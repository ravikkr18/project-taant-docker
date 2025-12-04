import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ProductReview,
  CreateProductReviewRequest,
  UpdateProductReviewRequest,
  ReviewResponse,
  ReviewHelpfulVote,
  ReviewWithProduct,
  ReviewSummary,
  ReviewFilters,
} from './review.entity';

@Injectable()
export class ReviewsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  async createReview(
    customerId: string,
    customerName: string,
    customerEmail: string,
    reviewData: CreateProductReviewRequest,
  ): Promise<ProductReview> {
    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if customer has purchased the product (if order_id provided)
    let isVerifiedPurchase = false;
    if (reviewData.order_id) {
      const { data: orderItem, error: orderError } = await this.supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(customer_id)
        `)
        .eq('order_id', reviewData.order_id)
        .eq('product_id', reviewData.product_id)
        .eq('orders.customer_id', customerId)
        .single();

      if (!orderError && orderItem) {
        isVerifiedPurchase = true;
      }
    }

    // Check if customer already reviewed this product/variant
    const { data: existingReview, error: checkError } = await this.supabase
      .from('product_reviews')
      .select('id')
      .eq('customer_id', customerId)
      .eq('product_id', reviewData.product_id)
      .eq('variant_id', reviewData.variant_id || null)
      .single();

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Create the review
    const { data: review, error } = await this.supabase
      .from('product_reviews')
      .insert([{
        product_id: reviewData.product_id,
        variant_id: reviewData.variant_id,
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        order_id: reviewData.order_id,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        pros: reviewData.pros,
        cons: reviewData.cons,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true, // Auto-approve for now, can add moderation later
        is_featured: false,
        helpful_count: 0,
      }])
      .select()
      .single();

    if (error || !review) {
      throw new BadRequestException('Failed to create review');
    }

    return review;
  }

  async getProductReviews(productId: string, filters: ReviewFilters = {}): Promise<{
    reviews: ReviewWithProduct[];
    summary: ReviewSummary;
    total: number;
  }> {
    const {
      rating,
      is_verified_purchase,
      has_pros_cons,
      sort_by = 'newest',
      page = 1,
      limit = 10,
    } = filters;

    const offset = (page - 1) * limit;

    // Build query
    let query = this.supabase
      .from('product_reviews')
      .select(`
        *,
        product:products(id, title, images),
        variant:product_variants(id, title, price, sku)
      `, { count: 'exact' })
      .eq('product_id', productId)
      .eq('is_approved', true);

    // Apply filters
    if (rating) {
      query = query.eq('rating', rating);
    }
    if (is_verified_purchase !== undefined) {
      query = query.eq('is_verified_purchase', is_verified_purchase);
    }
    if (has_pros_cons) {
      query = query.not('pros', 'is', null).not('cons', 'is', null);
    }

    // Apply sorting
    switch (sort_by) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true }).order('created_at', { ascending: false });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      throw new BadRequestException('Failed to fetch reviews');
    }

    // Get review summary
    const summary = await this.getReviewSummary(productId);

    return {
      reviews: reviews || [],
      summary,
      total: count || 0,
    };
  }

  async getReviewById(reviewId: string): Promise<ReviewWithProduct | null> {
    const { data: review, error } = await this.supabase
      .from('product_reviews')
      .select(`
        *,
        product:products(id, title, images),
        variant:product_variants(id, title, price, sku)
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new BadRequestException('Failed to fetch review');
    }

    return review;
  }

  async updateReview(
    reviewId: string,
    customerId: string,
    updateData: UpdateProductReviewRequest,
  ): Promise<ProductReview> {
    // First check if review exists and belongs to customer
    const { data: existingReview, error: fetchError } = await this.supabase
      .from('product_reviews')
      .select('customer_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      throw new NotFoundException('Review not found');
    }

    if (existingReview.customer_id !== customerId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Update the review
    const { data: review, error } = await this.supabase
      .from('product_reviews')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error || !review) {
      throw new BadRequestException('Failed to update review');
    }

    return review;
  }

  async deleteReview(reviewId: string, customerId: string): Promise<void> {
    // First check if review exists and belongs to customer
    const { data: existingReview, error: fetchError } = await this.supabase
      .from('product_reviews')
      .select('customer_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      throw new NotFoundException('Review not found');
    }

    if (existingReview.customer_id !== customerId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Delete the review (cascade will handle helpful votes)
    const { error } = await this.supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw new BadRequestException('Failed to delete review');
    }
  }

  async addReviewResponse(reviewId: string, responseData: ReviewResponse): Promise<ProductReview> {
    const { data: review, error } = await this.supabase
      .from('product_reviews')
      .update({
        response_content: responseData.content,
        responded_by: 'seller', // Can be enhanced to track actual responder
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error || !review) {
      throw new BadRequestException('Failed to add review response');
    }

    return review;
  }

  async voteReviewHelpful(
    reviewId: string,
    customerId: string,
    isHelpful: boolean,
  ): Promise<void> {
    // Check if customer already voted
    const { data: existingVote, error: checkError } = await this.supabase
      .from('product_review_helpful_votes')
      .select('id, is_helpful')
      .eq('review_id', reviewId)
      .eq('customer_id', customerId)
      .single();

    if (existingVote) {
      if (existingVote.is_helpful === isHelpful) {
        // Same vote, remove it
        const { error: deleteError } = await this.supabase
          .from('product_review_helpful_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          throw new BadRequestException('Failed to remove vote');
        }

        // Update helpful count
        await this.updateHelpfulCount(reviewId);
      } else {
        // Different vote, update it
        const { error: updateError } = await this.supabase
          .from('product_review_helpful_votes')
          .update({ is_helpful: isHelpful })
          .eq('id', existingVote.id);

        if (updateError) {
          throw new BadRequestException('Failed to update vote');
        }

        // Update helpful count
        await this.updateHelpfulCount(reviewId);
      }
    } else {
      // New vote
      const { error: insertError } = await this.supabase
        .from('product_review_helpful_votes')
        .insert([{
          review_id: reviewId,
          customer_id: customerId,
          is_helpful: isHelpful,
        }]);

      if (insertError) {
        throw new BadRequestException('Failed to add vote');
      }

      // Update helpful count
      await this.updateHelpfulCount(reviewId);
    }
  }

  async getCustomerReviews(customerId: string, page = 1, limit = 10): Promise<{
    reviews: ReviewWithProduct[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const { data: reviews, error, count } = await this.supabase
      .from('product_reviews')
      .select(`
        *,
        product:products(id, title, images),
        variant:product_variants(id, title, price, sku)
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch customer reviews');
    }

    return {
      reviews: reviews || [],
      total: count || 0,
    };
  }

  private async updateHelpfulCount(reviewId: string): Promise<void> {
    const { data: votes, error: countError } = await this.supabase
      .from('product_review_helpful_votes')
      .select('is_helpful')
      .eq('review_id', reviewId);

    if (countError) {
      console.error('Failed to count helpful votes:', countError);
      return;
    }

    const helpfulCount = votes?.filter(vote => vote.is_helpful).length || 0;

    const { error: updateError } = await this.supabase
      .from('product_reviews')
      .update({ helpful_count: helpfulCount })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Failed to update helpful count:', updateError);
    }
  }

  private async getReviewSummary(productId: string): Promise<ReviewSummary> {
    const { data: reviews, error } = await this.supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    if (error) {
      throw new BadRequestException('Failed to fetch review summary');
    }

    const totalReviews = reviews?.length || 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews?.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      totalRating += review.rating;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    const recommendedCount = reviews?.filter(review => review.rating >= 4).length || 0;
    const recommendedPercentage = totalReviews > 0 ? (recommendedCount / totalReviews) * 100 : 0;

    return {
      average_rating: Math.round(averageRating * 100) / 100,
      total_reviews: totalReviews,
      rating_distribution: ratingDistribution,
      recommended_percentage: Math.round(recommendedPercentage * 100) / 100,
    };
  }
}