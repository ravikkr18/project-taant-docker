/**
 * API Client for taant-backend communication
 * Replaces direct Supabase calls with secure backend API calls
 */

import { supabase } from './supabase/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface Product {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  category_id: string;
  base_price: number;
  compare_price?: number;
  cost_price?: number;
  track_inventory: boolean;
  selling_policy?: string;
  manufacturer?: string;
  model_number?: string;
  origin_country?: string;
  shipping_requirements?: string;
  a_plus_content?: string;
  a_plus_sections?: any;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: string;
  supplier_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    parent_id?: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface SupplierProfile {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  tax_id?: string;
  business_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SupplierStats {
  totalProducts: number;
  recentOrders: number;
  supplierId: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use the backend URL from environment or fallback to external IP
    this.baseUrl = process.env.NEXT_PUBLIC_TAANT_BACKEND_URL || 'http://94.136.187.1:4000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token from Supabase session
    const token = await this.getAuthToken();

    const defaultHeaders: HeadersInit = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Only set Content-Type to application/json if the body is not FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        // For 304 responses, we need to return the cached data or throw an error to force refetch
        throw new Error('Cache expired - please refresh');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting auth session:', error);
        return null;
      }

      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Product API methods
  async getProducts(
    supplierId?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<{ data: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const params = new URLSearchParams();
    if (supplierId) params.append('supplierId', supplierId);
    if (categoryId) params.append('categoryId', categoryId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    // Add cache-busting timestamp
    params.append('_t', Date.now().toString());

    console.log('API Client: Making products request with params:', params.toString());
    const response = await this.request<{ success: boolean; data: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number }; message: string }>(`/api/products?${params}`);
    console.log('API Client: Received products response');
    return {
      data: response.data as any,
      pagination: (response as any).pagination
    };
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(productData: Partial<Product> & { supplier_id: string }): Promise<Product> {
    const response = await this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<Product>, supplierId: string): Promise<Product> {
    const response = await this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        productData,
        supplier_id: supplierId
      }),
    });
    return response.data;
  }

  async deleteProduct(id: string, supplierId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({
        supplier_id: supplierId
      }),
    });
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/api/products/categories');
    return response.data;
  }

  async getProductStats(supplierId: string): Promise<{ totalProducts: number }> {
    const params = new URLSearchParams({
      supplierId
    });
    const response = await this.request<{ totalProducts: number }>(`/api/products/stats?${params}`);
    return response.data;
  }

  // Supplier API methods
  async getSupplierProfile(): Promise<SupplierProfile> {
    const response = await this.request<SupplierProfile>('/api/suppliers/profile');
    return response.data;
  }

  async updateSupplierProfile(profileData: Partial<SupplierProfile>): Promise<SupplierProfile> {
    const response = await this.request<SupplierProfile>('/api/suppliers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  }

  async getSupplierStats(): Promise<SupplierStats> {
    const response = await this.request<SupplierStats>('/api/suppliers/stats');
    return response.data;
  }

  async getSupplierProducts(limit: number = 10, offset: number = 0): Promise<Product[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await this.request<Product[]>(`/api/suppliers/products?${params}`);
    return response.data;
  }

  // Variant API methods
  async getProductVariants(productId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/api/products/${productId}/variants`);
    return response.data;
  }

  async createProductVariant(productId: string, variantData: any): Promise<any> {
    const response = await this.request<any>(`/api/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantData),
    });
    return response.data;
  }

  async updateProductVariant(productId: string, variantId: string, variantData: any): Promise<any> {
    const response = await this.request<any>(`/api/products/${productId}/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(variantData),
    });
    return response.data;
  }

  async deleteProductVariant(productId: string, variantId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  // A+ Content Images methods
  async getAPlusContentImages(productId: string): Promise<any[]> {
    console.log('📡 API Client: Getting A+ content images for product:', productId)
    const response = await this.request<{ success: boolean; data: any[]; message: string }>(`/api/products/${productId}/content-images`);
    console.log('📡 API Client: Raw response:', response)
    console.log('📡 API Client: Response data:', response.data)
    return response.data;
  }

  async createAPlusContentImage(productId: string, imageData: any): Promise<any> {
    console.log('🔍 API Client: Creating A+ content image for product:', productId);
    console.log('🔍 API Client: Image data being sent:', imageData);

    const response = await this.request<any>(`/api/products/${productId}/content-images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
    });

    console.log('🔍 API Client: Raw response from backend:', response);
    console.log('🔍 API Client: Response data:', response.data);

    // FIXED: Return full response object to maintain success/message structure
    return response;
  }

  async updateAPlusContentImage(productId: string, imageId: string, imageData: any): Promise<any> {
    const response = await this.request<any>(`/api/products/${productId}/content-images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(imageData),
    });
    return response.data;
  }

  async updateAPlusContentImagePositions(productId: string, positions: { id: string; position: number }[]): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/${productId}/content-images/positions`, {
      method: 'PUT',
      body: JSON.stringify({ positions }),
    });
    return response.data;
  }

  async deleteAPlusContentImage(productId: string, imageId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/${productId}/content-images/${imageId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  // Product Images methods
  async getProductImages(productId: string): Promise<any[]> {
    console.log('📡 API Client: Getting product images for product:', productId)
    const response = await this.request<{ success: boolean; data: any[]; message: string }>(`/api/products/${productId}/images`);
    console.log('📡 API Client: Product images response:', response)
    return response.data;
  }

  async createProductImage(productId: string, imageData: any): Promise<any> {
    const response = await this.request<any>(`/api/products/${productId}/images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
    return response.data;
  }

  async updateProductImagePositions(productId: string, positions: { id: string; position: number }[]): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/${productId}/images/positions`, {
      method: 'PUT',
      body: JSON.stringify({ positions }),
    });
    return response.data;
  }

  async updateProductImage(productId: string, imageId: string, imageData: any): Promise<any> {
    const response = await this.request<any>(`/api/products/${productId}/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(imageData),
    });
    return response.data;
  }

  async deleteProductImage(productId: string, imageId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async uploadProductImage(formData: FormData): Promise<{ success: boolean; data: { url: string; key: string; originalName: string; size: number; mimetype: string }; message: string }> {
    try {
      console.log('API Client: Starting uploadProductImage')
      const response = await this.request<{ success: boolean; data: { url: string; key: string; originalName: string; size: number; mimetype: string }; message: string }>('/api/products/upload-product-image', {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type for FormData, base request method will handle it
      });
      console.log('API Client: Product image upload response:', response)

      // Check if response has the expected structure
      if (response && typeof response === 'object') {
        if (response.success && response.data && response.data.url) {
          // Normal case: response is wrapped
          return response;
        } else if (response.url) {
          // Direct case: response is the data itself
          return {
            success: true,
            data: response,
            message: 'Product image uploaded successfully'
          };
        }
      }

      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('API Client: Product image upload failed with error:', error)
      throw error
    }
  }

  async uploadAPlusImage(formData: FormData): Promise<{ success: boolean; data: { url: string }; message: string }> {
    try {
      console.log('API Client: Starting uploadAPlusImage')
      const response = await this.request<{ success: boolean; data: { url: string; key: string; originalName: string; size: number; mimetype: string }; message: string }>('/api/products/upload-a-plus-image', {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type for FormData, base request method will handle it
      });
      console.log('API Client: Upload response:', response)

      // Check if response has the expected structure
      if (response && typeof response === 'object') {
        if (response.success && response.data && response.data.url) {
          // Normal case: response is wrapped
          console.log('✅ API Client: Upload successful, structure validated:', response.success);
          return response;
        } else if (response.url) {
          // Direct case: response is the data itself
          console.log('✅ API Client: Upload successful (direct response)');
          return {
            success: true,
            data: response,
            message: 'A+ content image uploaded successfully'
          };
        } else {
          // Log the actual response structure for debugging
          console.error('❌ API Client: Invalid response structure:', {
            response,
            hasSuccess: !!response.success,
            hasData: !!response.data,
            hasDataUrl: !!(response.data && response.data.url),
            hasDirectUrl: !!response.url
          });
        }
      }

      console.error('❌ API Client: Invalid response structure, throwing error');
      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('API Client: Upload failed with error:', error)
      throw error
    }
  }

  async uploadVariantImage(variantId: string, formData: FormData): Promise<{ success: boolean; data: { id: string; url: string; key: string; originalName: string; size: number; mimetype: string; position: number; is_primary: boolean }; message: string }> {
    try {
      console.log('API Client: Starting uploadVariantImage for variant:', variantId)
      const response = await this.request<{ success: boolean; data: { id: string; url: string; key: string; originalName: string; size: number; mimetype: string; position: number; is_primary: boolean }; message: string }>(`/api/products/variants/${variantId}/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {}, // Don't set Content-Type for FormData, base request method will handle it
      });
      console.log('API Client: Variant upload response:', response)

      // Check if response has the expected structure
      if (response && typeof response === 'object') {
        if (response.success && response.data && response.data.url) {
          // Normal case: response is wrapped
          return response;
        } else if (response.url) {
          // Direct case: response is the data itself
          return {
            success: true,
            data: response,
            message: 'Variant image uploaded successfully'
          };
        } else {
          throw new Error('Invalid response structure');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('API Client: Variant image upload failed with error:', error)
      return {
        success: false,
        data: { url: '', key: '', originalName: '', size: 0, mimetype: '' },
        message: error instanceof Error ? error.message : 'Variant image upload failed'
      }
    }
  }

  async getVariantImages(variantId: string): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await this.request<{ success: boolean; data: any[]; message: string }>(`/api/products/variants/${variantId}/images`);
    return response.data;
  }

  async updateVariantImagePrimary(variantId: string, imageId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/variants/${variantId}/images/${imageId}/primary`, {
      method: 'PUT',
    });
    return response;
  }

  async deleteVariantImage(variantId: string, imageId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/api/products/variants/${variantId}/images/${imageId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async convertBlobToS3(blobUrl: string, fileName: string): Promise<{ success: boolean; data: { s3Url: string }; message: string }> {
    const response = await this.request<{ success: boolean; data: { s3Url: string }; message: string }>('/api/products/convert-blob-to-s3', {
      method: 'POST',
      body: JSON.stringify({ blobUrl, fileName }),
    });
    return response.data;
  }

  async getOrphanedImages(): Promise<{ success: boolean; data: { totalS3Images: number; totalDbImages: number; orphanedImages: any[]; orphanedCount: number }; message: string }> {
    const response = await this.request<{ success: boolean; data: { totalS3Images: number; totalDbImages: number; orphanedImages: any[]; orphanedCount: number }; message: string }>('/api/products/orphaned-images');
    return response.data;
  }

  async cleanupOrphanedImages(imageKeys: string[]): Promise<{ success: boolean; data: { deletedImages: string[]; deletedCount: number }; message: string }> {
    const response = await this.request<{ success: boolean; data: { deletedImages: string[]; deletedCount: number }; message: string }>('/api/products/cleanup-orphaned-images', {
      method: 'DELETE',
      body: JSON.stringify({ imageKeys }),
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

// Export types
export type { Product, Category, SupplierProfile, SupplierStats, ApiResponse };