import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create Supabase client with official SSR pattern
    const supabase = createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // Let Supabase handle cookies automatically
          },
          remove(name, options) {
            // Let Supabase handle cookies automatically
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log('Authentication failed:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    // Check supplier role using service client (same as admin panel)
    const serviceClient = createServiceClient()
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || profile.role !== 'supplier') {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Access denied. Supplier privileges required.' },
        { status: 403 }
      )
    }

    console.log('API: Supplier verified, session created by Supabase SSR')

    // Return success response - no manual cookie handling needed
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role
      }
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}