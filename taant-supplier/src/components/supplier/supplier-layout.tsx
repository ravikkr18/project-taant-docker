'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  HelpCircle,
  Building,
  CreditCard,
  MessageSquare,
  Truck,
  PackageOpen,
  TrendingUp,
  DollarSign,
  Users,
  Archive
} from 'lucide-react'

interface SupplierLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: 'My Products',
    href: '/products',
    icon: Package,
    current: false,
    badge: 'Manage'
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    current: false,
    badge: 'New'
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Archive,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
    current: false,
  },
  {
    name: 'Shipping',
    href: '/shipping',
    icon: Truck,
    current: false,
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    current: false,
    badge: '2'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    current: false,
  },
]

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, session } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        })
        router.push('/login')
      } else {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden bg-gray-50">
        <Topbar onMenuClick={() => setSidebarOpen(true)} onSignOut={handleSignOut} user={user} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="flex items-center h-14 flex-shrink-0 px-5 border-b border-gray-100">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-7 w-7 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center shadow-sm">
              <PackageOpen className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-sm font-semibold text-gray-800 tracking-tight">Taant Supplier</h1>
            <p className="text-xs text-gray-400">Supplier Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-slate-50 text-slate-700 border-l-2 border-slate-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.icon
                className={`mr-3 h-4 w-4 flex-shrink-0 ${
                  active ? 'text-slate-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
              {item.badge && (
                <Badge
                  variant={active ? "default" : "secondary"}
                  className="ml-auto text-[10px] px-1.5 py-0.5 h-auto"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex-shrink-0 flex border-t border-gray-100 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">Supplier Portal</p>
            <p className="text-[10px] text-gray-400">Business Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Topbar({ onMenuClick, onSignOut, user }: {
  onMenuClick: () => void
  onSignOut: () => void
  user: any
}) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 transition-all duration-200"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden lg:block">
            <div className="flex items-center text-xs text-gray-500">
              <PackageOpen className="h-3 w-3 mr-1.5" />
              <span className="font-medium">Supplier Dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-gray-50 transition-all duration-200 w-48 focus:w-56"
              />
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0 hover:bg-gray-50 transition-colors">
            <Bell className="h-4 w-4 text-gray-500" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-medium">3</span>
            </span>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50 transition-colors">
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-[10px] text-gray-400">Supplier</p>
            </div>
            <div className="h-7 w-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-[10px] font-medium">
                {(user?.user_metadata?.full_name || user?.email)?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}