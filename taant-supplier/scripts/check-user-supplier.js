const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserSupplierMapping() {
  console.log('🔍 Checking user-supplier mapping...');

  // Get supplier info
  const { data: suppliers, error: supplierError } = await supabase
    .from('suppliers')
    .select('id, business_name, user_id');

  if (supplierError) {
    console.error('❌ Error fetching suppliers:', supplierError);
    return;
  }

  console.log('✅ Suppliers in database:');
  suppliers.forEach(supplier => {
    console.log(`  - Supplier ID: ${supplier.id}`);
    console.log(`    Business Name: ${supplier.business_name}`);
    console.log(`    User ID: ${supplier.user_id || 'NULL'}`);
    console.log('');
  });

  // Check if there's a user_id mapping
  if (suppliers.length > 0 && !suppliers[0].user_id) {
    console.log('⚠️  ISSUE FOUND: Supplier has no user_id associated with it!');
    console.log('   The products are stored with supplier_id, but the frontend is filtering by user.id');
    console.log('   Need to either:');
    console.log('   1. Update the supplier record with the correct user_id, OR');
    console.log('   2. Update the frontend to filter by supplier_id correctly');
  }
}

checkUserSupplierMapping().catch(console.error);