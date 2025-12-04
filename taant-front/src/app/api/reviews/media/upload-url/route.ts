import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, fileName, contentType } = body;

    if (!reviewId || !fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing required parameters: reviewId, fileName, contentType' },
        { status: 400 }
      );
    }

    // Fetch upload URL from backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';
    const response = await fetch(`${backendUrl}/api/reviews/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewId,
        fileName,
        contentType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to get upload URL' },
        { status: response.status }
      );
    }

    const uploadData = await response.json();
    return NextResponse.json(uploadData);

  } catch (error) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}