const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use existing user
const existingUserId = '07c0cef9-64d2-4269-884a-121d1ad94db0';

async function debugOrderCreation() {
  console.log('🔍 Debugging order creation step by step...\n');

  try {
    // Step 1: Check if the product exists
    console.log('Step 1: Checking product...');
    const productId = "0275448e-1f78-4aa1-a078-e3ceaced90e1";
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.log('❌ Product not found:', productError);
      return;
    }
    console.log('✅ Product found:', product.title);

    // Step 2: Check if the variant exists
    console.log('\nStep 2: Checking variant...');
    const variantId = "33065a2f-a8ef-48dd-9d74-8bc93ed2f933";
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', variantId)
      .single();

    if (variantError) {
      console.log('❌ Variant not found:', variantError);
      return;
    }
    console.log('✅ Variant found:', variant.title, 'Price:', variant.price);

    // Step 3: Create order without items first
    console.log('\nStep 3: Creating order...');
    const orderNumber = 'TEST' + Date.now();
    const orderData = {
      customer_id: existingUserId,
      order_number: orderNumber,
      status: 'pending',
      currency: 'INR',
      subtotal: 100.00,
      tax_amount: 18.00,
      shipping_amount: 50.00,
      total_amount: 168.00,
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.log('❌ Order creation failed:', orderError);
      return;
    }
    console.log('✅ Order created:', order.id, orderNumber);

    // Step 4: Create order items
    console.log('\nStep 4: Creating order items...');
    const orderItemData = {
      order_id: order.id,
      product_id: productId,
      variant_id: variantId,
      quantity: 1,
      price: variant.price,
      total: variant.price
    };

    const { data: orderItem, error: orderItemError } = await supabase
      .from('order_items')
      .insert([orderItemData])
      .select()
      .single();

    if (orderItemError) {
      console.log('❌ Order item creation failed:', orderItemError);
      // Try to clean up the order
      await supabase.from('orders').delete().eq('id', order.id);
      return;
    }
    console.log('✅ Order item created:', orderItem.id);

    // Step 5: Test fetching the complete order with items
    console.log('\nStep 5: Testing complete order fetch...');
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.log('❌ Order fetch failed:', fetchError);
    } else {
      console.log('✅ Complete order fetch successful');
    }

    // Step 6: Test fetching order items
    console.log('\nStep 6: Testing order items fetch...');
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) {
      console.log('❌ Order items fetch failed:', itemsError);
    } else {
      console.log('✅ Order items fetch successful, items count:', items.length);
    }

    console.log('\n🎉 Order creation test completed successfully!');
    console.log('Order ID:', order.id);
    console.log('Order Number:', orderNumber);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugOrderCreation();