'use client'

import React from 'react'
import { Refine } from '@refinedev/core'
import { liveProvider, dataProvider as supabaseDataProvider } from '@refinedev/supabase'
import { authProvider } from './auth-provider'
import { dataProviderWithUsers } from './data-provider'
import { supabase } from '../../lib/supabase/client'
import { notificationProvider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'

interface RefineProviderProps {
  children: React.ReactNode
}

export function RefineProvider({ children }: RefineProviderProps) {
  return (
    <Refine
      dataProvider={dataProviderWithUsers}
      liveProvider={liveProvider(supabase)}
      authProvider={authProvider}
      notificationProvider={notificationProvider}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        projectId: 'taant-admin',
      }}
    >
      {children}
    </Refine>
  )
}