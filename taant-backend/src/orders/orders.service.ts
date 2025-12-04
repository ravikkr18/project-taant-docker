import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Order,
  OrderItem,
  OrderWithItems,
  EnrichedOrderWithItems,
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
        // Use specific variant price
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
        // Try to get first variant price, fallback to product base_price
        const { data: variant, error: variantError } = await this.supabase
          .from('product_variants')
          .select('price')
          .eq('product_id', item.product_id)
          .limit(1)
          .single();

        if (variantError || !variant) {
          // No variants found, use product's base_price
          const { data: product, error: productError } = await this.supabase
            .from('products')
            .select('base_price, title')
            .eq('id', item.product_id)
            .single();

          if (productError || !product) {
            throw new NotFoundException(`Product with ID ${item.product_id} not found`);
          }

          if (!product.base_price || product.base_price <= 0) {
            throw new BadRequestException(`Product ${item.product_id} has no price configured`);
          }

          price = product.base_price;
          console.log(`Using base price for product ${product.title}: ₹${price}`);
        } else {
          price = variant.price;
        }
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
    const { data: items, error: itemsFetchError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsFetchError) {
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

  async getOrdersByCustomer(customerId: string, page = 1, limit = 10): Promise<{ orders: EnrichedOrderWithItems[]; total: number }> {
    const offset = (page - 1) * limit;

    // Fetch orders with essential fields only
    const { data: orders, error, count } = await this.supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        order_number,
        status,
        currency,
        subtotal,
        tax_amount,
        shipping_amount,
        total_amount,
        shipping_address,
        billing_address,
        notes,
        internal_notes,
        shipped_at,
        delivered_at,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException('Failed to fetch orders');
    }

    if (!orders || orders.length === 0) {
      return {
        orders: [],
        total: count || 0,
      };
    }

    // Fetch all order items for these orders
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await this.supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      throw new BadRequestException('Failed to fetch order items');
    }

    // Get unique product and variant IDs
    const productIds = [...new Set(orderItems?.map(item => item.product_id) || [])];
    const variantIds = [...new Set(orderItems?.filter(item => item.variant_id).map(item => item.variant_id) || [])];

    // Fetch products and variants in parallel
    const [productsResult, variantsResult] = await Promise.all([
      productIds.length > 0
        ? this.supabase.from('products').select('id, title, images').in('id', productIds)
        : Promise.resolve({ data: [], error: null }),
      variantIds.length > 0
        ? this.supabase.from('product_variants').select('id, title, price, sku').in('id', variantIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    const { data: products } = productsResult;
    const { data: variants } = variantsResult;

    // Combine all data
    const enrichedOrders: EnrichedOrderWithItems[] = orders.map(order => {
      const items = orderItems?.filter(item => item.order_id === order.id) || [];

      const enrichedItems = items.map(item => ({
        ...item,
        product: products?.find(p => p.id === item.product_id) || null,
        variant: variants?.find(v => v.id === item.variant_id) || null
      }));

      return {
        ...order,
        items: enrichedItems
      };
    });

    console.log(`Loaded ${enrichedOrders.length} orders with ${orderItems?.length || 0} total items`);

    return {
      orders: enrichedOrders,
      total: count || 0,
    };
  }

  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    // Fetch only essential order fields for better performance
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select(`
        id,
        customer_id,
        order_number,
        status,
        currency,
        subtotal,
        tax_amount,
        shipping_amount,
        total_amount,
        shipping_address,
        billing_address,
        notes,
        internal_notes,
        shipped_at,
        delivered_at,
        created_at,
        updated_at
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') return null; // Not found
      throw new BadRequestException('Failed to fetch order');
    }

    // Get order items with basic details first
    const { data: items, error: itemsFetchError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsFetchError) {
      console.error('Failed to fetch order items:', itemsFetchError);
      throw new BadRequestException('Failed to fetch order items');
    }

    // If we have items, fetch product and variant details in parallel
    let itemsWithDetails = [];
    if (items && items.length > 0) {
      // Get unique product and variant IDs
      const productIds = [...new Set(items.map(item => item.product_id))];
      const variantIds = [...new Set(items.filter(item => item.variant_id).map(item => item.variant_id))];

      // Fetch products and variants in parallel
      const [productsResult, variantsResult] = await Promise.all([
        productIds.length > 0
          ? this.supabase.from('products').select('id, title, images').in('id', productIds)
          : Promise.resolve({ data: [], error: null }),
        variantIds.length > 0
          ? this.supabase.from('product_variants').select('id, title, price, sku').in('id', variantIds)
          : Promise.resolve({ data: [], error: null })
      ]);

      const { data: products } = productsResult;
      const { data: variants } = variantsResult;

      // Combine the data efficiently
      itemsWithDetails = items.map(item => ({
        ...item,
        product: products?.find(p => p.id === item.product_id) || null,
        variant: variants?.find(v => v.id === item.variant_id) || null
      }));
    }

    console.log(`Order ${orderId} loaded with ${itemsWithDetails.length} items`);

    return {
      ...order,
      items: itemsWithDetails,
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

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    // First, check if the order exists and can be cancelled
    const { data: order, error: fetchError } = await this.supabase
      .from('orders')
      .select('id, status, customer_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order can be cancelled (only pending, confirmed, or processing orders can be cancelled)
    if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
    }

    // Update order status to cancelled
    const updateFields: any = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    if (reason) {
      updateFields.internal_notes = `Cancelled: ${reason}`;
    }

    const { data: cancelledOrder, error: updateError } = await this.supabase
      .from('orders')
      .update(updateFields)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !cancelledOrder) {
      throw new BadRequestException('Failed to cancel order');
    }

    console.log(`Order ${orderId} cancelled successfully`);
    return cancelledOrder;
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    // Fetch only essential order fields for better performance
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        currency,
        subtotal,
        tax_amount,
        shipping_amount,
        total_amount,
        shipping_address,
        billing_address,
        notes,
        internal_notes,
        shipped_at,
        delivered_at,
        created_at,
        updated_at
      `)
      .eq('order_number', orderNumber)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') return null; // Not found
      throw new BadRequestException('Failed to fetch order');
    }

    // Get order items with basic details first
    const { data: items, error: itemsFetchError } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsFetchError) {
      console.error('Failed to fetch order items:', itemsFetchError);
      throw new BadRequestException('Failed to fetch order items');
    }

    // If we have items, fetch product and variant details in parallel
    let itemsWithDetails = [];
    if (items && items.length > 0) {
      // Get unique product and variant IDs
      const productIds = [...new Set(items.map(item => item.product_id))];
      const variantIds = [...new Set(items.filter(item => item.variant_id).map(item => item.variant_id))];

      // Fetch products and variants in parallel
      const [productsResult, variantsResult] = await Promise.all([
        productIds.length > 0
          ? this.supabase.from('products').select('id, title, images').in('id', productIds)
          : Promise.resolve({ data: [], error: null }),
        variantIds.length > 0
          ? this.supabase.from('product_variants').select('id, title, price, sku').in('id', variantIds)
          : Promise.resolve({ data: [], error: null })
      ]);

      const { data: products } = productsResult;
      const { data: variants } = variantsResult;

      // Combine the data efficiently
      itemsWithDetails = items.map(item => ({
        ...item,
        product: products?.find(p => p.id === item.product_id) || null,
        variant: variants?.find(v => v.id === item.variant_id) || null
      }));
    }

    console.log(`Order ${orderNumber} loaded with ${itemsWithDetails.length} items`);

    return {
      ...order,
      items: itemsWithDetails,
    } as OrderWithItems;
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

  async refundOrder(orderId: string, refundData: { reason: string; refund_amount?: number; refund_method?: string }): Promise<Order> {
    // First, check if the order exists and can be refunded
    const { data: order, error: fetchError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order can be refunded (only delivered orders can be refunded)
    if (order.status !== 'delivered') {
      throw new BadRequestException(`Cannot refund order with status: ${order.status}. Only delivered orders can be refunded.`);
    }

    // Validate refund amount
    const refundAmount = refundData.refund_amount || order.total_amount;
    if (refundAmount <= 0 || refundAmount > order.total_amount) {
      throw new BadRequestException('Invalid refund amount');
    }

    // Update order status to refunded
    const { data: refundedOrder, error: updateError } = await this.supabase
      .from('orders')
      .update({
        status: 'refunded',
        internal_notes: order.internal_notes
          ? `${order.internal_notes}\nRefunded: ${refundData.reason}. Amount: ₹${refundAmount}. Method: ${refundData.refund_method || 'original'}`
          : `Refunded: ${refundData.reason}. Amount: ₹${refundAmount}. Method: ${refundData.refund_method || 'original'}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException('Failed to refund order');
    }

    return refundedOrder;
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  }
}