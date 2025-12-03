const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProductsSchema() {
  console.log('🔍 Checking products table schema...\n');

  try {
    // Get a sample product to see what columns exist
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.log('❌ Error fetching product:', error);
      return;
    }

    console.log('✅ Product found. Available columns:');
    console.log(Object.keys(product));

    console.log('\n📄 Product sample data:');
    console.log(JSON.stringify(product, null, 2));

    // Check if there's a title column instead of name
    if (product.title && !product.name) {
      console.log('\n🔧 Found the issue: Products table has "title" column, not "name"!');
      console.log('Need to update OrdersService to use "title" instead of "name"');
    }

    // Check product_variants schema too
    console.log('\n🔍 Checking product_variants schema...');
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)
      .single();

    if (variantError) {
      console.log('❌ Error fetching variant:', variantError);
      return;
    }

    console.log('✅ Variant found. Available columns:');
    console.log(Object.keys(variant));

    console.log('\n📄 Variant sample data:');
    console.log(JSON.stringify(variant, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkProductsSchema();