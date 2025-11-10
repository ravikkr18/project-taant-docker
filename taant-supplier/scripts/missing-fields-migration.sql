-- Add missing manufacturer and model_number fields to products table
-- Migration for additional product fields used in the form

ALTER TABLE products
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100),
ADD COLUMN IF NOT EXISTS model_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS shipping_requirements TEXT,
ADD COLUMN IF NOT EXISTS a_plus_content TEXT,
ADD COLUMN IF NOT EXISTS a_plus_sections JSONB;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_model_number ON products(model_number);
CREATE INDEX IF NOT EXISTS idx_products_origin_country ON products(origin_country);

-- Add comments for documentation
COMMENT ON COLUMN products.manufacturer IS 'Manufacturer or brand name of the product';
COMMENT ON COLUMN products.model_number IS 'Model number or part number for identification';
COMMENT ON COLUMN products.origin_country IS 'ISO country code where product was manufactured';
COMMENT ON COLUMN products.shipping_requirements IS 'Special shipping instructions or requirements';
COMMENT ON COLUMN products.a_plus_content IS 'A+ content in rich text format';
COMMENT ON COLUMN products.a_plus_sections IS 'Structured A+ content sections with text and images';