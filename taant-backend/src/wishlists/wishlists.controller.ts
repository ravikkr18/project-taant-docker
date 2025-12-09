import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  ToggleWishlistResponse,
  CheckWishlistResponse,
  WishlistCountResponse,
} from './wishlist.entity';

@Controller('api/wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get('health')
  async health() {
    return { status: 'OK', controller: 'WishlistsController' };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getUserWishlist(@Request() req) {
    try {
      // Handle both custom tokens (req.user.id) and Supabase tokens (req.user.sub)
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      const wishlist = await this.wishlistsService.getUserWishlist(userId);

      return {
        success: true,
        data: wishlist,
        message: 'Wishlist retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('add/:productId')
  async addToWishlist(@Param('productId') productId: string, @Request() req) {
    try {
      // Handle both custom tokens (req.user.id) and Supabase tokens (req.user.sub)
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      const wishlistItem = await this.wishlistsService.addToWishlist(userId, productId);

      return {
        success: true,
        data: wishlistItem,
        message: 'Product added to wishlist'
      };
    } catch (error) {
      if (error.message === 'Product already in wishlist') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (error.message === 'Product not found') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Failed to add to wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('remove/:productId')
  async removeFromWishlist(@Param('productId') productId: string, @Request() req) {
    try {
      // Handle both custom tokens (req.user.id) and Supabase tokens (req.user.sub)
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      await this.wishlistsService.removeFromWishlist(userId, productId);

      return {
        success: true,
        message: 'Product removed from wishlist'
      };
    } catch (error) {
      if (error.message === 'Product not found in wishlist') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Failed to remove from wishlist',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('toggle/:productId')
  async toggleWishlist(@Param('productId') productId: string, @Request() req): Promise<{ success: boolean; data: ToggleWishlistResponse; message: string }> {
    try {
      // Handle both custom tokens (req.user.id) and Supabase tokens (req.user.sub)
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      const result = await this.wishlistsService.toggleWishlistItem(userId, productId);

      return {
        success: true,
        data: result,
        message: result.message
      };
    } catch (error) {
      if (error.message === 'Product not found') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Failed to toggle wishlist item',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('check/:productId')
  async checkWishlistStatus(@Param('productId') productId: string, @Request() req): Promise<{ success: boolean; data: CheckWishlistResponse; message: string }> {
    try {
      // Handle both custom tokens (req.user.id) and Supabase tokens (req.user.sub)
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      const isInWishlist = await this.wishlistsService.isInWishlist(userId, productId);

      return {
        success: true,
        data: { isInWishlist },
        message: 'Wishlist status checked'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to check wishlist status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('count')
  async getWishlistCount(@Request() req): Promise<{ success: boolean; data: WishlistCountResponse; message: string }> {
    try {
      // Handle both custom tokens (req.user.id) and Supabase tokens (req.user.sub)
      const userId = req.user?.id || req.user?.sub;
      if (!userId) {
        throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
      }

      const count = await this.wishlistsService.getWishlistCount(userId);

      return {
        success: true,
        data: { count },
        message: 'Wishlist count retrieved'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get wishlist count',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}