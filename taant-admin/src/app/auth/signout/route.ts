import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Signout error:', error)
  }

  // Redirect to login page
  const response = NextResponse.redirect(new URL('/login', request.url))

  // Clear auth cookies
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')

  return response
}