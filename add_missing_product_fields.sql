-- Migration to add missing product fields
-- Run this with: psql -d your_database -f add_missing_product_fields.sql

-- Add a_plus_content column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'a_plus_content'
    ) THEN
        ALTER TABLE products ADD COLUMN a_plus_content TEXT DEFAULT '';
        RAISE NOTICE 'Added a_plus_content column';
    END IF;
END $$;

-- Add a_plus_sections column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'a_plus_sections'
    ) THEN
        ALTER TABLE products ADD COLUMN a_plus_sections JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added a_plus_sections column';
    END IF;
END $$;

-- Add simple_fields column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'simple_fields'
    ) THEN
        ALTER TABLE products ADD COLUMN simple_fields JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added simple_fields column';
    END IF;
END $$;

-- Add information_sections column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'information_sections'
    ) THEN
        ALTER TABLE products ADD COLUMN information_sections JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added information_sections column';
    END IF;
END $$;

-- Add images column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'images'
    ) THEN
        ALTER TABLE products ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added images column';
    END IF;
END $$;

-- Add variants column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'variants'
    ) THEN
        ALTER TABLE products ADD COLUMN variants JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added variants column';
    END IF;
END $$;

-- Add faqs column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'faqs'
    ) THEN
        ALTER TABLE products ADD COLUMN faqs JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added faqs column';
    END IF;
END $$;

-- Add included_items column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'included_items'
    ) THEN
        ALTER TABLE products ADD COLUMN included_items JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added included_items column';
    END IF;
END $$;

-- Add compatibility column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'compatibility'
    ) THEN
        ALTER TABLE products ADD COLUMN compatibility TEXT DEFAULT '';
        RAISE NOTICE 'Added compatibility column';
    END IF;
END $$;

-- Add safety_warnings column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'safety_warnings'
    ) THEN
        ALTER TABLE products ADD COLUMN safety_warnings TEXT DEFAULT '';
        RAISE NOTICE 'Added safety_warnings column';
    END IF;
END $$;

-- Add care_instructions column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'care_instructions'
    ) THEN
        ALTER TABLE products ADD COLUMN care_instructions TEXT DEFAULT '';
        RAISE NOTICE 'Added care_instructions column';
    END IF;
END $$;

-- Add indexes for JSONB fields for better performance
CREATE INDEX IF NOT EXISTS idx_products_a_plus_sections ON products USING GIN (a_plus_sections);
CREATE INDEX IF NOT EXISTS idx_products_simple_fields ON products USING GIN (simple_fields);
CREATE INDEX IF NOT EXISTS idx_products_information_sections ON products USING GIN (information_sections);
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_products_variants ON products USING GIN (variants);
CREATE INDEX IF NOT EXISTS idx_products_faqs ON products USING GIN (faqs);
CREATE INDEX IF NOT EXISTS idx_products_included_items ON products USING GIN (included_items);

RAISE NOTICE 'Migration completed successfully!';