-- Products Core Table
-- Migration for main products table

-- Products table with comprehensive e-commerce features
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    title VARCHAR(300) NOT NULL,
    short_description TEXT,
    description TEXT,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    product_type VARCHAR(50) DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital', 'service')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
    is_featured BOOLEAN DEFAULT false,
    is_digital BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    track_inventory BOOLEAN DEFAULT true,
    weight DECIMAL(10,3),
    dimensions JSONB,
    tags TEXT[],
    warranty_months INTEGER DEFAULT 12,
    warranty_text TEXT,
    specifications JSONB,
    features TEXT[],
    shipping_info JSONB,
    return_policy JSONB,
    seo_title VARCHAR(200),
    seo_description TEXT,
    seo_keywords TEXT[],
    meta_title VARCHAR(200),
    meta_description TEXT,
    canonical_url VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    wishlist_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    cost_price DECIMAL(15,2),
    base_price DECIMAL(15,2) NOT NULL,
    compare_price DECIMAL(15,2),
    profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN base_price > 0 THEN ((base_price - COALESCE(cost_price, 0)) / base_price) * 100
            ELSE 0
        END
    ) STORED,
    low_stock_threshold INTEGER DEFAULT 10,
    allow_backorder BOOLEAN DEFAULT false,
    requires_tax_calculation BOOLEAN DEFAULT true,
    tax_code VARCHAR(50),
    supplier_product_code VARCHAR(100),
    barcode VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_title ON products USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_published_at ON products(published_at);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(
    to_tsvector('english', title || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(description, ''))
);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update published_at when status changes to active
CREATE OR REPLACE FUNCTION update_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
        NEW.published_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_published_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_published_at();