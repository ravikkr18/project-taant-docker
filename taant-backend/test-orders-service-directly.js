const { createClient } = require('@supabase/supabase-js');

// Test the OrdersService methods directly
class TestOrdersService {
  constructor() {
    this.supabase = createClient(
      'https://lyteoxnqkjrpilrfcimc.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  async createOrder(customerId, orderData) {
    console.log('🔍 Testing createOrder step by step...');

    try {
      // Generate unique order number
      const orderNumber = 'TEST' + Date.now();

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      // Get product details and calculate totals
      console.log('Step 1: Processing order items...');
      for (const item of orderData.items) {
        console.log(`Processing item: product_id=${item.product_id}, variant_id=${item.variant_id}`);

        const { data: product, error: productError } = await this.supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();

        if (productError || !product) {
          console.log('❌ Product not found:', productError);
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        console.log('✅ Product found:', product.title);

        let price = 0;
        if (item.variant_id) {
          const { data: variant, error: variantError } = await this.supabase
            .from('product_variants')
            .select('price')
            .eq('id', item.variant_id)
            .single();

          if (variantError || !variant) {
            console.log('❌ Variant not found:', variantError);
            throw new Error(`Product variant with ID ${item.variant_id} not found`);
          }
          price = variant.price;
          console.log('✅ Variant found, price:', price);
        } else {
          // Get first variant price if no variant specified
          const { data: variant, error: variantError } = await this.supabase
            .from('product_variants')
            .select('price')
            .eq('product_id', item.product_id)
            .limit(1)
            .single();

          if (variantError || !variant) {
            console.log('❌ No variants found for product');
            throw new Error(`No variants found for product ${item.product_id}`);
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

      console.log('✅ All items processed, subtotal:', subtotal);

      // Calculate shipping (flat rate for now)
      const shippingAmount = 50; // ₹50 flat shipping
      const taxAmount = subtotal * 0.18; // 18% GST
      const totalAmount = subtotal + taxAmount + shippingAmount;

      console.log('Step 2: Creating order in database...');
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
        console.log('❌ Order creation failed:', orderError);
        throw new Error('Failed to create order');
      }

      console.log('✅ Order created:', order.id);

      console.log('Step 3: Creating order items...');
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
        console.log('❌ Order items creation failed:', itemsError);
        // Rollback order creation
        await this.supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Failed to create order items');
      }

      console.log('✅ Order items created:', createdItems.length);

      console.log('Step 4: Fetching order items for response...');
      // Get order items with product details - use separate queries to avoid JOIN issues
      const { data: items, error: fetchItemsError } = await this.supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (fetchItemsError) {
        console.log('❌ Failed to fetch order items:', fetchItemsError);
        throw new Error('Failed to fetch order items');
      }

      console.log('✅ Order items fetched successfully:', items.length);

      // If we have items, fetch product details separately
      let itemsWithDetails = [];
      if (items && items.length > 0) {
        console.log('Step 5: Fetching product details...');
        // Get product details for all unique products
        const productIds = [...new Set(items.map(item => item.product_id))];
        const { data: products, error: productsError } = await this.supabase
          .from('products')
          .select('id, name, images')
          .in('id', productIds);

        if (productsError) {
          console.log('❌ Failed to fetch product details:', productsError);
        } else {
          console.log('✅ Product details fetched:', products.length);
        }

        // Get variant details for all unique variants
        const variantIds = [...new Set(items.filter(item => item.variant_id).map(item => item.variant_id))];
        let variants = [];
        if (variantIds.length > 0) {
          console.log('Step 6: Fetching variant details...');
          const { data: variantData, error: variantsError } = await this.supabase
            .from('product_variants')
            .select('id, title, price, sku')
            .in('id', variantIds);

          if (!variantsError && variantData) {
            variants = variantData;
            console.log('✅ Variant details fetched:', variants.length);
          } else {
            console.log('❌ Failed to fetch variant details:', variantsError);
          }
        }

        // Combine the data
        itemsWithDetails = items.map(item => ({
          ...item,
          product: products?.find(p => p.id === item.product_id) || null,
          variant: variants?.find(v => v.id === item.variant_id) || null
        }));
      }

      console.log('✅ Order creation completed successfully!');

      // Return order with items
      return {
        ...order,
        items: itemsWithDetails || [],
      };

    } catch (error) {
      console.error('❌ createOrder failed:', error.message);
      throw error;
    }
  }
}

async function testOrdersService() {
  const service = new TestOrdersService();

  const orderData = {
    items: [
      {
        product_id: "0275448e-1f78-4aa1-a078-e3ceaced90e1",
        variant_id: "33065a2f-a8ef-48dd-9d74-8bc93ed2f933",
        quantity: 1
      }
    ],
    shipping_address: {
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 Main Street, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    billing_address: {
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 Main Street, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    }
  };

  try {
    const result = await service.createOrder('07c0cef9-64d2-4269-884a-121d1ad94db0', orderData);
    console.log('\n🎉 SUCCESS! Order created:', result.id);
    console.log('Order number:', result.order_number);
    console.log('Items in order:', result.items.length);

    // Cleanup
    await service.supabase.from('order_items').delete().eq('order_id', result.id);
    await service.supabase.from('orders').delete().eq('id', result.id);
    console.log('🧹 Cleanup completed');

  } catch (error) {
    console.log('\n❌ FAILED:', error.message);
  }
}

testOrdersService();