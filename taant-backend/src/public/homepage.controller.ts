import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpException,
  Res,
  Param
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { Response } from 'express';

@Controller('public/homepage')
export class HomepageController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('trending')
  async getTrendingProducts(
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: Response
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 8;

      const result = await this.productsService.getProductsPaginated(
        undefined, // supplierId - undefined for public access
        undefined, // categoryId
        1, // page
        limitNum * 2, // Get more to filter from
        undefined, // search
        'active' // status
      );

      // Transform and filter trending products
      const trendingProducts = result.data
        .map(product => ({
          id: product.id,
          name: product.title,
          slug: product.slug,
          description: product.short_description || product.description,
          price: product.base_price,
          originalPrice: product.compare_price,
          image: product.product_images?.find((img: any) => img.is_primary)?.url ||
                 product.product_images?.[0]?.url ||
                 `https://picsum.photos/seed/${product.slug}/800/800.jpg`,
          images: product.product_images?.map((img: any) => img.url) || [],
          category: product.categories?.name || 'Unknown',
          categoryId: product.category_id,
          rating: Math.round((product.rating || 4.0) * 10) / 10, // Round to 1 decimal place
          reviews: product.total_reviews || 0,
          inStock: product.quantity > 0,
          badge: product.compare_price && product.compare_price > product.base_price
            ? Math.round(((product.compare_price - product.base_price) / product.compare_price) * 100) + '% OFF'
            : product.is_featured ? 'Featured' : product.tags?.includes('popular') ? 'Popular' : 'Trending',
          brand: product.suppliers?.business_name || product.manufacturer,
          sku: product.sku,
          variants: product.variants?.map((variant: any) => ({
            id: variant.id,
            name: variant.title || variant.name,
            price: variant.price || product.base_price,
            inStock: variant.inventory_quantity > 0,
            image: variant.image_url
          })) || []
        }))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limitNum);

      return {
        success: true,
        data: trendingProducts,
        message: 'Trending products retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getTrendingProducts:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch trending products',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('deals')
  async getDealsOfTheDay(
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: Response
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 6;

      const result = await this.productsService.getProductsPaginated(
        undefined, // supplierId - undefined for public access
        undefined, // categoryId
        1, // page
        limitNum * 3, // Get more to filter from
        undefined, // search
        'active' // status
      );

      // Transform and filter products with discounts
      const dealsProducts = result.data
        .map(product => ({
          id: product.id,
          name: product.title,
          slug: product.slug,
          description: product.short_description || product.description,
          price: product.base_price,
          originalPrice: product.compare_price,
          image: product.product_images?.find((img: any) => img.is_primary)?.url ||
                 product.product_images?.[0]?.url ||
                 `https://picsum.photos/seed/${product.slug}/800/800.jpg`,
          images: product.product_images?.map((img: any) => img.url) || [],
          category: product.categories?.name || 'Unknown',
          categoryId: product.category_id,
          rating: Math.round((product.rating || 4.0) * 10) / 10, // Round to 1 decimal place
          reviews: product.total_reviews || 0,
          inStock: product.quantity > 0,
          badge: product.compare_price && product.compare_price > product.base_price
            ? Math.round(((product.compare_price - product.base_price) / product.compare_price) * 100) + '% OFF'
            : 'Deal',
          brand: product.suppliers?.business_name || product.manufacturer,
          sku: product.sku,
          variants: product.variants?.map((variant: any) => ({
            id: variant.id,
            name: variant.title || variant.name,
            price: variant.price || product.base_price,
            inStock: variant.inventory_quantity > 0,
            image: variant.image_url
          })) || []
        }))
        .filter(product => product.originalPrice && product.originalPrice > product.price)
        .sort((a, b) => {
          const discountA = ((b.originalPrice - b.price) / b.originalPrice) * 100;
          const discountB = ((a.originalPrice - a.price) / a.originalPrice) * 100;
          return discountB - discountA; // Sort by highest discount
        })
        .slice(0, limitNum);

      return {
        success: true,
        data: dealsProducts,
        message: 'Deals of the day retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getDealsOfTheDay:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch deals',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Res({ passthrough: true }) res?: Response
  ) {
    try {
      const limitNum = Math.min(parseInt(limit) || 10, 20);

      const result = await this.productsService.getProductsPaginated(
        undefined, // supplierId - undefined for public access
        categoryId,
        1, // page
        limitNum,
        undefined, // search
        'active' // status
      );

      // Transform products
      const transformedProducts = result.data.map(product => ({
        id: product.id,
        name: product.title,
        slug: product.slug,
        description: product.short_description || product.description,
        price: product.base_price,
        originalPrice: product.compare_price,
        image: product.product_images?.find((img: any) => img.is_primary)?.url ||
               product.product_images?.[0]?.url ||
               `https://picsum.photos/seed/${product.slug}/800/800.jpg`,
        images: product.product_images?.map((img: any) => img.url) || [],
        category: product.categories?.name || 'Unknown',
        categoryId: product.category_id,
        rating: Math.round((product.rating || 4.0) * 10) / 10, // Round to 1 decimal place
        reviews: product.total_reviews || 0,
        inStock: product.quantity > 0,
        badge: product.compare_price && product.compare_price > product.base_price
          ? Math.round(((product.compare_price - product.base_price) / product.compare_price) * 100) + '% OFF'
          : product.is_featured ? 'Featured' : product.tags?.includes('popular') ? 'Popular' : undefined,
        brand: product.suppliers?.business_name || product.manufacturer,
        sku: product.sku,
        variants: product.variants?.map((variant: any) => ({
          id: variant.id,
          name: variant.title || variant.name,
          price: variant.price || product.base_price,
          inStock: variant.inventory_quantity > 0,
          image: variant.image_url
        })) || []
      }));

      // Apply sorting
      let sortedProducts = transformedProducts;
      if (sort === 'price-low') {
        sortedProducts = transformedProducts.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        sortedProducts = transformedProducts.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        sortedProducts = transformedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      return {
        success: true,
        data: sortedProducts.slice(0, limitNum),
        message: 'Products by category retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch products by category',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('featured')
  async getFeaturedProducts(
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: Response
  ) {
    try {
      const limitNum = Math.min(parseInt(limit) || 10, 20);

      const result = await this.productsService.getProductsPaginated(
        undefined, // supplierId - undefined for public access
        undefined, // categoryId
        1, // page
        limitNum,
        undefined, // search
        'active' // status
      );

      // Transform products
      const featuredProducts = result.data.map(product => ({
        id: product.id,
        name: product.title,
        slug: product.slug,
        description: product.short_description || product.description,
        price: product.base_price,
        originalPrice: product.compare_price,
        image: product.product_images?.find((img: any) => img.is_primary)?.url ||
               product.product_images?.[0]?.url ||
               `https://picsum.photos/seed/${product.slug}/800/800.jpg`,
        images: product.product_images?.map((img: any) => img.url) || [],
        category: product.categories?.name || 'Unknown',
        categoryId: product.category_id,
        rating: Math.round((product.rating || 4.0) * 10) / 10, // Round to 1 decimal place
        reviews: product.total_reviews || 0,
        inStock: product.quantity > 0,
        badge: product.compare_price && product.compare_price > product.base_price
          ? Math.round(((product.compare_price - product.base_price) / product.compare_price) * 100) + '% OFF'
          : 'Featured',
        brand: product.suppliers?.business_name || product.manufacturer,
        sku: product.sku,
        variants: product.variants?.map((variant: any) => ({
          id: variant.id,
          name: variant.title || variant.name,
          price: variant.price || product.base_price,
          inStock: variant.inventory_quantity > 0,
          image: variant.image_url
        })) || []
      }));

      return {
        success: true,
        data: featuredProducts.slice(0, limitNum),
        message: 'Featured products retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch featured products',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}