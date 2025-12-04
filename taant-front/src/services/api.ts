import { Product, Category } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';

class ApiService {
  private async fetchWithFallback<T>(
    endpoint: string,
    fallbackData: T,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}/public${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'API request failed');
      }
    } catch (error) {
      console.warn(`API call failed for ${endpoint}, using fallback data:`, error);
      return fallbackData;
    }
  }

  async getTrendingProducts(limit: number = 8): Promise<Product[]> {
    const fallbackProducts: Product[] = [
      {
        id: 'trend-1',
        name: 'Wireless Bluetooth Earbuds',
        slug: 'wireless-bluetooth-earbuds',
        description: 'Premium sound quality with active noise cancellation',
        price: 2999,
        originalPrice: 4999,
        image: 'https://picsum.photos/seed/earbuds/800/800.jpg',
        category: 'Electronics',
        categoryId: 'electronics',
        rating: 4.5,
        reviews: 234,
        inStock: true,
        badge: 'Hot',
        brand: 'SoundPro'
      },
      {
        id: 'trend-2',
        name: 'Smart Fitness Watch',
        slug: 'smart-fitness-watch',
        description: 'Track your health and fitness goals',
        price: 4999,
        originalPrice: 6999,
        image: 'https://picsum.photos/seed/smartwatch/800/800.jpg',
        category: 'Electronics',
        categoryId: 'electronics',
        rating: 4.3,
        reviews: 189,
        inStock: true,
        badge: 'Trending',
        brand: 'FitTech'
      }
    ];

    return this.fetchWithFallback(`/homepage/trending?limit=${limit}`, fallbackProducts);
  }

  async getDealsOfTheDay(limit: number = 6): Promise<Product[]> {
    const fallbackDeals: Product[] = [
      {
        id: 'deal-1',
        name: '4K Ultra HD Smart TV',
        slug: '4k-ultra-hd-smart-tv',
        description: '55-inch 4K Smart LED TV with built-in streaming apps',
        price: 24999,
        originalPrice: 39999,
        image: 'https://picsum.photos/seed/smarttv/800/800.jpg',
        category: 'Electronics',
        categoryId: 'electronics',
        rating: 4.4,
        reviews: 156,
        inStock: true,
        badge: '38% OFF',
        brand: 'ViewMaster'
      }
    ];

    return this.fetchWithFallback(`/homepage/deals?limit=${limit}`, fallbackDeals);
  }

  async getProductsByCategory(categoryId: string, limit: number = 10): Promise<Product[]> {
    const fallbackProducts: Product[] = [
      {
        id: `cat-${categoryId}-1`,
        name: `Product in ${categoryId}`,
        slug: `product-${categoryId}`,
        description: `Great product from ${categoryId} category`,
        price: 1999,
        originalPrice: 2999,
        image: `https://picsum.photos/seed/${categoryId}-1/800/800.jpg`,
        category: categoryId,
        categoryId: categoryId,
        rating: 4.2,
        reviews: 89,
        inStock: true,
        badge: '25% OFF'
      }
    ];

    return this.fetchWithFallback(`/homepage/category/${categoryId}?limit=${limit}`, fallbackProducts);
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    const fallbackProducts: Product[] = [
      {
        id: 'feat-1',
        name: 'Premium Leather Jacket',
        slug: 'premium-leather-jacket',
        description: 'Genuine leather jacket with modern styling',
        price: 8999,
        originalPrice: 12999,
        image: 'https://picsum.photos/seed/jacket/800/800.jpg',
        category: 'Fashion',
        categoryId: 'fashion',
        rating: 4.6,
        reviews: 312,
        inStock: true,
        badge: '31% OFF',
        brand: 'StyleCo'
      }
    ];

    return this.fetchWithFallback(`/homepage/featured?limit=${limit}`, fallbackProducts);
  }

  async getCategories(): Promise<Category[]> {
    const fallbackCategories: Category[] = [
      {
        id: 'electronics',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and electronics',
        image: 'https://picsum.photos/seed/electronics/400/300.jpg'
      },
      {
        id: 'fashion',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trendy clothing and accessories',
        image: 'https://picsum.photos/seed/fashion/400/300.jpg'
      },
      {
        id: 'home-kitchen',
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Everything for your home',
        image: 'https://picsum.photos/seed/home/400/300.jpg'
      },
      {
        id: 'beauty-health',
        name: 'Beauty & Health',
        slug: 'beauty-health',
        description: 'Personal care and wellness',
        image: 'https://picsum.photos/seed/beauty/400/300.jpg'
      },
      {
        id: 'sports-outdoors',
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports and adventure gear',
        image: 'https://picsum.photos/seed/sports/400/300.jpg'
      }
    ];

    return this.fetchWithFallback('/products/categories', fallbackCategories);
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const fallbackResults: Product[] = [
      {
        id: 'search-1',
        name: `Search result for ${query}`,
        slug: `search-${query}`,
        description: `Product matching your search for ${query}`,
        price: 1999,
        image: `https://picsum.photos/seed/search-${query}/800/800.jpg`,
        category: 'General',
        categoryId: 'general',
        rating: 4.0,
        reviews: 45,
        inStock: true
      }
    ];

    return this.fetchWithFallback(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`, fallbackResults);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const result = await fetch(`${API_BASE_URL}/public/products/slug/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const response = result as Response; // Type assertion
      const apiResult = await response.json();

      if (apiResult.success) {
        return apiResult.data;
      } else {
        throw new Error(apiResult.message || 'Failed to fetch product');
      }
    } catch (error) {
      console.warn(`Failed to fetch product ${slug}:`, error);
      return null;
    }
  }
}

export const apiService = new ApiService();