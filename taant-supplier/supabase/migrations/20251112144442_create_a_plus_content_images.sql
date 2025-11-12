-- Create a_plus_content_images table for content-only images
-- This migration will replace the complex text-based A+ content with simple images

-- Create new table for A+ content images
CREATE TABLE IF NOT EXISTS a_plus_content_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    width INTEGER,
    height INTEGER,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_a_plus_content_images_product_id ON a_plus_content_images(product_id);
CREATE INDEX IF NOT EXISTS idx_a_plus_content_images_position ON a_plus_content_images(position);
CREATE INDEX IF NOT EXISTS idx_a_plus_content_images_is_active ON a_plus_content_images(is_active);

-- Add comments for documentation
COMMENT ON TABLE a_plus_content_images IS 'A+ content images - full-width content images similar to product images';
COMMENT ON COLUMN a_plus_content_images.position IS 'Position order for sorting images';
COMMENT ON COLUMN a_plus_content_images.is_active IS 'Whether this content image is active and visible';

-- Remove old a_plus_content columns from products table (optional - you can keep for backward compatibility)
-- ALTER TABLE products DROP COLUMN IF EXISTS a_plus_content;
-- ALTER TABLE products DROP COLUMN IF EXISTS a_plus_sections;