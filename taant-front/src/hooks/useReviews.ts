import { useState, useEffect } from 'react';

export interface Review {
  id: string;
  customer: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseReviewsOptions {
  rating?: number;
  isVerifiedPurchase?: boolean;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}

export const useReviews = (productId: string | null, options: UseReviewsOptions = {}) => {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    rating,
    isVerifiedPurchase,
    sortBy = 'newest',
    page = 1,
    limit = 10
  } = options;

  useEffect(() => {
    if (!productId) {
      setData(null);
      return;
    }

    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          sort_by: sortBy,
          page: page.toString(),
          limit: limit.toString(),
        });

        if (rating) queryParams.set('rating', rating.toString());
        if (isVerifiedPurchase !== undefined) {
          queryParams.set('is_verified_purchase', isVerifiedPurchase.toString());
        }

        const response = await fetch(
          `/api/reviews/product/${productId}?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const apiResponse = await response.json();

        // Transform backend response to frontend interface
        const transformedData: ReviewsResponse = {
          reviews: apiResponse.reviews.map((review: any) => ({
            id: review.id,
            customer: review.customer_name,
            rating: review.rating,
            title: review.title,
            content: review.content,
            date: review.created_at,
            verified: review.is_verified_purchase,
            helpful: review.helpful_count,
            pros: review.pros || [],
            cons: review.cons || [],
            images: review.media ? review.media.map((m: any) => m.media_url) : []
          })),
          stats: {
            averageRating: apiResponse.summary.average_rating,
            totalReviews: apiResponse.summary.total_reviews,
            distribution: Object.entries(apiResponse.summary.rating_distribution).map(([stars, count]) => ({
              stars: parseInt(stars),
              count: count as number,
              percentage: Math.round((count as number / apiResponse.summary.total_reviews) * 100)
            }))
          },
          pagination: {
            page: page,
            limit: limit,
            total: apiResponse.total,
            totalPages: Math.ceil(apiResponse.total / limit)
          }
        };

        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, rating, isVerifiedPurchase, sortBy, page, limit]);

  return { data, isLoading, error };
};