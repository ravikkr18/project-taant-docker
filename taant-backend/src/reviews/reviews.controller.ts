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
import { S3Service } from '../s3/s3.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  CreateProductReviewRequest,
  UpdateProductReviewRequest,
  ReviewResponse,
  ReviewWithProduct,
  ReviewFilters,
} from './review.entity';

@Controller('api/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Body() createReviewData: CreateProductReviewRequest & {
      customer_id?: string;
      customer_name?: string;
      customer_email?: string;
    },
  ) {
    // Use provided customer info or fall back to placeholders
    const customerId = createReviewData.customer_id || 'temp-customer-id';
    const customerName = createReviewData.customer_name || 'Anonymous User';
    const customerEmail = createReviewData.customer_email || 'anonymous@example.com';

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
  @UseGuards(SupabaseAuthGuard)
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
  @UseGuards(SupabaseAuthGuard)
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
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Param('id') id: string, @Request() req) {
    const customerId = req.user.id;
    await this.reviewsService.deleteReview(id, customerId);
  }

  @Post(':id/respond')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async addReviewResponse(
    @Param('id') id: string,
    @Body() responseData: ReviewResponse,
  ) {
    return this.reviewsService.addReviewResponse(id, responseData);
  }

  @Post(':id/vote-helpful')
  @UseGuards(SupabaseAuthGuard)
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

  @Post('media/upload-url')
  @HttpCode(HttpStatus.OK)
  async getMediaUploadUrl(
    @Body() uploadData: {
      reviewId: string;
      fileName: string;
      contentType: string;
    },
  ) {
    return this.s3Service.getReviewMediaUploadSignedUrlWithTimestamp(
      uploadData.reviewId,
      uploadData.fileName,
      uploadData.contentType,
    );
  }
}