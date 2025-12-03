const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRLSIssue() {
  console.log('🔍 Testing RLS issue with order_items...\n');

  try {
    // Step 1: Create order using service role
    console.log('Step 1: Creating order...');
    const existingUserId = '07c0cef9-64d2-4269-884a-121d1ad94db0';
    const orderNumber = 'RLS_TEST_' + Date.now();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: existingUserId,
        order_number: orderNumber,
        status: 'pending',
        currency: 'INR',
        subtotal: 100.00,
        tax_amount: 18.00,
        shipping_amount: 50.00,
        total_amount: 168.00,
        shipping_address: { name: 'Test User' },
        billing_address: { name: 'Test User' }
      }])
      .select()
      .single();

    if (orderError) {
      console.log('❌ Order creation failed:', orderError);
      return;
    }
    console.log('✅ Order created:', order.id);

    // Step 2: Create order item using service role
    console.log('\nStep 2: Creating order item...');
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        product_id: "0275448e-1f78-4aa1-a078-e3ceaced90e1",
        variant_id: "33065a2f-a8ef-48dd-9d74-8bc93ed2f933",
        quantity: 1,
        price: 200,
        total: 200
      }])
      .select()
      .single();

    if (itemError) {
      console.log('❌ Order item creation failed:', itemError);
      return;
    }
    console.log('✅ Order item created:', orderItem.id);

    // Step 3: Try to fetch order items immediately (this is what fails in the service)
    console.log('\nStep 3: Testing immediate fetch of order items...');
    const { data: items, error: fetchError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (fetchError) {
      console.log('❌ Fetch failed - this is the problem!', fetchError);
      console.log('Error code:', fetchError.code);
      console.log('Error message:', fetchError.message);
      console.log('Error details:', fetchError.details);

      // Let's check if it's an RLS issue by trying a different approach
      console.log('\nStep 4: Testing if RLS is the issue...');

      // Try using RPC to bypass RLS
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_order_items_by_order_id', { order_id_param: order.id });

      if (rpcError) {
        console.log('❌ RPC also failed:', rpcError);
      } else {
        console.log('✅ RPC worked! RLS is the issue');
      }

    } else {
      console.log('✅ Fetch successful! Items count:', items.length);
      console.log('Items:', items);
    }

    // Cleanup
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('\n🧹 Cleanup completed');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRLSIssue();