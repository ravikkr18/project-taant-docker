'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Truck, Shield, Lock, User, Plus, IndianRupee, Wallet, Mail, Phone, MapPin, X, CheckCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface CheckoutFormData {
  isLoggedIn: boolean;
  selectedAddressIds: string[];
  shippingAddresses: ShippingAddress[];
  newAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  isReselling: boolean;
  resellerMarginType: 'percentage' | 'fixed';
  resellerMarginValue: number;
  paymentMethod: 'cod' | 'online' | null;
  saveNewAddress: boolean;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, login, logout, showAuthModal, hideAuthModal, isAuthModalOpen } = useAuth();
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  
  
  // Load form data from localStorage on mount
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('checkoutFormData');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing saved checkout data:', e);
        }
      }
    }

    return {
      isLoggedIn: false,
      selectedAddressIds: [],
      shippingAddresses: [
        {
          id: '1',
          name: 'John Doe',
          phone: '+91 9876543210',
          address: '123 Main Street, Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true
        },
        {
          id: '2',
          name: 'Jane Doe',
          phone: '+91 9876543211',
          address: '456 Business Park, Suite 100',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          isDefault: false
        }
      ],
      newAddress: {
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      },
      isReselling: false,
      resellerMarginType: 'percentage' as const,
      resellerMarginValue: 10,
      paymentMethod: null,
      saveNewAddress: false
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }
  }, [formData]);

  // Get cart data from localStorage
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    }
  }, []);

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 2000 ? 0 : 99;

  // Reseller calculations
  const resellerProfit = formData.isReselling
    ? (formData.resellerMarginType === 'percentage'
        ? (subtotal * formData.resellerMarginValue) / 100
        : formData.resellerMarginValue)
    : 0;
  const total = subtotal + tax + shipping + resellerProfit;

  
  const toggleAddressSelection = (addressId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAddressIds: prev.selectedAddressIds.includes(addressId)
        ? prev.selectedAddressIds.filter(id => id !== addressId)
        : [...prev.selectedAddressIds, addressId]
    }));
  };

  const addNewAddress = () => {
    const newId = formData.isLoggedIn ? Date.now().toString() : `temp_${Date.now()}`;
    const address: ShippingAddress = {
      id: newId,
      ...formData.newAddress
    };

    setFormData(prev => ({
      ...prev,
      shippingAddresses: [...prev.shippingAddresses, address],
      selectedAddressIds: [...prev.selectedAddressIds, newId],
      newAddress: {
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      }
    }));
    setShowAddAddressForm(false);
  };

  const removeAddress = (addressId: string) => {
    setFormData(prev => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.filter(addr => addr.id !== addressId),
      selectedAddressIds: prev.selectedAddressIds.filter(id => id !== addressId)
    }));
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        alert('Please login to place an order');
        showAuthModal('signin');
        return;
      }

      // Get selected shipping address
      const selectedAddress = formData.shippingAddresses.find(addr =>
        formData.selectedAddressIds.includes(addr.id)
      );

      if (!selectedAddress) {
        alert('Please select a shipping address');
        return;
      }

      // Prepare order data for API
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          variant_id: item.variantId || null,
          quantity: item.quantity
        })),
        shipping_address: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        billing_address: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        notes: formData.isReselling
          ? `Reseller margin: ${formData.resellerMarginType === 'percentage' ? formData.resellerMarginValue + '%' : '₹' + formData.resellerMarginValue}`
          : null
      };

      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      // Call the backend API to create order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to place order');
      }

      const createdOrder = await response.json();

      // Clear form data after successful order
      localStorage.removeItem('checkoutFormData');

      // Clear cart after successful order
      localStorage.removeItem('cart');

      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdate'));

      // Redirect to order confirmation page with order number
      router.push(`/order-confirmation/${createdOrder.order_number}`);

    } catch (error) {
      console.error('Error placing order:', error);
      alert(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    }
  };


  // Show empty cart message if no items
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to your cart before proceeding to checkout.</p>
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container py-8">
          <form onSubmit={placeOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">

                {/* Login Section */}
                {!isAuthenticated && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Have an account?</h2>
                      <button
                        type="button"
                        onClick={() => showAuthModal('signin')}
                        className="text-orange-600 font-semibold hover:text-orange-600"
                      >
                        Login
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Login to access your saved addresses and order history.</p>
                  </div>
                )}

                {/* User Info (when logged in) */}
                {isAuthenticated && user && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Welcome back!</p>
                          <p className="text-sm text-gray-600">+91 {user.phone.slice(0, 5)}XXXXX</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={logout}
                        className="text-red-500 hover:text-red-600 font-medium text-sm"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}

                {/* Shipping Addresses */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Addresses</h2>

                  {/* Saved Addresses */}
                  {formData.shippingAddresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {formData.shippingAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${
                            formData.selectedAddressIds.includes(address.id)
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedAddressIds.includes(address.id)}
                            onChange={() => toggleAddressSelection(address.id)}
                            className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <p className="font-bold text-gray-900">{address.name}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                            <p className="text-sm text-gray-600">
                              {address.address}
                              {address.city && `, ${address.city}`}
                              {address.state && `, ${address.state}`}
                              {address.pincode && ` - ${address.pincode}`}
                            </p>
                          </div>
                          {address.id.startsWith('temp_') && (
                            <button
                              type="button"
                              onClick={() => removeAddress(address.id)}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 text-orange-600 font-semibold transition-colors"
                  >
                    + Add New Address
                  </button>

                  {/* Add New Address Form */}
                  {showAddAddressForm && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={formData.newAddress.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, name: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Full Name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                          <input
                            type="tel"
                            value={formData.newAddress.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, phone: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="+91 1234567890"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                        <textarea
                          value={formData.newAddress.address}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            newAddress: { ...prev.newAddress, address: e.target.value }
                          }))}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="House No, Street, Area"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={formData.newAddress.city}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, city: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={formData.newAddress.state}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, state: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                          <input
                            type="text"
                            value={formData.newAddress.pincode}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              newAddress: { ...prev.newAddress, pincode: e.target.value }
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      {formData.isLoggedIn && (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.saveNewAddress}
                            onChange={(e) => setFormData(prev => ({ ...prev, saveNewAddress: e.target.checked }))}
                            className="mr-2 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Save this address to my account</span>
                        </label>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={addNewAddress}
                          className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 font-semibold transition-all duration-200"
                        >
                          Add Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(false)}
                          className="px-6 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reselling Options */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isReselling}
                      onChange={(e) => setFormData(prev => ({ ...prev, isReselling: e.target.checked }))}
                      className="mt-1 w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="font-bold text-lg text-gray-900">Are you reselling this product?</p>
                      <p className="text-sm text-gray-600">Set your profit margin for dropshipping</p>
                    </div>
                  </label>

                  {formData.isReselling && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Margin Type</label>
                        <select
                          value={formData.resellerMarginType}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            resellerMarginType: e.target.value as 'percentage' | 'fixed'
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Margin Value</label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={formData.resellerMarginValue}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              resellerMarginValue: Number(e.target.value)
                            }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            min="0"
                            step="0.01"
                          />
                          <span className="ml-2 font-bold text-gray-700">
                            {formData.resellerMarginType === 'percentage' ? '%' : '₹'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded border border-orange-500-muted">
                        <p className="text-sm font-semibold text-gray-900">Your Estimated Profit:</p>
                        <p className="text-2xl font-black text-orange-600">₹{resellerProfit.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethod: e.target.value as 'cod' | 'online'
                        }))}
                        className="mr-3 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive</p>
                      </div>
                    </label>
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.paymentMethod === 'online' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          paymentMethod: e.target.value as 'cod' | 'online'
                        }))}
                        className="mr-3 w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <div>
                        <p className="font-bold text-gray-900">Online Payment</p>
                        <p className="text-sm text-gray-600">UPI, Card, Net Banking</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                  {/* Real cart items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex gap-3 pb-3 border-b">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                          <div className="text-xs text-gray-600 mt-1">
                            <div className="flex flex-wrap gap-x-1 gap-y-1">
                              {/* Display variant if exists */}
                              {item.variant && (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium text-xs">
                                  {item.variant}
                                </span>
                              )}

                              {/* Display size if exists */}
                              {item.size && (
                                <span className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-medium text-xs">
                                  Size: {item.size}
                                </span>
                              )}

                              {/* Display color if exists */}
                              {item.color && (
                                <span className="flex items-center gap-0.5 bg-purple-100 px-1.5 py-0.5 rounded text-purple-700 font-medium text-xs">
                                  Color:
                                  <span
                                    className="w-2 h-2 rounded-full border border-gray-300 inline-block"
                                    style={{ backgroundColor: item.color }}
                                    title={item.color}
                                  ></span>
                                </span>
                              )}

                              {/* Display all selected options */}
                              {item.selectedOptions && Object.entries(item.selectedOptions).map(([optionName, optionValue]) => (
                                <span key={optionName} className="bg-orange-100 px-1.5 py-0.5 rounded text-orange-700 font-medium text-xs">
                                  {optionName}: {optionValue}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2 flex justify-between">
                              <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                              <span className="font-bold text-xs text-gray-900">
                                ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (18%)</span>
                      <span className="font-semibold">₹{Math.round(tax).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                    </div>
                    {formData.isReselling && resellerProfit > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Your Profit</span>
                        <span className="font-bold">₹{resellerProfit.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formData.selectedAddressIds.length === 0 || !formData.paymentMethod}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all duration-200"
                  >
                    Place Order
                  </button>

                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Secure checkout powered by SSL encryption</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={hideAuthModal}
        onSuccess={login}
        mode="signin"
      />
    </div>
  );
};

export default CheckoutPage;