import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const isVerifiedPurchase = searchParams.get('is_verified_purchase');
    const hasProsCons = searchParams.get('has_pros_cons');
    const sortBy = searchParams.get('sort_by') || 'newest';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Build query string
    const queryParams = new URLSearchParams({
      sort_by: sortBy,
      page,
      limit,
    });

    if (rating) queryParams.set('rating', rating);
    if (isVerifiedPurchase !== null) queryParams.set('is_verified_purchase', isVerifiedPurchase);
    if (hasProsCons !== null) queryParams.set('has_pros_cons', hasProsCons);

    // Fetch product reviews from backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';
    const response = await fetch(
      `${backendUrl}/api/reviews/product/${productId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch product reviews' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}