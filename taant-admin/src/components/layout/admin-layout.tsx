'use client'

import { ReactNode } from 'react'
import { Sidebar } from '../ui/sidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0">
          <div className="lg:pl-0 pt-16 lg:pt-0">
            <div className="p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}