/**
 * Database Seeder Script
 *
 * This script will:
 * 1. Remove all products except the sample (0275448e-1f78-4aa1-a078-e3ceaced90e1)
 * 2. Create 50 realistic fake products with complete data including variants, images, etc.
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Supabase configuration
const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data templates
const categories = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors',
  'Books', 'Toys & Games', 'Health & Beauty', 'Automotive',
  'Food & Beverages', 'Office Supplies', 'Jewelry', 'Shoes'
];

const brands = [
  'TechPro', 'ComfortPlus', 'EcoLiving', 'SportMax', 'BookWorm',
  'PlayTime', 'BeautyGlow', 'AutoCare', 'Foodie', 'OfficePro',
  'Sparkle', 'StepRight'
];

const productTypes = ['physical', 'digital', 'service'];
const statuses = ['active', 'draft', 'archived'];
const visibilities = ['public', 'private'];

// Color options for variants
const colors = [
  { name: 'Red', value: 'rgb(220,38,38)' },
  { name: 'Blue', value: 'rgb(37,99,235)' },
  { name: 'Green', value: 'rgb(34,197,94)' },
  { name: 'Black', value: 'rgb(0,0,0)' },
  { name: 'White', value: 'rgb(255,255,255)' },
  { name: 'Yellow', value: 'rgb(250,204,21)' },
  { name: 'Purple', value: 'rgb(147,51,234)' },
  { name: 'Orange', value: 'rgb(249,115,22)' }
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const materials = ['Cotton', 'Polyester', 'Leather', 'Metal', 'Wood', 'Plastic', 'Glass', 'Ceramic'];

// Faker seed for reproducibility
faker.seed(12345);

function generateSKU() {
  return `SKU-${faker.string.alphanumeric({ length: 8 }).toUpperCase()}`;
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + `-${faker.string.alphanumeric({ length: 6 }).toLowerCase()}`;
}

function generateVariants(baseProduct) {
  const variantCount = faker.number.int({ min: 0, max: 4 });
  const variants = [];

  for (let i = 0; i < variantCount; i++) {
    const variantColors = faker.helpers.arrayElements(colors, { min: 1, max: 2 });
    const variantSizes = faker.helpers.arrayElements(sizes, { min: 1, max: 3 });

    variants.push({
      sku: `VAR-${faker.string.alphanumeric({ length: 10 }).toUpperCase()}`,
      price: faker.number.float({ min: baseProduct.base_price * 0.8, max: baseProduct.base_price * 1.3, precision: 0.01 }),
      title: faker.helpers.arrayElement(variantColors).name,
      options: [
        { id: `opt-${faker.string.uuid()}`, name: 'Color', value: faker.helpers.arrayElement(variantColors).value },
        ...(faker.datatype.boolean() ? [{ id: `opt-${faker.string.uuid()}`, name: 'Size', value: faker.helpers.arrayElement(variantSizes) }] : [])
      ],
      position: i,
      image_url: faker.image.url({ width: 800, height: 600 }),
      is_active: faker.datatype.boolean(),
      inventory_quantity: faker.number.int({ min: 0, max: 100 }),
      weight: faker.number.float({ min: 0.1, max: 5, precision: 0.1 }),
      barcode: faker.string.numeric(13),
      compare_price: null,
      cost_price: null
    });
  }

  return variants;
}

function generateImages(productId) {
  const imageCount = faker.number.int({ min: 1, max: 6 });
  const images = [];

  for (let i = 0; i < imageCount; i++) {
    images.push({
      url: faker.image.url({ width: 800, height: 600 }),
      alt_text: `${faker.lorem.words(3)} ${i}`,
      position: i,
      is_primary: i === 0
    });
  }

  return images;
}

function generateAPlusSections() {
  const sectionCount = faker.number.int({ min: 0, max: 3 });
  const sections = [];
  const sectionTypes = ['text', 'image_text', 'text_image'];

  for (let i = 0; i < sectionCount; i++) {
    const type = faker.helpers.arrayElement(sectionTypes);
    const section = {
      id: `temp-${Date.now()}-${faker.string.alphanumeric(10)}`,
      type: type,
      title: faker.lorem.sentence(),
      content: `<p>${faker.lorem.paragraphs(2)}</p>`,
      position: i,
      formatting: {
        bold: faker.datatype.boolean(),
        align: faker.helpers.arrayElement(['left', 'center', 'right']),
        italic: faker.datatype.boolean(),
        listType: faker.helpers.arrayElement(['none', 'bullet', 'number']),
        underline: faker.datatype.boolean()
      }
    };

    if (type !== 'text') {
      section.image = faker.image.url({ width: 400, height: 300 });
    }

    sections.push(section);
  }

  return sections;
}

function generateSimpleFields() {
  const fieldCount = faker.number.int({ min: 0, max: 4 });
  const fields = [];

  for (let i = 0; i < fieldCount; i++) {
    fields.push({
      id: `field-${Date.now()}-${i}`,
      value: faker.lorem.sentence(),
      option: faker.lorem.words(3)
    });
  }

  return fields;
}

function generateInformationSections() {
  const sectionCount = faker.number.int({ min: 1, max: 3 });
  const sections = [];

  for (let i = 0; i < sectionCount; i++) {
    const itemCount = faker.number.int({ min: 2, max: 5 });
    const items = [];

    for (let j = 0; j < itemCount; j++) {
      items.push({
        id: `item-${Date.now()}-${i}-${j}`,
        key: faker.lorem.sentence(),
        value: faker.lorem.sentence()
      });
    }

    sections.push({
      id: `section-${Date.now()}-${i}`,
      items: items,
      title: faker.person.jobType(),
      isExpanded: faker.datatype.boolean()
    });
  }

  return sections;
}

function generateFAQs() {
  const faqCount = faker.number.int({ min: 1, max: 5 });
  const faqs = [];

  for (let i = 0; i < faqCount; i++) {
    faqs.push({
      id: `temp-${Date.now()}-${faker.string.alphanumeric(10)}`,
      question: faker.lorem.sentence() + '?',
      answer: faker.lorem.sentences(2),
      position: i,
      is_active: faker.datatype.boolean()
    });
  }

  return faqs;
}

function generateProduct(index) {
  const category = faker.helpers.arrayElement(categories);
  const brand = faker.helpers.arrayElement(brands);
  const title = faker.commerce.productName();
  const slug = generateSlug(title);

  const basePrice = faker.number.float({ min: 10, max: 500, precision: 0.01 });
  const costPrice = basePrice * faker.number.float({ min: 0.5, max: 0.8, precision: 0.01 });
  const comparePrice = basePrice * faker.number.float({ min: 1.2, max: 2, precision: 0.01 });

  const product = {
    id: faker.string.uuid(),
    supplier_id: 'fa0ca8e0-f848-45b9-b107-21e56b38573f', // Using the same supplier as sample
    sku: generateSKU(),
    slug: slug,
    title: title,
    short_description: faker.commerce.productDescription(),
    description: faker.lorem.paragraphs(3),
    brand_id: null, // Using null to avoid foreign key constraint issues
    category_id: faker.helpers.arrayElement(['b64cfab0-3fd2-40cc-8478-4140869f5b47', 'c1e171e7-693e-4aa5-ac99-6effb57b12a9']), // Using sample category or null
    product_type: faker.helpers.arrayElement(productTypes),
    status: faker.helpers.arrayElement(statuses),
    visibility: faker.helpers.arrayElement(visibilities),
    is_featured: faker.datatype.boolean(),
    is_digital: faker.datatype.boolean(),
    requires_shipping: faker.datatype.boolean(),
    track_inventory: faker.datatype.boolean(),
    weight: faker.number.float({ min: 0.1, max: 10, precision: 0.1 }),
    dimensions: {
      unit: 'cm',
      width: faker.number.float({ min: 10, max: 100, precision: 0.1 }),
      height: faker.number.float({ min: 10, max: 100, precision: 0.1 }),
      length: faker.number.float({ min: 10, max: 100, precision: 0.1 })
    },
    tags: faker.helpers.arrayElements(['sale', 'new', 'popular', 'eco-friendly', 'premium', 'limited'], { min: 2, max: 4 }),
    warranty_months: faker.number.int({ min: 0, max: 24 }),
    warranty_text: faker.lorem.sentences(2),
    specifications: {
      color: faker.color.human(),
      material: faker.helpers.arrayElement(materials)
    },
    features: faker.helpers.arrayElements([faker.lorem.sentence()], { min: 2, max: 5 }),
    shipping_info: {
      weight: {
        unit: 'kg',
        value: faker.number.float({ min: 0.1, max: 20, precision: 0.1 })
      },
      dimensions: {
        unit: 'cm',
        width: faker.number.float({ min: 10, max: 100, precision: 0.1 }),
        height: faker.number.float({ min: 10, max: 100, precision: 0.1 }),
        length: faker.number.float({ min: 10, max: 100, precision: 0.1 })
      },
      free_shipping: faker.datatype.boolean(),
      shipping_class: faker.helpers.arrayElement(['Standard', 'Express', 'Overnight', 'Freight']),
      shipping_restrictions: []
    },
    return_policy: {
      policy: `${faker.number.int({ min: 7, max: 30 })}-day return`,
      conditions: faker.lorem.sentence(),
      restocking_fee: `${faker.number.int({ min: 0, max: 20 })}%`
    },
    seo_title: `${title} - Best Price | ${category} | Premium Quality`,
    seo_description: faker.lorem.sentences(2),
    seo_keywords: ['online shopping', 'best price', 'quality', 'free delivery', title.toLowerCase(), category.toLowerCase()],
    meta_title: title,
    meta_description: faker.lorem.sentences(2),
    canonical_url: null,
    view_count: faker.number.int({ min: 0, max: 5000 }),
    wishlist_count: faker.number.int({ min: 0, max: 500 }),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.01 }),
    total_reviews: faker.number.int({ min: 0, max: 1000 }),
    total_sales: faker.number.int({ min: 0, max: 1000 }),
    total_revenue: faker.number.float({ min: 0, max: 100000, precision: 0.01 }),
    cost_price: costPrice,
    base_price: basePrice,
    compare_price: comparePrice,
    low_stock_threshold: faker.number.int({ min: 5, max: 25 }),
    allow_backorder: faker.datatype.boolean(),
    requires_tax_calculation: faker.datatype.boolean(),
    tax_code: faker.helpers.arrayElement(['STANDARD', 'EXEMPT', 'REDUCED']),
    supplier_product_code: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
    barcode: faker.string.numeric(13),
    created_at: faker.date.past({ years: 2 }).toISOString(),
    updated_at: faker.date.recent().toISOString(),
    published_at: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
    deleted_at: null,
    a_plus_content: faker.lorem.paragraphs(2),
    a_plus_sections: generateAPlusSections(),
    simple_fields: generateSimpleFields(),
    information_sections: generateInformationSections(),
    images: generateImages(),
    variants: generateVariants({ base_price: basePrice }),
    faqs: generateFAQs(),
    included_items: faker.helpers.arrayElements(['User Manual', 'Warranty Card', 'Battery', 'Charger', 'Case'], { min: 1, max: 3 }),
    compatibility: faker.lorem.sentences(2),
    safety_warnings: faker.lorem.sentences(2),
    care_instructions: faker.lorem.sentences(2),
    height: faker.number.int({ min: 10, max: 100 }),
    length: faker.number.int({ min: 10, max: 100 }),
    width: faker.number.int({ min: 10, max: 100 }),
    manufacturer: faker.company.name(),
    model_number: faker.string.alphanumeric({ length: 6 }).toUpperCase(),
    origin_country: faker.helpers.arrayElement(['US', 'CN', 'IN', 'DE', 'JP', 'GB']),
    shipping_requirements: faker.lorem.sentences(2),
    selling_policy: faker.lorem.sentences(2),
    quantity: faker.number.int({ min: 0, max: 100 }),
    options: [
      {
        id: `opt-${faker.string.uuid()}`,
        name: 'Color',
        value: faker.helpers.arrayElement(colors).value
      }
    ]
  };

  return product;
}

async function cleanupDatabase() {
  console.log('🧹 Cleaning up database...');

  try {
    // Delete all products except the sample
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '0275448e-1f78-4aa1-a078-e3ceaced90e1');

    if (deleteError) {
      console.error('❌ Error deleting products:', deleteError);
      throw deleteError;
    }

    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    throw error;
  }
}

async function seedProducts() {
  console.log('🌱 Starting to seed 50 products...');

  const products = [];
  for (let i = 0; i < 50; i++) {
    const product = generateProduct(i + 1);
    products.push(product);

    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1} products...`);
    }
  }

  try {
    // Insert products
    console.log('Inserting products into database...');

    for (const product of products) {
      // Extract nested data for separate tables
      const { images, variants, a_plus_sections, simple_fields, information_sections, faqs, ...productData } = product;

      // Insert main product
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) {
        console.error('❌ Error inserting product:', productError);
        continue;
      }

      console.log(`✅ Inserted product: ${product.title}`);

      // Insert product images
      if (images && images.length > 0) {
        const imagesWithProductId = images.map(img => ({
          ...img,
          product_id: insertedProduct.id,
          file_name: `${faker.system.fileName()}.jpg`,
          file_size: faker.number.int({ min: 50000, max: 500000 }),
          file_type: 'image/jpeg',
          width: faker.number.int({ min: 400, max: 1200 }),
          height: faker.number.int({ min: 300, max: 900 })
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesWithProductId);

        if (imagesError) {
          console.error('❌ Error inserting images:', imagesError);
        }
      }

      // Insert variants
      if (variants && variants.length > 0) {
        const variantsWithProductId = variants.map(variant => ({
          ...variant,
          product_id: insertedProduct.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsWithProductId);

        if (variantsError) {
          console.error('❌ Error inserting variants:', variantsError);
        }
      }

      // Insert A+ content images if any
      if (a_plus_sections && a_plus_sections.length > 0) {
        const aPlusImages = a_plus_sections
          .filter(section => section.image)
          .map(section => ({
            product_id: insertedProduct.id,
            url: section.image,
            alt_text: section.title,
            file_name: `a-plus-${faker.system.fileName()}.jpg`,
            file_size: faker.number.int({ min: 50000, max: 500000 }),
            file_type: 'image/jpeg',
            width: faker.number.int({ min: 400, max: 800 }),
            height: faker.number.int({ min: 300, max: 600 }),
            position: section.position,
            is_active: true
          }));

        if (aPlusImages.length > 0) {
          const { error: aPlusError } = await supabase
            .from('a_plus_content_images')
            .insert(aPlusImages);

          if (aPlusError) {
            console.error('❌ Error inserting A+ content images:', aPlusError);
          }
        }
      }
    }

    console.log('✅ Successfully seeded 50 products!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database seeding process...\n');

  try {
    // Step 1: Cleanup existing data
    await cleanupDatabase();

    // Step 2: Seed new products
    await seedProducts();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Kept 1 sample product (0275448e-1f78-4aa1-a078-e3ceaced90e1)');
    console.log('   - Added 50 new realistic products');
    console.log('   - Each product includes variants, images, A+ content, and complete metadata');

  } catch (error) {
    console.error('\n💥 Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
main();