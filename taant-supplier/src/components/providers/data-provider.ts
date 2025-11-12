import { DataProvider } from '@refinedev/core'
import { supabase } from '../../lib/supabase/client'

// Simple mock data provider to get build working
const dataProvider = {
  getOne: async (params: any) => ({ data: { id: params.id } }),
  getList: async (params: any) => ({ data: [], total: 0 }),
  create: async (params: any) => ({ data: params.variables }),
  update: async (params: any) => ({ data: { ...params.variables, id: params.id } }),
  deleteOne: async (params: any) => ({ data: { id: params.id } }),
  bulkCreate: async (params: any) => ({ data: [] }),
  bulkUpdate: async (params: any) => ({ data: [] }),
  bulkDelete: async (params: any) => ({ data: { deleted: [] } }),
}

export const dataProviderWithProducts = dataProvider as any