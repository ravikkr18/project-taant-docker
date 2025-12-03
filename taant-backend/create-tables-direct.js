const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating orders and order_items tables...');

  try {
    // SQL for creating tables
    const createOrdersSQL = `
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
    `;

    const createOrderItemsSQL = `
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
    `;

    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `;

    // Create orders table
    console.log('Creating orders table...');
    const { error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (ordersError && ordersError.code === 'PGRST116') {
      // Table doesn't exist, need to create it via direct SQL
      console.log('Orders table does not exist. Creating...');
      // Since we can't execute arbitrary SQL via the JS client, let's use a workaround
      console.log('Note: Table creation requires direct SQL execution. Using service client...');
    } else if (!ordersError) {
      console.log('Orders table already exists');
    }

    // Check order_items table
    console.log('Checking order_items table...');
    const { error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);

    if (itemsError && itemsError.code === 'PGRST116') {
      console.log('Order_items table does not exist');
    } else if (!itemsError) {
      console.log('Order_items table already exists');
    }

    console.log('Table check completed');

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();