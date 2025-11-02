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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform profiles to match expected user structure
    const users = data?.map((profile: any) => ({
      id: profile.id,
      email: profile.email,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      last_sign_in_at: null,
      user_metadata: {
        full_name: profile.full_name
      },
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name
      }
    })) || []

    return NextResponse.json({
      data: users,
      total: count || 0,
      page,
      pageSize
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, profile, user_metadata, email, password } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Update user profile
    if (profile) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: id,
          ...profile,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // Update user metadata if provided
    if (user_metadata) {
      const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { user_metadata }
      )

      if (metadataError) {
        console.error('Metadata update error:', metadataError)
        return NextResponse.json({ error: metadataError.message }, { status: 500 })
      }
    }

    // Update email if provided
    if (email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { email }
      )

      if (emailError) {
        console.error('Email update error:', emailError)
        return NextResponse.json({ error: emailError.message }, { status: 500 })
      }
    }

    // Update password if provided
    if (password) {
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { password }
      )

      if (passwordError) {
        console.error('Password update error:', passwordError)
        return NextResponse.json({ error: passwordError.message }, { status: 500 })
      }
    }

    // Return updated user data
    const { data: updatedProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (updatedProfile) {
      const user = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at,
        last_sign_in_at: null,
        user_metadata: {
          full_name: updatedProfile.full_name
        },
        profile: {
          id: updatedProfile.id,
          role: updatedProfile.role,
          full_name: updatedProfile.full_name
        }
      }

      return NextResponse.json({ data: user })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Delete user from profiles table
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { id: userId } })
  } catch (error: any) {
    console.error('Delete API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}