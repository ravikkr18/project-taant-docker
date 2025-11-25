// Test the API from frontend context
const API_BASE_URL = 'http://94.136.187.1:4000';

async function testAPIFromFrontend() {
  console.log('=== Testing API from frontend context ===');

  try {
    const queryString = new URLSearchParams({ limit: 5 }).toString();
    const url = `${API_BASE_URL}/public/products${queryString ? '?' + queryString : ''}`;

    console.log('Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Optional: Add CORS headers if needed
      mode: 'cors',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response successful');
    console.log('Success:', data.success);
    console.log('Data length:', data.data?.length);

    if (data.data && data.data.length > 0) {
      console.log('First product:', data.data[0].title);
      console.log('First product images count:', data.data[0].product_images?.length);
      console.log('First image URL:', data.data[0].product_images?.[0]?.url);
    }

    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Test if running in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testAPIFromFrontend;
} else {
  // Run if called directly
  testAPIFromFrontend();
}