'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { User, Session } from '@supabase/supabase-js'

interface SupabaseContextType {
  user: User | null
  session: Session | null
  supabase: SupabaseClient
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

interface SupabaseProviderProps {
  children: React.ReactNode
  client: SupabaseClient
}

export function SupabaseProvider({ children, client }: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [client])

  const value = {
    user,
    session,
    supabase: client,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}