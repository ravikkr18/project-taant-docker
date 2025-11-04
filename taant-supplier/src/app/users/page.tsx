'use client'

import { useState, useEffect } from 'react'
import { AdminLayoutWithLoading } from '../../components/layout/admin-layout'
import RefinedUsers from './refined-users'

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Show loading for at least 500ms to avoid flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AdminLayoutWithLoading loading={isLoading}>
      <RefinedUsers />
    </AdminLayoutWithLoading>
  )
}