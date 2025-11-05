import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../../../lib/auth-middleware'

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
async function generateUniqueSlug(title: string, supabaseClient: any, existingId?: string): Promise<string> {
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
      .neq('id', existingId || '')
      .single()

    if (error && error.code === 'PGRST116') {
      // No existing slug found
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

  // Verify uniqueness
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

  // If exists, try again
  return generateUniqueSKU(supabaseClient)
}

export const GET = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Safely get search params
    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      searchParams = request.nextUrl.searchParams
    }

    const productId = searchParams.get('id')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const brand = searchParams.get('brand') || ''
    const sortBy = searchParams.get('sort') || 'created_at'
    const sortOrder = searchParams.get('order') || 'desc'
    const supplierId = profile.id // Get supplier ID from authenticated user

    // Handle single product request
    if (productId) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          brand:brands(name, slug),
          category:categories(name, slug),
          supplier:suppliers(business_name),
          variants:product_variants(*),
          images:product_images(*),
          videos:product_videos(*),
          faqs:product_faqs(*),
          reviews:product_reviews(id, rating, title, content, customer_name, created_at)
        `)
        .eq('id', productId)
        .eq('supplier_id', supplierId)
        .single()

      if (error) {
        console.error('Product fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    // Handle multiple products request
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        brand:brands(name, slug),
        category:categories(name, slug),
        variants:product_variants(
          id, sku, title, price, compare_price, inventory_quantity,
          option1_value, option2_value, option3_value, is_active
        ),
        images:product_images(id, url, alt_text, position, is_primary),
        reviews:product_reviews(id, rating, is_approved)
      `, { count: 'exact' })
      .eq('supplier_id', supplierId)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    if (brand && brand !== 'all') {
      query = query.eq('brand_id', brand)
    }

    // Apply sorting
    if (sortBy && sortOrder) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Products list error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process products data
    const processedProducts = data?.map((product: any) => ({
      ...product,
      avg_rating: product.reviews?.length > 0
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
        : 0,
      total_reviews: product.reviews?.length || 0,
      min_price: product.variants?.length > 0
        ? Math.min(...product.variants.map((v: any) => v.price))
        : 0,
      max_price: product.variants?.length > 0
        ? Math.max(...product.variants.map((v: any) => v.price))
        : 0,
      total_inventory: product.variants?.reduce((sum: number, v: any) => sum + v.inventory_quantity, 0) || 0,
      primary_image: product.images?.find((img: any) => img.is_primary) || product.images?.[0]
    })) || []

    return NextResponse.json({
      data: processedProducts,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    })

  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const supplierId = profile.id

    // Generate slug and SKU if not provided
    const slug = body.slug || await generateUniqueSlug(body.title, supabaseAdmin)
    const sku = body.sku || await generateUniqueSKU(supabaseAdmin)

    // Validate required fields
    if (!body.title || !body.category_id) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Prepare product data
    const productData = {
      supplier_id: supplierId,
      sku,
      slug,
      title: body.title,
      short_description: body.short_description || '',
      description: body.description || '',
      brand_id: body.brand_id || null,
      category_id: body.category_id,
      specifications: body.specifications || {},
      features: body.features || [],
      warranty_months: body.warranty_months || 12,
      warranty_text: body.warranty_text || '',
      shipping_info: body.shipping_info || {},
      return_policy: body.return_policy || {},
      seo_title: body.seo_title || body.title,
      seo_description: body.seo_description || body.short_description,
      seo_keywords: body.seo_keywords || [],
      status: body.status || 'draft',
      visibility: body.visibility || 'public',
      is_featured: body.is_featured || false,
      is_digital: body.is_digital || false,
      requires_shipping: body.requires_shipping !== false,
      track_inventory: body.track_inventory !== false,
      weight: body.weight || null,
      dimensions: body.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
      tags: body.tags || [],
      published_at: body.status === 'active' ? new Date().toISOString() : null
    }

    // Create product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (productError) {
      console.error('Product creation error:', productError)
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    // Handle variants if provided
    if (body.variants && body.variants.length > 0) {
      const variantsData = await Promise.all(
        body.variants.map(async (variant: any, index: number) => {
          const variantSKU = variant.sku || await generateUniqueSKU(supabaseAdmin)
          return {
            product_id: product.id,
            sku: variantSKU,
            title: variant.title || '',
            barcode: variant.barcode || '',
            price: variant.price,
            compare_price: variant.compare_price || null,
            cost_price: variant.cost_price || null,
            weight: variant.weight || null,
            dimensions: variant.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
            inventory_quantity: variant.inventory_quantity || 0,
            inventory_policy: variant.inventory_policy || 'deny',
            inventory_tracking: variant.inventory_tracking !== false,
            low_stock_threshold: variant.low_stock_threshold || 10,
            allow_backorder: variant.allow_backorder || false,
            requires_shipping: variant.requires_shipping !== false,
            taxable: variant.taxable !== false,
            tax_code: variant.tax_code || '',
            position: index,
            option1_name: variant.option1_name || '',
            option1_value: variant.option1_value || '',
            option2_name: variant.option2_name || '',
            option2_value: variant.option2_value || '',
            option3_name: variant.option3_name || '',
            option3_value: variant.option3_value || '',
            is_active: variant.is_active !== false
          }
        })
      )

      const { error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .insert(variantsData)

      if (variantsError) {
        console.error('Variants creation error:', variantsError)
        // Don't fail the whole operation if variants fail
      }
    }

    // Handle images if provided
    if (body.images && body.images.length > 0) {
      const imagesData = body.images.map((image: any, index: number) => ({
        product_id: product.id,
        url: image.url,
        alt_text: image.alt_text || '',
        position: index,
        is_primary: index === 0,
        file_name: image.file_name || '',
        file_size: image.file_size || null,
        file_type: image.file_type || '',
        width: image.width || null,
        height: image.height || null
      }))

      const { error: imagesError } = await supabaseAdmin
        .from('product_images')
        .insert(imagesData)

      if (imagesError) {
        console.error('Images creation error:', imagesError)
        // Don't fail the whole operation if images fail
      }
    }

    // Handle FAQs if provided
    if (body.faqs && body.faqs.length > 0) {
      const faqsData = body.faqs.map((faq: any, index: number) => ({
        product_id: product.id,
        question: faq.question,
        answer: faq.answer,
        position: index,
        is_active: true
      }))

      const { error: faqsError } = await supabaseAdmin
        .from('product_faqs')
        .insert(faqsData)

      if (faqsError) {
        console.error('FAQs creation error:', faqsError)
        // Don't fail the whole operation if FAQs fail
      }
    }

    // Return complete product with relations
    const { data: completeProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        brand:brands(name, slug),
        category:categories(name, slug),
        variants:product_variants(*),
        images:product_images(*),
        faqs:product_faqs(*)
      `)
      .eq('id', product.id)
      .single()

    if (fetchError) {
      console.error('Complete product fetch error:', fetchError)
      return NextResponse.json({ data: product })
    }

    return NextResponse.json({ data: completeProduct })

  } catch (error: any) {
    console.error('Product creation API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
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

    const { id, ...updateData } = await request.json()
    const supplierId = profile.id

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product belongs to the supplier
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id, supplier_id, slug, title')
      .eq('id', id)
      .eq('supplier_id', supplierId)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Generate new slug if title changed
    if (updateData.title && updateData.title !== existingProduct.title) {
      updateData.slug = await generateUniqueSlug(updateData.title, supabaseAdmin, id)
    }

    // Update published_at if status changes to active
    if (updateData.status === 'active' && existingProduct.status !== 'active') {
      updateData.published_at = new Date().toISOString()
    }

    // Update product
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Product update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Handle variants update if provided
    if (updateData.variants) {
      // Delete existing variants and create new ones
      await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('product_id', id)

      if (updateData.variants.length > 0) {
        const variantsData = await Promise.all(
          updateData.variants.map(async (variant: any, index: number) => {
            const variantSKU = variant.sku || await generateUniqueSKU(supabaseAdmin)
            return {
              product_id: id,
              sku: variantSKU,
              title: variant.title || '',
              price: variant.price,
              compare_price: variant.compare_price || null,
              cost_price: variant.cost_price || null,
              inventory_quantity: variant.inventory_quantity || 0,
              option1_value: variant.option1_value || '',
              option2_value: variant.option2_value || '',
              option3_value: variant.option3_value || '',
              position: index,
              is_active: variant.is_active !== false
            }
          })
        )

        await supabaseAdmin
          .from('product_variants')
          .insert(variantsData)
      }
    }

    // Handle images update if provided
    if (updateData.images) {
      // Delete existing images and create new ones
      await supabaseAdmin
        .from('product_images')
        .delete()
        .eq('product_id', id)

      if (updateData.images.length > 0) {
        const imagesData = updateData.images.map((image: any, index: number) => ({
          product_id: id,
          url: image.url,
          alt_text: image.alt_text || '',
          position: index,
          is_primary: index === 0
        }))

        await supabaseAdmin
          .from('product_images')
          .insert(imagesData)
      }
    }

    return NextResponse.json({ data: updatedProduct })

  } catch (error: any) {
    console.error('Product update API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
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

    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      searchParams = request.nextUrl.searchParams
    }

    const productId = searchParams.get('id')
    const supplierId = profile.id

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product belongs to the supplier
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('supplier_id', supplierId)
      .single()

    if (checkError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Delete related records first (due to foreign key constraints)
    await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', productId)

    await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId)

    await supabaseAdmin
      .from('product_faqs')
      .delete()
      .eq('product_id', productId)

    // Delete the product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Product deletion error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { id: productId } })

  } catch (error: any) {
    console.error('Product deletion API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
})