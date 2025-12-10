'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star, Package } from 'lucide-react';
import { useWishlist, WishlistItem } from '@/hooks/useWishlist';
import ImageWithFallback from '@/components/ImageWithFallback';

export default function WishlistPage() {
  const {
    wishlistItems,
    isLoading,
    error,
    wishlistCount,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleRemoveItem = async (productId: string) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', item.product.title);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <span className="font-medium text-gray-900">My Wishlist ({wishlistCount})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Start adding products you love to keep them all in one place.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative">
                    <Link href={`/products/${item.product.slug}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <ImageWithFallback
                          src={
                            item.product.product_images && item.product.product_images.length > 0
                              ? item.product.product_images[0].url
                              : '/placeholder-product.svg'
                          }
                          alt={item.product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          fallback="/placeholder-product.svg"
                        />
                      </div>
                    </Link>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        disabled={removingItems.has(item.product.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from wishlist"
                      >
                        {removingItems.has(item.product.id) ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Badge */}
                    {item.product.badge && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {item.product.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="font-medium text-gray-900 mb-2 hover:text-orange-800 transition-colors line-clamp-2">
                        {item.product.title}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {item.product.rating && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(item.product.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({item.product.total_reviews || 0})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{Math.round(item.product.base_price).toLocaleString('en-IN')}
                      </span>
                      {item.product.compare_price && item.product.compare_price > item.product.base_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{Math.round(item.product.compare_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.product.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.product.quantity === 0}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {item.product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}