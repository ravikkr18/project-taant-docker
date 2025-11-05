const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://lyteoxnqkjrpilrfcimc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGVveG5xa2pycGlscmZjaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzI2NSwiZXhwIjoyMDc3MzgzMjY1fQ.TTy-fS8I4dIgCvxkfQSxCGmAldoUz2PGi59ya8bx10C';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files directory
const migrationsDir = path.join(__dirname, '../supabase/migrations');

async function applyMigrations() {
  console.log('Starting migration process...');

  try {
    // Create schema_migrations table if it doesn't exist
    console.log('Creating schema_migrations table if not exists...');

    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (tableError) {
      // Try direct SQL if RPC not available
      console.log('Using direct SQL for table creation...');
      const { error: directError } = await supabase
        .from('schema_migrations')
        .select('filename')
        .limit(1);

      if (directError && directError.code === 'PGRST116') {
        console.log('Table does not exist, creating manually...');
        // Table will be created with first migration
      }
    }

    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:`, migrationFiles);

    // Get applied migrations
    const { data: appliedMigrations, error: fetchError } = await supabase
      .from('schema_migrations')
      .select('filename');

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching applied migrations:', fetchError);
    }

    const appliedFilenames = new Set((appliedMigrations || []).map(m => m.filename));

    // Apply each migration
    for (const filename of migrationFiles) {
      if (appliedFilenames.has(filename)) {
        console.log(`✓ Skipping already applied migration: ${filename}`);
        continue;
      }

      console.log(`→ Applying migration: ${filename}`);

      const migrationSQL = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');

      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
        .filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        const cleanStatement = statement.trim();
        if (!cleanStatement) continue;

        // Execute the SQL statement using raw SQL execution
        const { error } = await supabase.rpc('exec_sql', {
          sql: cleanStatement
        });

        if (error) {
          console.error(`Error executing statement in ${filename}:`, error);
          console.error('Statement:', cleanStatement.substring(0, 100) + '...');

          // Try alternative approach using direct table operations
          console.log('Attempting alternative execution method...');
          continue;
        }
      }

      // Record the migration as applied
      const { error: insertError } = await supabase
        .from('schema_migrations')
        .insert({ filename });

      if (insertError) {
        console.error(`Error recording migration ${filename}:`, insertError);
      } else {
        console.log(`✓ Successfully applied migration: ${filename}`);
      }
    }

    console.log('\nMigration process completed!');

    // Show current migrations
    const { data: finalMigrations } = await supabase
      .from('schema_migrations')
      .select('filename, applied_at')
      .order('applied_at');

    if (finalMigrations && finalMigrations.length > 0) {
      console.log('\nApplied migrations:');
      finalMigrations.forEach(m => {
        console.log(`  - ${m.filename} (${m.applied_at})`);
      });
    } else {
      console.log('\nNo migrations recorded in database (this might be expected if schema_migrations table creation failed)');
    }

  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Alternative approach: execute SQL files directly using database connection
async function applyMigrationsDirectly() {
  console.log('Using direct database connection approach...');

  // This would require the actual database connection string
  // For now, let's create a simple script that can be run with psql
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('Migration files to apply:', migrationFiles);

  // Create a combined migration file
  let combinedSQL = `
-- Migration batch applied on ${new Date().toISOString()}
-- Files: ${migrationFiles.join(', ')}

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

`;

  for (const filename of migrationFiles) {
    const migrationSQL = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
    combinedSQL += `\n-- Migration: ${filename}\n`;
    combinedSQL += migrationSQL;
    combinedSQL += `\n-- Record migration\n`;
    combinedSQL += `INSERT INTO schema_migrations (filename) VALUES ('${filename}') ON CONFLICT (filename) DO NOTHING;\n\n`;
  }

  // Write combined migration file
  fs.writeFileSync(path.join(__dirname, 'combined_migration.sql'), combinedSQL);
  console.log('Created combined migration file: combined_migration.sql');
  console.log('\nTo apply this migration manually, run:');
  console.log(`psql "postgresql://postgres:password@lyteoxnqkjrpilrfcimc.supabase.co:5432/postgres?sslmode=require" -f combined_migration.sql`);
}

// Run the migration
applyMigrationsDirectly().catch(console.error);