import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProductsService {
  constructor(private readonly authService: AuthService) {}

  private createServiceClient() {
    return this.authService.createServiceClient();
  }

  async getProducts(supplierId?: string, categoryId?: string) {
    const supabase = this.createServiceClient();

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug,
          parent_id
        ),
        suppliers:supplier_id (
          id,
          business_name,
          slug,
          rating,
          is_verified,
          status
        ),
        product_images (
          id,
          url,
          alt_text,
          file_name,
          file_size,
          file_type,
          width,
          height,
          position,
          is_primary
        )
      `);

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Add variant count for each product
    const productsWithVariantCount = await Promise.all(
      data.map(async (product) => {
        const { count: variantCount } = await supabase
          .from('product_variants')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', product.id);

        return {
          ...product,
          variant_count: variantCount || 0
        };
      })
    );

    return productsWithVariantCount;
  }

  async getProductById(id: string) {
    const supabase = this.createServiceClient();

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          slug,
          parent_id
        ),
        suppliers:supplier_id (
          id,
          business_name,
          slug,
          rating,
          is_verified,
          status
        ),
        product_images (
          id,
          url,
          alt_text,
          file_name,
          file_size,
          file_type,
          width,
          height,
          position,
          is_primary
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  }

  async createProduct(productData: any, supplierId: string) {
    const supabase = await this.createServiceClient();

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        supplier_id: supplierId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data;
  }

  async updateProduct(id: string, productData: any, supplierId: string) {
    const supabase = await this.createServiceClient();

    // First verify the product belongs to the supplier
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`);
    }

    if (existingProduct.supplier_id !== supplierId) {
      throw new Error('Unauthorized: Product does not belong to this supplier');
    }

    // Prepare update data with timestamp
    const updateData = {
      ...productData,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated directly
    const fieldsToRemove = ['id', 'created_at', 'categories', 'suppliers', 'variant_count', 'total_revenue', 'total_sales', 'rating', 'total_reviews', 'view_count', 'wishlist_count'];

    fieldsToRemove.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field];
      }
    });

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data;
  }

  async deleteProduct(id: string, supplierId: string) {
    const supabase = await this.createServiceClient();

    // First verify the product belongs to the supplier
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`);
    }

    if (existingProduct.supplier_id !== supplierId) {
      throw new Error('Unauthorized: Product does not belong to this supplier');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    return { success: true, message: 'Product deleted successfully' };
  }

  async getCategories() {
    const supabase = await this.createServiceClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data;
  }

  async getProductStats(supplierId: string) {
    const supabase = await this.createServiceClient();

    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId);

    if (error) {
      throw new Error(`Failed to fetch product stats: ${error.message}`);
    }

    return { totalProducts: count || 0 };
  }
}