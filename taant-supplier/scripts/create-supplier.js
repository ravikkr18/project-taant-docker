#!/usr/bin/env node

/**
 * Create Initial Supplier Script
 *
 * This script creates an initial supplier record for the product seeding
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

async function createSupplier() {
  console.log('🏢 Creating initial supplier...')

  const supplierData = {
    business_name: 'TechVision Industries',
    slug: 'techvision-industries',
    contact_email: 'contact@techvision.com',
    phone: '+1-555-0123-4567',
    business_registration_number: 'TVI-2024-001',
    tax_id: 'TAX-123456789',
    address: '123 Tech Boulevard, San Francisco, CA 94105, USA',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postal_code: '94105',
    status: 'active',
    is_verified: true,
    rating: 4.8,
    total_products: 0,
    description: 'Leading supplier of premium electronics and technology products with focus on innovation and quality.',
    website: 'https://techvision.example.com'
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplierData)
    .select()
    .single()

  if (error) {
    console.error('❌ Error creating supplier:', error.message)
    return null
  }

  console.log(`✅ Created supplier: ${supplierData.business_name} (${data.id})`)
  console.log('📧 Email:', supplierData.contact_email)
  console.log('📱 Phone:', supplierData.phone)
  console.log('🌐 Website:', supplierData.website)

  return data
}

// Run the supplier creation
if (require.main === module) {
  createSupplier()
    .then((supplier) => {
      if (supplier) {
        console.log('\n✨ Supplier created successfully! You can now run the product seeding.')
        console.log('Run: npm run seed:products')
      }
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error creating supplier:', error)
      process.exit(1)
    })
}

module.exports = { createSupplier }