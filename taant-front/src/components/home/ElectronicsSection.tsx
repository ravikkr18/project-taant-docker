'use client';

import React, { useEffect, useState } from 'react';
import ProductSlider from '../ProductSlider';
import { apiService } from '@/services/api';
import { Product } from '@/types';

const ElectronicsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectronics = async () => {
      try {
        const electronicsProducts = await apiService.getProductsByCategory('electronics', 8);
        setProducts(electronicsProducts);
      } catch (error) {
        console.error('Failed to fetch electronics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchElectronics();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Tech Deals
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
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
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container">
        {/* Header with gradient text and icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Tech Deals
              </h2>
              <p className="text-sm text-gray-600 mt-1">Latest gadgets at unbeatable prices</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <span>✓</span>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <span>✓</span>
              <span>Warranty</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <span>✓</span>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Blue-themed product slider */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-transparent rounded-2xl -z-10"></div>
          <ProductSlider title="" products={products} />
        </div>

        {/* Electronics category pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['Smartphones', 'Laptops', 'Audio', 'Cameras', 'Gaming', 'Accessories'].map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ElectronicsSection;