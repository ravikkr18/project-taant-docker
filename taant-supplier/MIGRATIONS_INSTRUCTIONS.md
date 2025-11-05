# Supabase Migrations - Manual Application Required

## Issue
The automated migration application is failing due to database connection issues. The tables need to be created manually in your Supabase dashboard.

## Solution: Manual Application via Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project: `lyteoxnqkjrpilrfcimc`
3. Navigate to the **SQL Editor** from the left sidebar

### Step 2: Apply Basic Tables First
Copy and paste the following SQL into the SQL Editor and run it:

```sql
-- Basic Tables for Products Management
-- Run this first to create the core tables

-- Categories table
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

-- Brands table
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

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
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
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
    base_price DECIMAL(15,2) NOT NULL,
    compare_price DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    title VARCHAR(200),
    price DECIMAL(15,2) NOT NULL,
    compare_price DECIMAL(15,2),
    inventory_quantity INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Verify Tables Created
After running the above SQL, verify the tables exist by running:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- categories
- brands
- suppliers
- products
- product_images
- product_variants

### Step 4: Test Table Access
Run this to test the tables work:

```sql
-- Test basic table operations
SELECT 'categories' as table_name, count(*) as record_count FROM categories
UNION ALL
SELECT 'brands', count(*) FROM brands
UNION ALL
SELECT 'suppliers', count(*) FROM suppliers
UNION ALL
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'product_images', count(*) FROM product_images
UNION ALL
SELECT 'product_variants', count(*) FROM product_variants;
```

### Step 5: Restart Application
Once the tables are created, restart your supplier application:

```bash
cd /www/ravi/project-taant-docker
docker-compose restart taant-supplier
```

## Migration Files Available
The complete migration files are available in:
- `supabase/migrations/` - Individual migration files
- `scripts/combined_all_migrations.sql` - All migrations in one file

These include additional tables for reviews, analytics, inventory tracking, etc. that can be applied later.

## Why This Happened
The automated migration failed due to:
1. Database connection authentication issues
2. Special characters in the database password
3. Network connectivity problems with remote Supabase database

Manual application via the dashboard is the most reliable approach.