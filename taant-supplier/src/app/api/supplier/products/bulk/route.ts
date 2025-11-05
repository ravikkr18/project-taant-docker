import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../../../../lib/auth-middleware'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role key for supplier operations
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Helper function to generate unique slug
async function generateUniqueSlug(title: string, supabaseClient: any): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  let slug = baseSlug
  let counter = 1

  while (true) {
    const { data, error } = await supabaseClient
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error && error.code === 'PGRST116') {
      return slug
    }

    if (error) {
      throw error
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// Helper function to generate unique SKU
async function generateUniqueSKU(supabaseClient: any): Promise<string> {
  const prefix = 'SKU'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const sku = `${prefix}-${timestamp}-${random}`

  const { data, error } = await supabaseClient
    .from('products')
    .select('id')
    .eq('sku', sku)
    .single()

  if (error && error.code === 'PGRST116') {
    return sku
  }

  if (error) {
    throw error
  }

  return generateUniqueSKU(supabaseClient)
}

export const POST = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    const { products } = await request.json()
    const supplierId = profile.id

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      )
    }

    if (products.length > 100) {
      return NextResponse.json(
        { error: 'Cannot process more than 100 products at once' },
        { status: 400 }
      )
    }

    // Process products with validation
    const processedProducts = []
    const errors = []

    for (let i = 0; i < products.length; i++) {
      try {
        const product = products[i]

        // Validate required fields
        if (!product.title || !product.category_id) {
          errors.push({
            row: i + 1,
            error: 'Title and category are required'
          })
          continue
        }

        // Generate slug and SKU
        const slug = product.slug || await generateUniqueSlug(product.title, supabaseAdmin)
        const sku = product.sku || await generateUniqueSKU(supabaseAdmin)

        // Prepare product data
        const productData = {
          supplier_id: supplierId,
          sku,
          slug,
          title: product.title,
          short_description: product.short_description || '',
          description: product.description || '',
          brand_id: product.brand_id || null,
          category_id: product.category_id,
          specifications: product.specifications || {},
          features: product.features || [],
          warranty_months: product.warranty_months || 12,
          warranty_text: product.warranty_text || '',
          shipping_info: product.shipping_info || {},
          return_policy: product.return_policy || {},
          seo_title: product.seo_title || product.title,
          seo_description: product.seo_description || product.short_description,
          seo_keywords: product.seo_keywords || [],
          status: product.status || 'draft',
          visibility: product.visibility || 'public',
          is_featured: product.is_featured || false,
          is_digital: product.is_digital || false,
          requires_shipping: product.requires_shipping !== false,
          track_inventory: product.track_inventory !== false,
          weight: product.weight || null,
          dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
          tags: product.tags || [],
          published_at: product.status === 'active' ? new Date().toISOString() : null
        }

        processedProducts.push({
          ...productData,
          variants: product.variants || [],
          images: product.images || [],
          faqs: product.faqs || []
        })
      } catch (error: any) {
        errors.push({
          row: i + 1,
          error: error.message
        })
      }
    }

    if (processedProducts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid products to create',
        errors
      }, { status: 400 })
    }

    // Insert products in batch
    const { data: createdProducts, error: createError } = await supabaseAdmin
      .from('products')
      .insert(processedProducts.map(p => ({
        supplier_id: p.supplier_id,
        sku: p.sku,
        slug: p.slug,
        title: p.title,
        short_description: p.short_description,
        description: p.description,
        brand_id: p.brand_id,
        category_id: p.category_id,
        specifications: p.specifications,
        features: p.features,
        warranty_months: p.warranty_months,
        warranty_text: p.warranty_text,
        shipping_info: p.shipping_info,
        return_policy: p.return_policy,
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        seo_keywords: p.seo_keywords,
        status: p.status,
        visibility: p.visibility,
        is_featured: p.is_featured,
        is_digital: p.is_digital,
        requires_shipping: p.requires_shipping,
        track_inventory: p.track_inventory,
        weight: p.weight,
        dimensions: p.dimensions,
        tags: p.tags,
        published_at: p.published_at
      })))
      .select()

    if (createError) {
      console.error('Bulk product creation error:', createError)
      return NextResponse.json({
        success: false,
        error: createError.message,
        errors
      }, { status: 500 })
    }

    // Process variants, images, and FAQs for created products
    const variantInserts = []
    const imageInserts = []
    const faqInserts = []

    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i]
      const originalProduct = processedProducts[i]

      // Process variants
      if (originalProduct.variants && originalProduct.variants.length > 0) {
        for (const variant of originalProduct.variants) {
          const variantSKU = variant.sku || await generateUniqueSKU(supabaseAdmin)
          variantInserts.push({
            product_id: product.id,
            sku: variantSKU,
            title: variant.title || '',
            price: variant.price,
            compare_price: variant.compare_price || null,
            cost_price: variant.cost_price || null,
            inventory_quantity: variant.inventory_quantity || 0,
            option1_value: variant.option1_value || '',
            option2_value: variant.option2_value || '',
            option3_value: variant.option3_value || ''
          })
        }
      }

      // Process images
      if (originalProduct.images && originalProduct.images.length > 0) {
        for (let j = 0; j < originalProduct.images.length; j++) {
          const image = originalProduct.images[j]
          imageInserts.push({
            product_id: product.id,
            url: image.url,
            alt_text: image.alt_text || '',
            position: j,
            is_primary: j === 0
          })
        }
      }

      // Process FAQs
      if (originalProduct.faqs && originalProduct.faqs.length > 0) {
        for (let j = 0; j < originalProduct.faqs.length; j++) {
          const faq = originalProduct.faqs[j]
          faqInserts.push({
            product_id: product.id,
            question: faq.question,
            answer: faq.answer,
            position: j
          })
        }
      }
    }

    // Insert variants
    if (variantInserts.length > 0) {
      await supabaseAdmin
        .from('product_variants')
        .insert(variantInserts)
    }

    // Insert images
    if (imageInserts.length > 0) {
      await supabaseAdmin
        .from('product_images')
        .insert(imageInserts)
    }

    // Insert FAQs
    if (faqInserts.length > 0) {
      await supabaseAdmin
        .from('product_faqs')
        .insert(faqInserts)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdProducts.length} products`,
      data: createdProducts,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Bulk product creation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    const { ids, variables } = await request.json()
    const supplierId = profile.id

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Cannot update more than 100 products at once' },
        { status: 400 }
      )
    }

    // Verify all products belong to the supplier
    const { data: existingProducts, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .in('id', ids)
      .eq('supplier_id', supplierId)

    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to verify product ownership' },
        { status: 500 }
      )
    }

    if (!existingProducts || existingProducts.length !== ids.length) {
      return NextResponse.json(
        { error: 'Some products not found or access denied' },
        { status: 404 }
      )
    }

    // Update products
    const { data: updatedProducts, error: updateError } = await supabaseAdmin
      .from('products')
      .update(variables)
      .in('id', ids)
      .select()

    if (updateError) {
      console.error('Bulk product update error:', updateError)
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedProducts.length} products`,
      data: updatedProducts
    })

  } catch (error: any) {
    console.error('Bulk product update error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    const { ids } = await request.json()
    const supplierId = profile.id

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Cannot delete more than 100 products at once' },
        { status: 400 }
      )
    }

    // Verify all products belong to the supplier
    const { data: existingProducts, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .in('id', ids)
      .eq('supplier_id', supplierId)

    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to verify product ownership' },
        { status: 500 }
      )
    }

    if (!existingProducts || existingProducts.length !== ids.length) {
      return NextResponse.json(
        { error: 'Some products not found or access denied' },
        { status: 404 }
      )
    }

    // Delete related records first
    await supabaseAdmin
      .from('product_variants')
      .delete()
      .in('product_id', ids)

    await supabaseAdmin
      .from('product_images')
      .delete()
      .in('product_id', ids)

    await supabaseAdmin
      .from('product_faqs')
      .delete()
      .in('product_id', ids)

    // Delete products
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('Bulk product deletion error:', deleteError)
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} products`,
      data: { deleted: ids }
    })

  } catch (error: any) {
    console.error('Bulk product deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
})