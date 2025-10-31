import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role = 'Super Admin' } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Use service role key to bypass RLS policies for initial setup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Step 1: Create user using admin.createUser to bypass email verification
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification for development
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Step 2: Update profile to admin role (trigger should handle this, but let's be explicit)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't fail completely, as the trigger might have handled it
    }

    // Step 3: Create admin user record
    const { data: roleData, error: roleError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', role)
      .single()

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'Admin role not found. Please run database setup first.' },
        { status: 400 }
      )
    }

    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        role_id: roleData.id,
        permissions: role === 'Super Admin' ? { all: true } : { users: true, products: true, orders: true, analytics: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (adminError) {
      console.error('Admin user creation error:', adminError)
      return NextResponse.json(
        { error: 'Failed to create admin user: ' + adminError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        email,
        fullName,
        role,
        id: authData.user.id
      }
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating admin user' },
      { status: 500 }
    )
  }
}