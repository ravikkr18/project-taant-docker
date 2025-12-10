import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { reason, refund_amount, refund_method } = await request.json();

    // Validate required fields
    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      );
    }

    // Get Authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch refund order from backend API with authentication
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';
    const response = await fetch(`${backendUrl}/api/orders/${orderId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        reason: reason.trim(),
        refund_amount,
        refund_method
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'You are not authorized to refund this order' },
          { status: 403 }
        );
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.message || 'Cannot refund this order' },
          { status: 400 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to refund order' },
        { status: response.status }
      );
    }

    const refundedOrder = await response.json();
    return NextResponse.json(refundedOrder);

  } catch (error) {
    console.error('Error refunding order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}