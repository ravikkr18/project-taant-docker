import { createClient } from '@/lib/supabase/server'
import { MigrationRunner } from '@/lib/migration'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const setupSQL = `
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  role_id UUID REFERENCES admin_roles(id),
  permissions JSONB,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

export async function POST(request: NextRequest) {
  try {
    // Initialize migration runner
    const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations')
    const migrationRunner = new MigrationRunner(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      migrationsPath
    )

    // Run migrations
    const result = await migrationRunner.setupInitialSchema()

    if (result.requiresManualExecution && result.sql) {
      return NextResponse.json({
        success: false,
        manualSetupRequired: true,
        message: result.message,
        instructions: [
          '🚀 **Automated Migration Setup**',
          '',
          '1. **Open Supabase Dashboard**',
          '   → Go to https://supabase.com/dashboard',
          '   → Select your project',
          '',
          '2. **Open SQL Editor**',
          '   → Click "SQL Editor" in the left sidebar',
          '   → Click "New query" button',
          '',
          '3. **Execute Migration Script**',
          '   → Copy the complete migration script below',
          '   → Paste it into the SQL Editor',
          '   → Click "Run" to execute',
          '',
          '4. **Verify Setup**',
          '   → Return to this setup page',
          '   → Click "🔄 Refresh Status" button',
          '   → Continue with admin user creation'
        ],
        sql: result.sql,
        estimatedTime: '2-5 minutes',
        difficulty: 'Easy',
        migrationSystem: true
      })
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during setup' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createClient()

    // Check if tables exist
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('count')
      .limit(1)

    const tablesExist = !profilesError && !rolesError

    return NextResponse.json({
      setup: {
        tablesExist,
        profilesTable: !profilesError,
        adminRolesTable: !rolesError,
        profilesError: profilesError?.message,
        rolesError: rolesError?.message
      }
    })

  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    )
  }
}