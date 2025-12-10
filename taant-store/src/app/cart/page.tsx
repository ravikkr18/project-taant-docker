'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, IndianRupee } from 'lucide-react';


interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  variant: string;
  size: string;
  color: string;
  timestamp: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      if (typeof window !== 'undefined') {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
      }
    };
    loadCart();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadCart();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(index);
      return;
    }

    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const bulkDiscount = subtotal > 50000 ? subtotal * 0.1 : 0; // 10% discount over ₹50,000
  const shipping = subtotal > 2000 ? 0 : 99; // Free shipping over ₹2,000
  const tax = (subtotal - bulkDiscount - couponDiscount) * 0.18; // 18% GST
  const total = subtotal - bulkDiscount - couponDiscount + shipping + tax;

  // Demo coupon codes
  const applyCoupon = () => {
    setCouponError('');
    const code = couponCode.toUpperCase().trim();

    switch(code) {
      case 'SAVE10':
        setAppliedCoupon(code);
        setCouponDiscount(subtotal * 0.1);
        break;
      case 'SAVE20':
        setAppliedCoupon(code);
        setCouponDiscount(subtotal * 0.2);
        break;
      case 'FLAT500':
        setAppliedCoupon(code);
        setCouponDiscount(500);
        break;
      case 'FLAT1000':
        setAppliedCoupon(code);
        setCouponDiscount(1000);
        break;
      case 'FIRST50':
        setAppliedCoupon(code);
        setCouponDiscount(subtotal * 0.5);
        break;
      case 'WELCOME':
        setAppliedCoupon(code);
        setCouponDiscount(subtotal * 0.15);
        break;
      default:
        setCouponError('Invalid coupon code. Try: SAVE10, SAVE20, FLAT500, FLAT1000, FIRST50, WELCOME');
        setAppliedCoupon('');
        setCouponDiscount(0);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="container px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12 md:py-16">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8 px-4">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm sm:text-base">
              Start Shopping
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                    Cart Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <div key={`${item.id}-${item.timestamp}`} className="p-3 sm:p-4 md:p-6">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-sm sm:text-base md:text-lg font-medium text-gray-900 hover:text-orange-600-accent transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-2">
                            <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
                              {/* Display variant if exists */}
                              {item.variant && (
                                <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                                  {item.variant}
                                </span>
                              )}

                              {/* Display size if exists */}
                              {item.size && (
                                <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">
                                  Size: {item.size}
                                </span>
                              )}

                              {/* Display color if exists */}
                              {item.color && (
                                <span className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded text-purple-700 font-medium">
                                  Color:
                                  <span
                                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300 inline-block"
                                    style={{ backgroundColor: item.color }}
                                    title={item.color}
                                  ></span>
                                </span>
                              )}

                              {/* Display all selected options */}
                              {item.selectedOptions && Object.entries(item.selectedOptions).map(([optionName, optionValue]) => (
                                <span key={optionName} className="bg-orange-100 px-2 py-1 rounded text-orange-700 font-medium">
                                  {optionName}: {optionValue}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                className="p-1 sm:p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="p-1 sm:p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex items-center gap-1">
                                <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                                {Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-gray-500 hidden sm:block">
                                ₹{Math.round(item.price).toLocaleString('en-IN')} each
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 sticky top-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span className="font-medium flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {Math.round(subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {bulkDiscount > 0 && (
                    <div className="flex justify-between text-orange-600 text-sm sm:text-base">
                      <span>Bulk Discount (10%)</span>
                      <span className="font-medium flex items-center gap-1">
                        -<IndianRupee className="w-3 h-3" />
                        {Math.round(bulkDiscount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-orange-600 text-sm sm:text-base">
                      <span>Coupon ({appliedCoupon})</span>
                      <span className="font-medium flex items-center gap-1">
                        -<IndianRupee className="w-3 h-3" />
                        {Math.round(couponDiscount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : (
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {Math.round(shipping).toLocaleString('en-IN')}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>GST (18%)</span>
                    <span className="font-medium flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {Math.round(tax).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                        {Math.round(total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {(bulkDiscount > 0 || couponDiscount > 0) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-green-800">
                      🎉 You saved ₹{Math.round(bulkDiscount + couponDiscount).toLocaleString('en-IN')} with this order!
                    </p>
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  <Link href="/checkout" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition-all duration-200 w-full text-center inline-block text-sm sm:text-base">
                    Proceed to Checkout
                  </Link>
                  <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 sm:py-3 px-4 rounded-lg transition-colors w-full text-center inline-block text-sm sm:text-base">
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Have a coupon code?</h3>
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Coupon {appliedCoupon} applied
                          </span>
                          <span className="text-xs text-green-600">
                            (-₹{Math.round(couponDiscount).toLocaleString('en-IN')})
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code (e.g., SAVE10, WELCOME)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                        />
                        <button
                          onClick={applyCoupon}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-sm"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <div className="mt-2 text-xs text-red-600">
                          {couponError}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Try: <span className="font-medium">SAVE10</span>, <span className="font-medium">SAVE20</span>, <span className="font-medium">FLAT500</span>, <span className="font-medium">WELCOME</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;