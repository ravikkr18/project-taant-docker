const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10C';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createBasicTables() {
  console.log('Creating basic tables for products management...');

  try {
    // Create categories table
    console.log('Creating categories table...');
    const { error: categoriesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(120) UNIQUE NOT NULL,
          description TEXT,
          parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
          position INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (categoriesError) {
      console.log('Categories table creation failed:', categoriesError.message);
    } else {
      console.log('✓ Categories table created successfully');
    }

    // Create brands table
    console.log('Creating brands table...');
    const { error: brandsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS brands (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(120) UNIQUE NOT NULL,
          description TEXT,
          logo_url VARCHAR(500),
          website_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (brandsError) {
      console.log('Brands table creation failed:', brandsError.message);
    } else {
      console.log('✓ Brands table created successfully');
    }

    // Create suppliers table
    console.log('Creating suppliers table...');
    const { error: suppliersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS suppliers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          business_name VARCHAR(200) NOT NULL,
          slug VARCHAR(220) UNIQUE NOT NULL,
          description TEXT,
          is_verified BOOLEAN DEFAULT false,
          rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (suppliersError) {
      console.log('Suppliers table creation failed:', suppliersError.message);
    } else {
      console.log('✓ Suppliers table created successfully');
    }

    // Create products table
    console.log('Creating products table...');
    const { error: productsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
          sku VARCHAR(100) UNIQUE NOT NULL,
          slug VARCHAR(300) UNIQUE NOT NULL,
          title VARCHAR(300) NOT NULL,
          short_description TEXT,
          description TEXT,
          brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
          category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
          base_price DECIMAL(15,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          published_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    if (productsError) {
      console.log('Products table creation failed:', productsError.message);
    } else {
      console.log('✓ Products table created successfully');
    }

    // Create product_images table
    console.log('Creating product_images table...');
    const { error: imagesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          url VARCHAR(500) NOT NULL,
          alt_text VARCHAR(200),
          position INTEGER DEFAULT 0,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (imagesError) {
      console.log('Product images table creation failed:', imagesError.message);
    } else {
      console.log('✓ Product images table created successfully');
    }

    // Create product_variants table
    console.log('Creating product_variants table...');
    const { error: variantsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_variants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          sku VARCHAR(100) UNIQUE,
          title VARCHAR(200),
          price DECIMAL(15,2) NOT NULL,
          inventory_quantity INTEGER DEFAULT 0,
          position INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (variantsError) {
      console.log('Product variants table creation failed:', variantsError.message);
    } else {
      console.log('✓ Product variants table created successfully');
    }

    console.log('\nBasic tables creation completed!');

    // Test the tables by trying to select from them
    console.log('\nTesting table access...');

    const tables = ['categories', 'brands', 'suppliers', 'products', 'product_images', 'product_variants'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count(*)').limit(1);
        if (error) {
          console.log(`✗ ${table}: ${error.message}`);
        } else {
          console.log(`✓ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`✗ ${table}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Table creation process failed:', error);
  }
}

createBasicTables();