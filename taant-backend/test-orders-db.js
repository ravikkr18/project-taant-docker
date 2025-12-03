const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createOrdersAndItems() {
  console.log('Creating orders table...');

  try {
    // Create orders table by inserting a dummy record (this will fail if table doesn't exist)
    const { error: orderTestError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (orderTestError && orderTestError.code === 'PGRST116') {
      console.log('Orders table does not exist. Creating...');

      // Since we can't execute DDL via JS client, let's check if we have any records
      console.log('Tables need to be created manually in Supabase dashboard or via SQL migration.');
      return false;
    }

    console.log('Orders table exists');

    // Test order_items table
    const { error: itemsTestError } = await supabase
      .from('order_items')
      .select('id')
      .limit(1);

    if (itemsTestError && itemsTestError.code === 'PGRST116') {
      console.log('Order_items table does not exist');
      return false;
    }

    console.log('Order_items table exists');
    return true;

  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Test inserting a simple order
async function testOrderInsert() {
  console.log('Testing order insert...');

  try {
    const testOrder = {
      customer_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      order_number: 'TEST123456789',
      status: 'pending',
      currency: 'INR',
      subtotal: 100.00,
      tax_amount: 18.00,
      shipping_amount: 50.00,
      total_amount: 168.00,
      shipping_address: { name: 'Test User', phone: '1234567890' },
      billing_address: { name: 'Test User', phone: '1234567890' }
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([testOrder])
      .select();

    if (error) {
      console.error('Order insert failed:', error);
      return false;
    }

    console.log('Order inserted successfully:', data);
    return true;

  } catch (error) {
    console.error('Error testing order insert:', error);
    return false;
  }
}

async function main() {
  const tablesExist = await createOrdersAndItems();

  if (tablesExist) {
    await testOrderInsert();
  } else {
    console.log('Tables do not exist. Please run the SQL migration manually.');
    console.log('SQL needed:');
    console.log(`
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    internal_notes TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    variant_id UUID,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `);
  }
}

main();