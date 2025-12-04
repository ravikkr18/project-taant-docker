export interface ProductReview {
  id: string;
  product_id: string;
  variant_id?: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  order_id?: string;
  rating: number; // 1-5
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  response_content?: string;
  responded_by?: string;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
  media?: ReviewMedia[];
}

export interface ReviewMedia {
  id: string;
  review_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos in seconds
  position: number;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductReviewRequest {
  product_id: string;
  variant_id?: string;
  order_id?: string;
  rating: number; // 1-5
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  media?: CreateReviewMediaRequest[];
  // Optional customer info for non-authenticated submissions
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
}

export interface CreateReviewMediaRequest {
  media_url: string;
  media_type: 'image' | 'video';
  file_name: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos in seconds
  position?: number;
  is_primary?: boolean;
}

export interface UpdateProductReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
}

export interface ReviewResponse {
  content: string;
}

export interface ReviewHelpfulVote {
  id: string;
  review_id: string;
  customer_id: string;
  is_helpful: boolean;
  created_at: Date;
}

export interface ReviewWithProduct extends ProductReview {
  product?: {
    id: string;
    title: string;
    images: Array<{
      url: string;
      alt_text: string;
      position: number;
      is_primary: boolean;
    }>;
  };
  variant?: {
    id: string;
    title: string;
    price: number;
    sku: string;
  };
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recommended_percentage: number;
}

export interface ReviewFilters {
  rating?: number;
  is_verified_purchase?: boolean;
  has_pros_cons?: boolean;
  sort_by?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  page?: number;
  limit?: number;
}