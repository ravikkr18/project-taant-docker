const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

console.log('🔍 Checking admin user existence and role...');

async function checkUser() {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check profiles table for admin users
    console.log('1️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(10);

    if (profilesError) {
      console.log('❌ Profile error:', profilesError.message);
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log('✅ Found admin profiles:');
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ID: ${profile.id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Role: ${profile.role}`);
        console.log(`      Name: ${profile.full_name || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('❌ No admin profiles found');
    }

    // Check specific user
    console.log('2️⃣ Checking specific user admin.test@gmail.com...');
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin.test@gmail.com')
      .single();

    if (userError) {
      console.log('❌ User not found:', userError.message);

      // Try to find any users
      console.log('3️⃣ Checking all users...');
      const { data: allUsers, error: allUsersError } = await supabase
        .from('profiles')
        .select('email, role, full_name')
        .limit(10);

      if (allUsersError) {
        console.log('❌ Error getting all users:', allUsersError.message);
      } else if (allUsers && allUsers.length > 0) {
        console.log('✅ Found users:');
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. Email: ${user.email}, Role: ${user.role}`);
        });
      } else {
        console.log('❌ No users found in profiles table');
      }
    } else {
      console.log('✅ Found user profile:');
      console.log(`   Email: ${userProfile.email}`);
      console.log(`   Role: ${userProfile.role}`);
      console.log(`   Name: ${userProfile.full_name || 'Not set'}`);
    }

    // Try authentication
    console.log('4️⃣ Testing authentication...');
    const supabaseAuth = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDcyNjUsImV4cCI6MjA3NzM4MzI2NX0.BoELmC4cEqnL3TjRWfrmpIJdorG4lmvps-qZiohobmw');

    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email: 'admin.test@gmail.com',
      password: 'Admin123'
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);

      // Try with Admin@123!
      console.log('5️⃣ Trying with Admin@123!');
      const { data: authData2, error: authError2 } = await supabaseAuth.auth.signInWithPassword({
        email: 'admin.test@gmail.com',
        password: 'Admin@123!'
      });

      if (authError2) {
        console.log('❌ Both passwords failed');
      } else {
        console.log('✅ Authentication successful with Admin@123!');
      }
    } else {
      console.log('✅ Authentication successful with Admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUser();