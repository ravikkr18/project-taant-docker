import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly authService: AuthService) {}

  private createServiceClient() {
    return this.authService.createServiceClient();
  }

  async getSupplierProfile(userId: string) {
    const supabase = this.createServiceClient();

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch supplier profile: ${error.message}`);
    }

    return data;
  }

  async updateSupplierProfile(userId: string, profileData: any) {
    const supabase = this.createServiceClient();

    const { data, error } = await supabase
      .from('suppliers')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update supplier profile: ${error.message}`);
    }

    return data;
  }

  async getSupplierStats(userId: string) {
    const supabase = this.createServiceClient();

    // First get supplier ID from user ID
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (supplierError) {
      throw new Error(`Failed to fetch supplier: ${supplierError.message}`);
    }

    const supplierId = supplier.id;

    // Get product counts
    const { count: totalProducts, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId);

    if (productError) {
      throw new Error(`Failed to fetch product stats: ${productError.message}`);
    }

    // Get recent orders (assuming orders table exists)
    const { count: recentOrders, error: orderError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    const ordersCount = orderError ? 0 : recentOrders || 0;

    return {
      totalProducts: totalProducts || 0,
      recentOrders: ordersCount,
      supplierId: supplierId
    };
  }

  async getSupplierProducts(userId: string, limit: number = 10, offset: number = 0) {
    const supabase = this.createServiceClient();

    // First get supplier ID from user ID
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (supplierError) {
      throw new Error(`Failed to fetch supplier: ${supplierError.message}`);
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          name,
          slug
        )
      `)
      .eq('supplier_id', supplier.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch supplier products: ${error.message}`);
    }

    return data;
  }
}