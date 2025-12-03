import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Order,
  OrderItem,
  OrderWithItems,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderSummary
} from './order.entity';

@Injectable()
export class OrdersService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  async createOrder(customerId: string, orderData: CreateOrderRequest): Promise<OrderWithItems> {
    // Generate unique order number
    const orderNumber = this.generateOrderNumber();

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    // Get product details and calculate totals
    for (const item of orderData.items) {
      const { data: product, error: productError } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (productError || !product) {
        throw new NotFoundException(`Product with ID ${item.product_id} not found`);
      }

      let price = 0;
      if (item.variant_id) {
        const { data: variant, error: variantError } = await this.supabase
          .from('product_variants')
          .select('price')
          .eq('id', item.variant_id)
          .single();

        if (variantError || !variant) {
          throw new NotFoundException(`Product variant with ID ${item.variant_id} not found`);
        }
        price = variant.price;
      } else {
        // Get first variant price if no variant specified
        const { data: variant, error: variantError } = await this.supabase
          .from('product_variants')
          .select('price')
          .eq('product_id', item.product_id)
          .limit(1)
          .single();

        if (variantError || !variant) {
          throw new NotFoundException(`No variants found for product ${item.product_id}`);
        }
        price = variant.price;
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: price,
        total: itemTotal,
      });
    }

    // Calculate shipping (flat rate for now)
    const shippingAmount = 50; // ₹50 flat shipping
    const taxAmount = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .insert([
        {
          customer_id: customerId,
          order_number: orderNumber,
          status: 'pending',
          currency: 'INR',
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address || orderData.shipping_address,
          notes: orderData.notes,
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      throw new BadRequestException('Failed to create order');
    }

    // Create order items
    const { data: createdItems, error: itemsError } = await this.supabase
      .from('order_items')
      .insert(
        orderItems.map(item => ({
          ...item,
          order_id: order.id,
        }))
      )
      .select();

    if (itemsError) {
      // Rollback order creation
      await this.supabase.from('orders').delete().eq('id', order.id);
      throw new BadRequestException('Failed to create order items');
    }

    // Get order items with product details
    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) {
      throw new BadRequestException('Failed to fetch order items');
    }

    // If we have items, fetch product details separately
    let itemsWithDetails = [];
    if (items && items.length > 0) {
      // Get product details for all unique products
      const productIds = [...new Set(items.map(item => item.product_id))];
      const { data: products, error: productsError } = await this.supabase
        .from('products')
        .select('id, title, images')
        .in('id', productIds);

      if (productsError) {
        console.error('Failed to fetch product details:', productsError);
      }

      // Get variant details for all unique variants
      const variantIds = [...new Set(items.filter(item => item.variant_id).map(item => item.variant_id))];
      let variants = [];
      if (variantIds.length > 0) {
        const { data: variantData, error: variantsError } = await this.supabase
          .from('product_variants')
          .select('id, title, price, sku')
          .in('id', variantIds);

        if (!variantsError && variantData) {
          variants = variantData;
        }
      }

      // Combine the data
      itemsWithDetails = items.map(item => ({
        ...item,
        product: products?.find(p => p.id === item.product_id) || null,
        variant: variants?.find(v => v.id === item.variant_id) || null
      }));
    }

    // Return order with items
    return {
      ...order,
      items: itemsWithDetails || [],
    } as OrderWithItems;
  }

  async getOrdersByCustomer(customerId: string, page = 1, limit = 10): Promise<{ orders: Order[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data: orders, error, count } = await this.supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch orders');
    }

    return {
      orders: orders || [],
      total: count || 0,
    };
  }

  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') return null; // Not found
      throw new BadRequestException('Failed to fetch order');
    }

    // Get order items with product details - use separate queries to avoid JOIN issues
    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      throw new BadRequestException('Failed to fetch order items');
    }

    // If we have items, fetch product details separately
    let itemsWithDetails = [];
    if (items && items.length > 0) {
      // Get product details for all unique products
      const productIds = [...new Set(items.map(item => item.product_id))];
      const { data: products, error: productsError } = await this.supabase
        .from('products')
        .select('id, title, images')
        .in('id', productIds);

      if (productsError) {
        console.error('Failed to fetch product details:', productsError);
      }

      // Get variant details for all unique variants
      const variantIds = [...new Set(items.filter(item => item.variant_id).map(item => item.variant_id))];
      let variants = [];
      if (variantIds.length > 0) {
        const { data: variantData, error: variantsError } = await this.supabase
          .from('product_variants')
          .select('id, title, price, sku')
          .in('id', variantIds);

        if (!variantsError && variantData) {
          variants = variantData;
        }
      }

      // Combine the data
      itemsWithDetails = items.map(item => ({
        ...item,
        product: products?.find(p => p.id === item.product_id) || null,
        variant: variants?.find(v => v.id === item.variant_id) || null
      }));
    }

    return {
      ...order,
      items: itemsWithDetails || [],
    };
  }

  async updateOrderStatus(orderId: string, updateData: UpdateOrderStatusRequest): Promise<Order> {
    const updateFields: any = {
      status: updateData.status,
      updated_at: new Date().toISOString(),
    };

    if (updateData.internal_notes) {
      updateFields.internal_notes = updateData.internal_notes;
    }

    // Set timestamps based on status
    if (updateData.status === 'shipped') {
      updateFields.shipped_at = new Date().toISOString();
    } else if (updateData.status === 'delivered') {
      updateFields.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await this.supabase
      .from('orders')
      .update(updateFields)
      .eq('id', orderId)
      .select()
      .single();

    if (error || !order) {
      throw new NotFoundException('Order not found or update failed');
    }

    return order;
  }

  async getOrderSummary(customerId?: string): Promise<OrderSummary> {
    let query = this.supabase.from('orders').select('status, total_amount');

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw new BadRequestException('Failed to fetch order summary');
    }

    const summary: OrderSummary = {
      total_orders: orders?.length || 0,
      pending_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      total_revenue: 0,
    };

    orders?.forEach(order => {
      switch (order.status) {
        case 'pending':
          summary.pending_orders++;
          break;
        case 'delivered':
          summary.completed_orders++;
          summary.total_revenue += order.total_amount;
          break;
        case 'cancelled':
        case 'refunded':
          summary.cancelled_orders++;
          break;
      }
    });

    return summary;
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  }
}