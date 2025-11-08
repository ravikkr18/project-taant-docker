-- Migration to add missing dimension fields to products table
-- Run this with: psql -d your_database -f add_dimension_fields.sql

-- Add height column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'height'
    ) THEN
        ALTER TABLE products ADD COLUMN height NUMERIC;
        RAISE NOTICE 'Added height column';
    END IF;
END $$;

-- Add length column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'length'
    ) THEN
        ALTER TABLE products ADD COLUMN length NUMERIC;
        RAISE NOTICE 'Added length column';
    END IF;
END $$;

-- Add width column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'width'
    ) THEN
        ALTER TABLE products ADD COLUMN width NUMERIC;
        RAISE NOTICE 'Added width column';
    END IF;
END $$;

-- Add indexes for dimension fields for better performance
CREATE INDEX IF NOT EXISTS idx_products_height ON products (height);
CREATE INDEX IF NOT EXISTS idx_products_length ON products (length);
CREATE INDEX IF NOT EXISTS idx_products_width ON products (width);

RAISE NOTICE 'Dimension fields migration completed successfully!';