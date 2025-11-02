import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Test login with provided credentials
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login test failed:', error)
      return NextResponse.json({
        error: error.message,
        hint: 'User may not exist or password is incorrect'
      }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user?.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        profile: profile
      }
    })
  } catch (error: any) {
    console.error('Test login error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}