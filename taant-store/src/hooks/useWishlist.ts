import { useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    rating?: number;
    reviews?: number;
    images: Array<{
      id: string;
      image_url: string;
      is_primary: boolean;
    }>;
    variants: Array<{
      id: string;
      title: string;
      price: number;
    }>;
    stockStatus?: string;
    badge?: string;
    description?: string;
    features?: any[];
    specifications?: any;
  };
  addedAt: string;
}

export interface UseWishlistOptions {
  autoLoad?: boolean;
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const { autoLoad = true } = options;

  // Get auth token from localStorage or sessionStorage
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    // Try to get from localStorage first, then sessionStorage using the same key as AuthContext
    const localToken = localStorage.getItem('authToken');
    const sessionToken = sessionStorage.getItem('authToken');

    // Return the token directly (no JSON parsing needed)
    if (localToken) {
      return localToken;
    }

    if (sessionToken) {
      return sessionToken;
    }

    return null;
  };

  // Make authenticated API request
  const makeAuthRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const baseUrl = 'http://94.136.187.1:4000';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    return fetch(fullUrl, {
      ...options,
      headers,
    });
  };

  // Load user's wishlist
  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await makeAuthRequest('/api/wishlists');

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, return empty wishlist
          setWishlistItems([]);
          setWishlistCount(0);
          return;
        }
        throw new Error('Failed to load wishlist');
      }

      const data = await response.json();
      setWishlistItems(data.data || []);
      setWishlistCount(data.data?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setWishlistItems([]);
      setWishlistCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to wishlist
  const addToWishlist = async (productId: string): Promise<boolean> => {
    try {
      const response = await makeAuthRequest(`/api/wishlists/add/${productId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to wishlist');
      }

      // Reload wishlist to get updated state
      await loadWishlist();
      return true;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      throw err;
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    try {
      const response = await makeAuthRequest(`/api/wishlists/remove/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from wishlist');
      }

      // Update local state immediately for better UX
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      setWishlistCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      throw err;
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (productId: string): Promise<{ added: boolean; message: string }> => {
    try {
      const response = await makeAuthRequest(`/api/wishlists/toggle/${productId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle wishlist');
      }

      const result = await response.json();

      // Update local state immediately
      if (result.data.added) {
        setWishlistCount(prev => prev + 1);
      } else {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        setWishlistCount(prev => Math.max(0, prev - 1));
      }

      return result.data;
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      throw err;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product.id === productId);
  };

  // Check product wishlist status via API
  const checkWishlistStatus = async (productId: string): Promise<boolean> => {
    try {
      const response = await makeAuthRequest(`/api/wishlists/check/${productId}`);

      if (!response.ok) {
        if (response.status === 401) {
          return false; // Not authenticated
        }
        throw new Error('Failed to check wishlist status');
      }

      const data = await response.json();
      return data.data?.isInWishlist || false;
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      return false;
    }
  };

  // Get wishlist count
  const loadWishlistCount = async () => {
    try {
      const response = await makeAuthRequest('/api/wishlists/count');

      if (!response.ok) {
        if (response.status === 401) {
          setWishlistCount(0);
          return;
        }
        throw new Error('Failed to get wishlist count');
      }

      const data = await response.json();
      setWishlistCount(data.data?.count || 0);
    } catch (err) {
      console.error('Error getting wishlist count:', err);
      setWishlistCount(0);
    }
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
    setWishlistCount(0);
  };

  // Auto-load wishlist on mount
  useEffect(() => {
    if (autoLoad) {
      loadWishlist();
    }
  }, [autoLoad]);

  return {
    wishlistItems,
    isLoading,
    error,
    wishlistCount,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    checkWishlistStatus,
    loadWishlistCount,
    clearWishlist,
  };
};