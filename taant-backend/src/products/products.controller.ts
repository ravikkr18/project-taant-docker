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
  UseGuards
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthService } from '../auth/auth.service';

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
    private readonly authService: AuthService
  ) {}

  @Get()
  async getProducts(
    @Query('supplierId') supplierId?: string,
    @Query('categoryId') categoryId?: string,
    @Request() req?: any
  ) {
    try {
      const user = req.user;

      // Check if user can access the requested supplier data
      const canAccess = await this.authService.canAccessSupplierData(user.id, supplierId);

      if (!canAccess) {
        throw new HttpException('You do not have permission to access this supplier\'s products', HttpStatus.FORBIDDEN);
      }

      let finalSupplierId: string;

      // Get user profile to determine role
      const profile = await this.authService.getUserProfile(user.id);

      if (!profile) {
        throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
      }

      if (profile.role === 'admin') {
        // Admins can specify any supplierId or get all if not specified
        finalSupplierId = supplierId;
      } else if (profile.role === 'supplier') {
        // Suppliers can only get their own products
        const supplier = await this.authService.getSupplierByUserId(user.id);
        if (!supplier) {
          throw new HttpException('Supplier account not found for this user', HttpStatus.FORBIDDEN);
        }

        // Suppliers cannot access other suppliers' data
        if (supplierId && supplierId !== supplier.id) {
          throw new HttpException('You can only access your own products', HttpStatus.FORBIDDEN);
        }

        finalSupplierId = supplier.id;
      } else {
        throw new HttpException('Invalid user role', HttpStatus.FORBIDDEN);
      }

      const products = await this.productsService.getProducts(finalSupplierId, categoryId);
      return {
        success: true,
        data: products,
        message: 'Products retrieved successfully'
      };
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

      // Get user profile to determine role
      const profile = await this.authService.getUserProfile(user.id);

      if (!profile) {
        throw new HttpException('User profile not found', HttpStatus.FORBIDDEN);
      }

      let finalSupplierId: string;

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
}