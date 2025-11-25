'use client';

import React, { useEffect, useState } from 'react';
import ProductSlider from '../ProductSlider';
import { apiService } from '@/services/api';
import { Product } from '@/types';

const HomeKitchenSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeKitchen = async () => {
      try {
        const homeProducts = await apiService.getProductsByCategory('009f926c-eaef-47b0-acef-ee2d3a7e7d30', 6);
        setProducts(homeProducts);
      } catch (error) {
        console.error('Failed to fetch home & kitchen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeKitchen();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-8">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏠</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Home & Living
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
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="container">
        {/* Home & Kitchen header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🏠</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Home & Living
              </h2>
              <p className="text-sm text-gray-600 mt-1">Transform your space into a sanctuary</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Eco-Friendly
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              Premium Quality
            </span>
          </div>
        </div>

        {/* Grid layout with feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {products.slice(0, 3).map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />

                {/* Icon overlay */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <span className="text-lg">
                    {index === 0 ? '🛋️' : index === 1 ? '🍳' : '🌿'}
                  </span>
                </div>

                {product.badge && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.badge}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      ₹{Math.round(product.price * 83).toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{Math.round(product.originalPrice * 83).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>⭐</span>
                    <span>{product.rating}</span>
                    <span>({product.reviews})</span>
                  </div>
                </div>

                <button className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining products in slider */}
        {products.length > 3 && (
          <div className="bg-white rounded-xl p-4 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">More Home Essentials</h3>
            <ProductSlider title="" products={products.slice(3)} />
          </div>
        )}

        {/* Home categories */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['Furniture', 'Kitchen', 'Decor', 'Bedding', 'Storage', 'Lighting'].map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-white text-green-600 border border-green-200 rounded-full text-sm font-medium hover:bg-green-50 transition-colors cursor-pointer"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeKitchenSection;