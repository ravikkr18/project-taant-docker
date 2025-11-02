import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

interface Migration {
  version: string
  filename: string
  sql: string
  name: string
  timestamp: string
}

interface MigrationResult {
  success: boolean
  applied: Migration[]
  pending: Migration[]
  error?: string
  message: string
}

export class SupabaseCLI {
  private supabase: any
  private migrationsPath: string
  private serviceRoleKey: string

  constructor(supabaseUrl: string, serviceRoleKey: string, migrationsPath: string) {
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    this.migrationsPath = migrationsPath
    this.serviceRoleKey = serviceRoleKey
  }

  /**
   * Initialize Supabase project structure (like `supabase init`)
   */
  async init(): Promise<{ success: boolean; message: string }> {
    try {
      // Ensure migrations directory exists
      await fs.mkdir(this.migrationsPath, { recursive: true })

      // Create config file
      const configPath = path.join(path.dirname(path.dirname(this.migrationsPath)), 'supabase', 'config.toml')
      const configContent = `[project]
ref = "${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'local'}"

[api]
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
port = 54323

[functions]
verify_jwt = false

[storage]
file_size_limit = "50MiB"
image_render_size_limit = "0MiB"

[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = "3600s"

[analytics]
enabled = false
`

      await fs.writeFile(configPath, configContent)

      // Create initial migration
      await this.createMigration('initial_schema', this.getInitialSchema())

      return {
        success: true,
        message: '✅ Supabase project initialized successfully! Migration files created.'
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create a new migration (like `supabase migration new <name>`)
   */
  async createMigration(name: string, sql?: string): Promise<{ success: boolean; filename: string; message: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').replace('T', '_').slice(0, 14)
      const filename = `${timestamp}_${name}.sql`
      const filePath = path.join(this.migrationsPath, filename)

      const migrationSQL = sql || `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Add your SQL here

-- Example:
-- CREATE TABLE IF NOT EXISTS public.${name} (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
`

      await fs.writeFile(filePath, migrationSQL)

      return {
        success: true,
        filename,
        message: `✅ Migration created: ${filename}`
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        message: `Failed to create migration: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get all migrations (pending and applied)
   */
  async getMigrations(): Promise<{ applied: string[], pending: Migration[] }> {
    try {
      // Create migrations table if it doesn't exist
      await this.ensureMigrationsTable()

      // Get applied migrations
      const { data: applied, error } = await this.supabase
        .from('schema_migrations')
        .select('version')
        .order('executed_at', { ascending: true })

      if (error && !error.message.includes('does not exist')) {
        throw error
      }

      const appliedVersions = applied?.map(m => m.version) || []

      // Get all migration files
      const files = await fs.readdir(this.migrationsPath)
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort()

      const migrations: Migration[] = []

      for (const file of migrationFiles) {
        const filePath = path.join(this.migrationsPath, file)
        const sql = await fs.readFile(filePath, 'utf8')

        // Extract version from filename
        const version = file.replace('.sql', '')
        const name = version.split('_').slice(1).join('_')
        const timestamp = version.split('_')[0]

        migrations.push({
          version,
          filename: file,
          sql,
          name,
          timestamp
        })
      }

      const pending = migrations.filter(m => !appliedVersions.includes(m.version))

      return { applied: appliedVersions, pending }
    } catch (error) {
      console.error('Error getting migrations:', error)
      return { applied: [], pending: [] }
    }
  }

  /**
   * Apply pending migrations (like `supabase db push`)
   */
  async push(): Promise<MigrationResult> {
    try {
      const { applied, pending } = await this.getMigrations()

      if (pending.length === 0) {
        return {
          success: true,
          applied: [],
          pending: [],
          message: '✅ No pending migrations. Database is up to date.'
        }
      }

      const appliedMigrations: Migration[] = []

      for (const migration of pending) {
        try {
          // Execute migration SQL
          const result = await this.executeSQL(migration.sql)

          if (result.success) {
            // Mark migration as applied
            await this.supabase
              .from('schema_migrations')
              .insert({
                version: migration.version,
                executed_at: new Date().toISOString()
              })

            appliedMigrations.push(migration)
          } else {
            return {
              success: false,
              applied: appliedMigrations,
              pending: pending.slice(appliedMigrations.length),
              error: result.error,
              message: `❌ Migration ${migration.filename} failed: ${result.error}`
            }
          }
        } catch (error) {
          return {
            success: false,
            applied: appliedMigrations,
            pending: pending.slice(appliedMigrations.length),
            error: error instanceof Error ? error.message : 'Unknown error',
            message: `❌ Migration ${migration.filename} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      }

      return {
        success: true,
        applied: appliedMigrations,
        pending: [],
        message: `✅ Applied ${appliedMigrations.length} migration(s) successfully!`
      }
    } catch (error) {
      return {
        success: false,
        applied: [],
        pending: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `❌ Migration push failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Reset database (like `supabase db reset`)
   */
  async reset(): Promise<{ success: boolean; message: string }> {
    try {
      // Drop migrations table and recreate
      await this.supabase.rpc('exec_sql', {
        sql: 'DROP TABLE IF EXISTS public.schema_migrations CASCADE;'
      }).catch(() => {
        // Ignore if RPC doesn't exist
      })

      // Run all migrations
      const result = await this.push()

      if (result.success) {
        return {
          success: true,
          message: '✅ Database reset successfully! All migrations applied.'
        }
      } else {
        return {
          success: false,
          message: `❌ Database reset failed: ${result.error}`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Database reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get migration status
   */
  async status(): Promise<{ success: boolean; applied: string[]; pending: Migration[]; message: string }> {
    try {
      const { applied, pending } = await this.getMigrations()

      const message = pending.length > 0
        ? `⚠️ ${pending.length} pending migration(s)`
        : '✅ All migrations applied'

      return {
        success: true,
        applied,
        pending,
        message
      }
    } catch (error) {
      return {
        success: false,
        applied: [],
        pending: [],
        message: `❌ Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async ensureMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id SERIAL PRIMARY KEY,
        version TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        checksum TEXT
      );
    `

    const result = await this.executeSQL(createTableSQL)
    if (!result.success) {
      // If automatic creation fails, assume manual setup is needed
      console.log('⚠️ schema_migrations table may need manual creation')
    }
  }

  private async executeSQL(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'))

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // Use Supabase SQL HTTP API (v1/sql endpoint)
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.serviceRoleKey}`,
                'apikey': this.serviceRoleKey,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                query: statement
              })
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              const errorMessage = errorData.message || errorData.error || `SQL execution failed: ${response.statusText}`
              throw new Error(errorMessage)
            }

            // Check if response has content and if it's an error
            const responseData = await response.json().catch(() => null)
            if (responseData && responseData.error) {
              throw new Error(responseData.error)
            }

          } catch (fetchError) {
            console.error('SQL execution failed for statement:', statement, fetchError)
            return {
              success: false,
              error: `SQL execution failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
            }
          }
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getInitialSchema(): string {
    return `-- Initial Schema Migration
-- This creates all necessary tables for the Taant Admin Panel
-- Created: ${new Date().toISOString()}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'supplier', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  role_id UUID REFERENCES admin_roles(id),
  permissions JSONB,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin roles
INSERT INTO public.admin_roles (name, permissions, description) VALUES
('Super Admin', '{"all": true}', 'Full access to all platform features'),
('Admin', '{"users": true, "products": true, "orders": true, "analytics": true}', 'Standard admin access'),
('Moderator', '{"products": true, "orders": true}', 'Content moderation access')
ON CONFLICT (name) DO NOTHING;

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.admin_roles;

-- Policy for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy for admin users table
CREATE POLICY "Admins can view all admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update admin users" ON public.admin_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy for admin roles table
CREATE POLICY "Admins can view all roles" ON public.admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
`
  }
}