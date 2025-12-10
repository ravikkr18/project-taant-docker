export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  categoryId: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  badge?: string;
  variants?: ProductVariant[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  image?: string;
  inStock: boolean;
  color?: string;
  options?: VariantOption[];
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: Category[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}