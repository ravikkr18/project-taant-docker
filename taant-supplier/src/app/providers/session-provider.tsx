'use client'

import { createClient } from '@/lib/supabase/client'
import { AuthProvider } from '@/contexts/auth-context'

const supabaseClient = createClient()

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}