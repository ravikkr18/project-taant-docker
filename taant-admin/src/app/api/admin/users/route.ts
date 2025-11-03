import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../../lib/auth-middleware'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Admin client with service role key for admin operations
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

export const GET = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    // Debug environment variables
    console.log('Users API - Environment check:', {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      supabaseAdmin: !!supabaseAdmin,
      nodeEnv: process.env.NODE_ENV,
      userId: user.id
    })

    if (!supabaseAdmin) {
      console.error('Users API - Supabase admin client not initialized')
      return NextResponse.json(
        {
          error: 'Server configuration error - missing Supabase credentials',
          debug: {
            supabaseUrl: !!supabaseUrl,
            supabaseServiceKey: !!supabaseServiceKey,
            nodeEnv: process.env.NODE_ENV
          }
        },
        { status: 500 }
      )
    }

    // Safely get search params, handling potential URL parsing issues
    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      // Fallback for URL parsing issues - use NextRequest's built-in URL parsing
      searchParams = request.nextUrl.searchParams
    }
    const userId = searchParams.get('id')

    // Handle single user request
    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Single user fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Transform to match expected user structure
      const userData = {
        id: data.id,
        email: data.email,
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_sign_in_at: data.last_sign_in_at,
        user_metadata: {
          full_name: data.full_name
        },
        profile: {
          id: data.id,
          role: data.role,
          full_name: data.full_name,
          status: data.status || 'active'
        }
      }

      return NextResponse.json({ data: userData })
    }

    // Handle multiple users request
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
      last_sign_in_at: profile.last_sign_in_at,
      user_metadata: {
        full_name: profile.full_name
      },
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
        status: profile.status || 'active'
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
})

export const PUT = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    const { id, profile: profileData, user_metadata, email, password, status } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Update user profile
    if (profileData || status !== undefined) {
      const updateData = {
        ...profileData,
        ...(status !== undefined && { status }),
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: id,
          ...updateData
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
      const userData = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at,
        last_sign_in_at: updatedProfile.last_sign_in_at,
        user_metadata: {
          full_name: updatedProfile.full_name
        },
        profile: {
          id: updatedProfile.id,
          role: updatedProfile.role,
          full_name: updatedProfile.full_name,
          status: updatedProfile.status || 'active'
        }
      }

      return NextResponse.json({ data: userData })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
})

export const DELETE = withAuth(async (request: NextRequest, { user, profile }) => {
  try {
    // Safely get search params, handling potential URL parsing issues
    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      // Fallback for URL parsing issues - use NextRequest's built-in URL parsing
      searchParams = request.nextUrl.searchParams
    }
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
})