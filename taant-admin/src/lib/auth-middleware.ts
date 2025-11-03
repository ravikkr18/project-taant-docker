import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client for auth checks
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function verifyAuth(request: NextRequest): Promise<{ user: any, profile: any } | null> {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '') ||
                      request.cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return null
    }

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)

    if (authError || !user) {
      return null
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return null
    }

    return { user, profile }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export function withAuth(handler: (request: NextRequest, context: { user: any, profile: any }) => Promise<NextResponse>) {
  return async (request: NextRequest, context: any) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    }

    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    return handler(request, { ...context, user: auth.user, profile: auth.profile })
  }
}