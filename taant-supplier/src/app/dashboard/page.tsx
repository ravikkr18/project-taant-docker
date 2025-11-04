'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { AdminLayoutWithLoading } from '../../components/layout/admin-layout'
import { Users, Package, ShoppingCart, Plus } from 'lucide-react'
import Link from 'next/link'
import RefinedDashboard from './refined-dashboard'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Check if user is supplier
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'supplier') {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  
  return (
    <AdminLayoutWithLoading loading={loading}>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <div className="text-lg text-gray-600">Loading dashboard...</div>
          <div className="text-sm text-gray-400">Fetching user data and permissions</div>
        </div>
      ) : (
        <RefinedDashboard />
      )}
    </AdminLayoutWithLoading>
  )
}