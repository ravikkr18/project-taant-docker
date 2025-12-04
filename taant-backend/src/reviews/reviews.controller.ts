import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  CreateProductReviewRequest,
  UpdateProductReviewRequest,
  ReviewResponse,
  ReviewWithProduct,
  ReviewFilters,
} from './review.entity';

@Controller('api/reviews')
@UseGuards(SupabaseAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Request() req,
    @Body() createReviewData: CreateProductReviewRequest,
  ) {
    const customerId = req.user.id;
    const customerName = req.user.user_metadata?.name || req.user.email || 'Anonymous';
    const customerEmail = req.user.email || '';

    return this.reviewsService.createReview(
      customerId,
      customerName,
      customerEmail,
      createReviewData,
    );
  }

  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() filters: ReviewFilters,
  ) {
    return this.reviewsService.getProductReviews(productId, filters);
  }

  @Get('customer')
  async getCustomerReviews(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const customerId = req.user.id;
    return this.reviewsService.getCustomerReviews(customerId, page, limit);
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string): Promise<ReviewWithProduct> {
    const review = await this.reviewsService.getReviewById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateReview(
    @Param('id') id: string,
    @Body() updateData: UpdateProductReviewRequest,
    @Request() req,
  ) {
    const customerId = req.user.id;
    return this.reviewsService.updateReview(id, customerId, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Param('id') id: string, @Request() req) {
    const customerId = req.user.id;
    await this.reviewsService.deleteReview(id, customerId);
  }

  @Post(':id/respond')
  @HttpCode(HttpStatus.OK)
  async addReviewResponse(
    @Param('id') id: string,
    @Body() responseData: ReviewResponse,
  ) {
    return this.reviewsService.addReviewResponse(id, responseData);
  }

  @Post(':id/vote-helpful')
  @HttpCode(HttpStatus.OK)
  async voteReviewHelpful(
    @Param('id') id: string,
    @Body() voteData: { is_helpful: boolean },
    @Request() req,
  ) {
    const customerId = req.user.id;
    await this.reviewsService.voteReviewHelpful(id, customerId, voteData.is_helpful);
    return { message: 'Vote recorded successfully' };
  }
}