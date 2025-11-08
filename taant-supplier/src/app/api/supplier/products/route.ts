import { NextRequest, NextResponse } from 'next/server'
// Backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_TAANT_BACKEND_URL || 'http://localhost:4000'

// Helper function to get auth token for backend requests
function getAuthToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fallback to getting from session cookie
  const sessionCookie = request.cookies.get('supabase.auth.token')
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie.value)
      return sessionData.access_token
    } catch (error) {
      console.error('Failed to parse session cookie:', error)
    }
  }

  throw new Error('No valid authentication token found')
}

// Helper functions for slug and SKU generation are now handled by the backend

export const GET = async (request: NextRequest) => {
  try {

    // Safely get search params
    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      searchParams = request.nextUrl.searchParams
    }

    const productId = searchParams.get('id')

    // Handle single product request
    if (productId) {
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Temporarily remove auth header for testing
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json({ error: errorData.message || 'Failed to fetch product' }, { status: response.status })
      }

      const result = await response.json()
      return NextResponse.json({ data: result.data })
    }

    // Handle multiple products request - forward to backend with supplier ID
    // Temporarily hardcoded supplier ID - in production this should come from authentication
    const supplierId = 'fa0ca8e0-f848-45b9-b107-21e56b38573f'
    console.log(`Fetching from backend: ${BACKEND_URL}/api/products?supplierId=${supplierId}`)

    const backendResponse = await fetch(`${BACKEND_URL}/api/products?supplierId=${supplierId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Temporarily remove auth header for testing
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.message || 'Failed to fetch products' }, { status: backendResponse.status })
    }

    const result = await backendResponse.json()

    // Process products data to match expected format
    const processedProducts = result.data?.map((product: any) => ({
      ...product,
      avg_rating: 0, // TODO: Calculate from reviews when backend supports it
      total_reviews: 0, // TODO: Get from reviews when backend supports it
      min_price: product.base_price,
      max_price: product.compare_price || product.base_price,
      total_inventory: 0, // TODO: Calculate from variants when backend supports it
      primary_image: product.images?.find((img: any) => img.is_primary) || product.images?.[0]
    })) || []

    return NextResponse.json({
      data: processedProducts,
      total: processedProducts.length,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      totalPages: Math.ceil(processedProducts.length / parseInt(searchParams.get('pageSize') || '10'))
    })

  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.category_id) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Prepare product data for backend
    const productData = {
      title: body.title,
      description: body.description || '',
      category_id: body.category_id,
      base_price: body.base_price || 0,
      compare_price: body.compare_price || null,
      cost_price: body.cost_price || null,
      sku: body.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      track_inventory: body.track_inventory !== false,
      status: body.status || 'draft',
      manufacturer: body.manufacturer || '',
      model_number: body.model_number || '',
      origin_country: body.origin_country || '',
      shipping_requirements: body.shipping_requirements || '',
      a_plus_content: body.a_plus_content || '',
      a_plus_sections: body.a_plus_sections || null,
      weight: body.weight || null,
      length: body.dimensions?.length || null,
      width: body.dimensions?.width || null,
      height: body.dimensions?.height || null,
      supplier_id: 'fa0ca8e0-f848-45b9-b107-21e56b38573f', // Temporarily hardcoded supplier ID
    }

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Temporarily remove auth header for testing
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.message || 'Failed to create product' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ data: result.data })

  } catch (error: any) {
    console.error('Product creation API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const PUT = async (request: NextRequest) => {
  try {
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Prepare product data for backend
    const productData = {
      title: updateData.title,
      description: updateData.description,
      category_id: updateData.category_id,
      base_price: updateData.base_price,
      compare_price: updateData.compare_price,
      cost_price: updateData.cost_price,
      sku: updateData.sku,
      slug: updateData.slug,
      track_inventory: updateData.track_inventory,
      status: updateData.status,
      manufacturer: updateData.manufacturer,
      model_number: updateData.model_number,
      origin_country: updateData.origin_country,
      shipping_requirements: updateData.shipping_requirements,
      a_plus_content: updateData.a_plus_content,
      a_plus_sections: updateData.a_plus_sections,
      weight: updateData.weight,
      length: updateData.length,
      width: updateData.width,
      height: updateData.height,
    }

    // Forward request to backend with expected format
    const response = await fetch(`${BACKEND_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Temporarily remove auth header for testing
      },
      body: JSON.stringify({
        productData,
        supplier_id: 'fa0ca8e0-f848-45b9-b107-21e56b38573f' // Temporarily hardcoded supplier ID
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.message || 'Failed to update product' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ data: result.data })

  } catch (error: any) {
    console.error('Product update API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export const DELETE = async (request: NextRequest) => {
  try {

    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      searchParams = request.nextUrl.searchParams
    }

    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Forward request to backend with supplier ID in body
    const response = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Temporarily remove auth header for testing
      },
      body: JSON.stringify({
        supplier_id: 'fa0ca8e0-f848-45b9-b107-21e56b38573f' // Temporarily hardcoded supplier ID
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.message || 'Failed to delete product' }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json({ success: true, data: result.data })

  } catch (error: any) {
    console.error('Product deletion API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}