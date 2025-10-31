import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Delete user profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      // Continue with user deletion even if profile deletion fails
    }

    // Delete admin user record if exists
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId)

    if (adminError) {
      console.error('Admin user deletion error:', adminError)
      // Continue with user deletion even if admin record deletion fails
    }

    // Delete the user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete user: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ User deleted successfully!'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}