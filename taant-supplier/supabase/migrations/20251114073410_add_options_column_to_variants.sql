-- Add options JSON column to product_variants table
-- This will store variant options as JSON array

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance on options queries
CREATE INDEX IF NOT EXISTS idx_product_variants_options ON product_variants USING GIN (options);