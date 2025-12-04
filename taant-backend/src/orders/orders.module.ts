import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrderConfirmationController } from './public-orders.controller';
import { OrdersService } from './orders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, OrderConfirmationController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}