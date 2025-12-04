import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderWithItems } from './order.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('api/orders/confirmation')
@UseGuards(SupabaseAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OrderConfirmationController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':orderNumber')
  async getOrderByOrderNumber(@Param('orderNumber') orderNumber: string, @Request() req): Promise<OrderWithItems> {
    const order = await this.ordersService.getOrderByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify that the authenticated user is the owner of this order
    const authenticatedUserId = req.user?.id;
    if (order.customer_id !== authenticatedUserId) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    return order;
  }
}