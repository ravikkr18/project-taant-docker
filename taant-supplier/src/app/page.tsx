'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { user, session } = useAuth()

  useEffect(() => {
    if (user && session) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [user, session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}