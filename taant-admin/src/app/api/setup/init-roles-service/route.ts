import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Use service role key to bypass RLS policies
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

    // Insert default admin roles
    const { error } = await supabase
      .from('admin_roles')
      .upsert([
        {
          name: 'Super Admin',
          permissions: { all: true },
          description: 'Full access to all platform features'
        },
        {
          name: 'Admin',
          permissions: { users: true, products: true, orders: true, analytics: true },
          description: 'Standard admin access'
        },
        {
          name: 'Moderator',
          permissions: { products: true, orders: true },
          description: 'Content moderation access'
        }
      ], {
        onConflict: 'name'
      })

    if (error) {
      console.error('Admin roles insertion error:', error)
      return NextResponse.json(
        { error: 'Failed to create admin roles: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ Default admin roles created successfully!'
    })

  } catch (error) {
    console.error('Roles initialization error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating admin roles' },
      { status: 500 }
    )
  }
}