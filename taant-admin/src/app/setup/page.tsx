'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface Migration {
  version: string
  name: string
  filename: string
  timestamp: string
}

interface CLIStatus {
  success: boolean
  message: string
  applied: string[]
  pending: Migration[]
}

export default function SetupPage() {
  const [status, setStatus] = useState<CLIStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [initLoading, setInitLoading] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAdminForm, setShowAdminForm] = useState(false)

  // Admin user form state
  const [adminEmail, setAdminEmail] = useState('admin@taant.com')
  const [adminPassword, setAdminPassword] = useState('Admin@123!')
  const [adminFullName, setAdminFullName] = useState('Admin User')
  const [adminRole, setAdminRole] = useState('Super Admin')

  const router = useRouter()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/supabase/status')
      const data = await response.json()
      setStatus(data)

      if (data.success && data.pending.length === 0) {
        setShowAdminForm(true)
      }
    } catch (error) {
      setError('Failed to check migration status')
    } finally {
      setLoading(false)
    }
  }

  const initializeProject = async () => {
    setInitLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/supabase/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        await checkStatus()
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('An unexpected error occurred during initialization')
    } finally {
      setInitLoading(false)
    }
  }

  const pushMigrations = async () => {
    setPushLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/supabase/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`${data.message}

Applied migrations:
${data.applied.map((m: any) => `✅ ${m.name} (${m.filename})`).join('\n')}`)

        await checkStatus()
        if (data.applied.length > 0) {
          setShowAdminForm(true)
        }
      } else {
        setError(data.message)
        if (data.applied && data.applied.length > 0) {
          setMessage(`Partially applied:
${data.applied.map((m: any) => `✅ ${m.name}`).join('\n')}`)
        }
      }
    } catch (error) {
      setError('An unexpected error occurred while pushing migrations')
    } finally {
      setPushLoading(false)
    }
  }

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const originalText = (e.target as HTMLFormElement).querySelector('button[type="submit"]')?.textContent
    const submitButton = (e.target as HTMLFormElement).querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitButton) submitButton.textContent = 'Creating admin user...'

    try {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          fullName: adminFullName,
          role: adminRole
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ Admin user created successfully!

        Login Credentials:
        Email: ${adminEmail}
        Password: ${adminPassword}
        Role: ${adminRole}

        Redirecting to login page...`)

        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Failed to create admin user')
      }
    } catch (error) {
      setError('An unexpected error occurred while creating admin user')
    } finally {
      if (submitButton) submitButton.textContent = originalText
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking project status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31 2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31-2.37-2.37a1.724 1.724 0 00-2.572-1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573 1.066c-1.543-.94-3.31.826-2.37 2.37a1.724 1.724 0 00-1.065 2.572c-1.756.426-1.756 2.924 0 3.35a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 002.572-1.065c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573-1.066c1.543.94 3.31-.826 2.37-2.37a1.724 1.724 0 001.065-2.572c1.756-.426 1.756-2.924 0-3.35z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Taant Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Automated Supabase CLI-based setup
          </p>
        </div>

        {/* Migration Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Migration Status</h3>
            <Button
              onClick={checkStatus}
              variant="outline"
              size="sm"
            >
              🔄 Refresh
            </Button>
          </div>

          {status && (
            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${status.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm font-medium ${status.success ? 'text-green-800' : 'text-red-800'}`}>
                  {status.message}
                </p>
              </div>

              {status.applied.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Migrations ({status.applied.length})</h4>
                  <div className="space-y-1">
                    {status.applied.map(version => (
                      <div key={version} className="flex items-center text-sm text-green-600">
                        <span className="mr-2">✅</span>
                        <span>{version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status.pending.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Pending Migrations ({status.pending.length})</h4>
                  <div className="space-y-1">
                    {status.pending.map(migration => (
                      <div key={migration.version} className="flex items-center text-sm text-orange-600">
                        <span className="mr-2">⏳</span>
                        <div>
                          <span className="font-medium">{migration.name}</span>
                          <span className="text-gray-500 ml-2">({migration.filename})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="text-sm whitespace-pre-line">{message}</p>
          </div>
        )}

        {/* Setup Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Actions</h3>
          <div className="space-y-4">
            {/* Initialize Project */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Initialize Project</h4>
                <p className="text-sm text-gray-600">Create initial migration files</p>
              </div>
              <Button
                onClick={initializeProject}
                disabled={initLoading}
                variant="outline"
                size="sm"
              >
                {initLoading ? 'Initializing...' : 'Init'}
              </Button>
            </div>

            {/* Push Migrations */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Push Migrations</h4>
                <p className="text-sm text-gray-600">Apply pending migrations to database</p>
              </div>
              <Button
                onClick={pushMigrations}
                disabled={pushLoading || (status?.pending.length === 0)}
                size="sm"
              >
                {pushLoading ? 'Pushing...' : 'Push'}
              </Button>
            </div>
          </div>
        </div>

        {/* Admin User Creation */}
        {showAdminForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Admin User
            </h3>
            <form onSubmit={createAdminUser} className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@taant.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminFullName">Full Name</Label>
                <Input
                  id="adminFullName"
                  type="text"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  placeholder="Admin User"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminRole">Admin Role</Label>
                <select
                  id="adminRole"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full"
              >
                Create Admin User
              </Button>
            </form>
          </div>
        )}

        {/* Already Setup */}
        {status?.success && status.pending.length === 0 && !showAdminForm && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Database is set up! You can now create an admin user.
            </p>
            <Button
              onClick={() => setShowAdminForm(true)}
              className="w-full"
            >
              Create Admin User
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}