'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/datatable'
import { ColumnDef } from '@tanstack/react-table'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Activity,
  Globe,
  Building,
  BarChart3,
  User,
  Server,
  Wifi
} from 'lucide-react'

const metrics = [
  {
    title: 'Total Revenue',
    value: '$45,678',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Compared to last month'
  },
  {
    title: 'Active Users',
    value: '12,543',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Monthly active users'
  },
  {
    title: 'Total Orders',
    value: '3,456',
    change: '+15.3%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Orders this month'
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '-0.8%',
    trend: 'down',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Purchase conversion'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'user',
    title: 'New user registration',
    description: 'John Doe joined the platform',
    time: '2 minutes ago',
    icon: UserPlus,
    color: 'text-blue-500'
  },
  {
    id: 2,
    type: 'order',
    title: 'Premium order #1234',
    description: 'Customer purchased 5 items',
    time: '5 minutes ago',
    icon: ShoppingCart,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'alert',
    title: 'Payment verification required',
    description: 'Order #1233 needs manual review',
    time: '10 minutes ago',
    icon: AlertTriangle,
    color: 'text-orange-500'
  },
  {
    id: 4,
    type: 'system',
    title: 'Database backup completed',
    description: 'Scheduled backup successful',
    time: '15 minutes ago',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    id: 5,
    type: 'user',
    title: 'New supplier registration',
    description: 'Tech Solutions Inc. applied',
    time: '20 minutes ago',
    icon: Building,
    color: 'text-purple-500'
  }
]

const topProducts = [
  {
    id: 1,
    name: 'Premium Package',
    sales: 245,
    revenue: '$24,500',
    growth: '+12%',
    status: 'active'
  },
  {
    id: 2,
    name: 'Professional Plan',
    sales: 189,
    revenue: '$18,900',
    growth: '+8%',
    status: 'active'
  },
  {
    id: 3,
    name: 'Basic Plan',
    sales: 156,
    revenue: '$7,800',
    growth: '-3%',
    status: 'active'
  },
  {
    id: 4,
    name: 'Enterprise Solution',
    sales: 98,
    revenue: '$49,000',
    growth: '+25%',
    status: 'featured'
  }
]

const productColumns: ColumnDef<typeof topProducts[0]>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-gray-50 rounded flex items-center justify-center">
          <Package className="h-3 w-3 text-gray-500" />
        </div>
        <span className="text-xs font-medium text-gray-800">{row.getValue('name')}</span>
        {row.original.status === 'featured' && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 h-auto border-orange-200 text-orange-600">
            Featured
          </Badge>
        )}
      </div>
    ),
    enableSorting: true,
    enableFiltering: true,
  },
  {
    accessorKey: 'sales',
    header: 'Sales',
    cell: ({ row }) => (
      <span className="text-xs text-gray-600 font-medium">{row.getValue('sales')}</span>
    ),
    enableSorting: true,
    enableFiltering: false,
  },
  {
    accessorKey: 'revenue',
    header: 'Revenue',
    cell: ({ row }) => (
      <span className="text-xs text-gray-600 font-medium">{row.getValue('revenue')}</span>
    ),
    enableSorting: true,
    enableFiltering: false,
  },
  {
    accessorKey: 'growth',
    header: 'Growth',
    cell: ({ row }) => {
      const growth = row.getValue('growth') as string
      const isPositive = growth.startsWith('+')
      return (
        <Badge
          variant={isPositive ? 'default' : 'secondary'}
          className="text-[10px] px-2 py-0.5 h-auto"
        >
          {growth}
        </Badge>
      )
    },
    enableSorting: true,
    enableFiltering: false,
  },
]

const activityColumns: ColumnDef<typeof recentActivities[0]>[] = [
  {
    accessorKey: 'title',
    header: 'Activity',
    cell: ({ row }) => (
      <div className="flex items-start gap-2">
        <div className={`p-1 rounded-full ${row.original.color} bg-opacity-10 flex-shrink-0`}>
          <row.original.icon className={`h-3 w-3 ${row.original.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 leading-tight">{row.getValue('title')}</p>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{row.original.description}</p>
          <p className="text-[9px] text-gray-300 mt-1">{row.original.time}</p>
        </div>
      </div>
    ),
    enableSorting: false,
    enableFiltering: true,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const colors = {
        user: 'bg-blue-50 text-blue-600 border-blue-200',
        order: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        alert: 'bg-orange-50 text-orange-600 border-orange-200',
        system: 'bg-gray-50 text-gray-600 border-gray-200'
      }
      return (
        <Badge variant="outline" className={`text-[9px] px-2 py-0.5 h-auto ${colors[type as keyof typeof colors] || colors.system}`}>
          {type}
        </Badge>
      )
    },
    enableSorting: true,
    enableFiltering: true,
  },
  {
    accessorKey: 'time',
    header: 'Time',
    cell: ({ row }) => (
      <span className="text-xs text-gray-400">{row.getValue('time')}</span>
    ),
    enableSorting: false,
    enableFiltering: false,
  },
]

const systemStats = [
  {
    label: 'Server Uptime',
    value: '99.9%',
    status: 'healthy',
    icon: CheckCircle
  },
  {
    label: 'Response Time',
    value: '245ms',
    status: 'good',
    icon: Clock
  },
  {
    label: 'Active Sessions',
    value: '1,234',
    status: 'normal',
    icon: Users
  },
  {
    label: 'Storage Used',
    value: '67%',
    status: 'warning',
    icon: Activity
  }
]

export default function DashboardAnalytics() {
  return (
    <div className="space-y-5">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-4">
              <CardTitle className="text-xs font-medium text-gray-500">
                {metric.title}
              </CardTitle>
              <div className={`p-1.5 rounded-md ${metric.bgColor}`}>
                <metric.icon className={`h-3.5 w-3.5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-baseline justify-between">
                <div className="text-xl font-bold text-gray-900">
                  {metric.value}
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-gray-800">Revenue Overview</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Monthly revenue trend for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center border border-gray-100 bg-gray-50/50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">Revenue Chart</p>
                <p className="text-xs text-gray-300">Chart visualization will be added here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <DataTable
          columns={activityColumns}
          data={recentActivities}
          title="Recent Activities"
          description="Latest system and user activities"
          searchPlaceholder="Search activities..."
          enableMultiSelect={false}
          enableSearch={true}
          enableFilters={true}
          enableSorting={true}
          enablePagination={false}
          pageSize={5}
        />
      </div>

      {/* Products and System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <DataTable
          columns={productColumns}
          data={topProducts}
          title="Top Products"
          description="Best performing products this month"
          searchPlaceholder="Search products..."
          enableMultiSelect={true}
          enableSearch={true}
          enableFilters={true}
          enableSorting={true}
          enablePagination={false}
          pageSize={5}
        />

        {/* System Statistics */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-gray-800">System Status</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Real-time system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      stat.status === 'healthy' ? 'bg-emerald-50' :
                      stat.status === 'warning' ? 'bg-orange-50' :
                      stat.status === 'good' ? 'bg-blue-50' :
                      'bg-gray-50'
                    }`}>
                      <stat.icon className={`h-4 w-4 ${
                        stat.status === 'healthy' ? 'text-emerald-600' :
                        stat.status === 'warning' ? 'text-orange-600' :
                        stat.status === 'good' ? 'text-blue-600' :
                        'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">{stat.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{stat.value}</p>
                    <Badge
                      variant={
                        stat.status === 'healthy' ? 'default' :
                        stat.status === 'warning' ? 'destructive' :
                        stat.status === 'good' ? 'secondary' :
                        'outline'
                      }
                      className="text-[10px] px-2 py-0.5 h-auto"
                    >
                      {stat.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Overview */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-gray-800">Website Traffic Overview</CardTitle>
          <CardDescription className="text-xs text-gray-400">
            User engagement and traffic analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mx-auto mb-3">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-gray-800">45.2K</p>
              <p className="text-xs text-gray-400 mt-1">Page Views</p>
              <Badge variant="secondary" className="mt-2 text-[10px] px-2 py-0.5 h-auto">+15%</Badge>
            </div>
            <div className="text-center p-4 bg-gray-50/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg mx-auto mb-3">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-gray-800">12.8K</p>
              <p className="text-xs text-gray-400 mt-1">Unique Visitors</p>
              <Badge variant="secondary" className="mt-2 text-[10px] px-2 py-0.5 h-auto">+8%</Badge>
            </div>
            <div className="text-center p-4 bg-gray-50/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg mx-auto mb-3">
                <MousePointer className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-gray-800">3.2%</p>
              <p className="text-xs text-gray-400 mt-1">Click Rate</p>
              <Badge variant="destructive" className="mt-2 text-[10px] px-2 py-0.5 h-auto">-2%</Badge>
            </div>
            <div className="text-center p-4 bg-gray-50/50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg mx-auto mb-3">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-xl font-bold text-gray-800">4m 32s</p>
              <p className="text-xs text-gray-400 mt-1">Avg. Duration</p>
              <Badge variant="secondary" className="mt-2 text-[10px] px-2 py-0.5 h-auto">+18%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}