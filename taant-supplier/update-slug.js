import { createClient } from './node_modules/@supabase/supabase-js/dist/module/index.js'

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateProductSlug() {
  try {
    console.log('Updating product slug...')

    // Update the product slug to include SKU
    const { data, error } = await supabase
      .from('products')
      .update({ slug: 'handcrafted-wooden-chicken-sku-mi4owdmo' })
      .eq('slug', 'handcrafted-wooden-chicken-1')
      .select()

    if (error) {
      console.error('Error updating slug:', error)
      process.exit(1)
    }

    console.log('Product slug updated successfully:', data)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

updateProductSlug()