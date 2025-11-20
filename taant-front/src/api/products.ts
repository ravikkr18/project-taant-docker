const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://94.136.187.1:4000';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  base_price: number;
  compare_price?: number;
  status: string;
  reviews: number;
  rating: number;
  brand?: string;
  sku?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  a_plus_content?: string;
  a_plus_sections?: any;
  faqs?: any[];
  categories: {
    id: string;
    name: string;
    slug: string;
  };
  suppliers: {
    id: string;
    business_name: string;
    slug: string;
  };
  product_images: {
    id: string;
    url: string;
    alt_text?: string;
    file_name: string;
    file_size: number;
    file_type: string;
    position: number;
    is_primary: boolean;
  }[];
  product_variants: {
    id: string;
    sku: string;
    title: string;
    price: number;
    compare_price?: number;
    cost_price?: number;
    weight?: number;
    barcode?: string;
    dimensions?: any;
    inventory_quantity: number;
    inventory_policy: string;
    requires_shipping: boolean;
    taxable: boolean;
    inventory_tracking: boolean;
    low_stock_threshold: number;
    allow_backorder: boolean;
    position: number;
    options?: any;
    image_url?: string;
    image_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    product_id: string;
    tax_code?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  weight?: number;
  inventory_quantity: number;
  inventory_policy: string;
  requires_shipping: boolean;
  taxable: boolean;
  barcode?: string;
  position: number;
  option1?: string;
  option2?: string;
  option3?: string;
  inStock?: boolean;
  color?: string;
  image?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  position: number;
  is_primary: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  query?: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper function to transform API product to frontend format
export const transformProductForFrontend = (apiProduct: Product) => {
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    slug: apiProduct.slug,
    description: apiProduct.description,
    short_description: apiProduct.short_description,
    price: apiProduct.base_price,
    originalPrice: apiProduct.compare_price,
    image: apiProduct.product_images?.find(img => img.is_primary)?.url || apiProduct.product_images?.[0]?.url || '',
    images: apiProduct.product_images?.map(img => img.url) || [],
    category: apiProduct.categories?.name || '',
    categoryId: apiProduct.categories?.id || '',
    rating: apiProduct.rating || 0,
    reviews: apiProduct.reviews || 0,
    inStock: apiProduct.status === 'active',
    badge: apiProduct.rating > 4.5 ? 'Top Rated' : undefined,
    brand: apiProduct.brand || apiProduct.suppliers?.business_name,
    sku: apiProduct.sku,
    variants: apiProduct.product_variants?.map((variant) => ({
      id: variant.id,
      name: variant.title,
      price: variant.price,
      originalPrice: variant.compare_price || undefined,
      inStock: variant.inventory_quantity > 0 && variant.is_active,
      color: variant.title,
      image: variant.image_id
        ? (apiProduct.product_images?.find((img: any) => img.id === variant.image_id)?.url || apiProduct.product_images?.[0]?.url)
        : apiProduct.product_images?.[0]?.url,
      sku: variant.sku,
      options: variant.options || [],
      // Additional database fields
      cost_price: variant.cost_price || null,
      inventory_quantity: variant.inventory_quantity || 0,
      position: variant.position || 0,
      inventory_tracking: variant.inventory_tracking || true,
      low_stock_threshold: variant.low_stock_threshold || 10,
      allow_backorder: variant.allow_backorder || false,
      requires_shipping: variant.requires_shipping || true,
      taxable: variant.taxable || true,
      tax_code: variant.tax_code || null,
      is_active: variant.is_active || true,
      image_id: variant.image_id || null
    })) || [],
    weight: apiProduct.weight,
    dimensions: apiProduct.width && apiProduct.height && apiProduct.length
      ? { length: apiProduct.length, width: apiProduct.width, height: apiProduct.height }
      : undefined,
    specifications: apiProduct,
    aPlusSections: apiProduct.a_plus_sections || [],
    faqs: apiProduct.faqs || []
  };
};

// API Functions
export const getPublicProducts = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  } = {}
): Promise<PaginatedProductsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.category) searchParams.append('category', params.category);
  if (params.status) searchParams.append('status', params.status);

  const response = await fetch(`${API_BASE_URL}/public/products?${searchParams}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return response.json();
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const response = await fetch(`${API_BASE_URL}/public/products/slug/${slug}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : null;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const response = await fetch(`${API_BASE_URL}/public/products/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : null;
};

export const getProductImages = async (id: string): Promise<ProductImage[]> => {
  const response = await fetch(`${API_BASE_URL}/public/products/${id}/images`);

  if (!response.ok) {
    throw new Error(`Failed to fetch product images: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : [];
};

export const getProductVariants = async (id: string): Promise<ProductVariant[]> => {
  const response = await fetch(`${API_BASE_URL}/public/products/${id}/variants`);

  if (!response.ok) {
    throw new Error(`Failed to fetch product variants: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : [];
};

export const getRelatedProducts = async (id: string, limit: number = 6): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/public/products/${id}/related?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch related products: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : [];
};

export const getCategories = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/public/products/categories`);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : [];
};

export const getFeaturedProducts = async (limit: number = 10): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/public/products/featured?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch featured products: ${response.status}`);
  }

  const result = await response.json();
  return result.success ? result.data : [];
};

export const searchProducts = async (
  query: string,
  params: {
    page?: number;
    limit?: number;
    category?: string;
  } = {}
): Promise<PaginatedProductsResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('q', query);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.category) searchParams.append('category', params.category);

  const response = await fetch(`${API_BASE_URL}/public/products/search?${searchParams}`);

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.status}`);
  }

  return response.json();
};