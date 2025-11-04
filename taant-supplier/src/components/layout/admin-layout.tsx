'use client'

import { ReactNode } from 'react'
import { Spin } from 'antd'
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

// Loading component with page-level indicator
export function AdminLayoutWithLoading({ children, loading }: { children: ReactNode, loading?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Loading Indicator */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 h-1">
          <div className="h-full bg-white animate-pulse" style={{ width: '30%' }}></div>
        </div>
      )}

      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0">
          <div className="lg:pl-0 pt-16 lg:pt-0">
            <div className="p-6 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-500">Loading users...</div>
                  </div>
                </div>
              ) : (
                children
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}