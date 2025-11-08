import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { AuthGuard } from '@nestjs/passport';

interface SupplierProfileUpdateDto {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  business_type?: string;
}

@Controller('api/suppliers')
@UseGuards(AuthGuard('jwt'))
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('profile')
  async getSupplierProfile(@Request() req: any) {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const profile = await this.suppliersService.getSupplierProfile(userId);
      return {
        success: true,
        data: profile,
        message: 'Supplier profile retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch supplier profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('profile')
  async updateSupplierProfile(
    @Body() profileData: SupplierProfileUpdateDto,
    @Request() req: any
  ) {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const profile = await this.suppliersService.updateSupplierProfile(userId, profileData);
      return {
        success: true,
        data: profile,
        message: 'Supplier profile updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update supplier profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  async getSupplierStats(@Request() req: any) {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const stats = await this.suppliersService.getSupplierStats(userId);
      return {
        success: true,
        data: stats,
        message: 'Supplier stats retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch supplier stats',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('products')
  async getSupplierProducts(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const userId = req.user?.sub || req.user?.id;

      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }

      const products = await this.suppliersService.getSupplierProducts(
        userId,
        limit ? parseInt(limit) : 10,
        offset ? parseInt(offset) : 0
      );

      return {
        success: true,
        data: products,
        message: 'Supplier products retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch supplier products',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}