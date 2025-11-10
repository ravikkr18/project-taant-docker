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
        ),
        product_variants (
          id,
          title,
          sku,
          price,
          compare_price,
          cost_price,
          inventory_quantity,
          weight,
          option1_name,
          option1_value,
          option2_name,
          option2_value,
          option3_name,
          option3_value,
          image_id,
          is_active,
          position
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
    const productsWithVariantCount = data.map((product) => ({
      ...product,
      variant_count: product.product_variants?.length || 0
    }));

    return productsWithVariantCount;
  }

  async getProductsPaginated(
    supplierId?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    const supabase = this.createServiceClient();
    const offset = (page - 1) * limit;

    // Get total count first
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (supplierId) {
      countQuery = countQuery.eq('supplier_id', supplierId);
    }

    if (categoryId) {
      countQuery = countQuery.eq('category_id', categoryId);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count products: ${countError.message}`);
    }

    // Get paginated data
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
        ),
        product_variants (
          id,
          title,
          sku,
          price,
          compare_price,
          cost_price,
          inventory_quantity,
          weight,
          option1_name,
          option1_value,
          option2_name,
          option2_value,
          option3_name,
          option3_value,
          image_id,
          is_active,
          position
        )
      `);

    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Add variant count and enhance variants with images for each product
    const productsWithEnhancedVariants = await Promise.all(
      (data || []).map(async (product) => {
        let enhancedVariants = product.product_variants || [];

        // Enhance variants with image URLs if they exist
        if (enhancedVariants.length > 0) {
          enhancedVariants = await this.enhanceVariantsWithImages(enhancedVariants);
        }

        return {
          ...product,
          product_variants: enhancedVariants,
          variant_count: enhancedVariants.length
        };
      })
    );

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return {
      data: productsWithEnhancedVariants,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages
      }
    };
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
        ),
        product_variants (
          id,
          title,
          sku,
          price,
          compare_price,
          cost_price,
          inventory_quantity,
          weight,
          option1_name,
          option1_value,
          option2_name,
          option2_value,
          option3_name,
          option3_value,
          image_id,
          is_active,
          position
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    // Enhance variants with image URLs
    if (data.product_variants && data.product_variants.length > 0) {
      data.product_variants = await this.enhanceVariantsWithImages(data.product_variants);
    }

    return data;
  }

  private async enhanceVariantsWithImages(variants: any[]) {
    const supabase = await this.createServiceClient();

    // Get all unique image_ids from variants
    const imageIds = [...new Set(variants
      .filter(variant => variant.image_id)
      .map(variant => variant.image_id)
    )];

    if (imageIds.length === 0) {
      return variants;
    }

    // Fetch all images in one query
    const { data: images, error: imageError } = await supabase
      .from('product_images')
      .select('id, url, alt_text, width, height')
      .in('id', imageIds);

    if (imageError) {
      console.error('Failed to fetch variant images:', imageError.message);
      return variants; // Return variants without images rather than failing
    }

    // Create a map of image_id to image data
    const imageMap = new Map();
    images?.forEach(image => {
      imageMap.set(image.id, image);
    });

    // Enhance each variant with its image data
    return variants.map(variant => ({
      ...variant,
      image_url: variant.image_id ? imageMap.get(variant.image_id)?.url : null,
      image_data: variant.image_id ? imageMap.get(variant.image_id) : null
    }));
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

    // Handle variants separately
    const variants = updateData.variants;
    delete updateData.variants; // Remove from main update data

    // Remove fields that shouldn't be updated directly
    const fieldsToRemove = ['id', 'created_at', 'categories', 'suppliers', 'variant_count', 'total_revenue', 'total_sales', 'rating', 'total_reviews', 'view_count', 'wishlist_count'];

    fieldsToRemove.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field];
      }
    });

    // Update main product
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    // Handle variants if provided
    if (variants && Array.isArray(variants)) {
      console.log('Handling variants:', variants.length, 'variants to process');

      // Delete existing variants for this product
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      if (deleteError) {
        console.error('Failed to delete existing variants:', deleteError.message);
        // Continue anyway, as variants might not exist yet
      }

      // Insert new variants
      const variantsToInsert = variants.map((variant, index) => ({
        product_id: id,
        sku: variant.sku,
        title: variant.title,
        price: variant.price || 0,
        compare_price: variant.compare_price || null,
        cost_price: variant.cost_price || null,
        inventory_quantity: variant.inventory_quantity || 0,
        weight: variant.weight || null,
        dimensions: variant.dimensions || null,
        option1_name: variant.options?.[0]?.name || null,
        option1_value: variant.options?.[0]?.value || null,
        option2_name: variant.options?.[1]?.name || null,
        option2_value: variant.options?.[1]?.value || null,
        option3_name: variant.options?.[2]?.name || null,
        option3_value: variant.options?.[2]?.value || null,
        image_id: variant.image_id || null,
        position: variant.position !== undefined ? variant.position : index,
        is_active: variant.is_active !== undefined ? variant.is_active : true
      }));

      if (variantsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (insertError) {
          console.error('Failed to insert variants:', insertError.message);
          throw new Error(`Failed to save variants: ${insertError.message}`);
        }

        console.log('Successfully inserted', variantsToInsert.length, 'variants');
      }
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