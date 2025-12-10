import { NextRequest, NextResponse } from 'next/server';

// POST /api/reviews/[id]/respond - Respond to review
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
    if (!body.content || body.content.trim() === '') {
      return NextResponse.json(
        { error: 'Response content is required' },
        { status: 400 }
      );
    }

    // Fetch respond to review from backend API with authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';
    const response = await fetch(`${backendUrl}/api/reviews/${reviewId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        content: body.content.trim(),
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
        { error: errorData.message || 'Failed to respond to review' },
        { status: response.status }
      );
    }

    const review = await response.json();
    return NextResponse.json(review);

  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}