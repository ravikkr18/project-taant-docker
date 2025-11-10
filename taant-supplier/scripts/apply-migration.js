require('dotenv').config();
const { createClient } = require('@supabase/supababase-js');

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// The migration SQL
const migrationSQL = `
-- Add missing manufacturer and model_number fields to products table
-- Migration for additional product fields used in the form

ALTER TABLE products
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100),
ADD COLUMN IF NOT EXISTS model_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS shipping_requirements TEXT,
ADD COLUMN IF NOT EXISTS a_plus_content TEXT,
ADD COLUMN IF NOT EXISTS a_plus_sections JSONB;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_model_number ON products(model_number);
CREATE INDEX IF NOT EXISTS idx_products_origin_country ON products(origin_country);

-- Add comments for documentation
COMMENT ON COLUMN products.manufacturer IS 'Manufacturer or brand name of the product';
COMMENT ON COLUMN products.model_number IS 'Model number or part number for identification';
COMMENT ON COLUMN products.origin_country IS 'ISO country code where product was manufactured';
COMMENT ON COLUMN products.shipping_requirements IS 'Special shipping instructions or requirements';
COMMENT ON COLUMN products.a_plus_content IS 'A+ content in rich text format';
COMMENT ON COLUMN products.a_plus_sections IS 'Structured A+ content sections with text and images';
`;

async function applyMigration() {
  console.log('🚀 Applying database migration for missing product fields...');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);

      // Try alternative method using direct SQL
      console.log('🔄 Trying alternative migration method...');
      const { data: altData, error: altError } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (altError) {
        console.error('❌ Alternative method also failed:', altError);
        process.exit(1);
      }

      console.log('✅ Database connection verified, but manual migration may be needed');
      console.log('Please apply the migration SQL directly to your Supabase database.');
      console.log('Migration SQL:');
      console.log('===========================');
      console.log(migrationSQL);
      console.log('===========================');
    } else {
      console.log('✅ Migration applied successfully!');
    }
  } catch (err) {
    console.error('💥 Error applying migration:', err);
    process.exit(1);
  }
}

applyMigration();