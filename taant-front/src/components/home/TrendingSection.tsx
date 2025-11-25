'use client';

import React, { useEffect, useState } from 'react';
import ProductSlider from '../ProductSlider';
import { apiService } from '@/services/api';
import { Product } from '@/types';
import { TrendingUp, Clock, Heart } from 'lucide-react';

const TrendingSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trendingProducts = await apiService.getTrendingProducts(10);
        setProducts(trendingProducts);
      } catch (error) {
        console.error('Failed to fetch trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-orange-600">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative">
        {/* Trending header with flame icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  🔥 Trending Now
                </h2>
                <p className="text-sm text-gray-600 mt-1">Hot picks everyone's talking about</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                <span>Limited Time</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <Heart className="w-4 h-4 fill-current" />
                <span>Customer Favorites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trending product slider with special styling */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-100">
          <ProductSlider title="" products={products} />
        </div>

        {/* Trending indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Fast Selling', count: '2.3k+', icon: '⚡', color: 'orange' },
            { label: 'Top Rated', count: '4.8★', icon: '⭐', color: 'yellow' },
            { label: 'Wishlisted', count: '5.1k+', icon: '❤️', color: 'red' },
            { label: 'Limited Stock', count: 'Only few left!', icon: '⏰', color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className={`bg-white rounded-lg p-3 border border-${stat.color}-100 text-center`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.count}</div>
            </div>
          ))}
        </div>

        {/* Trending tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['#BestSeller', '#Trending', '#MustHave', '#Viral', '#HotDeal', '#TopPick'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-white text-orange-600 border border-orange-200 rounded-full text-xs font-medium hover:bg-orange-50 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;