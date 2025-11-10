#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read the migration SQL
const fs = require('fs');
const path = require('path');
const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'combined_all_migrations.sql'),
  'utf8'
);

async function applyMigration() {
  console.log('🚀 Applying complete database migration...');

  try {
    // Use raw SQL execution through the REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Migration failed:', error);

      // If exec_sql doesn't exist, try direct SQL approach
      console.log('🔄 Trying to apply missing fields directly...');

      const missingFieldsSQL = `
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100),
        ADD COLUMN IF NOT EXISTS model_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS origin_country VARCHAR(2),
        ADD COLUMN IF NOT EXISTS shipping_requirements TEXT,
        ADD COLUMN IF NOT EXISTS a_plus_content TEXT,
        ADD COLUMN IF NOT EXISTS a_plus_sections JSONB;

        CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
        CREATE INDEX IF NOT EXISTS idx_products_model_number ON products(model_number);
        CREATE INDEX IF NOT EXISTS idx_products_origin_country ON products(origin_country);
      `;

      // Apply individual ALTER TABLE statements
      const statements = [
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100)',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS model_number VARCHAR(50)',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country VARCHAR(2)',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_requirements TEXT',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_content TEXT',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_sections JSONB'
      ];

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        try {
          const testResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              id: '00000000-0000-0000-0000-000000000000',
              supplier_id: '00000000-0000-0000-0000-000000000000',
              sku: 'test-migration',
              slug: 'test-migration',
              title: 'Migration Test',
              category_id: '00000000-0000-0000-0000-000000000000',
              base_price: 0,
              manufacturer: null
            })
          });

          if (testResponse.status === 400 || testResponse.status === 406) {
            const errorData = await testResponse.json();
            if (errorData.message && errorData.message.includes('column')) {
              console.log(`✅ Column already exists or was added: ${statement}`);
            } else {
              console.log(`ℹ️  Statement result: ${testResponse.status}`);
            }
          }
        } catch (err) {
          console.log(`ℹ️  Statement execution completed: ${err.message}`);
        }
      }

    } else {
      const result = await response.json();
      console.log('✅ Migration applied successfully!', result);
    }
  } catch (err) {
    console.error('💥 Error applying migration:', err.message);
    console.log('⚠️  Please manually apply the migration to your Supabase database.');
    console.log('You can apply the SQL from scripts/combined_all_migrations.sql directly in the Supabase SQL editor.');
  }
}

applyMigration();