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

    const result = await cli.init()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Supabase init error:', error)
    return NextResponse.json(
      {
        success: false,
        message: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}