import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Wishlist,
  WishlistWithProduct,
  ToggleWishlistResponse,
  CheckWishlistResponse,
  WishlistCountResponse,
} from './wishlist.entity';

@Injectable()
export class WishlistsService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided');
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  // Get user's wishlist with detailed product information
  async getUserWishlist(userId: string): Promise<WishlistWithProduct[]> {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select(`
        *,
        product:products(
          id,
          title,
          slug,
          base_price,
          compare_price,
          rating,
          total_reviews,
          quantity,
          status,
          description,
          features,
          specifications,
          product_images(id, url, is_primary),
          product_variants(id, title, price)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to fetch wishlist: ${error.message}`);
    }

    return data || [];
  }

  // Add product to wishlist
  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    // Check if product exists
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new NotFoundException('Product not found');
    }

    // Check if already in wishlist
    const { data: existing, error: checkError } = await this.supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      throw new BadRequestException('Product already in wishlist');
    }

    // Add to wishlist
    const { data, error } = await this.supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to add to wishlist: ${error.message}`);
    }

    return data;
  }

  // Remove product from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw new BadRequestException(`Failed to remove from wishlist: ${error.message}`);
    }
  }

  // Check if product is in user's wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new BadRequestException(`Failed to check wishlist status: ${error.message}`);
    }

    return !!data;
  }

  // Get wishlist item count for user
  async getWishlistCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new BadRequestException(`Failed to get wishlist count: ${error.message}`);
    }

    return count || 0;
  }

  // Toggle product in wishlist (add if not exists, remove if exists)
  async toggleWishlistItem(userId: string, productId: string): Promise<ToggleWishlistResponse> {
    const isInWishlist = await this.isInWishlist(userId, productId);

    if (isInWishlist) {
      await this.removeFromWishlist(userId, productId);
      return { added: false, message: 'Product removed from wishlist' };
    } else {
      await this.addToWishlist(userId, productId);
      return { added: true, message: 'Product added to wishlist' };
    }
  }
}