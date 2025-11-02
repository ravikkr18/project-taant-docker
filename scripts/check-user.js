const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDcyNjUsImV4cCI6MjA3NzM4MzI2NX0.BoELmC4cEqnL3TjRWfrmpIJdorG4lmvps-qZiohobmw';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

console.log('🔍 Checking admin user existence and role...');

async function checkUser() {
  try {
    // Try to authenticate first
    console.log('\n1️⃣ Testing authentication...');
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: 'admin.test@gmail.com',
      password: 'Admin@123!'
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);

      // Try with Admin123 (without special chars)
      console.log('\n2️⃣ Trying alternative password...');
      const { data: authData2, error: authError2 } = await supabaseAuth.auth.signInWithPassword({
        email: 'admin.test@gmail.com',
        password: 'Admin123'
      });

      if (authError2) {
        console.log('❌ Alternative password also failed:', authError2.message);
        console.log('👤 User may not exist or password is incorrect');
        return;
      }

      console.log('✅ Authentication successful with alternative password');
      var userId = authData2.user.id;
    } else {
      console.log('✅ Authentication successful');
      var userId = authData.user.id;
    }

    // Check user profile and role
    console.log('\n3️⃣ Checking user profile and role...');
    const supabaseService = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      console.log('🔧 User exists but no profile found');
    } else {
      console.log('✅ Profile found:');
      console.log('   ID:', profile.id);
      console.log('   Email:', profile.email);
      console.log('   Role:', profile.role);
      console.log('   Full Name:', profile.full_name || 'Not set');

      if (profile.role === 'admin') {
        console.log('🎉 User has admin role - login should work!');
      } else {
        console.log('⚠️  User role is:', profile.role, '(Expected: admin)');
        console.log('🔧 Need to update user role to admin');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();