import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [AuthModule, ProductsModule, SuppliersModule, PublicModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}