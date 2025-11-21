const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixSlug() {
  try {
    console.log('Checking current product slug...');

    // Get current product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('slug, title, sku')
      .eq('sku', 'SKU-MI4OWDMO')
      .single();

    if (fetchError) {
      console.error('Error fetching product:', fetchError);
      return;
    }

    console.log('Current product:', product);

    if (product.slug !== 'handcrafted-wooden-chicken-sku-mi4owdmo') {
      console.log('Updating slug...');

      // Update the slug
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ slug: 'handcrafted-wooden-chicken-sku-mi4owdmo' })
        .eq('sku', 'SKU-MI4OWDMO')
        .select()
        .single();

      if (updateError) {
        console.error('Error updating slug:', updateError);
      } else {
        console.log('Slug updated successfully:', updatedProduct.slug);
      }
    } else {
      console.log('Slug is already correct!');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndFixSlug();