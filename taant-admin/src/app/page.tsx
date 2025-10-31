import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()

  try {
    // Check if database is set up
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('count')
      .limit(1)

    const tablesExist = !profilesError && !rolesError && profiles && roles

    // If tables don't exist, go to setup
    if (!tablesExist) {
      redirect('/setup')
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    // If any error occurs, assume database is not set up
    redirect('/setup')
  }
}