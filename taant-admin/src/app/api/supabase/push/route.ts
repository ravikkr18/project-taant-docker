import { NextRequest, NextResponse } from 'next/server'
import { SupabaseCLI } from '@/lib/supabase-cli'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations')
    const cli = new SupabaseCLI(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      migrationsPath
    )

    const result = await cli.push()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        applied: result.applied.map(m => ({
          version: m.version,
          name: m.name,
          filename: m.filename
        }))
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
        applied: result.applied.map(m => ({
          version: m.version,
          name: m.name,
          filename: m.filename
        })),
        pending: result.pending.map(m => ({
          version: m.version,
          name: m.name,
          filename: m.filename
        }))
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Supabase push error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Push failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}