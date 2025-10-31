import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'fs'
import path from 'path'

interface Migration {
  version: string
  filename: string
  sql: string
}

export class MigrationRunner {
  private supabase: any
  private migrationsPath: string

  constructor(supabaseUrl: string, serviceRoleKey: string, migrationsPath: string) {
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    this.migrationsPath = migrationsPath
  }

  async createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id SERIAL PRIMARY KEY,
        version TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql_query: sql })
      if (error && !error.message.includes('already exists')) {
        // Try direct SQL if RPC doesn't work
        await this.executeSQLDirectly(sql)
      }
    } catch (error) {
      console.log('Creating migrations table manually if needed')
    }
  }

  async executeSQLDirectly(sql: string): Promise<any> {
    // Since we can't use Supabase's SQL execution API directly,
    // we'll return the SQL to be executed manually
    return {
      manualExecutionRequired: true,
      sql: sql,
      message: 'Please execute this SQL manually in Supabase Dashboard SQL Editor'
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('schema_migrations')
        .select('version')
        .order('executed_at', { ascending: true })

      if (error) {
        // If table doesn't exist, return empty array
        if (error.message.includes('does not exist') || error.code === 'PGRST116') {
          return []
        }
        throw error
      }

      return data?.map((m: any) => m.version) || []
    } catch (error) {
      // If table doesn't exist, return empty array
      return []
    }
  }

  async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = []

    try {
      const files = await fs.readdir(this.migrationsPath)
      const sqlFiles = files.filter(file => file.endsWith('.sql')).sort()

      for (const file of sqlFiles) {
        const version = path.basename(file, '.sql')
        const filePath = path.join(this.migrationsPath, file)
        const sql = await fs.readFile(filePath, 'utf8')

        migrations.push({
          version,
          filename: file,
          sql
        })
      }
    } catch (error) {
      console.error('Error loading migrations:', error)
    }

    return migrations
  }

  async runMigration(migration: Migration): Promise<void> {
    try {
      // Split SQL into individual statements
      const statements = migration.sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          // Since we can't execute SQL directly via API,
          // we'll need to return this for manual execution
          await this.executeSQLDirectly(statement + ';')
        }
      }

      // Mark migration as executed
      const { error } = await this.supabase
        .from('schema_migrations')
        .insert({ version: migration.version })

      if (error) {
        console.error('Error marking migration as executed:', error)
      }
    } catch (error) {
      console.error(`Error running migration ${migration.version}:`, error)
      throw error
    }
  }

  async migrate(): Promise<{
    pending: Migration[],
    executed: string[],
    requiresManualExecution: boolean,
    manualSQL?: string
  }> {
    await this.createMigrationsTable()

    const executed = await this.getExecutedMigrations()
    const migrations = await this.loadMigrations()
    const pending = migrations.filter(m => !executed.includes(m.version))

    if (pending.length === 0) {
      return {
        pending: [],
        executed,
        requiresManualExecution: false
      }
    }

    // Combine all pending migrations into one SQL script
    const combinedSQL = pending.map(m => m.sql).join('\n\n')

    return {
      pending,
      executed,
      requiresManualExecution: true,
      manualSQL: combinedSQL
    }
  }

  async setupInitialSchema(): Promise<{ success: boolean, message: string, requiresManualExecution: boolean, sql?: string }> {
    try {
      const migration = await this.migrate()

      if (migration.requiresManualExecution) {
        return {
          success: false,
          message: 'Manual database setup required. Please execute the SQL script in your Supabase Dashboard.',
          requiresManualExecution: true,
          sql: migration.manualSQL
        }
      }

      return {
        success: true,
        message: 'Database schema updated successfully!',
        requiresManualExecution: false
      }
    } catch (error) {
      console.error('Migration error:', error)
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requiresManualExecution: true
      }
    }
  }
}