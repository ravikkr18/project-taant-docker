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
  quantity?: number;
  product_type?: string;
  visibility?: string;
  warranty_months?: number;
  barcode?: string;
  model_number?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  dimensions?: any;
  a_plus_content_images?: {
    id: string;
    product_id: string;
    url: string;
    alt_text?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    width?: number;
    height?: number;
    position: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }[];
  faqs?: any[];
  product_details?: {
    // Basic Specifications from Product Details tab
    weight?: number;
    warranty_months?: number;
    origin_country?: string;
    model_number?: string;

    // Dimensions
    length?: number;
    width?: number;
    height?: number;

    // Additional fields from Product Details tab
    manufacturer?: string;
    warranty_text?: string;
    shipping_requirements?: string;

    // Additional Product Details section
    simple_fields?: any[];
  };
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
    variant_images?: {
      id: string;
      url: string;
      alt_text?: string;
      file_name?: string;
      file_size?: number;
      file_type?: string;
      position: number;
      is_primary: boolean;
    }[];
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
  variant_images?: any[];
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
  // Get main product images from product_images, sorted by position and primary first
  const mainProductImages = apiProduct.product_images?.sort((a: any, b: any) => {
    // Primary image always comes first (position 0)
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    // Then sort by position
    return a.position - b.position;
  }) || [];

  const primaryImage = mainProductImages.find((img: any) => img.is_primary)?.url || mainProductImages[0]?.url || '';

  // Transform product_variants to include proper variant images
  const variants = apiProduct.product_variants?.map((variant) => {
    // Use variant-specific images from variant_images array
    let variantImageUrl = primaryImage;
    let variantSpecificImages: any[] = [];

    // Check if variant has its own variant_images
    if (variant.variant_images && Array.isArray(variant.variant_images) && variant.variant_images.length > 0) {
      // Sort variant images: primary first, then by position
      const sortedVariantImages = variant.variant_images.sort((a: any, b: any) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.position - b.position;
      });

      variantSpecificImages = sortedVariantImages;
      variantImageUrl = sortedVariantImages[0]?.url || primaryImage;

      console.log(`✅ Variant "${variant.title}" has ${sortedVariantImages.length} variant images, primary image: ${variantImageUrl}`);
    } else {
      // No variant-specific images, fall back to main product images
      console.warn(`⚠️ Variant "${variant.title}" has no variant_images, falling back to main product images`);
      variantSpecificImages = [...mainProductImages];
      variantImageUrl = primaryImage;
    }

    return {
      id: variant.id,
      name: variant.title,
      price: variant.price,
      originalPrice: variant.compare_price || undefined,
      inStock: variant.inventory_quantity > 0 && variant.is_active,
      color: variant.title,
      image: variantImageUrl,
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
      image_id: variant.image_id || null,
      // Store variant-specific image gallery
      variant_images: variantSpecificImages
    };
  }) || [];

  return {
    id: apiProduct.id,
    name: apiProduct.title,
    slug: apiProduct.slug,
    description: apiProduct.description,
    short_description: apiProduct.short_description,
    price: apiProduct.base_price,
    originalPrice: apiProduct.compare_price,
    image: primaryImage,
    images: mainProductImages.map((img: any) => img.url) || [],
    category: apiProduct.categories?.name || '',
    categoryId: apiProduct.categories?.id || '',
    rating: apiProduct.rating || 0,
    reviews: apiProduct.reviews || 0,
    inStock: (apiProduct.status === 'active' || apiProduct.status === 'published'),
    badge: apiProduct.rating > 4.5 ? 'Top Rated' : undefined,
    brand: apiProduct.brand || apiProduct.suppliers?.business_name,
    sku: apiProduct.sku,
    quantity: apiProduct.quantity,
    product_type: apiProduct.product_type,
    visibility: apiProduct.visibility,
    warranty_months: apiProduct.warranty_months,
    barcode: apiProduct.barcode,
    model_number: apiProduct.model_number,
    variants: variants,
    // Main product details (not variant details)
    weight: apiProduct.weight,
    dimensions: apiProduct.dimensions ||
      (apiProduct.width && apiProduct.height && apiProduct.length
        ? { length: apiProduct.length, width: apiProduct.width, height: apiProduct.height }
        : undefined),
    specifications: apiProduct,
    a_plus_content_images: apiProduct.a_plus_content_images || [],
    faqs: apiProduct.faqs || [],
    product_details: apiProduct.product_details || null
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