import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'No session token provided' }, { status: 400 })
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 })
    }

    // Revoke all sessions for the user
    const { error: revokeError } = await supabaseAdmin.auth.admin.signOut(user.id)

    if (revokeError) {
      console.error('Logout error:', revokeError)
      return NextResponse.json({ error: revokeError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error: any) {
    console.error('Logout API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}