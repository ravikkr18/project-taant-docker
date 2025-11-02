import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: 'All Supabase cookies cleared. Please refresh the page.'
  })

  // Clear all possible Supabase-related cookies
  const cookies = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-lyteoxnqkjrpilrfcimc-auth-token',
    'sb-lyteoxnqkjrpilrfcimc-refresh-token'
  ]

  cookies.forEach(cookie => {
    response.cookies.set(cookie, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })
  })

  return response
}