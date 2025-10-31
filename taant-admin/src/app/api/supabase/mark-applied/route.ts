import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Manually insert the initial migration as applied
    const { error } = await supabase
      .from('schema_migrations')
      .insert({
        version: '20251031_17245_initial_schema',
        executed_at: new Date().toISOString()
      })

    if (error) {
      // Check if it's a duplicate entry error (which is fine)
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: '✅ Migration already marked as applied'
        })
      }

      return NextResponse.json(
        { error: 'Failed to mark migration as applied: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ Initial migration marked as applied successfully!'
    })

  } catch (error) {
    console.error('Manual migration marking error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}