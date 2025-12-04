export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  notes?: string;
  internal_notes?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  total: number;
  created_at: Date;
}

export interface ProductDetails {
  id: string;
  title: string;
  images: Array<{
    url: string;
    alt_text: string;
    position: number;
    is_primary: boolean;
  }>;
}

export interface VariantDetails {
  id: string;
  title: string;
  price: number;
  sku: string;
}

export interface EnrichedOrderItem extends OrderItem {
  product: ProductDetails | null;
  variant: VariantDetails | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface EnrichedOrderWithItems extends Order {
  items: EnrichedOrderItem[];
}

export interface CreateOrderRequest {
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }[];
  shipping_address: any;
  billing_address?: any;
  notes?: string;
  payment_method: 'cod' | 'online';
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  internal_notes?: string;
  tracking_number?: string;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface RefundOrderRequest {
  reason: string;
  refund_amount?: number; // Optional: if not provided, refund full amount
  refund_method?: 'original' | 'bank_transfer' | 'wallet'; // How to process the refund
}

export interface OrderSummary {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
}