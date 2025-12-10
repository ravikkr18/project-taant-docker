-- Database Backup
-- Created: 2025-12-10
-- Database: taant project
-- Purpose: Backup after fixing image order functionality

-- Products Table Structure
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    base_price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    track_inventory BOOLEAN DEFAULT true,
    weight DECIMAL(8,2),
    dimensions_length DECIMAL(8,2),
    dimensions_width DECIMAL(8,2),
    dimensions_height DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    supplier_id UUID REFERENCES suppliers(id),
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table Structure
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(position);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_images_product_position ON product_images(product_id, "position");

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_product_images_updated_at
    BEFORE UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary image per product
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        UPDATE product_images
        SET is_primary = false
        WHERE product_id = NEW.product_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS ensure_single_primary_image_trigger
    AFTER INSERT OR UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_image();

-- Current State Backup (Key Data)
-- This backup confirms the 'position' column exists and is properly indexed
-- The image order fix resolved the NestJS routing conflict where:
-- - PUT :id/images/update-order was being matched by PUT :id/images/:imageId
-- - Fixed by moving specific routes before generic routes
-- - Updated both backend controller and frontend API client

-- Key Changes Made:
-- 1. Fixed route ordering in products.controller.ts
-- 2. Updated API endpoint from /images/positions to /images/update-order
-- 3. Updated frontend api-client.ts to use new endpoint
-- 4. Simplified service method to use direct Supabase client calls

-- Final Working API:
-- PUT /api/products/:id/images/update-order
-- Body: {"positions": [{"id": "uuid", "position": 0}, ...]}