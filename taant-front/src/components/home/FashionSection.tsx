'use client';

import React, { useEffect, useState } from 'react';
import ProductSlider from '../ProductSlider';
import { apiService } from '@/services/api';
import { Product } from '@/types';

const FashionSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFashion = async () => {
      try {
        const fashionProducts = await apiService.getProductsByCategory('80b389e6-4822-4063-9532-59a841d062f3', 6);
        setProducts(fashionProducts);
      } catch (error) {
        console.error('Failed to fetch fashion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFashion();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">👗</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Fashion Trends
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container">
        {/* Fashion header with elegance */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">👗</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Fashion Trends
              </h2>
              <p className="text-sm text-gray-600 mt-1">Style that speaks your language</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
              New Collection
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              Limited Edition
            </span>
          </div>
        </div>

        {/* Fashion product grid with card styling */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-pink-100 hover:border-pink-300"
            >
              {/* Product image with overlay */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Discount badge */}
                {product.badge && product.badge.includes('%') && (
                  <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.badge}
                  </div>
                )}

                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                    <button className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium hover:bg-pink-50 transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div className="p-3">
                <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
                  {product.name}
                </h3>

                {product.brand && (
                  <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                )}

                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xs text-pink-400">
                        {i < Math.floor(product.rating || 0) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {product.rating}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-gray-900">
                    ₹{Math.round(product.price * 83).toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{Math.round(product.originalPrice * 83).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fashion categories */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['Ethnic Wear', 'Western Wear', 'Footwear', 'Accessories', 'Bags', 'Jewelry'].map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-white text-pink-600 border border-pink-200 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors cursor-pointer"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FashionSection;