'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        console.log('Fetching profiles via API...')
        const response = await fetch('/api/admin/users')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch profiles')
        }

        const data = await response.json()
        console.log('Profiles data:', data)
        setProfiles(data.data || [])
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page - Database Connection</h1>

      {loading && <p>Loading...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
        <p><strong>SUPABASE_SERVICE_ROLE_KEY:</strong> {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'}</p>
      </div>

      <div className="bg-white border rounded">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">Profiles Table Data ({profiles.length} records)</h2>
        </div>

        {profiles.length === 0 ? (
          <div className="p-4 text-gray-500">
            No profiles found. You may need to create some test users.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {profile.id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        profile.role === 'admin' ? 'bg-red-100 text-red-800' :
                        profile.role === 'supplier' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {profile.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Test Admin Login</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600 mb-2">Test credentials:</p>
          <div className="space-y-1 text-sm font-mono">
            <p>Email: admin.test@gmail.com</p>
            <p>Password: (unknown - needs to be set)</p>
            <p>Email: admin@taant.com</p>
            <p>Password: (unknown - needs to be set)</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: Users exist but may need passwords set in Supabase dashboard
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>If you see no data, you may need to run the SQL scripts to create test users.</p>
        <p>Check the browser console for detailed debugging information.</p>
        <p>Users exist but may need passwords set in Supabase Auth dashboard.</p>
      </div>
    </div>
  )
}