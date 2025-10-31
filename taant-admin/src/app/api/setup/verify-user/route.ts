import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use service role key to bypass email verification
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

    // Get the user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()

    if (getUserError) {
      return NextResponse.json(
        { error: 'Failed to get users: ' + getUserError.message },
        { status: 500 }
      )
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user to confirm email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          email_verified: true
        }
      }
    )

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email: ' + updateError.message },
        { status: 500 }
      )
    }

    // Update profile to set admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't fail completely
    }

    return NextResponse.json({
      success: true,
      message: '✅ User email verified and admin role assigned successfully!'
    })

  } catch (error) {
    console.error('User verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}