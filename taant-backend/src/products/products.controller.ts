import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpStatus,
  HttpException,
  UseGuards,
  Headers,
  Ip,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthService } from '../auth/auth.service';
import { S3Service } from '../s3/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

interface ProductCreateDto {
  sku: string;
  slug: string;
  title: string;
  description: string;
  category_id: string;
  base_price: number;
  compare_price?: number;
  cost_price?: number;
  track_inventory: boolean;
  selling_policy?: string;
  manufacturer?: string;
  model_number?: string;
  origin_country?: string;
  shipping_requirements?: string;
  a_plus_content?: string;
  a_plus_sections?: any;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: string;
}

interface ProductUpdateDto {
  sku?: string;
  slug?: string;
  title?: string;
  description?: string;
  category_id?: string;
  base_price?: number;
  compare_price?: number;
  cost_price?: number;
  track_inventory?: boolean;
  selling_policy?: string;
  manufacturer?: string;
  model_number?: string;
  origin_country?: string;
  shipping_requirements?: string;
  a_plus_content?: string;
  a_plus_sections?: any;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: string;
}

@Controller('api/products')
@UseGuards(SupabaseAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
    private readonly s3Service: S3Service
  ) {}

  @Get()
  async getProducts(
    @Query('supplierId') supplierId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Request() req?: any,
    @Res({ passthrough: true }) res?: any
  ) {
    // Temporarily skip authentication for debugging
    console.log('API called with params:', { supplierId, categoryId, page, limit, search, status });
    try {
      // TEMPORARILY SKIP AUTHENTICATION FOR DEBUGGING
      const finalSupplierId = supplierId || 'fa0ca8e0-f848-45b9-b107-21e56b38573f';
      console.log('Using supplierId:', finalSupplierId);

      // Parse pagination parameters
      const pageNum = parseInt(page) || 1;
      const limitNum = Math.min(parseInt(limit) || 10, 40); // Max 40 records per page

      const result = await this.productsService.getProductsPaginated(
        finalSupplierId,
        categoryId,
        pageNum,
        limitNum,
        search,
        status
      );

      console.log('Service result:', JSON.stringify(result, null, 2));

      const response = {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Products retrieved successfully'
      };

      console.log('Controller response:', JSON.stringify(response, null, 2));

      // Set headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return response;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  async getProductStats(@Query('supplierId') supplierId?: string) {
    try {
      // Temporarily require supplier ID as query parameter for testing
      if (!supplierId) {
        throw new HttpException('Supplier ID is required as query parameter', HttpStatus.BAD_REQUEST);
      }

      const stats = await this.productsService.getProductStats(supplierId);
      return {
        success: true,
        data: stats,
        message: 'Product stats retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch product stats',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('categories')
  async getCategories() {
    try {
      const categories = await this.productsService.getCategories();
      return {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch categories',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getProductById(@Param('id') id: string, @Request() req?: any) {
    try {
      const user = req.user;

      // For now, if no user (auth disabled), skip authorization
      if (user) {
        // Get user profile to determine role
        const profile = await this.authService.getUserProfile(user.id);

        if (!profile) {
          throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
        }

        const product = await this.productsService.getProductById(id);

        // Admins can access any product
        if (profile.role === 'admin') {
          return {
            success: true,
            data: product,
            message: 'Product retrieved successfully'
          };
        }

        // Suppliers can only access their own products
        if (profile.role === 'supplier') {
          const supplier = await this.authService.getSupplierByUserId(user.id);

          if (!supplier) {
            throw new HttpException('Supplier account not found for this user', HttpStatus.FORBIDDEN);
          }

          // Verify the product belongs to the authenticated supplier
          if (product.supplier_id !== supplier.id) {
            throw new HttpException('You can only access your own products', HttpStatus.FORBIDDEN);
          }
        } else {
          throw new HttpException('Invalid user role', HttpStatus.FORBIDDEN);
        }
      } else {
        // Auth disabled - skip authorization
        console.log('Auth disabled, skipping product authorization check');
      }

      const product = await this.productsService.getProductById(id);
      return {
        success: true,
        data: product,
        message: 'Product retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch product',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async createProduct(@Body() productData: ProductCreateDto & { supplier_id: string }) {
    try {
      const supplierId = productData.supplier_id;

      if (!supplierId) {
        throw new HttpException('Supplier ID is required in request body', HttpStatus.BAD_REQUEST);
      }

      // Validate required fields
      const requiredFields = ['sku', 'slug', 'title', 'description', 'category_id', 'base_price', 'supplier_id'];
      const missingFields = requiredFields.filter(field => !productData[field]);

      if (missingFields.length > 0) {
        throw new HttpException(
          `Missing required fields: ${missingFields.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      const product = await this.productsService.createProduct(productData, supplierId);
      return {
        success: true,
        data: product,
        message: 'Product created successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateData: { productData: ProductUpdateDto; supplier_id: string },
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const { productData, supplier_id: requestSupplierId } = updateData;

      // For now, if no user (auth disabled), use provided supplier ID
      let finalSupplierId: string;

      if (user) {
        // Get user profile to determine role
        const profile = await this.authService.getUserProfile(user.id);

        if (!profile) {
          throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
        }

        // Suppliers can only update their own products
        if (profile.role === 'supplier') {
          const supplier = await this.authService.getSupplierByUserId(user.id);

          if (!supplier) {
            throw new HttpException('Supplier account not found for this user', HttpStatus.FORBIDDEN);
          }

          // Suppliers can only update their own products
          if (requestSupplierId && requestSupplierId !== supplier.id) {
            throw new HttpException('You can only update your own products', HttpStatus.FORBIDDEN);
          }

          // Use the authenticated supplier's ID
          finalSupplierId = supplier.id;
        } else if (profile.role === 'admin') {
          // Admins can use the provided supplier ID
          finalSupplierId = requestSupplierId;
        } else {
          throw new HttpException('Invalid user role', HttpStatus.FORBIDDEN);
        }
      } else {
        // Auth disabled - use provided supplier ID
        finalSupplierId = requestSupplierId;
        console.log('Auth disabled, using provided supplier ID:', finalSupplierId);
      }

      const product = await this.productsService.updateProduct(id, productData, finalSupplierId);
      return {
        success: true,
        data: product,
        message: 'Product updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string, @Body() body: { supplier_id: string }) {
    try {
      const { supplier_id: supplierId } = body;

      if (!supplierId) {
        throw new HttpException('Supplier ID is required in request body', HttpStatus.BAD_REQUEST);
      }

      const result = await this.productsService.deleteProduct(id, supplierId);
      return {
        success: true,
        data: result,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Variant-specific endpoints
  @Get(':id/variants')
  async getProductVariants(@Param('id') productId: string, @Request() req?: any) {
    try {
      const user = req.user;

      // Get user profile to determine role and verify access
      const profile = await this.authService.getUserProfile(user.id);
      if (!profile) {
        throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
      }

      const variants = await this.productsService.getProductVariants(productId, user.id);
      return {
        success: true,
        data: variants,
        message: 'Product variants retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch product variants',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/variants')
  async createProductVariant(
    @Param('id') productId: string,
    @Body() variantData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const variant = await this.productsService.createProductVariant(productId, variantData, user.id);
      return {
        success: true,
        data: variant,
        message: 'Variant created successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create variant',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/variants/:variantId')
  async updateProductVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() variantData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const variant = await this.productsService.updateProductVariant(productId, variantId, variantData, user.id);
      return {
        success: true,
        data: variant,
        message: 'Variant updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update variant',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id/variants/:variantId')
  async deleteProductVariant(
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.deleteProductVariant(productId, variantId, user.id);
      return {
        success: true,
        data: result,
        message: 'Variant deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete variant',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // A+ Content Images endpoints
  @Get(':id/content-images')
  async getAPlusContentImages(@Param('id') productId: string, @Request() req?: any) {
    try {
      const user = req.user;

      // Get user profile to determine role and verify access
      const profile = await this.authService.getUserProfile(user.id);
      if (!profile) {
        throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
      }

      const contentImages = await this.productsService.getAPlusContentImages(productId, user.id);
      return {
        success: true,
        data: contentImages,
        message: 'A+ content images retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch A+ content images',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/content-images')
  async createAPlusContentImage(
    @Param('id') productId: string,
    @Body() imageData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const contentImage = await this.productsService.createAPlusContentImage(productId, imageData, user.id);
      return {
        success: true,
        data: contentImage,
        message: 'A+ content image created successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create A+ content image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/content-images/:imageId')
  async updateAPlusContentImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Body() imageData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const contentImage = await this.productsService.updateAPlusContentImage(productId, imageId, imageData, user.id);
      return {
        success: true,
        data: contentImage,
        message: 'A+ content image updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update A+ content image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/content-images/positions')
  async updateAPlusContentImagePositions(
    @Param('id') productId: string,
    @Body() positionsData: { positions: { id: string; position: number }[] },
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.updateAPlusContentImagePositions(productId, positionsData.positions, user.id);
      return {
        success: true,
        data: result,
        message: 'A+ content image positions updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update A+ content image positions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id/content-images/:imageId')
  async deleteAPlusContentImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.deleteAPlusContentImage(productId, imageId, user.id);
      return {
        success: true,
        data: result,
        message: 'A+ content image deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete A+ content image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-a-plus-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Accept only image files
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      }
    })
  )
  async uploadAPlusImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req?: any
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `a-plus-${timestamp}-${randomString}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;

      // Upload to S3
      const result = await this.s3Service.uploadFile(
        file.buffer,
        fileName,
        file.mimetype,
        'a-plus-content'
      );

      return {
        success: true,
        data: {
          url: result.url,
          key: result.key,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        },
        message: 'A+ content image uploaded successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload A+ content image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Accept only image files
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadProductImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Get user info from request
      const user = req.user;
      let userId: string;

      // Handle both authenticated and non-authenticated cases
      if (user) {
        // Get user profile to determine role and verify access
        const profile = await this.authService.getUserProfile(user.id);
        if (!profile) {
          throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
        }
        userId = user.id;
      } else {
        // For non-authenticated requests, use a default user ID for testing
        userId = 'fa0ca8e0-f848-45b9-b107-21e56b38573f';
        console.log('Auth disabled, using default user ID for product image upload:', userId);
      }

      // Upload to S3 with folder structure for product images
      const s3Url = await this.s3Service.uploadProductImage(file, userId);

      return {
        success: true,
        data: {
          url: s3Url,
          key: `product-images/${userId}/${file.originalname}`,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        },
        message: 'Product image uploaded successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload product image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Product Images Database Management endpoints
  @Get(':id/images')
  async getProductImages(@Param('id') productId: string, @Request() req?: any) {
    try {
      const user = req.user;

      // Get user profile to determine role and verify access
      const profile = await this.authService.getUserProfile(user.id);
      if (!profile) {
        throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
      }

      const productImages = await this.productsService.getProductImages(productId, user.id);
      return {
        success: true,
        data: productImages,
        message: 'Product images retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve product images',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/images')
  async createProductImage(
    @Param('id') productId: string,
    @Body() imageData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const productImage = await this.productsService.createProductImage(productId, imageData, user.id);
      return {
        success: true,
        data: productImage,
        message: 'Product image created successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create product image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/images/:imageId')
  async updateProductImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Body() imageData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const updatedImage = await this.productsService.updateProductImage(productId, imageId, imageData, user.id);
      return {
        success: true,
        data: updatedImage,
        message: 'Product image updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update product image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/images/positions')
  async updateProductImagePositions(
    @Param('id') productId: string,
    @Body() positionsData: { positions: { id: string; position: number }[] },
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.updateProductImagePositions(productId, positionsData.positions, user.id);
      return {
        success: true,
        data: result,
        message: 'Product image positions updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update product image positions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id/images/:imageId')
  async deleteProductImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.deleteProductImage(productId, imageId, user.id);
      return {
        success: true,
        data: result,
        message: 'Product image deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete product image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Variant Images Management endpoints
  @Post('variants/:variantId/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Accept only image files
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
  )
  async uploadVariantImage(@UploadedFile() file: Express.Multer.File, @Param('variantId') variantId: string, @Request() req) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Get user info from request
      const user = req.user;
      let userId: string;

      // Handle both authenticated and non-authenticated cases
      if (user) {
        userId = user.id;
      } else {
        // For non-authenticated requests, use a default user ID for testing
        userId = 'fa0ca8e0-f848-45b9-b107-21e56b38573f';
        console.log('Auth disabled, using default user ID for variant image upload:', userId);
      }

      // Upload to S3 with folder structure for variant images
      const s3Url = await this.s3Service.uploadVariantImage(file, userId, variantId);

      // Save image to database
      const imageData = {
        url: s3Url,
        alt_text: file.originalname,
        position: 0, // Will be updated based on existing images
        is_primary: false // Will be set to true for first image
      };

      const savedImage = await this.productsService.createVariantImage(variantId, imageData, userId);

      return {
        success: true,
        data: {
          id: savedImage.id,
          url: savedImage.url,
          key: `variant-images/${userId}/${variantId}/${file.originalname}`,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          position: savedImage.position,
          is_primary: savedImage.is_primary
        },
        message: 'Variant image uploaded successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload variant image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('variants/:variantId/images')
  async getVariantImages(@Param('variantId') variantId: string, @Request() req?: any) {
    try {
      const user = req.user;
      const variantImages = await this.productsService.getVariantImages(variantId, user.id);
      return {
        success: true,
        data: variantImages,
        message: 'Variant images retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve variant images',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('variants/:variantId/images')
  async createVariantImage(
    @Param('variantId') variantId: string,
    @Body() imageData: any,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const variantImage = await this.productsService.createVariantImage(variantId, imageData, user.id);
      return {
        success: true,
        data: variantImage,
        message: 'Variant image created successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create variant image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('variants/:variantId/images/positions')
  async updateVariantImagePositions(
    @Param('variantId') variantId: string,
    @Body() positionsData: { positions: { id: string; position: number }[] },
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.updateVariantImagePositions(variantId, positionsData.positions, user.id);
      return {
        success: true,
        data: result,
        message: 'Variant image positions updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update variant image positions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('variants/:variantId/images/:imageId/primary')
  async setVariantPrimaryImage(
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.setVariantPrimaryImage(variantId, imageId, user.id);
      return {
        success: true,
        data: result,
        message: 'Variant primary image updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update variant primary image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('variants/:variantId/images/:imageId')
  async deleteVariantImage(
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
    @Request() req?: any
  ) {
    try {
      const user = req.user;
      const result = await this.productsService.deleteVariantImage(variantId, imageId, user.id);
      return {
        success: true,
        data: result,
        message: 'Variant image deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete variant image',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('convert-blob-to-s3')
  async convertBlobToS3(@Body() body: { blobUrl: string; fileName: string }) {
    try {
      const { blobUrl, fileName } = body;

      if (!blobUrl || !fileName) {
        throw new HttpException('blobUrl and fileName are required', HttpStatus.BAD_REQUEST);
      }

      // Convert blob URL to S3 URL
      const s3Url = await this.s3Service.convertBlobUrlToS3(blobUrl, fileName);

      return {
        success: true,
        data: {
          originalBlobUrl: blobUrl,
          s3Url: s3Url
        },
        message: 'Blob URL converted to S3 URL successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to convert blob URL to S3',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('orphaned-images')
  async getOrphanedImages(@Request() req?: any) {
    try {
      const user = req.user;
      let userId: string;

      // Handle both authenticated and non-authenticated cases
      if (user) {
        // Get user profile to determine role and verify access
        const profile = await this.authService.getUserProfile(user.id);
        if (!profile) {
          throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
        }
        userId = user.id;
      } else {
        // For non-authenticated requests, use a default user ID for testing
        userId = 'fa0ca8e0-f848-45b9-b107-21e56b38573f';
        console.log('Auth disabled, using default user ID for orphaned images:', userId);
      }

      // Get all S3 images in a-plus-content folder
      const s3Images = await this.s3Service.listS3Files('a-plus-content/');

      // Get all images from database
      const dbImages = await this.productsService.getAllAPlusContentImages(userId);

      // Extract S3 keys from database images
      const dbS3Keys = new Set();
      dbImages.forEach(img => {
        if (img.url && img.url.includes('amazonaws.com')) {
          // Extract S3 key from URL
          const urlParts = img.url.split('/');
          const key = urlParts.slice(3).join('/'); // Remove protocol, domain, bucket
          dbS3Keys.add(key);
        }
      });

      // Find orphaned images (in S3 but not in DB)
      const orphanedImages = s3Images.filter(s3Img => !dbS3Keys.has(s3Img.key));

      return {
        success: true,
        data: {
          totalS3Images: s3Images.length,
          totalDbImages: dbImages.length,
          orphanedImages: orphanedImages,
          orphanedCount: orphanedImages.length
        },
        message: 'Orphaned images retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve orphaned images',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('cleanup-orphaned-images')
  async cleanupOrphanedImages(@Body() body: { imageKeys?: string[] }, @Request() req?: any) {
    try {
      const user = req.user;

      // Handle both authenticated and non-authenticated cases
      if (user) {
        // Get user profile to determine role and verify access
        const profile = await this.authService.getUserProfile(user.id);
        if (!profile) {
          throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
        }
      } else {
        console.log('Auth disabled, allowing orphaned images cleanup');
      }

      const { imageKeys } = body;

      if (!imageKeys || imageKeys.length === 0) {
        throw new HttpException('imageKeys are required', HttpStatus.BAD_REQUEST);
      }

      // Delete specified orphaned images from S3
      const deletedImages = await this.s3Service.deleteMultipleFiles(imageKeys);

      return {
        success: true,
        data: {
          deletedImages: deletedImages,
          deletedCount: deletedImages.length
        },
        message: `Successfully deleted ${deletedImages.length} orphaned images`
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to cleanup orphaned images',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}