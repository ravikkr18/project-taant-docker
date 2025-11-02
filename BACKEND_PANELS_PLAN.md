# Taant Backend Panels Development Plan

## Project Overview
Development of two backend panels based on taant-front product data structure:
- **Taant Supplier Panel** - For suppliers to manage their products
- **Taant Admin Panel** - For administrators to manage the entire platform

## Current taant-front Product Data Analysis

### Product Interface Structure
Based on `taant-front/src/types/index.ts` and product data, each product contains:

```typescript
interface Product {
  id: string;                    // Unique identifier
  name: string;                  // Product name
  slug: string;                  // URL-friendly name
  description: string;           // Detailed description
  price: number;                 // Current selling price
  originalPrice?: number;        // Original price (for discounts)
  image: string;                 // Main product image
  images?: string[];             // Additional product images
  category: string;              // Display category name
  categoryId: string;            // Category identifier
  rating?: number;               // Average rating (1-5)
  reviews?: number;              // Number of reviews
  inStock: boolean;              // Stock availability
  badge?: string;                // Promotion badge (Best Seller, 21% OFF, etc.)
  variants?: ProductVariant[];   // Product variants
  brand?: string;                // Brand name
  sku?: string;                  // Stock keeping unit
  weight?: number;               // Product weight
  dimensions?: {                 // Product dimensions
    length: number;
    width: number;
    height: number;
  };
}

interface ProductVariant {
  id: string;                    // Variant ID
  name: string;                  // Variant name (size, color, etc.)
  price: number;                 // Variant price
  image?: string;                // Variant-specific image
  inStock: boolean;              // Variant stock status
  color?: string;                // Color hex code
}
```

## 📋 **Comprehensive Product Detail Page Analysis**

Based on detailed examination of `/products/[slug]/page.tsx`, here are ALL the sections and data fields that need management:

### **1. Basic Product Information**
- **Product Title** (main heading)
- **Product Category & Subcategory** (breadcrumb navigation)
- **Brand Name** (displayed separately)
- **Product Short Description** (brief overview below price)
- **Product Long Description** (detailed description section)
- **SKU** (Stock Keeping Unit)
- **Model Number** (technical specifications)
- **ASIN** (Amazon Standard Identification Number) - *need to add*
- **Product Unique ID** (internal tracking) - *need to add*

### **2. Media Management**
- **Main Product Image** (primary display image)
- **Product Images Gallery** (multiple additional images)
- **Product Videos** - *need to add*
- **Image Alt Text** (for accessibility)
- **Image Zoom Functionality**
- **360° Product Views** - *need to add*

### **3. Pricing & Sales**
- **MRP (Maximum Retail Price)** = `originalPrice`
- **Selling Price** = `price`
- **Discount Percentage** (calculated and displayed as badge)
- **Tax Information** ("Inclusive of all taxes")
- **Currency Display** (₹ INR formatting)

### **4. Product Variants & Options**
- **Color Variants** (with color hex codes)
- **Size Options** (XS, S, M, L, XL, XXL, etc.)
- **Material Variants** - *need to add*
- **Style Variants** - *need to add*
- **Variant-specific Images**
- **Variant-specific Pricing**
- **Variant Inventory Status**

### **5. Inventory & Stock Management**
- **Stock Status** (In Stock / Out of Stock)
- **Stock Quantity** (number available)
- **Low Stock Alerts** ("Only X left")
- **Inventory Tracking** (per variant)
- **Stock Management** (restock alerts)

### **6. Seller Information**
- **Seller/Supplier Name** - *need to add*
- **Seller Rating** - *need to add*
- **Seller Business Information** - *need to add*
- **Supplier Verification Status** - *need to add*

### **7. Product Ratings & Reviews**
- **Average Rating** (1-5 stars)
- **Total Reviews Count**
- **Review Distribution** (5-star, 4-star, etc. breakdown)
- **Customer Reviews** (with images)
- **Verified Purchase Badges**
- **Review Helpfulness Voting**
- **Review Moderation**

### **8. Product Information Sections**
#### **A+ Content (Amazon-style enhanced content)**
- **Marketing Sections** (image + text blocks)
- **Feature Highlights**
- **Lifestyle Images**
- **Comparison Charts**
- **Technical Specifications**

#### **Detailed Specifications** (expandable sections)
- **Item Details** (Brand, Model, Color, Material)
- **Design** (Style, Fit, Weight, Dimensions)
- **Controls** (Touch, Voice, Playback, Mic)
- **Battery** (Life, Charge, Quick, Port)
- **Audio** (Driver, Frequency, Impedance, Sensitivity, Codecs)
- **Connectivity** (Bluetooth, Range, 3.5mm, Multi-device)
- **Additional Details** (Warranty, Box Contents, Compatibility, Country)
- **Style** (Finish, Colors, Look, Target Users)
- **Measurements** (Band, Cup, Cable, Case dimensions)
- **Case Battery** (Capacity, Charges, Method, LED)

### **9. Shipping & Delivery**
- **Delivery Estimates** (date range)
- **Location-based Delivery** (pincode/city)
- **Shipping Options** (Free, Express, etc.)
- **Delivery Instructions**

### **10. FAQ Section**
- **Product-specific FAQs**
- **Technical Questions**
- **Usage Instructions**
- **Warranty Information**
- **Return Policy**

### **11. Marketing & Badges**
- **Promotional Badges** (Best Seller, Top Rated, New, Exclusive, % OFF)
- **Badge Expiry Dates**
- **Special Offers**
- **Featured Product Status**

### **12. Related Products**
- **Similar Products** (algorithm-based recommendations)
- **Cross-sell Products**
- **Upsell Products**
- **Recently Viewed Products**

### **13. Live Activity & Social Proof**
- **Live Viewers Count**
- **Recent Purchases** (name, city, time ago)
- **Stock Urgency Indicators**
- **Trending Status**

### Current Product Categories in taant-front
- Electronics (categoryId: 'electronics')
- Fashion (categoryId: 'fashion')
- Home & Kitchen (categoryId: 'home-kitchen')
- Sports & Outdoors (categoryId: 'sports-outdoors')
- Toys & Games (categoryId: 'toys-games')

### Current Badge Types
- "Best Seller"
- "Top Rated"
- "New"
- "Exclusive"
- "XX% OFF" (percentage discounts)

---

## 1. Taant Supplier Panel Features

### 1.1 Core Product Management (Complete Product Detail Page Coverage)

#### **1.1.1 Basic Product Information**
- [ ] **Product Title** (main heading, rich text support)
- [ ] **Product Short Description** (brief overview below price)
- [ ] **Product Long Description** (detailed description section)
- [ ] **Auto-generate slug from name**
- [ ] **SKU** (Stock Keeping Unit, auto-generated or manual)
- [ ] **Model Number** (technical specifications)
- [ ] **ASIN** (Amazon Standard Identification Number)
- [ ] **Product Unique ID** (internal tracking, auto-generated)
- [ ] **Brand Name** (text input or selection)
- [ ] **Category & Subcategory** (hierarchical selection)
- [ ] **Tags for search** (optional, multiple tags)

#### **1.1.2 Media Management**
- [ ] **Main Product Image** (primary display image, required)
- [ ] **Product Images Gallery** (multiple images up to 20)
- [ ] **Image Alt Text** (for accessibility, SEO)
- [ ] **Image Optimization and Resizing** (automatic)
- [ ] **Product Videos** (upload or embed YouTube/Vimeo)
- [ ] **Video Thumbnails** (auto-generated or custom)
- [ ] **360° Product Views** (interactive product views)
- [ ] **Image Zoom Functionality** (high-res images)
- [ ] **Media Sort Order** (drag and drop ordering)

#### **1.1.3 Pricing & Sales**
- [ ] **MRP (Maximum Retail Price)** = `originalPrice`
- [ ] **Selling Price** = `price`
- [ ] **Cost Price** (for supplier profit tracking)
- [ ] **Tax Information** ("Inclusive of all taxes")
- [ ] **Currency Settings** (₹ INR formatting)
- [ ] **Discount Management** (automatic calculation)
- [ ] **Price History Tracking** (for analytics)

#### **1.1.4 Product Variants & Options**
- [ ] **Variant Management System**
  - [ ] Color variants (with color hex codes and images)
  - [ ] Size options (XS, S, M, L, XL, XXL, custom sizes)
  - [ ] Material variants (cotton, leather, metal, etc.)
  - [ ] Style variants (casual, formal, sport, etc.)
  - [ ] Custom variant types (flexible system)

- [ ] **Variant-Specific Features**
  - [ ] Variant-specific pricing
  - [ ] Variant-specific images
  - [ ] Variant inventory tracking
  - [ ] Variant weight/dimensions
  - [ ] Variant SKU generation

#### **1.1.5 Inventory & Stock Management**
- [ ] **Stock Status** (In Stock / Out of Stock / Backorder)
- [ ] **Stock Quantity** (number available per variant)
- [ ] **Low Stock Alerts** (configurable thresholds)
- [ ] **Inventory History** (stock in/out tracking)
- [ ] **Bulk Inventory Updates** (CSV import/export)
- [ ] **Stock Management** (restock alerts, forecasting)
- [ ] **Warehouse Location** (multi-warehouse support)

#### **1.1.6 A+ Content Management (Amazon-Style)**
- [ ] **Enhanced Content Editor**
  - [ ] Marketing sections (image + text blocks)
  - [ ] Feature highlights with images
  - [ ] Lifestyle images upload
  - [ ] Comparison charts
  - [ ] Technical specifications display
  - [ ] Drag-and-drop content builder

- [ ] **Content Templates**
  - [ ] Pre-built layouts for different product types
  - [ ] Brand-consistent styling
  - [ ] Mobile-responsive design

#### **1.1.7 Detailed Product Specifications**
- [ ] **Structured Specifications Editor**
  - [ ] Item Details (Brand, Model, Color, Material)
  - [ ] Design (Style, Fit, Weight, Dimensions)
  - [ ] Controls (Touch, Voice, Playback, Mic)
  - [ ] Battery (Life, Charge, Quick, Port)
  - [ ] Audio (Driver, Frequency, Impedance, Sensitivity, Codecs)
  - [ ] Connectivity (Bluetooth, Range, 3.5mm, Multi-device)
  - [ ] Additional Details (Warranty, Box Contents, Compatibility)
  - [ ] Custom specification sections

- [ ] **Specification Templates** (by category)

#### **1.1.8 SEO & Marketing**
- [ ] **SEO Management**
  - [ ] SEO title and meta description
  - [ ] SEO keywords management
  - [ ] Open Graph image for social sharing
  - [ ] Structured data (Schema.org)
  - [ ] URL slug customization
  - [ ] Indexability controls

- [ ] **Marketing Features**
  - [ ] Badge selection (Best Seller, Top Rated, New, Exclusive, % OFF)
  - [ ] Badge expiry dates
  - [ ] Special offers management
  - [ ] Featured product status
  - [ ] Trending score management

#### **1.1.9 FAQ Management**
- [ ] **Product FAQ Editor**
  - [ ] Add/edit/delete FAQs
  - [ ] FAQ categorization
  - [ ] FAQ search functionality
  - [ ] FAQ templates (common questions)
  - [ ] Multilingual FAQ support

#### **1.1.10 Related Products Management**
- [ ] **Product Relations**
  - [ ] Similar products selection
  - [ ] Cross-sell products
  - [ ] Upsell products
  - [ ] Manual and automatic recommendations
  - [ ] Relation strength scoring

#### **1.1.11 Shipping & Logistics**
- [ ] **Shipping Configuration**
  - [ ] Weight and dimensions per variant
  - [ ] Shipping class assignment
  - [ ] Free shipping eligibility
  - [ ] Shipping cost calculation
  - [ ] Delivery time estimates
  - [ ] Shipping restrictions

#### **1.1.12 Reviews & Ratings Management**
- [ ] **Review Moderation**
  - [ ] Customer review display
  - [ ] Review response tools
  - [ ] Review flagging system
  - [ ] Verified purchase badges
  - [ ] Review analytics

### 1.2 Dashboard Overview
- [ ] Total products count
- [ ] Total revenue (from orders)
- [ ] Recent orders summary
- [ ] Low stock alerts
- [ ] Top performing products
- [ ] Quick actions (Add Product, View Orders)

### 1.3 Order Management
- [ ] Order listing with filters
- [ ] Order status updates
- [ ] Customer information
- [ ] Shipping details
- [ ] Order fulfillment

### 1.4 Supplier Profile
- [ ] Business information
- [ ] Contact details
- [ ] Logo upload
- [ ] Bank details for payments

### 1.5 Analytics
- [ ] Sales by product
- [ ] Revenue trends
- [ ] Product views
- [ ] Customer metrics

---

## 2. Taant Admin Panel Features

### 2.1 Platform Dashboard
- [ ] Total users (customers, suppliers)
- [ ] Total products
- [ ] Total revenue
- [ ] Order statistics
- [ ] Recent activities
- [ ] System health

### 2.2 User Management
- [ ] **Customer Management**
  - [ ] Customer listing with search/filters
  - [ ] Customer details and order history
  - [ ] Account status management

- [ ] **Supplier Management**
  - [ ] Supplier listing and verification
  - [ ] Supplier approval workflow
  - [ ] Performance monitoring
  - [ ] Commission settings

- [ ] **Admin User Management**
  - [ ] Admin user creation
  - [ ] Role-based permissions
  - [ ] Activity monitoring

### 2.3 Product Management (Platform Level)
- [ ] **Global Product Overview**
  - [ ] All products across all suppliers
  - [ ] Product moderation and approval
  - [ ] Flagged products review
  - [ ] Category management

- [ ] **Category Management**
  - [ ] Add/Edit/Delete categories
  - [ ] Category hierarchy
  - [ ] Category images/descriptions

- [ ] **Brand Management**
  - [ ] Brand listing and approval
  - [ ] Brand logo management
  - [ ] Brand verification

### 2.4 Order Management
- [ ] Global order overview
- [ ] Dispute resolution
- [ ] Refund management
- [ ] Customer service escalation

### 2.5 Content Management
- [ ] Homepage banners
- [ ] Promotional campaigns
- [ ] Email templates
- [ ] System announcements

### 2.6 Platform Settings
- [ ] Commission rates
- [ ] Payment gateway settings
- [ ] Shipping configuration
- [ ] Tax settings
- [ ] Email/SMS settings

### 2.7 Analytics & Reports
- [ ] Platform revenue analytics
- [ ] Supplier performance
- [ ] Customer behavior analytics
- [ ] Product performance reports
- [ ] Financial reports

---

## 3. Database Schema Alignment

### 3.1 Current Tables (from existing schema)
- `profiles` - User profiles with roles
- `suppliers` - Supplier business information
- `products` - Product information
- `product_variants` - Product variants
- `orders` - Order management
- `order_items` - Order line items
- `reviews` - Product reviews

### 3.2 Enhanced Database Schema for Comprehensive Product Management

```sql
-- Product badges management
CREATE TABLE product_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'percentage')),
    style JSONB, -- CSS styles for badge
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges
INSERT INTO product_badges (name, type) VALUES
    ('Best Seller', 'text'),
    ('Top Rated', 'text'),
    ('New', 'text'),
    ('Exclusive', 'text');

-- Enhanced product categories with subcategories
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    parent_id UUID REFERENCES categories(id), -- For subcategories
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A+ Content Management (Amazon-style enhanced content)
CREATE TABLE product_a_plus_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    section_title TEXT NOT NULL,
    section_type TEXT NOT NULL CHECK (section_type IN ('image_left_text_right', 'text_left_image_right', 'text_only', 'image_grid')),
    content JSONB NOT NULL, -- Flexible content structure
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Videos
CREATE TABLE product_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    duration_seconds INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product FAQs
CREATE TABLE product_faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Specifications (structured technical specs)
CREATE TABLE product_specifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL, -- "Item Details", "Design", "Controls", etc.
    spec_key TEXT NOT NULL, -- "Brand", "Model", "Color", etc.
    spec_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced product variants with more options
CREATE TABLE product_variant_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    option_type TEXT NOT NULL CHECK (option_type IN ('size', 'color', 'material', 'style')),
    option_name TEXT NOT NULL, -- "Size", "Color", "Material", "Style"
    option_value TEXT NOT NULL, -- "Large", "Red", "Cotton", "Casual"
    hex_color TEXT, -- For color variants
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Enhancement
ALTER TABLE reviews ADD COLUMN variant_id UUID REFERENCES product_variants(id);
ALTER TABLE reviews ADD COLUMN helpful_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN is_moderated BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN moderation_notes TEXT;

-- Product Media Management
CREATE TABLE product_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', '360_view')),
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Shipping Information
CREATE TABLE product_shipping (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    weight DECIMAL(10,3) NOT NULL, -- in kg
    length DECIMAL(8,2), -- in cm
    width DECIMAL(8,2), -- in cm
    height DECIMAL(8,2), -- in cm
    shipping_class TEXT DEFAULT 'standard',
    free_shipping BOOLEAN DEFAULT FALSE,
    shipping_cost DECIMAL(10,2),
    estimated_delivery_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product SEO and Marketing
CREATE TABLE product_seo (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    meta_tags JSONB,
    og_image TEXT, -- Open Graph image for social sharing
    is_indexable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing products table with new fields
ALTER TABLE products ADD COLUMN short_description TEXT;
ALTER TABLE products ADD COLUMN long_description TEXT;
ALTER TABLE products ADD COLUMN asin TEXT; -- Amazon Standard Identification Number
ALTER TABLE products ADD COLUMN product_unique_id TEXT UNIQUE; -- Internal tracking
ALTER TABLE products ADD COLUMN model_number TEXT;
ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN featured_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE products ADD COLUMN badge_id UUID REFERENCES product_badges(id);
ALTER TABLE products ADD COLUMN supplier_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN total_sold INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN trending_score INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN live_viewers INTEGER DEFAULT 0;

-- Supplier settings
CREATE TABLE supplier_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    payment_method JSONB,
    notification_preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin roles
CREATE TABLE admin_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform settings
CREATE TABLE platform_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Related Products (for recommendations)
CREATE TABLE product_relations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('similar', 'cross_sell', 'upsell')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, related_product_id, relation_type)
);
```

### 3.3 Data Migration - Populate Categories
```sql
INSERT INTO categories (name, slug, description) VALUES
    ('Electronics', 'electronics', 'Electronic devices and gadgets'),
    ('Fashion', 'fashion', 'Clothing and fashion accessories'),
    ('Home & Kitchen', 'home-kitchen', 'Home appliances and kitchenware'),
    ('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
    ('Toys & Games', 'toys-games', 'Toys, games and collectibles');
```

---

## 4. API Endpoints Required

### 4.1 Supplier Panel APIs (Comprehensive Product Management)

```
Authentication:
POST   /api/supplier/auth/login
POST   /api/supplier/auth/logout
GET    /api/supplier/auth/me
POST   /api/supplier/auth/register
POST   /api/supplier/auth/forgot-password
POST   /api/supplier/auth/reset-password

Products (Basic CRUD):
GET    /api/supplier/products              # List supplier's products (with pagination, filters)
POST   /api/supplier/products              # Create new product
GET    /api/supplier/products/:id          # Get complete product details
PUT    /api/supplier/products/:id          # Update product
DELETE /api/supplier/products/:id          # Delete/archive product
POST   /api/supplier/products/:id/duplicate # Duplicate product
GET    /api/supplier/products/:id/preview  # Preview product as customer

Product Variants & Options:
GET    /api/supplier/products/:id/variants # Get all product variants
POST   /api/supplier/products/:id/variants # Create variant
PUT    /api/supplier/variants/:id          # Update variant
DELETE /api/supplier/variants/:id          # Delete variant
GET    /api/supplier/products/:id/options  # Get variant options (colors, sizes, materials)
POST   /api/supplier/products/:id/options  # Add variant option
PUT    /api/supplier/options/:id           # Update variant option
DELETE /api/supplier/options/:id           # Delete variant option

Media Management:
GET    /api/supplier/products/:id/media    # Get all product media
POST   /api/supplier/products/:id/images   # Upload product images
PUT    /api/supplier/media/:id             # Update media (alt text, sort order)
DELETE /api/supplier/media/:id             # Delete media
POST   /api/supplier/products/:id/videos   # Upload/add product videos
POST   /api/supplier/products/:id/360views # Upload 360° product views
POST   /api/supplier/upload/bulk           # Bulk file upload

A+ Content Management:
GET    /api/supplier/products/:id/a-plus-content # Get A+ content sections
POST   /api/supplier/products/:id/a-plus-content # Create A+ content section
PUT    /api/supplier/a-plus-content/:id    # Update A+ content section
DELETE /api/supplier/a-plus-content/:id    # Delete A+ content section
GET    /api/supplier/a-plus-templates      # Get available templates

Product Specifications:
GET    /api/supplier/products/:id/specs    # Get product specifications
POST   /api/supplier/products/:id/specs    # Add specification section
PUT    /api/supplier/specs/:id             # Update specification
DELETE /api/supplier/specs/:id             # Delete specification

FAQ Management:
GET    /api/supplier/products/:id/faqs     # Get product FAQs
POST   /api/supplier/products/:id/faqs     # Add FAQ
PUT    /api/supplier/faqs/:id              # Update FAQ
DELETE /api/supplier/faqs/:id              # Delete FAQ
GET    /api/supplier/faq-templates          # Get FAQ templates

SEO Management:
GET    /api/supplier/products/:id/seo      # Get SEO data
PUT    /api/supplier/products/:id/seo      # Update SEO data
GET    /api/supplier/products/seo-suggestions # Get AI-powered SEO suggestions

Related Products:
GET    /api/supplier/products/:id/relations # Get related products
POST   /api/supplier/products/:id/relations # Add related product
DELETE /api/supplier/relations/:id         # Remove related product
GET    /api/supplier/products/recommendations # Get AI recommendations

Inventory Management:
GET    /api/supplier/products/:id/inventory # Get inventory details
PUT    /api/supplier/products/:id/inventory # Update inventory
GET    /api/supplier/inventory/alerts       # Get low stock alerts
POST   /api/supplier/inventory/bulk-update  # Bulk inventory update
GET    /api/supplier/inventory/history      # Inventory history

Orders:
GET    /api/supplier/orders                # Get supplier's orders
GET    /api/supplier/orders/:id            # Get order details
PUT    /api/supplier/orders/:id/status     # Update order status
POST   /api/supplier/orders/:id/track      # Add tracking information
GET    /api/supplier/orders/analytics       # Order analytics

Reviews & Ratings:
GET    /api/supplier/products/:id/reviews   # Get product reviews
POST   /api/supplier/reviews/:id/respond   # Respond to review
PUT    /api/supplier/reviews/:id/moderate   # Moderate review
GET    /api/supplier/reviews/analytics      # Review analytics

Analytics:
GET    /api/supplier/analytics/dashboard    # Dashboard stats
GET    /api/supplier/analytics/sales        # Sales analytics
GET    /api/supplier/analytics/products     # Product performance analytics
GET    /api/supplier/analytics/traffic      # Traffic and views analytics
GET    /api/supplier/analytics/revenue      # Revenue analytics
GET    /api/supplier/analytics/inventory    # Inventory analytics

Categories & Brands:
GET    /api/supplier/categories             # Get available categories
GET    /api/supplier/brands                 # Get available brands
POST   /api/supplier/brands/suggest         # Suggest new brand

Profile & Settings:
GET    /api/supplier/profile                # Get supplier profile
PUT    /api/supplier/profile                # Update supplier profile
GET    /api/supplier/settings              # Get supplier settings
PUT    /api/supplier/settings              # Update supplier settings
GET    /api/supplier/payments              # Get payment history
POST   /api/supplier/payments/withdraw     # Request withdrawal

Notifications:
GET    /api/supplier/notifications         # Get notifications
PUT    /api/supplier/notifications/:id/read # Mark notification as read
POST   /api/supplier/notifications/subscribe # Subscribe to notifications
```

### 4.2 Admin Panel APIs
```
Authentication:
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me

Dashboard:
GET    /api/admin/dashboard/stats          # Platform statistics

Users:
GET    /api/admin/users/customers          # Customer list
GET    /api/admin/users/suppliers          # Supplier list
PUT    /api/admin/users/suppliers/:id/approve # Approve supplier
GET    /api/admin/users/admins             # Admin users list

Products:
GET    /api/admin/products                 # All products
PUT    /api/admin/products/:id/approve     # Approve product
PUT    /api/admin/products/:id/feature     # Feature product

Categories:
GET    /api/admin/categories               # Category list
POST   /api/admin/categories               # Create category
PUT    /api/admin/categories/:id           # Update category
DELETE /api/admin/categories/:id           # Delete category

Orders:
GET    /api/admin/orders                   # All orders
GET    /api/admin/orders/:id               # Order details
PUT    /api/admin/orders/:id/status        # Update order status

Content:
GET    /api/admin/content/banners          # Banners list
POST   /api/admin/content/banners          # Create banner
PUT    /api/admin/content/banners/:id      # Update banner

Settings:
GET    /api/admin/settings                 # Platform settings
PUT    /api/admin/settings                 # Update settings
```

---

## 5. Technology Stack

### 5.1 Frontend (Both Panels)
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage

### 5.2 Key Libraries
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.7",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@hookform/resolvers": "^3.3.4",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "zustand": "^4.4.7",
    "recharts": "^2.10.4",
    "@tanstack/react-table": "^8.11.8",
    "lucide-react": "^0.323.0",
    "tailwindcss": "^3.4.1"
  }
}
```

---

## 6. Development Phases

### Phase 1: Foundation Setup (Week 1)
- [ ] Set up taant-admin project structure
- [ ] Enhance taant-supplier with proper structure
- [ ] Database schema updates
- [ ] Authentication system for both panels
- [ ] Basic UI component library setup

### Phase 2: Supplier Product Management (Week 2-3)
- [ ] Product CRUD operations
- [ ] Product variant management
- [ ] Image upload and management
- [ ] Form validation and error handling
- [ ] Supplier dashboard basics

### Phase 3: Supplier Order & Analytics (Week 4)
- [ ] Order management interface
- [ ] Basic analytics dashboard
- [ ] Supplier profile management
- [ ] Testing and optimization

### Phase 4: Admin Core Features (Week 5-6)
- [ ] Admin authentication and roles
- [ ] User management (customers/suppliers)
- [ ] Global product management
- [ ] Category and brand management
- [ ] Admin dashboard

### Phase 5: Admin Advanced Features (Week 7)
- [ ] Content management system
- [ ] Platform settings
- [ ] Advanced analytics
- [ ] System monitoring

### Phase 6: Integration & Testing (Week 8)
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment preparation

---

## 7. Security Considerations

### 7.1 Row Level Security (RLS)
```sql
-- Suppliers can only access their own products
CREATE POLICY "Suppliers can only manage their products" ON products
    FOR ALL USING (supplier_id IN (
        SELECT id FROM suppliers WHERE user_id = auth.uid()
    ));

-- Admins can access all data
CREATE POLICY "Admins can access all data" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );
```

### 7.2 Data Validation
- [ ] Input validation on all forms
- [ ] File upload security
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting

---

## 8. Success Metrics

### 8.1 Supplier Panel
- Product creation time < 3 minutes
- Page load times < 2 seconds
- Mobile responsiveness score > 95%
- Supplier adoption rate > 80%

### 8.2 Admin Panel
- Admin task efficiency improvement > 60%
- System monitoring accuracy > 99%
- Data export reliability > 99.9%
- User satisfaction score > 4.5/5

---

## 9. Next Steps

1. **Immediate Actions:**
   - [ ] Create taant-admin directory
   - [ ] Update database schema
   - [ ] Set up authentication for both panels
   - [ ] Begin supplier product management development

2. **Development Priority:**
   - Supplier product management (highest priority)
   - Admin user management
   - Order management systems
   - Analytics and reporting

This plan focuses specifically on backend panel development while maintaining compatibility with the existing taant-front product data structure and ensuring all displayed product information can be managed through the admin interfaces.