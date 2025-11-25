// Test the API endpoint directly
const API_BASE_URL = 'http://94.136.187.1:4000';

async function getPublicProducts(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/public/products${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

async function testAPI() {
  try {
    console.log('Testing API call...');
    const response = await getPublicProducts({ limit: 5 });
    console.log('API Response:', response);
    console.log('Success:', response.success);
    console.log('Data length:', response.data?.length);
    console.log('Products:', response.data?.map(p => ({ id: p.id, title: p.title, hasImages: !!p.product_images, imageCount: p.product_images?.length })));

// Show detailed image info for first product
if (response.data && response.data.length > 0) {
  const firstProduct = response.data[0];
  console.log('\n=== First Product Images ===');
  console.log('Product:', firstProduct.title);
  console.log('Images count:', firstProduct.product_images?.length);
  if (firstProduct.product_images && firstProduct.product_images.length > 0) {
    firstProduct.product_images.forEach((img, index) => {
      console.log(`Image ${index + 1}:`, img);
    });
  }
}
  } catch (error) {
    console.error('API Error:', error);
  }
}

testAPI();