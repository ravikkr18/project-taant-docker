import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderWithItems,
} from './order.entity';

@Controller('api/orders')
@UseGuards(SupabaseAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Request() req, @Body() createOrderData: CreateOrderRequest): Promise<OrderWithItems> {
    const customerId = req.user.id;
    return this.ordersService.createOrder(customerId, createOrderData);
  }

  @Get()
  async getOrdersByCustomer(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const customerId = req.user.id;
    return this.ordersService.getOrdersByCustomer(customerId, page, limit);
  }

  @Get('summary/stats')
  async getOrderSummary(@Request() req) {
    const customerId = req.user.id;
    return this.ordersService.getOrderSummary(customerId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<OrderWithItems> {
    const order = await this.ordersService.getOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateData: UpdateOrderStatusRequest,
  ) {
    return this.ordersService.updateOrderStatus(id, updateData);
  }
}