'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    title: string;
    images: Array<{
      url: string;
      alt_text: string;
      position: number;
      is_primary: boolean;
    }>;
  } | null;
  variant: {
    id: string;
    title: string;
    price: number;
    sku: string;
  } | null;
}

interface OrderData {
  id: string;
  customer_id: string;
  order_number: string;
  status: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  notes: string | null;
  internal_notes: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setError('Order number is missing');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        // Get the user's session token from localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
          setError('You must be logged in to view order details');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/orders/fetch-by-number?orderNumber=${orderNumber}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found');
          }
          if (response.status === 401) {
            throw new Error('You must be logged in to view order details');
          }
          if (response.status === 403) {
            throw new Error('You are not authorized to view this order');
          }
          throw new Error('Failed to fetch order details');
        }

        const order = await response.json();
        setOrderData(order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'We couldn\'t find the order you\'re looking for.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 text-orange-200">
        <CheckCircle className="w-8 h-8" />
      </div>
      <div className="absolute top-20 right-20 text-orange-200">
        <CheckCircle className="w-6 h-6" />
      </div>
      <div className="absolute bottom-20 left-20 text-orange-200">
        <CheckCircle className="w-10 h-10" />
      </div>
      <div className="absolute bottom-10 right-10 text-orange-200">
        <CheckCircle className="w-7 h-7" />
      </div>

      <div className="relative z-10 container px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center relative overflow-hidden">
            {/* Subtle decorative gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-green-400"></div>

            {/* Additional subtle background pattern inside card */}
            <div className="absolute inset-0 opacity-3">
              <div className="absolute top-4 right-4 w-32 h-32 bg-orange-200 rounded-full filter blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-orange-200 rounded-full filter blur-2xl"></div>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <CheckCircle className="w-10 h-10 text-green-500 animate-bounce" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-8">Thank you for your order. We've received it and will process it shortly.</p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <span className="text-sm text-gray-500">#{orderData.order_number}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatDate(orderData.created_at)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize text-orange-600">{orderData.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Address:</span>
                  <span className="font-medium text-right max-w-xs">
                    {orderData.shipping_address?.name}<br />
                    {orderData.shipping_address?.address}, {orderData.shipping_address?.city}<br />
                    {orderData.shipping_address?.state} - {orderData.shipping_address?.pincode}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {orderData.items.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <img
                        src={item.product?.images?.[0]?.url || '/placeholder-product.svg'}
                        alt={item.product?.title || 'Product'}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{item.product?.title || 'Product'}</h4>
                        <div className="text-xs text-gray-600 mt-1">
                          <div className="flex flex-wrap gap-x-1 gap-y-1">
                            {/* Display variant if exists */}
                            {item.variant && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium text-xs">
                                {item.variant.title}
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-sm">₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{orderData.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%):</span>
                    <span>₹{Math.round(orderData.tax_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{orderData.shipping_amount === 0 ? 'FREE' : `₹${orderData.shipping_amount.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{Math.round(orderData.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-500-muted rounded-lg p-4 mb-8">
              <p className="text-sm text-orange-600">
                <strong>What's Next?</strong><br />
                You'll receive an order confirmation email shortly. We'll notify you when your order ships.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Continue Shopping
              </Link>
              <Link
                href="/orders"
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
              >
                View Orders
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}