import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Use service role key for admin operations
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

    // Get all users with profiles
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to get users: ' + usersError.message },
        { status: 500 }
      )
    }

    // Get profiles data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('Profiles error:', profilesError)
    }

    // Combine user data with profile data
    const usersWithProfiles = users.map(user => {
      const profile = profiles?.find(p => p.id === user.id)
      return {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: profile?.role || 'customer',
        full_name: profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url
      }
    })

    return NextResponse.json({
      success: true,
      users: usersWithProfiles
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Use service role key for admin operations
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

    // Update user role in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update user role: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ User role updated successfully!'
    })

  } catch (error) {
    console.error('Update user role error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}