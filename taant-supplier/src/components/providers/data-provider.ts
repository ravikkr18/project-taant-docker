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
// are not available on the client side. All supplier operations go through API routes.

const dataProvider: DataProvider = {
  getOne: async ({ resource, id, meta }) => {
    if (resource === 'products') {
      // Use API route to get single product
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/supplier/products?id=${id}`, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch product')
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
    if (resource === 'products') {
      // Use API route for products
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()

      // Add pagination
      if (pagination) {
        params.append('page', String(pagination.current))
        params.append('pageSize', String(pagination.pageSize))
      }

      // Add filters
      if (filters) {
        filters.forEach((filter: CrudFilter) => {
          if (filter.field && filter.operator) {
            params.append(filter.field, filter.value.toString())
          }
        })
      }

      // Add sort
      if (sorters && sorters.length > 0) {
        params.append('sort', sorters[0].field)
        params.append('order', sorters[0].order)
      }

      const response = await fetch(`/api/supplier/products?${params.toString()}`, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch products')
      }

      const data = await response.json()
      return {
        data: data.data,
        total: data.total,
      }
    }

    // Fallback to direct Supabase for other resources
    let query = supabase.from(resource).select('*', { count: 'exact' })

    // Apply filters
    if (filters) {
      filters.forEach((filter: CrudFilter) => {
        if (filter.field && filter.operator) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.field, filter.value)
              break
            case 'ne':
              query = query.neq(filter.field, filter.value)
              break
            case 'in':
              query = query.in(filter.field, filter.value)
              break
            case 'nin':
              query = query.not(filter.field, 'in', filter.value)
              break
            case 'contains':
              query = query.like(filter.field, `%${filter.value}%`)
              break
            case 'containss':
              query = query.ilike(filter.field, `%${filter.value}%`)
              break
            case 'gt':
              query = query.gt(filter.field, filter.value)
              break
            case 'gte':
              query = query.gte(filter.field, filter.value)
              break
            case 'lt':
              query = query.lt(filter.field, filter.value)
              break
            case 'lte':
              query = query.lte(filter.field, filter.value)
              break
            case 'null':
              query = query.is(filter.field, null)
              break
            case 'notnull':
              query = query.not(filter.field, 'is', null)
              break
          }
        }
      })
    }

    // Apply sorting
    if (sorters && sorters.length > 0) {
      sorters.forEach((sorter: CrudSort) => {
        query = query.order(sorter.field, { ascending: sorter.order === 'asc' })
      })
    }

    // Apply pagination
    if (pagination) {
      const from = (pagination.current - 1) * pagination.pageSize
      const to = from + pagination.pageSize - 1
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
    if (resource === 'products') {
      // Use API route for product creation
      const headers = await getAuthHeaders()
      const response = await fetch('/api/supplier/products', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(variables)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create product')
      }

      const data = await response.json()
      return { data: data.data }
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
    if (resource === 'products') {
      // Use API route for product updates
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/supplier/products?id=${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(variables)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update product')
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
    if (resource === 'products') {
      // Use API route for product deletion
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/supplier/products?id=${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete product')
      }

      return { data: { id } }
    }

    const { error } = await supabase.from(resource).delete().eq('id', id)

    if (error) throw error

    return { data: { id } }
  },

  // Add custom methods for bulk operations
  bulkCreate: async ({ resource, variables }) => {
    if (resource === 'products') {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/supplier/products/bulk', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ products: variables })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to bulk create products')
      }

      const data = await response.json()
      return { data: data.data }
    }

    const { data, error } = await supabase
      .from(resource)
      .insert(variables)
      .select()

    if (error) throw error

    return { data }
  },

  bulkUpdate: async ({ resource, ids, variables }) => {
    if (resource === 'products') {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/supplier/products/bulk', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ ids, variables })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to bulk update products')
      }

      const data = await response.json()
      return { data: data.data }
    }

    const { data, error } = await supabase
      .from(resource)
      .update(variables)
      .in('id', ids)
      .select()

    if (error) throw error

    return { data }
  },

  bulkDelete: async ({ resource, ids }) => {
    if (resource === 'products') {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/supplier/products/bulk', {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: JSON.stringify({ ids })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to bulk delete products')
      }

      return { data: { deleted: ids } }
    }

    const { error } = await supabase.from(resource).delete().in('id', ids)

    if (error) throw error

    return { data: { deleted: ids } }
  },
}

export { dataProvider as dataProviderWithProducts }