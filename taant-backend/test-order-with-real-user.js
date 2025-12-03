const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

// Create a custom token for existing user
const existingUserId = '07c0cef9-64d2-4269-884a-121d1ad94db0'; // User with phone 919876543210
const phone = '919876543210';

const customToken = {
  id: existingUserId,
  phone: phone,
  email: '9876543210@placeholder.com',
  name: 'Test User',
  role: 'user',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
};

const token = Buffer.from(JSON.stringify(customToken)).toString('base64');

console.log('Generated token:', token);

async function testOrderPlacement() {
  const orderData = {
    items: [
      {
        product_id: "0275448e-1f78-4aa1-a078-e3ceaced90e1",
        variant_id: "33065a2f-a8ef-48dd-9d74-8bc93ed2f933",
        quantity: 1
      }
    ],
    shipping_address: {
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 Main Street, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    billing_address: {
      name: "John Doe",
      phone: "+91 9876543210",
      address: "123 Main Street, Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    }
  };

  try {
    const response = await fetch('http://94.136.187.1:4000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('Order ID:', result.id);
      console.log('Order Number:', result.order_number);
    } else {
      console.log('❌ Order creation failed:', result.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testOrderPlacement();