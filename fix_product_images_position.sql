-- Fix product_images table - add position column if it doesn't exist
-- Run with: psql "postgresql://postgres:jqAR0nTfRHArzkYt@db.lyteoxnqkjrpilrfcimc.supabase.co:5432/postgres?sslmode=require" -f fix_product_images_position.sql

-- Add position column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'product_images' AND table_schema = 'public' AND column_name = 'position'
    ) THEN
        ALTER TABLE product_images ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added position column to product_images table';
        
        -- Update existing records with sequential positions based on creation time
        UPDATE product_images 
        SET position = (
            SELECT row_number - 1
            FROM (
                SELECT id, row_number() OVER (ORDER BY created_at ASC) as row_number
                FROM product_images
                WHERE product_id = product_images.product_id
            ) ranked
            WHERE ranked.id = product_images.id
        );
        
        RAISE NOTICE 'Updated existing product_images with sequential positions';
    ELSE
        RAISE NOTICE 'Position column already exists in product_images table';
    END IF;
END $$;

-- Create index for position column for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images (position);
CREATE INDEX IF NOT EXISTS idx_product_images_product_position ON product_images (product_id, position);

RAISE NOTICE 'Product images position fix completed successfully!';
