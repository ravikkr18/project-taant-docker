-- Add option4 and option5 columns to product_variants table
-- This migration adds support for additional variant options

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS option4_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS option4_value VARCHAR(100),
ADD COLUMN IF NOT EXISTS option5_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS option5_value VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN product_variants.option4_name IS 'Fourth option name for variant (e.g., Style, Pattern)';
COMMENT ON COLUMN product_variants.option4_value IS 'Fourth option value for variant';
COMMENT ON COLUMN product_variants.option5_name IS 'Fifth option name for variant (e.g., Fit, Length)';
COMMENT ON COLUMN product_variants.option5_value IS 'Fifth option value for variant';