-- Add options JSON column to product_variants table
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data from option1/2/3 columns to JSON format
UPDATE product_variants
SET options = jsonb_build_array(
    CASE WHEN option1_name IS NOT NULL AND option1_value IS NOT NULL
         THEN jsonb_build_object('name', option1_name, 'value', option1_value)
         ELSE NULL END,
    CASE WHEN option2_name IS NOT NULL AND option2_value IS NOT NULL
         THEN jsonb_build_object('name', option2_name, 'value', option2_value)
         ELSE NULL END,
    CASE WHEN option3_name IS NOT NULL AND option3_value IS NOT NULL
         THEN jsonb_build_object('name', option3_name, 'value', option3_value)
         ELSE NULL END
) - NULL
WHERE (option1_name IS NOT NULL OR option2_name IS NOT NULL OR option3_name IS NOT NULL);

-- Add index for better performance on options queries
CREATE INDEX IF NOT EXISTS idx_product_variants_options ON product_variants USING GIN (options);