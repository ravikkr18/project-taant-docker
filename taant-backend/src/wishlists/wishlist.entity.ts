export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistWithProduct extends Wishlist {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price?: number;
    discount?: number;
    rating?: number;
    total_reviews?: number;
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
    stock_status?: string;
    badge?: string;
    description?: string;
    features?: any[];
    specifications?: any;
  };
}

export interface CreateWishlistRequest {
  product_id: string;
}

export interface ToggleWishlistResponse {
  added: boolean;
  message: string;
}

export interface CheckWishlistResponse {
  isInWishlist: boolean;
}

export interface WishlistCountResponse {
  count: number;
}