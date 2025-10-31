import { NextRequest, NextResponse } from 'next/server'
import { SupabaseCLI } from '@/lib/supabase-cli'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations')
    const cli = new SupabaseCLI(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      migrationsPath
    )

    const result = await cli.status()

    return NextResponse.json({
      success: true,
      message: result.message,
      applied: result.applied,
      pending: result.pending.map(m => ({
        version: m.version,
        name: m.name,
        filename: m.filename,
        timestamp: m.timestamp
      }))
    })
  } catch (error) {
    console.error('Supabase status error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}