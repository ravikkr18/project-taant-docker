// Test homepage API call in browser context
console.log('=== Testing Homepage API ===');

// Test direct API call
fetch('http://94.136.187.1:4000/public/products?limit=5')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Raw API Response:', data);
    console.log('Success:', data.success);
    console.log('Data length:', data.data?.length);

    if (data.data && data.data.length > 0) {
      const firstProduct = data.data[0];
      console.log('First product title:', firstProduct.title);
      console.log('First product has images:', !!firstProduct.product_images);
      console.log('First product images count:', firstProduct.product_images?.length);
      console.log('First image URL:', firstProduct.product_images?.[0]?.url);
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });