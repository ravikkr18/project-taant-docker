#!/usr/bin/env node

require('dotenv').config();

// Simple SQL execution using node-postgres
const { Client } = require('pg');

const client = new Client({
  host: 'lyteoxnqkjrpilrfcimc.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'd$z#6W&K@8pL!qR3',
  ssl: { rejectUnauthorized: false }
});

const migrationSQL = `
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

async function applyMigration() {
  console.log('🚀 Applying database migration for missing product fields...');

  try {
    await client.connect();
    console.log('✅ Connected to database');

    await client.query(migrationSQL);
    console.log('✅ Migration applied successfully!');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);

    // Try individual statements
    console.log('🔄 Trying individual statements...');
    const statements = [
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100)',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS model_number VARCHAR(50)',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country VARCHAR(2)',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_requirements TEXT',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_content TEXT',
      'ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_sections JSONB'
    ];

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log(`✅ Applied: ${statement.substring(0, 50)}...`);
      } catch (err) {
        console.log(`ℹ️  ${statement.substring(0, 50)}... ${err.message.includes('already exists') ? 'already exists' : 'error: ' + err.message}`);
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer)',
      'CREATE INDEX IF NOT EXISTS idx_products_model_number ON products(model_number)',
      'CREATE INDEX IF NOT EXISTS idx_products_origin_country ON products(origin_country)'
    ];

    for (const index of indexes) {
      try {
        await client.query(index);
        console.log(`✅ Created index: ${index.substring(0, 50)}...`);
      } catch (err) {
        console.log(`ℹ️  Index ${err.message.includes('already exists') ? 'already exists' : 'error: ' + err.message}`);
      }
    }

  } finally {
    await client.end();
    console.log('🔚 Disconnected from database');
  }
}

applyMigration();