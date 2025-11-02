import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
    }

    // Create response that clears all Supabase cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear all Supabase-related cookies
    response.cookies.set('sb-access-token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })

    response.cookies.set('sb-refresh-token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })

    // Clear any other potential Supabase cookies
    response.cookies.set('sb-lyteoxnqkjrpilrfcimc-auth-token', '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}