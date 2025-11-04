import { AuthProvider } from '@refinedev/core'
import { supabase } from '../../lib/supabase/client'

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error,
      }
    }

    if (data.user) {
      // Check if user is supplier
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'supplier') {
        await supabase.auth.signOut()
        return {
          success: false,
          error: {
            name: 'AccessDenied',
            message: 'Access denied. Supplier privileges required.',
          },
        }
      }
    }

    return {
      success: true,
      redirectTo: '/dashboard',
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return {
        success: false,
        error,
      }
    }

    return {
      success: true,
      redirectTo: '/login',
    }
  },

  onError: async (error) => {
    console.error(error)
    return { error }
  },

  check: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return {
          authenticated: false,
          error: {
            message: 'Check failed',
            name: 'Not authenticated',
          },
          logout: true,
          redirectTo: '/login',
        }
      }

      // Check if user is supplier
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'supplier') {
        return {
          authenticated: false,
          error: {
            message: 'Access denied. Supplier privileges required.',
            name: 'AccessDenied',
          },
          logout: true,
          redirectTo: '/login',
        }
      }

      return {
        authenticated: true,
      }
    } catch (error: any) {
      return {
        authenticated: false,
        error: {
          message: 'Check failed',
          name: error.name,
        },
        logout: true,
        redirectTo: '/login',
      }
    }
  },

  getIdentity: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        name: profile?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url,
        role: profile?.role || 'supplier',
      }
    }

    return null
  },

  getPermissions: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      return profile?.role || 'supplier'
    }

    return null
  },
}