import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { validateOptionsCount, transformVariantsArray, transformVariantData, VariantOption } from '../utils/variant-helper';

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

    // Extract variants data for separate handling
    const variants = productData.variants;
    delete productData.variants;

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

    // Handle variants separately
    if (variants && Array.isArray(variants)) {
      const variantsToInsert = variants.map(variant => {
        // Validate options count
        const options = variant.options || [];
        const validation = validateOptionsCount(options);
        if (!validation.isValid) {
          throw new Error(`Variant validation failed: ${validation.error}`);
        }

        return {
          product_id: data.id,
          sku: variant.sku,
          title: variant.title,
          barcode: variant.barcode || null,
          price: variant.price,
          compare_price: variant.compare_price || null,
          cost_price: variant.cost_price || null,
          weight: variant.weight || null,
          inventory_quantity: variant.inventory_quantity || 0,
          position: variant.position || 0,
          options: options, // Store options directly as JSON
          image_id: variant.image_id || null,
          is_active: variant.is_active !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      if (variantsToInsert.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantError) {
          throw new Error(`Failed to create variants: ${variantError.message}`);
        }
      }
    }

    return data;
  }

  async updateProduct(id: string, productData: any, supplierId: string) {
    const supabase = await this.createServiceClient();

    // DEBUG: Log what data is being received
    console.log('🔍 UPDATE PRODUCT DEBUG - Received productData:', {
      id,
      supplierId,
      hasVariants: !!productData.variants,
      variantCount: productData.variants?.length || 0,
      variantKeys: productData.variants ? Object.keys(productData.variants[0] || {}) : [],
      allKeys: Object.keys(productData),
      aPlusContent: !!productData.a_plus_content,
      aPlusSections: !!productData.a_plus_sections
    });

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

    // Extract variants data for separate handling
    const variants = productData.variants;
    delete productData.variants;

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

    // Update the main product
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    // Handle variants separately - only if variants are actually provided
    if (variants && Array.isArray(variants)) {
      // Check if variants contain actual data (not just empty placeholder)
      const hasRealVariantData = variants.some(variant =>
        variant && (variant.sku || variant.title || (variant.options && variant.options.length > 0))
      );

      // Only update variants if real variant data is provided
      if (hasRealVariantData) {
        // First, delete existing variants for this product
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', id);

        // Then insert the new variants
      const variantsToInsert = variants.map(variant => {
        // Validate options count
        const options = variant.options || [];
        const validation = validateOptionsCount(options);
        if (!validation.isValid) {
          throw new Error(`Variant validation failed: ${validation.error}`);
        }

        const mappedVariant = {
          product_id: id,
          sku: variant.sku,
          title: variant.title,
          barcode: variant.barcode || null,
          price: variant.price,
          compare_price: variant.compare_price || null,
          cost_price: variant.cost_price || null,
          weight: variant.weight || null,
          inventory_quantity: variant.inventory_quantity || 0,
          position: variant.position || 0,
          options: options, // Store options directly as JSON
          image_id: variant.image_id || null,
          is_active: variant.is_active !== false,
          updated_at: new Date().toISOString()
        };
        return mappedVariant;
      });

      if (variantsToInsert.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantError) {
          throw new Error(`Failed to update variants: ${variantError.message}`);
        }
      }
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

  // Variant-specific methods
  async getProductVariants(productId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product's variants
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot access this product\'s variants');
    }

    // Fetch variants with their images
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        variant_images (
          id,
          url,
          alt_text,
          file_name,
          file_size,
          file_type,
          position,
          is_primary
        )
      `)
      .eq('product_id', productId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    // Convert to frontend format with options array using the new helper function
    return transformVariantsArray(variants);
  }

  async createProductVariant(productId: string, variantData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s variants');
    }

    // Get next position
    const { data: maxPosition } = await supabase
      .from('product_variants')
      .select('position')
      .eq('product_id', productId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPosition?.[0]?.position || 0) + 1;

    // Prepare variant data
    const newVariant = {
      product_id: productId,
      sku: variantData.sku || `VAR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      title: variantData.title,
      barcode: variantData.barcode || null,
      price: variantData.price,
      compare_price: variantData.compare_price || null,
      cost_price: variantData.cost_price || null,
      inventory_quantity: variantData.inventory_quantity || 0,
      inventory_policy: 'deny',
      inventory_tracking: true,
      low_stock_threshold: 10,
      allow_backorder: false,
      requires_shipping: true,
      weight: variantData.weight || null,
      taxable: true,
      tax_code: null,
      position: nextPosition,
      image_id: variantData.image_id || null,
      is_active: variantData.is_active !== false,
      // Store options directly as JSON
      options: variantData.options || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('product_variants')
      .insert([newVariant])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create variant: ${error.message}`);
    }

    // Handle variant images if provided
    if (variantData.variant_images && Array.isArray(variantData.variant_images)) {
      const variantImagesToInsert = variantData.variant_images
        .filter(img => img.url && !img.id.startsWith('temp-')) // Only save real images with URLs and non-temp IDs
        .map(img => ({
          variant_id: data.id,
          url: img.url,
          alt_text: img.alt_text || img.file_name || '',
          position: img.position || 0,
          is_primary: img.is_primary || false,
          file_name: img.file_name || '',
          file_size: img.file_size || 0,
          file_type: img.file_type || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (variantImagesToInsert.length > 0) {
        const { error: imagesError } = await supabase
          .from('variant_images')
          .insert(variantImagesToInsert);

        if (imagesError) {
          // Don't fail the variant creation, but log the error
          console.error('Failed to create variant images:', imagesError);
        }
      }
    }

    // Transform to frontend format (remove old columns, use JSON options)
    return transformVariantData(data);
  }

  async updateProductVariant(productId: string, variantId: string, variantData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s variants');
    }

    // Prepare update data
    const updateData: any = {
      title: variantData.title,
      sku: variantData.sku,
      barcode: variantData.barcode || null,
      price: variantData.price,
      compare_price: variantData.compare_price || null,
      cost_price: variantData.cost_price || null,
      inventory_quantity: variantData.inventory_quantity,
      weight: variantData.weight || null,
      image_id: variantData.image_id || null,
      is_active: variantData.is_active !== false,
      updated_at: new Date().toISOString()
    };

    // Store options directly as JSON (no more column limits)
    if (variantData.options && Array.isArray(variantData.options)) {
      updateData.options = variantData.options;
    }

    const { data, error } = await supabase
      .from('product_variants')
      .update(updateData)
      .eq('id', variantId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update variant: ${error.message}`);
    }

    // Handle variant images if provided
    if (variantData.variant_images && Array.isArray(variantData.variant_images)) {
      // First, delete existing variant images for this variant
      const { error: deleteError } = await supabase
        .from('variant_images')
        .delete()
        .eq('variant_id', variantId);

      if (deleteError) {
        console.error('Failed to delete existing variant images:', deleteError);
      }

      // Then insert the new variant images
      const variantImagesToInsert = variantData.variant_images
        .filter(img => img.url && !img.id.startsWith('temp-')) // Only save real images with URLs and non-temp IDs
        .map(img => ({
          variant_id: variantId,
          url: img.url,
          alt_text: img.alt_text || img.file_name || '',
          position: img.position || 0,
          is_primary: img.is_primary || false,
          file_name: img.file_name || '',
          file_size: img.file_size || 0,
          file_type: img.file_type || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (variantImagesToInsert.length > 0) {
        const { error: imagesError } = await supabase
          .from('variant_images')
          .insert(variantImagesToInsert);

        if (imagesError) {
          // Don't fail the variant update, but log the error
          console.error('Failed to update variant images:', imagesError);
        }
      }
    }

    // Transform to frontend format (remove old columns, use JSON options)
    return transformVariantData(data);
  }

  async deleteProductVariant(productId: string, variantId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s variants');
    }

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(`Failed to delete variant: ${error.message}`);
    }

    return { success: true, message: 'Variant deleted successfully' };
  }

  // A+ Content Images methods
  async getAPlusContentImages(productId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot access this product\'s content images');
    }

    const { data, error } = await supabase
      .from('a_plus_content_images')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch content images: ${error.message}`);
    }

    return data || [];
  }

  async createAPlusContentImage(productId: string, imageData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s content images');
    }

    // Get next position
    const { data: maxPosition } = await supabase
      .from('a_plus_content_images')
      .select('position')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = (maxPosition?.[0]?.position || 0) + 1;

    // Prepare image data
    const newContentImage = {
      product_id: productId,
      url: imageData.url,
      alt_text: imageData.alt_text || null,
      file_name: imageData.file_name || null,
      file_size: imageData.file_size || null,
      file_type: imageData.file_type || null,
      width: imageData.width || null,
      height: imageData.height || null,
      position: nextPosition,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('a_plus_content_images')
      .insert([newContentImage])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create content image: ${error.message}`);
    }

    return data;
  }

  async updateAPlusContentImage(productId: string, imageId: string, imageData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s content images');
    }

    // Prepare update data
    const updateData = {
      url: imageData.url,
      alt_text: imageData.alt_text || null,
      file_name: imageData.file_name || null,
      file_size: imageData.file_size || null,
      file_type: imageData.file_type || null,
      width: imageData.width || null,
      height: imageData.height || null,
      position: imageData.position,
      is_active: imageData.is_active !== false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('a_plus_content_images')
      .update(updateData)
      .eq('id', imageId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update content image: ${error.message}`);
    }

    return data;
  }

  async updateAPlusContentImagePositions(productId: string, positions: { id: string; position: number }[], userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s content images');
    }

    // Update each image position
    const updatePromises = positions.map(({ id, position }) =>
      supabase
        .from('a_plus_content_images')
        .update({ position, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('product_id', productId)
    );

    await Promise.all(updatePromises);

    return { success: true, message: 'Content image positions updated successfully' };
  }

  async deleteAPlusContentImage(productId: string, imageId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s content images');
    }

    const { error } = await supabase
      .from('a_plus_content_images')
      .delete()
      .eq('id', imageId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(`Failed to delete content image: ${error.message}`);
    }

    return { success: true, message: 'Content image deleted successfully' };
  }

  // Get all A+ content images for a user (for orphaned images detection)
  async getAllAPlusContentImages(userId: string) {
    const supabase = await this.createServiceClient();

    // Get all products the user can access
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('status', 'active');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    if (!products || products.length === 0) {
      return [];
    }

    const productIds = products.map(p => p.id);

    // Get all A+ content images for these products
    const { data: images, error: imagesError } = await supabase
      .from('a_plus_content_images')
      .select('*')
      .in('product_id', productIds);

    if (imagesError) {
      throw new Error(`Failed to fetch content images: ${imagesError.message}`);
    }

    return images || [];
  }

  // Paginated products method
  async getProductsPaginated(
    supplierId?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
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

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Apply same filters to count query
    if (supplierId) {
      countQuery = countQuery.eq('supplier_id', supplierId);
    }

    if (categoryId) {
      countQuery = countQuery.eq('category_id', categoryId);
    }

    if (search) {
      countQuery = countQuery.ilike('title', `%${search}%`);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to get total count: ${countError.message}`);
    }

    // Get paginated data
    const offset = (page - 1) * limit;
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Add variant count for each product
    const productsWithVariantCount = await Promise.all(
      (data || []).map(async (product) => {
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

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: productsWithVariantCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  // Product Images Database Management methods
  async getProductImages(productId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot access this product\'s images');
    }

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch product images: ${error.message}`);
    }

    return data || [];
  }

  async createProductImage(productId: string, imageData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s images');
    }

    // Get next position
    const { data: maxPosition } = await supabase
      .from('product_images')
      .select('position')
      .eq('product_id', productId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxPosition ? maxPosition.position + 1 : 0;

    // Insert new product image
    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: imageData.url,
        alt_text: imageData.alt_text || '',
        file_name: imageData.file_name || '',
        file_size: imageData.file_size || 0,
        file_type: imageData.file_type || '',
        position: imageData.position || nextPosition,
        is_primary: imageData.is_primary || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product image: ${error.message}`);
    }

    return data;
  }

  async updateProductImagePositions(productId: string, positions: { id: string; position: number }[], userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s images');
    }

    // Update each image position
    const updatePromises = positions.map(({ id, position }) =>
      supabase
        .from('product_images')
        .update({ position, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('product_id', productId)
    );

    await Promise.all(updatePromises);

    return { success: true, message: 'Product image positions updated successfully' };
  }

  async updateProductImage(productId: string, imageId: string, imageData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s images');
    }

    // Update the image
    const { data, error } = await supabase
      .from('product_images')
      .update({
        ...imageData,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product image: ${error.message}`);
    }

    return data;
  }

  async deleteProductImage(productId: string, imageId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this product\'s images');
    }

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(`Failed to delete product image: ${error.message}`);
    }

    return { success: true, message: 'Product image deleted successfully' };
  }

  // Public methods for frontend consumption
  async getProductsBySlug(slug: string) {
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
          product_id,
          sku,
          title,
          barcode,
          price,
          compare_price,
          cost_price,
          weight,
          dimensions,
          inventory_quantity,
          inventory_policy,
          inventory_tracking,
          low_stock_threshold,
          allow_backorder,
          requires_shipping,
          taxable,
          tax_code,
          position,
          option1_name,
          option1_value,
          option2_name,
          option2_value,
          option3_name,
          option3_value,
          options,
          image_id,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Product not found
      }
      throw new Error(`Failed to fetch product by slug: ${error.message}`);
    }

    // Transform variant options to ensure compatibility with frontend
    if (data && data.product_variants) {
      data.product_variants = transformVariantsArray(data.product_variants);
    }

    return data;
  }

  
  async getRelatedProducts(categoryId: string, excludeId: string, limit: number = 6) {
    const supabase = this.createServiceClient();

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        description,
        base_price,
        compare_price,
        status,
        total_reviews,
        rating,
        categories:category_id (
          id,
          name,
          slug
        ),
        suppliers:supplier_id (
          id,
          business_name,
          slug
        ),
        product_images (
          id,
          url,
          alt_text,
          position,
          is_primary
        )
      `)
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .eq('status', 'active')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch related products: ${error.message}`);
    }

    return data || [];
  }

  // Variant Images Database Management methods
  async getVariantImages(variantId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this variant
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    if (variantError) {
      throw new Error(`Failed to fetch variant: ${variantError.message}`);
    }

    // Get the product to check supplier access
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', variant.product_id)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot access this variant\'s images');
    }

    const { data, error } = await supabase
      .from('variant_images')
      .select('*')
      .eq('variant_id', variantId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch variant images: ${error.message}`);
    }

    return data || [];
  }

  async createVariantImage(variantId: string, imageData: any, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this variant
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    if (variantError) {
      throw new Error(`Failed to fetch variant: ${variantError.message}`);
    }

    // Get the product to check supplier access
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', variant.product_id)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this variant\'s images');
    }

    // Get next position
    const { data: maxPosition } = await supabase
      .from('variant_images')
      .select('position')
      .eq('variant_id', variantId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = maxPosition ? maxPosition.position + 1 : 0;

    // If this is the first image or explicitly set as primary, set it as primary
    const { data: existingImages } = await supabase
      .from('variant_images')
      .select('id')
      .eq('variant_id', variantId);

    const shouldBePrimary = existingImages?.length === 0 || imageData.is_primary === true;

    // Insert new variant image
    const { data, error } = await supabase
      .from('variant_images')
      .insert({
        variant_id: variantId,
        url: imageData.url,
        alt_text: imageData.alt_text || '',
        file_name: imageData.file_name || '',
        file_size: imageData.file_size || 0,
        file_type: imageData.file_type || '',
        position: imageData.position || nextPosition,
        is_primary: shouldBePrimary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create variant image: ${error.message}`);
    }

    return data;
  }

  async updateVariantImagePositions(variantId: string, positions: { id: string; position: number }[], userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this variant
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    if (variantError) {
      throw new Error(`Failed to fetch variant: ${variantError.message}`);
    }

    // Get the product to check supplier access
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', variant.product_id)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this variant\'s images');
    }

    // Update each image position
    const updatePromises = positions.map(({ id, position }) =>
      supabase
        .from('variant_images')
        .update({ position, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('variant_id', variantId)
    );

    await Promise.all(updatePromises);

    return { success: true, message: 'Variant image positions updated successfully' };
  }

  async setVariantPrimaryImage(variantId: string, imageId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this variant
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    if (variantError) {
      throw new Error(`Failed to fetch variant: ${variantError.message}`);
    }

    // Get the product to check supplier access
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', variant.product_id)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this variant\'s images');
    }

    // First, set all images for this variant to non-primary
    await supabase
      .from('variant_images')
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq('variant_id', variantId);

    // Then set the specified image as primary
    const { data, error } = await supabase
      .from('variant_images')
      .update({
        is_primary: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)
      .eq('variant_id', variantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update variant primary image: ${error.message}`);
    }

    return data;
  }

  async deleteVariantImage(variantId: string, imageId: string, userId: string) {
    const supabase = await this.createServiceClient();

    // Verify user can access this variant
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('product_id')
      .eq('id', variantId)
      .single();

    if (variantError) {
      throw new Error(`Failed to fetch variant: ${variantError.message}`);
    }

    // Get the product to check supplier access
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('supplier_id')
      .eq('id', variant.product_id)
      .single();

    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }

    const canAccess = await this.authService.canAccessSupplierData(userId, product.supplier_id);
    if (!canAccess) {
      throw new Error('Unauthorized: You cannot modify this variant\'s images');
    }

    const { error } = await supabase
      .from('variant_images')
      .delete()
      .eq('id', imageId)
      .eq('variant_id', variantId);

    if (error) {
      throw new Error(`Failed to delete variant image: ${error.message}`);
    }

    return { success: true, message: 'Variant image deleted successfully' };
  }

  // Public versions of image and variant methods (no user authentication required)
  async getProductImagesPublic(productId: string) {
    const supabase = this.createServiceClient();

    // First check if product is active
    const { data: product } = await supabase
      .from('products')
      .select('id, status')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (!product) {
      throw new Error('Product not found or not available');
    }

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch product images: ${error.message}`);
    }

    return data || [];
  }

  async getProductVariantsPublic(productId: string) {
    const supabase = this.createServiceClient();

    // First check if product is active
    const { data: product } = await supabase
      .from('products')
      .select('id, status')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (!product) {
      throw new Error('Product not found or not available');
    }

    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        variant_images (
          id,
          url,
          alt_text,
          file_name,
          file_size,
          file_type,
          position,
          is_primary
        )
      `)
      .eq('product_id', productId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch product variants: ${error.message}`);
    }

    return data || [];
  }
}