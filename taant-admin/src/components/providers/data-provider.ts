import { DataProvider, CrudFilter, CrudSort } from '@refinedev/core'
import { supabase } from '../../lib/supabase/client'

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  return headers
}

// Note: We don't create supabaseAdmin here because environment variables
// are not available on the client side. All admin operations go through API routes.

const dataProviderWithUsers: DataProvider = {
  getOne: async ({ resource, id, meta }) => {
    if (resource === 'users') {
      // Use API route to get single user
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/users?id=${id}`, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch user')
      }

      const data = await response.json()
      return { data: data.data }
    }

    const { data, error } = await supabase
      .from(resource)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { data }
  },

  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    if (resource === 'users') {
      // Use API route to fetch users
      const params = new URLSearchParams()

      if (pagination) {
        params.set('page', pagination.current?.toString() || '1')
        params.set('pageSize', pagination.pageSize?.toString() || '10')
      }

      // Apply filters
      if (filters) {
        filters.forEach((filter: CrudFilter) => {
          if ('field' in filter && 'operator' in filter && 'value' in filter) {
            if (filter.field === 'email' && filter.operator === 'contains') {
              params.set('search', filter.value as string)
            } else if (filter.field === 'profile.role' && filter.operator === 'eq') {
              params.set('role', filter.value as string)
            }
          }
        })
      }

      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        let errorMessage = 'Failed to fetch users'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If error response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      return {
        data: data.data || [],
        total: data.total || 0,
      }
    }

    let query = supabase.from(resource).select('*', { count: 'exact' })

    // Apply filters
    if (filters) {
      filters.forEach((filter: CrudFilter) => {
        if ('field' in filter && 'operator' in filter && 'value' in filter) {
          if (filter.operator === 'eq') {
            query = query.eq(filter.field, filter.value)
          } else if (filter.operator === 'ne') {
            query = query.neq(filter.field, filter.value)
          } else if (filter.operator === 'contains') {
            query = query.ilike(filter.field, `%${filter.value}%`)
          } else if (filter.operator === 'in') {
            query = query.in(filter.field, Array.isArray(filter.value) ? filter.value : [filter.value])
          }
        }
      })
    }

    // Apply sorting
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0]
      query = query.order(sorter.field, { ascending: sorter.order === 'asc' })
    }

    // Apply pagination
    if (pagination) {
      const current = pagination.current || 1
      const pageSize = pagination.pageSize || 10
      const from = (current - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
    }
  },

  create: async ({ resource, variables, meta }) => {
    if (resource === 'users') {
      throw new Error('User creation should be handled through auth endpoint')
    }

    const { data, error } = await supabase
      .from(resource)
      .insert(variables)
      .select()
      .single()

    if (error) throw error

    return { data }
  },

  update: async ({ resource, id, variables, meta }) => {
    if (resource === 'users') {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          id,
          ...variables
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      const data = await response.json()
      return { data: data.data }
    }

    const { data, error } = await supabase
      .from(resource)
      .update(variables)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data }
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    if (resource === 'users') {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      const data = await response.json()
      return { data: data.data as any }
    }

    const { error } = await supabase
      .from(resource)
      .delete()
      .eq('id', id)

    if (error) throw error

    return { data: { id } as any }
  },

  getApiUrl: () => {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  },

  custom: async ({ url, method, payload, headers, meta }) => {
    // For custom API calls
    throw new Error('Custom API calls not implemented')
  },
}

export { dataProviderWithUsers }