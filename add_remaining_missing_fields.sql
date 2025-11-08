-- Migration to add any remaining missing product fields
-- Run this with: psql -d your_database -f add_remaining_missing_fields.sql

-- Add manufacturer column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'manufacturer'
    ) THEN
        ALTER TABLE products ADD COLUMN manufacturer TEXT DEFAULT '';
        RAISE NOTICE 'Added manufacturer column';
    END IF;
END $$;

-- Add model_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'model_number'
    ) THEN
        ALTER TABLE products ADD COLUMN model_number TEXT DEFAULT '';
        RAISE NOTICE 'Added model_number column';
    END IF;
END $$;

-- Add origin_country column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'origin_country'
    ) THEN
        ALTER TABLE products ADD COLUMN origin_country TEXT;
        RAISE NOTICE 'Added origin_country column';
    END IF;
END $$;

-- Add shipping_requirements column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'shipping_requirements'
    ) THEN
        ALTER TABLE products ADD COLUMN shipping_requirements TEXT DEFAULT '';
        RAISE NOTICE 'Added shipping_requirements column';
    END IF;
END $$;

-- Add selling_policy column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'selling_policy'
    ) THEN
        ALTER TABLE products ADD COLUMN selling_policy TEXT DEFAULT '';
        RAISE NOTICE 'Added selling_policy column';
    END IF;
END $$;

-- Add indexes for text fields for better performance
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products (manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_model_number ON products (model_number);
CREATE INDEX IF NOT EXISTS idx_products_origin_country ON products (origin_country);
CREATE INDEX IF NOT EXISTS idx_products_shipping_requirements ON products (shipping_requirements);
CREATE INDEX IF NOT EXISTS idx_products_selling_policy ON products (selling_policy);

RAISE NOTICE 'Remaining missing fields migration completed successfully!';