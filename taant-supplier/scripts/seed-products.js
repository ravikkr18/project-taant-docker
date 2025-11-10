#!/usr/bin/env node

/**
 * Product Seeding Script with Faker
 *
 * This script generates realistic product data using faker library
 * and inserts at least 100 products with all fields populated
 * across different categories and subcategories.
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { faker } = require('@faker-js/faker')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Category and subcategory structure
const categoryStructure = [
  {
    name: 'Electronics',
    subcategories: [
      'Smartphones & Tablets',
      'Laptops & Computers',
      'Audio & Headphones',
      'Cameras & Photography',
      'Gaming & Consoles',
      'Smart Home & IoT',
      'Wearables & Accessories'
    ]
  },
  {
    name: 'Fashion & Apparel',
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids & Baby",
      'Footwear',
      'Bags & Accessories',
      'Jewelry & Watches',
      'Sportswear & Activewear'
    ]
  },
  {
    name: 'Home & Garden',
    subcategories: [
      'Furniture & Decor',
      'Kitchen & Dining',
      'Bedding & Bath',
      'Home Appliances',
      'Garden & Outdoor',
      'Home Improvement',
      'Storage & Organization'
    ]
  },
  {
    name: 'Sports & Outdoors',
    subcategories: [
      'Fitness & Exercise',
      'Camping & Hiking',
      'Water Sports',
      'Team Sports',
      'Cycling & Biking',
      'Winter Sports',
      'Outdoor Recreation'
    ]
  },
  {
    name: 'Books & Media',
    subcategories: [
      'Fiction & Literature',
      'Non-Fiction & Educational',
      "Children's Books",
      'Comics & Graphic Novels',
      'Movies & TV',
      'Music & Audio',
      'Magazines & Periodicals'
    ]
  },
  {
    name: 'Beauty & Personal Care',
    subcategories: [
      'Skincare',
      'Makeup & Cosmetics',
      'Hair Care',
      'Fragrances & Perfumes',
      'Personal Care & Hygiene',
      'Tools & Accessories',
      'Men\'s Grooming'
    ]
  },
  {
    name: 'Toys & Games',
    subcategories: [
      'Educational Toys',
      'Board Games & Puzzles',
      'Action Figures & Collectibles',
      'Dolls & Plush Toys',
      'Video Games & Accessories',
      'Outdoor & Ride-on Toys',
      'Arts & Crafts'
    ]
  },
  {
    name: 'Food & Beverages',
    subcategories: [
      'Snacks & Confectionery',
      'Beverages',
      'Breakfast Foods',
      'Cooking Ingredients',
      'Organic & Natural Foods',
      'International Cuisine',
      'Health & Dietary Foods'
    ]
  }
]

// Brand names for realistic data
const brandNames = [
  'TechPro', 'SoundMax', 'VisionClear', 'PowerDrive', 'EcoGreen', 'StyleCraft',
  'HomeEssentials', 'FitLife', 'BookWorld', 'BeautyPlus', 'ToyLand', 'FoodHub',
  'SmartTech', 'AudioPro', 'CamGear', 'GameZone', 'HomeTech', 'SportsGear',
  'FashionHub', 'KidZone', 'GourmetFoods', 'BeautyEssentials', 'ToyMaster',
  'TechVision', 'SoundWave', 'PhotoPro', 'GameMaster', 'SmartHome', 'OutdoorPro',
  'StyleElite', 'ComfortWear', 'HomeLux', 'FitnessPro', 'MediaWorld', 'SkinCarePro'
]

// Helper function to generate random SKU
function generateSKU(categoryName, productName) {
  const categoryCode = categoryName.substring(0, 3).toUpperCase()
  const productCode = productName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase()
  const randomNum = faker.string.alphanumeric({ length: 6, casing: 'upper' })
  return `${categoryCode}-${productCode}-${randomNum}`
}

// Helper function to generate dimensions
function generateDimensions() {
  return {
    length: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
    width: faker.number.float({ min: 5, max: 100, fractionDigits: 1 }),
    height: faker.number.float({ min: 2, max: 50, fractionDigits: 1 }),
    unit: 'cm'
  }
}

// Helper function to generate specifications
function generateSpecifications(categoryName) {
  const specs = {}

  switch (categoryName) {
    case 'Electronics':
      specs.warranty = `${faker.number.int({ min: 1, max: 5 })} years`
      specs.power = `${faker.number.int({ min: 5, max: 500 })}W`
      specs.connectivity = faker.helpers.arrayElement(['USB-C', 'Bluetooth 5.0', 'WiFi 6', 'Lightning', '3.5mm Jack'])
      specs.color = faker.color.human()
      break
    case 'Fashion & Apparel':
      specs.material = faker.helpers.arrayElement(['Cotton', 'Polyester', 'Wool', 'Silk', 'Denim', 'Leather', 'Linen'])
      specs.season = faker.helpers.arrayElement(['Spring', 'Summer', 'Fall', 'Winter', 'All Season'])
      specs.origin = faker.helpers.arrayElement(['USA', 'China', 'India', 'Vietnam', 'Bangladesh', 'Turkey'])
      break
    case 'Home & Garden':
      specs.material = faker.helpers.arrayElement(['Wood', 'Metal', 'Plastic', 'Glass', 'Ceramic', 'Fabric'])
      specs.style = faker.helpers.arrayElement(['Modern', 'Traditional', 'Contemporary', 'Industrial', 'Rustic', 'Minimalist'])
      specs.assembly = faker.helpers.arrayElement(['Required', 'Pre-assembled', 'Partial Assembly'])
      break
    default:
      specs.material = faker.helpers.arrayElement(['Plastic', 'Metal', 'Wood', 'Glass', 'Fabric'])
      specs.color = faker.color.human()
  }

  return specs
}

// Helper function to generate features list
function generateFeatures(categoryName) {
  const baseFeatures = [
    'High quality materials',
    'Durable construction',
    'Easy to use',
    'Compact design',
    'Energy efficient'
  ]

  const categoryFeatures = {
    'Electronics': [
      'Latest technology',
      'Fast processing',
      'Long battery life',
      'Wireless connectivity',
      'HD display'
    ],
    'Fashion & Apparel': [
      'Comfortable fit',
      'Stylish design',
      'Breathable fabric',
      'Machine washable',
      'Fade resistant'
    ],
    'Home & Garden': [
      'Space-saving design',
      'Easy maintenance',
      'Multi-functional',
      'Weather resistant',
      'Eco-friendly'
    ]
  }

  const features = [...baseFeatures]
  if (categoryFeatures[categoryName]) {
    features.push(...faker.helpers.arrayElements(categoryFeatures[categoryName], { min: 2, max: 4 }))
  }

  return features
}

// Helper function to generate shipping info
function generateShippingInfo(productWeight) {
  return {
    weight: {
      value: productWeight,
      unit: 'kg'
    },
    dimensions: generateDimensions(),
    shipping_class: faker.helpers.arrayElement(['Standard', 'Express', 'Economy', 'Freight']),
    free_shipping: productWeight < 5 && faker.datatype.boolean({ probability: 0.3 }),
    shipping_restrictions: productWeight > 20 ? ['Oversized item'] : []
  }
}

// Helper function to generate A+ content
function generateAPlusContent(productName, categoryName) {
  return {
    sections: [
      {
        type: 'headline',
        content: `Experience Premium ${productName}`,
        position: 1
      },
      {
        type: 'paragraph',
        content: `Discover the perfect ${productName.toLowerCase()} designed for ${categoryName.toLowerCase()} enthusiasts.
        This exceptional product combines innovative design with superior functionality to enhance your daily experience.`,
        position: 2
      },
      {
        type: 'feature_list',
        content: [
          'Premium quality construction',
          'Innovative design features',
          'Excellent value for money',
          'Reliable performance',
          'Stylish appearance'
        ],
        position: 3
      },
      {
        type: 'technical_specs',
        content: generateSpecifications(categoryName),
        position: 4
      }
    ]
  }
}

// Main function to create a single product
async function createProduct(categoryId, categoryName, subcategoryName, brandId, supplierId) {
  const productName = faker.commerce.productName()
  const productDescription = faker.commerce.productDescription()
  const shortDescription = productDescription.split('.')[0] + '.'

  const costPrice = faker.number.float({ min: 10, max: 500, fractionDigits: 2 })
  const profitMargin = faker.number.float({ min: 0.2, max: 0.8, fractionDigits: 2 })
  const basePrice = costPrice * (1 + profitMargin)
  const comparePrice = basePrice * faker.number.float({ min: 1.1, max: 1.5, fractionDigits: 2 })

  const weight = faker.number.float({ min: 0.1, max: 25, fractionDigits: 2 })

  const productData = {
    supplier_id: supplierId,
    sku: generateSKU(categoryName, productName),
    slug: faker.helpers.slugify(productName).toLowerCase() + '-' + faker.string.alphanumeric({ length: 8 }),
    title: productName,
    short_description: shortDescription,
    description: productDescription,
    brand_id: brandId,
    category_id: categoryId,
    product_type: faker.helpers.arrayElement(['physical', 'digital', 'service']),
    status: 'active',
    visibility: 'public',
    is_featured: faker.datatype.boolean({ probability: 0.1 }),
    is_digital: faker.datatype.boolean({ probability: 0.05 }),
    requires_shipping: weight > 0,
    track_inventory: true,
    weight: weight,
    dimensions: generateDimensions(),
    tags: faker.helpers.arrayElements([
      'popular', 'new', 'sale', 'bestseller', 'trending', 'premium', 'quality',
      'eco-friendly', 'innovative', ' stylish', 'durable', 'compact', 'portable'
    ], { min: 3, max: 8 }),
    warranty_months: faker.number.int({ min: 6, max: 36 }),
    warranty_text: `Manufacturer warranty covers defects in materials and workmanship for ${faker.number.int({ min: 1, max: 3 })} year(s).`,
    specifications: generateSpecifications(categoryName),
    features: generateFeatures(categoryName),
    shipping_info: generateShippingInfo(weight),
    return_policy: {
      policy: faker.helpers.arrayElement(['30-day return', '60-day return', '90-day return']),
      conditions: 'Product must be unused and in original packaging',
      restocking_fee: faker.datatype.boolean({ probability: 0.2 }) ? '10%' : null
    },
    seo_title: `${productName} - Best Price | ${categoryName} | Premium Quality`,
    seo_description: `Shop ${productName.toLowerCase()} at best price. ${shortDescription} Free shipping on orders above $50.`,
    seo_keywords: faker.helpers.arrayElements([
      productName.toLowerCase(),
      categoryName.toLowerCase(),
      'best price',
      'quality',
      'online shopping',
      'free delivery'
    ], { min: 4, max: 8 }),
    meta_title: productName,
    meta_description: shortDescription,
    canonical_url: null,
    view_count: faker.number.int({ min: 0, max: 10000 }),
    wishlist_count: faker.number.int({ min: 0, max: 500 }),
    rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 2 }),
    total_reviews: faker.number.int({ min: 0, max: 1000 }),
    total_sales: faker.number.int({ min: 0, max: 500 }),
    total_revenue: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
    cost_price: costPrice,
    base_price: basePrice,
    compare_price: comparePrice,
    low_stock_threshold: faker.number.int({ min: 5, max: 25 }),
    allow_backorder: faker.datatype.boolean({ probability: 0.2 }),
    requires_tax_calculation: true,
    tax_code: faker.helpers.arrayElement(['STANDARD', 'REDUCED', 'EXEMPT']),
    supplier_product_code: faker.string.alphanumeric({ length: { min: 8, max: 15 } }),
    barcode: faker.string.alphanumeric({ length: 13 })
    // Fields that need migration to be added first:
    // manufacturer: faker.helpers.arrayElement(brandNames),
    // model_number: faker.string.alphanumeric({ length: { min: 6, max: 12 } }),
    // origin_country: faker.helpers.arrayElement(['US', 'CN', 'IN', 'DE', 'JP', 'KR', 'TW', 'VN']),
    // shipping_requirements: weight > 10 ? 'Requires special handling for heavy items' : null,
    // a_plus_content: JSON.stringify(generateAPlusContent(productName, categoryName)),
    // a_plus_sections: JSON.stringify(generateAPlusContent(productName, categoryName))
  }

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating product:', error.message)
    return null
  }

  console.log(`✅ Created product: ${productName} (${data.sku})`)
  return data
}

// Function to create product variants
async function createProductVariants(productId, productName, basePrice, costPrice) {
  const variantTypes = [
    { name: 'Color', values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray'] },
    { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    { name: 'Material', values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather', 'Denim'] },
    { name: 'Storage', values: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
    { name: 'Style', values: ['Classic', 'Modern', 'Sport', 'Casual', 'Formal'] }
  ]

  // Decide if this product should have variants (30% chance)
  if (!faker.datatype.boolean({ probability: 0.3 })) {
    return []
  }

  const selectedVariantTypes = faker.helpers.arrayElements(variantTypes, { min: 1, max: 2 })
  const variants = []

  if (selectedVariantTypes.length === 1) {
    // Single variant type (e.g., just colors)
    const variantType = selectedVariantTypes[0]
    const selectedValues = faker.helpers.arrayElements(variantType.values, { min: 2, max: 5 })

    for (const value of selectedValues) {
      const priceModifier = faker.number.float({ min: -0.1, max: 0.3, fractionDigits: 2 })
      const variantPrice = basePrice * (1 + priceModifier)

      const variantData = {
        product_id: productId,
        sku: `${productId}-${value.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        title: `${productName} - ${value}`,
        price: variantPrice,
        compare_price: variantPrice * faker.number.float({ min: 1.1, max: 1.3, fractionDigits: 2 }),
        cost_price: costPrice,
        weight: faker.number.float({ min: 0.1, max: 2, fractionDigits: 2 }),
        inventory_quantity: faker.number.int({ min: 0, max: 100 }),
        option1_name: variantType.name,
        option1_value: value,
        is_active: true
      }

      const { data, error } = await supabase
        .from('product_variants')
        .insert(variantData)
        .select()
        .single()

      if (!error && data) {
        variants.push(data)
      }
    }
  } else {
    // Two variant types (e.g., colors and sizes)
    const type1 = selectedVariantTypes[0]
    const type2 = selectedVariantTypes[1]
    const values1 = faker.helpers.arrayElements(type1.values, { min: 2, max: 3 })
    const values2 = faker.helpers.arrayElements(type2.values, { min: 2, max: 3 })

    for (const value1 of values1) {
      for (const value2 of values2) {
        const priceModifier = faker.number.float({ min: -0.1, max: 0.4, fractionDigits: 2 })
        const variantPrice = basePrice * (1 + priceModifier)

        const variantData = {
          product_id: productId,
          sku: `${productId}-${value1.toLowerCase().replace(/[^a-z0-9]/g, '')}-${value2.toLowerCase()}`,
          title: `${productName} - ${value1} / ${value2}`,
          price: variantPrice,
          compare_price: variantPrice * faker.number.float({ min: 1.1, max: 1.3, fractionDigits: 2 }),
          cost_price: costPrice,
          weight: faker.number.float({ min: 0.1, max: 2, fractionDigits: 2 }),
          inventory_quantity: faker.number.int({ min: 0, max: 100 }),
          option1_name: type1.name,
          option1_value: value1,
          option2_name: type2.name,
          option2_value: value2,
          is_active: true
        }

        const { data, error } = await supabase
          .from('product_variants')
          .insert(variantData)
          .select()
          .single()

        if (!error && data) {
          variants.push(data)
        }
      }
    }
  }

  console.log(`  📦 Created ${variants.length} variants for ${productName}`)
  return variants
}

// Function to create product images
async function createProductImages(productId, productName) {
  const images = []
  const numImages = faker.number.int({ min: 2, max: 6 })

  for (let i = 0; i < numImages; i++) {
    const imageUrl = faker.image.url({
      width: 800,
      height: 600,
      category: 'product'
    })

    const imageData = {
      product_id: productId,
      url: imageUrl,
      alt_text: `${productName} - Image ${i + 1}`,
      file_name: `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}.jpg`,
      file_size: faker.number.int({ min: 50000, max: 2000000 }),
      file_type: 'image/jpeg',
      width: faker.number.int({ min: 600, max: 1200 }),
      height: faker.number.int({ min: 400, max: 900 }),
      position: i,
      is_primary: i === 0
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert(imageData)
      .select()
      .single()

    if (!error && data) {
      images.push(data)
    }
  }

  console.log(`  🖼️  Created ${images.length} images for ${productName}`)
  return images
}

// Main seeding function
async function seedProducts() {
  console.log('🚀 Starting product seeding process...')
  console.log('=====================================')

  try {
    // Get or create categories and subcategories
    console.log('\n📂 Setting up categories...')
    const categories = []

    for (const categoryInfo of categoryStructure) {
      // Create main category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .upsert({
          name: categoryInfo.name,
          slug: faker.helpers.slugify(categoryInfo.name).toLowerCase(),
          description: `High-quality ${categoryInfo.name.toLowerCase()} products`,
          is_active: true
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (categoryError) {
        console.error(`❌ Error creating category ${categoryInfo.name}:`, categoryError.message)
        continue
      }

      const categoryWithSubs = { ...category, subcategories: [] }

      // Create subcategories
      for (const subcatName of categoryInfo.subcategories) {
        const { data: subcategory, error: subcatError } = await supabase
          .from('categories')
          .upsert({
            name: subcatName,
            slug: faker.helpers.slugify(subcatName).toLowerCase(),
            description: `Premium ${subcatName.toLowerCase()} collection`,
            parent_id: category.id,
            is_active: true
          }, {
            onConflict: 'slug',
            ignoreDuplicates: false
          })
          .select()
          .single()

        if (!subcatError && subcategory) {
          categoryWithSubs.subcategories.push(subcategory)
        }
      }

      categories.push(categoryWithSubs)
      console.log(`✅ Created category: ${categoryInfo.name} with ${categoryWithSubs.subcategories.length} subcategories`)
    }

    // Get or create brands
    console.log('\n🏷️  Setting up brands...')
    const brands = []

    for (const brandName of brandNames) {
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .upsert({
          name: brandName,
          slug: faker.helpers.slugify(brandName).toLowerCase(),
          description: `Premium ${brandName} products - Quality you can trust`,
          is_active: true
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (!brandError && brand) {
        brands.push(brand)
      }
    }

    console.log(`✅ Created ${brands.length} brands`)

    // Get supplier
    console.log('\n🏢 Getting supplier...')
    const { data: suppliers, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .limit(1)

    if (supplierError || !suppliers || suppliers.length === 0) {
      console.error('❌ No suppliers found. Please create a supplier first.')
      process.exit(1)
    }

    const supplierId = suppliers[0].id
    console.log(`✅ Using supplier: ${supplierId}`)

    // Create products
    console.log('\n🛍️  Creating products...')
    console.log('=====================')

    const productsToCreate = faker.number.int({ min: 100, max: 150 })
    let createdProducts = 0

    for (let i = 0; i < productsToCreate; i++) {
      // Randomly select category and subcategory
      const category = faker.helpers.arrayElement(categories)
      const subcategory = category.subcategories.length > 0
        ? faker.helpers.arrayElement(category.subcategories)
        : category

      const brand = faker.helpers.arrayElement(brands)

      // Create product
      const product = await createProduct(
        subcategory.id,
        category.name,
        subcategory.name,
        brand.id,
        supplierId
      )

      if (product) {
        // Create variants
        await createProductVariants(
          product.id,
          product.title,
          parseFloat(product.base_price),
          parseFloat(product.cost_price)
        )

        // Create images
        await createProductImages(product.id, product.title)

        createdProducts++

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`\n📊 Progress: ${i + 1}/${productsToCreate} products created (${Math.round(((i + 1) / productsToCreate) * 100)}%)`)
        }
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n🎉 Product seeding completed successfully!')
    console.log('========================================')
    console.log(`✅ Total products created: ${createdProducts}`)
    console.log(`✅ Categories created: ${categories.length}`)
    console.log(`✅ Brands created: ${brands.length}`)
    console.log('\n🚀 Your database is now populated with realistic product data!')

  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

// Run the seeding
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('\n✨ Seeding completed. Happy selling! ✨')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error during seeding:', error)
      process.exit(1)
    })
}

module.exports = { seedProducts }