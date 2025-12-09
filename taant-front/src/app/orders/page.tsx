'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  User,
  IndianRupee,
  Eye,
  RefreshCw,
  X,
  Star,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Trash2,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface ProductDetails {
  id: string;
  title: string;
  images: Array<{
    url: string;
    alt_text: string;
    position: number;
    is_primary: boolean;
  }>;
}

interface VariantDetails {
  id: string;
  title: string;
  price: number;
  sku: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  product: ProductDetails | null;
  variant: VariantDetails | null;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderSummary {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
}

const OrdersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
    fetchOrders();
    fetchOrderSummary();
  }, [isAuthenticated, currentPage]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000'}/api/orders?page=${currentPage}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderSummary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000'}/api/orders/summary/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const trackOrder = (orderNumber: string) => {
    // TODO: Implement tracking functionality
    alert(`Track order: ${orderNumber}`);
  };

  const cancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    setCancellingOrderId(orderId);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to cancel orders');
        return;
      }

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Customer requested cancellation' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to cancel order');
      }

      const cancelledOrder = await response.json();

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'cancelled', updated_at: new Date().toISOString() }
            : order
        )
      );

      // If the selected order is the one being cancelled, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled', updated_at: new Date().toISOString() });
      }

      // Show success message
      alert(`Order #${orderNumber} has been cancelled successfully.`);

      // Refresh orders and summary
      fetchOrders();
      fetchOrderSummary();

    } catch (error: any) {
      console.error('Error cancelling order:', error);
      setError(error.message || 'Failed to cancel order');
      alert(error.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const refundOrder = async (orderId: string, orderNumber: string, totalAmount: number) => {
    // Prompt for refund reason
    const reason = prompt(`Please provide a reason for refunding order #${orderNumber}:`);
    if (!reason || reason.trim() === '') {
      return;
    }

    // Optional: Prompt for refund amount (defaults to full amount)
    const refundAmountInput = prompt(`Enter refund amount (press Enter for full refund of ₹${totalAmount}):`);
    let refundAmount = totalAmount;
    if (refundAmountInput && refundAmountInput.trim() !== '') {
      const parsedAmount = parseFloat(refundAmountInput);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > totalAmount) {
        alert('Invalid refund amount. Please enter a valid amount between ₹1 and ₹' + totalAmount);
        return;
      }
      refundAmount = parsedAmount;
    }

    if (!confirm(`Are you sure you want to refund ₹${refundAmount} for order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    setRefundingOrderId(orderId);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to refund orders');
        return;
      }

      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          refund_amount: refundAmount,
          refund_method: 'original' // Default to original payment method
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to refund order');
      }

      const refundedOrder = await response.json();

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'refunded', updated_at: new Date().toISOString() }
            : order
        )
      );

      // If the selected order is the one being refunded, update it too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'refunded', updated_at: new Date().toISOString() });
      }

      // Show success message
      alert(`Refund of ₹${refundAmount} for order #${orderNumber} has been processed successfully.`);

      // Refresh orders and summary
      fetchOrders();
      fetchOrderSummary();

    } catch (error: any) {
      console.error('Error refunding order:', error);
      setError(error.message || 'Failed to refund order');
      alert(error.message || 'Failed to refund order');
    } finally {
      setRefundingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600">Track and manage your purchases</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors inline-flex items-center gap-2"
            >
              Continue Shopping
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Total Orders</span>
                  <ShoppingBag className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.total_orders}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Pending</span>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{summary.pending_orders}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Completed</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{summary.completed_orders}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Total Spent</span>
                  <IndianRupee className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">₹{Math.round(summary.total_revenue).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <Link
                href="/"
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                Start Shopping
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">₹{Math.round(order.total_amount).toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-500">{order.items.length} items</p>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={
                              item.product?.images?.find(img => img.is_primary)?.url ||
                              item.product?.images?.[0]?.url ||
                              '/placeholder-product.svg'
                            }
                            alt={item.product?.title || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {item.product?.title || 'Product'}
                            </h4>
                            {item.variant && (
                              <p className="text-xs text-gray-600 truncate">{item.variant.title}</p>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                              <span className="font-semibold text-sm text-gray-900">
                                ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">
                            +{order.items.length - 3} more items
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => trackOrder(order.order_number)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Track Order
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {['pending', 'confirmed', 'processing'].includes(order.status) && (
                        <button
                          onClick={() => cancelOrder(order.id, order.order_number)}
                          disabled={cancellingOrderId === order.id}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrderId === order.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => refundOrder(order.id, order.order_number, order.total_amount)}
                          disabled={refundingOrderId === order.id}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {refundingOrderId === order.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                          {refundingOrderId === order.id ? 'Processing...' : 'Refund Order'}
                        </button>
                      )}
                    </div>
                    <Link
                      href={`/order-confirmation/${order.order_number}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Receipt
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      setSelectedOrder(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order #{selectedOrder.order_number}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">₹{Math.round(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={
                            item.product?.images?.find(img => img.is_primary)?.url ||
                            item.product?.images?.[0]?.url ||
                            '/placeholder-product.svg'
                          }
                          alt={item.product?.title || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product?.title || 'Product'}</h4>
                          {item.variant && (
                            <p className="text-sm text-gray-600">{item.variant.title}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-semibold text-gray-900">
                              ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedOrder.shipping_address?.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => trackOrder(selectedOrder.order_number)}
                    className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;