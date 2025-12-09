'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import ImageWithFallback from './ImageWithFallback';

interface ProductSliderProps {
  title: string;
  products: Product[];
}

const ProductSlider = ({ title, products }: ProductSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  // Responsive items per view
  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 360) return 2; // Extremely small screens - minimum 2
      if (width < 400) return 3; // Very small screens - minimum 3
      if (width < 640) return 3; // sm screens - minimum 3
      if (width < 768) return 4; // md screens
      if (width < 1024) return 4; // lg screens
      if (width < 1280) return 5; // xl screens
      return 6; // 2xl screens
    }
    return 3; // Default for SSR - minimum 3
  };

  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  // Reset current index when itemsPerView changes to prevent out of bounds
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, currentIndex, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  
  return (
    <div className="bg-white py-4">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md ${
                currentIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg border border-gray-200'
              }`}
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 shadow-md ${
                currentIndex >= maxIndex
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-lg border border-gray-200'
              }`}
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 px-1 sm:px-1.5 md:px-2"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <div className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-orange-300">
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 backdrop-blur-sm"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        wishlistItems.has(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    />
                  </button>

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-2 sm:p-3">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 hover:text-orange-600 transition-colors min-h-[2rem] sm:min-h-[2.5rem] leading-4 sm:leading-5">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Brand */}
                    {product.brand && (
                      <p className="text-xs text-gray-500 mb-1 truncate">{product.brand}</p>
                    )}

                    {/* Rating - Hide on very small screens */}
                    <div className="hidden sm:flex items-center gap-1 mb-2">
                      {product.rating && (
                        <>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating!)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {product.rating} ({product.reviews || 0})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Price in INR */}
                    <div className="flex items-center gap-1 sm:gap-2 mb-2">
                      <span className="text-sm sm:text-lg font-bold text-gray-900">
                        ₹{Math.round(product.price).toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          ₹{Math.round(product.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;