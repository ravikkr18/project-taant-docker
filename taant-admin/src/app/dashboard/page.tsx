import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Taant Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="outline">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">1,234</p>
                  <p className="text-sm text-gray-600 mt-1">+12% from last month</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">456</p>
                  <p className="text-sm text-gray-600 mt-1">+23 new this week</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">789</p>
                  <p className="text-sm text-gray-600 mt-1">+8% from last month</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">$45.6K</p>
                  <p className="text-sm text-gray-600 mt-1">+15% from last month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">New user registration</span>
                      <span className="text-xs text-gray-500">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Product order #1234</span>
                      <span className="text-xs text-gray-500">5 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Supplier verification</span>
                      <span className="text-xs text-gray-500">10 minutes ago</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link href="/admin">
                      <Button className="w-full justify-start">
                        Manage Users
                      </Button>
                    </Link>
                    <Button className="w-full justify-start" variant="outline" disabled>
                      View Products (Coming Soon)
                    </Button>
                    <Button className="w-full justify-start" variant="outline" disabled>
                      Process Orders (Coming Soon)
                    </Button>
                    <Button className="w-full justify-start" variant="outline" disabled>
                      View Analytics (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}