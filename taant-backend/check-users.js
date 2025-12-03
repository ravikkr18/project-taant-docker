const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('Checking users in auth.users table...');

  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return;
    }

    console.log('Users found:', users.users.length);
    users.users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Phone: ${user.phone}, Created: ${user.created_at}`);
    });

    // Also check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, phone, name');

    if (profilesError) {
      console.log('Profiles table might not exist:', profilesError.message);
    } else {
      console.log('Profiles found:', profiles.length);
      profiles.forEach(profile => {
        console.log(`- ID: ${profile.id}, Phone: ${profile.phone}, Name: ${profile.name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();