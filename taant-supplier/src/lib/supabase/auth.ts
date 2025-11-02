import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}