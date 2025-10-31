import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabase = createClient()

  // Skip middleware for static files, API routes, and auth/setup pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth/signout') ||
    pathname.startsWith('/setup')
  ) {
    return NextResponse.next()
  }

  try {
    // Check if user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('Middleware: User check result:', {
      user: user?.email || 'undefined',
      hasUser: !!user,
      error: error?.message
    })

    if (error || !user) {
      console.log('Middleware: No user found, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role for protected routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      )

      const { data: profile } = await serviceClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'Access denied. Admin privileges required.')
        return NextResponse.redirect(loginUrl)
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}