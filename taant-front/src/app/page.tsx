'use client';

import React from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ProductSlider from '@/components/ProductSlider';
import ElectronicsSection from '@/components/home/ElectronicsSection';
import FashionSection from '@/components/home/FashionSection';
import HomeKitchenSection from '@/components/home/HomeKitchenSection';
import TrendingSection from '@/components/home/TrendingSection';
import DealsSection from '@/components/home/DealsSection';
import { apiService } from '@/services/api';
import { Product } from '@/types';
import { ShoppingCart, Smartphone, Laptop, Watch, Headphones, Gamepad2 } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="w-full bg-gray-50">
      {/* Enhanced Hero Slider */}
      <HeroSlider />

      {/* Features Bar */}
      <section className="bg-white py-2 sm:py-3 border-b border-gray-200">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="text-orange-500 text-lg sm:text-xl">🚚</div>
              <div>
                <h3 className="text-xs font-semibold">FREE Shipping</h3>
                <p className="text-xs text-gray-600 hidden sm:block">On orders ₹500+</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="text-orange-500 text-lg sm:text-xl">🎁</div>
              <div>
                <h3 className="text-xs font-semibold">FREE Returns</h3>
                <p className="text-xs text-gray-600 hidden sm:block">30-day returns</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="text-orange-500 text-lg sm:text-xl">💳</div>
              <div>
                <h3 className="text-xs font-semibold">Secure Payment</h3>
                <p className="text-xs text-gray-600 hidden sm:block">100% secure</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="text-orange-500 text-lg sm:text-xl">⭐</div>
              <div>
                <h3 className="text-xs font-semibold">Best Quality</h3>
                <p className="text-xs text-gray-600 hidden sm:block">Top brands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deal of the Day - First section */}
      <DealsSection />

      {/* Quick Categories */}
      <section className="bg-white py-6 border-b border-gray-200">
        <div className="container">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Mobiles', icon: Smartphone, color: 'blue' },
              { name: 'Laptops', icon: Laptop, color: 'purple' },
              { name: 'Watches', icon: Watch, color: 'green' },
              { name: 'Audio', icon: Headphones, color: 'red' },
              { name: 'Gaming', icon: Gamepad2, color: 'orange' },
              { name: 'Fashion', icon: ShoppingCart, color: 'pink' }
            ].map((category) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className="group flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 bg-${category.color}-100 rounded-full flex items-center justify-center group-hover:bg-${category.color}-200 transition-colors mb-2`}>
                  <category.icon className={`w-6 h-6 text-${category.color}-600`} />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <TrendingSection />

      {/* Electronics Section */}
      <ElectronicsSection />

      {/* Fashion Section */}
      <FashionSection />

      {/* Home & Kitchen Section */}
      <HomeKitchenSection />

      {/* Featured Brands */}
      <section className="bg-white py-6">
        <div className="container">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Brands</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'].map((brand) => (
              <div key={brand} className="flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prime Membership Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">✨ Try Premium</h2>
              <p className="text-sm sm:text-base mb-3">FREE fast shipping, exclusive deals, movies, and more</p>
              <ul className="space-y-1 text-xs sm:text-sm max-w-md mx-auto lg:mx-0">
                <li>✓ FREE Two-Day Shipping on eligible items</li>
                <li>✓ Same-Day Delivery in select areas</li>
                <li>✓ Premium Video, Music, and Reading</li>
                <li>✓ Exclusive member-only deals</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-white text-blue-600 rounded-lg p-3 sm:p-4 max-w-xs">
                <h3 className="text-lg sm:text-xl font-bold mb-2">30-Day FREE Trial</h3>
                <p className="text-xs text-gray-600 mb-3">₹999/month after trial</p>
                <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm w-full sm:w-auto">
                  Start Your Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-gray-100 py-8">
        <div className="container">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Priya S.', rating: 5, comment: 'Amazing quality and fast delivery!' },
              { name: 'Rahul M.', rating: 5, comment: 'Best prices and great customer service.' },
              { name: 'Anita K.', rating: 4, comment: 'Good products, easy returns process.' }
            ].map((review, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      {i < review.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-2">"{review.comment}"</p>
                <p className="text-xs font-semibold text-gray-900">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;