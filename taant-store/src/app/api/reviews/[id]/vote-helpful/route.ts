import { NextRequest, NextResponse } from 'next/server';

// POST /api/reviews/[id]/vote-helpful - Vote review helpful/not helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const body = await request.json();

    // Get Authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (typeof body.is_helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'is_helpful field is required and must be a boolean' },
        { status: 400 }
      );
    }

    // Fetch vote review helpful from backend API with authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';
    const response = await fetch(`${backendUrl}/api/reviews/${reviewId}/vote-helpful`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        is_helpful: body.is_helpful,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to vote on review' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}