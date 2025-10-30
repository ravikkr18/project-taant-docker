'use client';

import React from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ProductSlider from '@/components/ProductSlider';
import { Product } from '@/types';
import { products } from '@/data/products';

const HomePage = () => {
  // Use products from data file with different filters
  const trendingNow = products.slice(0, 6);
  const electronicsDeals = products.filter(p => p.categoryId === 'electronics').slice(0, 6);
  const fashionItems = products.filter(p => p.categoryId === 'fashion').slice(0, 4);
  const homeAndKitchen = products.filter(p => p.categoryId === 'home-kitchen').slice(0, 4);
  const sportsAndOutdoors = products.filter(p => p.categoryId === 'sports-outdoors').slice(0, 4);

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Slider - Clean without text/buttons */}
      <HeroSlider />

      {/* Features Bar */}
      <section className="bg-white py-2 sm:py-3 border-b border-gray-200">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="text-orange-500 text-lg sm:text-xl">🚚</div>
              <div>
                <h3 className="text-xs font-semibold">FREE Shipping</h3>
                <p className="text-xs text-gray-600 hidden sm:block">On orders $35+</p>
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

      {/* Trending Now */}
      {trendingNow.length > 0 && <ProductSlider title="Trending Now" products={trendingNow} />}

      {/* Today's Deals - Electronics */}
      {electronicsDeals.length > 0 && <ProductSlider title="Today's Deals - Electronics" products={electronicsDeals} />}

      {/* Fashion Essentials */}
      {fashionItems.length > 0 && <ProductSlider title="Fashion Essentials" products={fashionItems} />}

      {/* Home & Kitchen */}
      {homeAndKitchen.length > 0 && <ProductSlider title="Home & Kitchen Favorites" products={homeAndKitchen} />}

      {/* Sports & Outdoors */}
      {sportsAndOutdoors.length > 0 && <ProductSlider title="Sports & Outdoors Gear" products={sportsAndOutdoors} />}

      {/* Prime Membership Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Try Prime</h2>
              <p className="text-sm sm:text-base mb-3">FREE fast shipping, exclusive deals, movies, and more</p>
              <ul className="space-y-1 text-xs sm:text-sm max-w-md mx-auto lg:mx-0">
                <li>✓ FREE Two-Day Shipping on eligible items</li>
                <li>✓ Same-Day Delivery in select areas</li>
                <li>✓ Prime Video, Music, and Reading</li>
                <li>✓ Exclusive member-only deals</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-white text-blue-600 rounded-lg p-3 sm:p-4 max-w-xs">
                <h3 className="text-lg sm:text-xl font-bold mb-2">30-Day FREE Trial</h3>
                <p className="text-xs text-gray-600 mb-3">$14.99/month after trial</p>
                <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm w-full sm:w-auto">
                  Start Your Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More sliders to make homepage longer */}
      {products.length > 4 && <ProductSlider title="Gift Ideas Under $50" products={products.slice(0, 4)} />}
      {fashionItems.length > 3 && <ProductSlider title="Customer Top Rated" products={fashionItems.slice(0, 3)} />}
      {electronicsDeals.length > 3 && <ProductSlider title="New Arrivals" products={electronicsDeals.slice(0, 3)} />}
      {homeAndKitchen.length > 3 && <ProductSlider title="Best Sellers in Home" products={homeAndKitchen.slice(0, 3)} />}
      {sportsAndOutdoors.length > 3 && <ProductSlider title="Outdoor Adventure Gear" products={sportsAndOutdoors.slice(0, 3)} />}
    </div>
  );
};

export default HomePage;