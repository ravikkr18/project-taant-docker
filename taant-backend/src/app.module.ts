import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PublicModule } from './public/public.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [AuthModule, ProductsModule, SuppliersModule, PublicModule, UsersModule, OrdersModule, ReviewsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}