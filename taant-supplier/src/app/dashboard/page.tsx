'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SupplierLayout from '@/components/supplier/supplier-layout'
import {
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
  Truck,
  BarChart3,
  Users,
  PackageOpen,
  Archive,
  Star,
  MessageSquare
} from 'lucide-react'

const metrics = [
  {
    title: 'Total Products',
    value: '234',
    change: '+12.5%',
    trend: 'up',
    icon: Package,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Active products listed'
  },
  {
    title: 'Pending Orders',
    value: '18',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Orders awaiting fulfillment'
  },
  {
    title: 'Monthly Revenue',
    value: '$45,678',
    change: '+15.3%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Revenue this month'
  },
  {
    title: 'Supplier Rating',
    value: '4.8',
    change: '+0.2',
    trend: 'up',
    icon: Star,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Average customer rating'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'order',
    title: 'New order #1234',
    description: 'Customer purchased 5 items',
    time: '2 minutes ago',
    icon: ShoppingCart,
    color: 'text-emerald-500'
  },
  {
    id: 2,
    type: 'product',
    title: 'Product updated',
    description: 'Stock levels adjusted',
    time: '5 minutes ago',
    icon: Package,
    color: 'text-blue-500'
  },
  {
    id: 3,
    type: 'shipping',
    title: 'Order shipped',
    description: 'Order #1233 dispatched',
    time: '10 minutes ago',
    icon: Truck,
    color: 'text-purple-500'
  },
  {
    id: 4,
    type: 'review',
    title: 'New review received',
    description: '5-star rating on Product X',
    time: '15 minutes ago',
    icon: Star,
    color: 'text-orange-500'
  },
  {
    id: 5,
    type: 'message',
    title: 'Customer inquiry',
    description: 'Question about delivery',
    time: '20 minutes ago',
    icon: MessageSquare,
    color: 'text-slate-500'
  }
]

const topProducts = [
  {
    id: 1,
    name: 'Premium Widget',
    sales: 89,
    revenue: '$8,900',
    growth: '+12%',
    stock: 45,
    status: 'active'
  },
  {
    id: 2,
    name: 'Professional Tool Set',
    sales: 67,
    revenue: '$13,400',
    growth: '+8%',
    stock: 23,
    status: 'active'
  },
  {
    id: 3,
    name: 'Basic Component',
    sales: 156,
    revenue: '$4,680',
    growth: '-3%',
    stock: 89,
    status: 'active'
  },
  {
    id: 4,
    name: 'Enterprise Solution',
    sales: 34,
    revenue: '$17,000',
    growth: '+25%',
    stock: 8,
    status: 'low_stock'
  }
]

export default function SupplierDashboard() {
  return (
    <SupplierLayout>
      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
              <PackageOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Supplier Dashboard</h1>
          </div>
          <p className="text-sm text-gray-400">Manage your products, orders, and business analytics</p>
        </div>

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
              <CardTitle className="text-sm font-semibold text-gray-800">Sales Overview</CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Monthly sales trend for the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center border border-gray-100 bg-gray-50/50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">Sales Chart</p>
                  <p className="text-xs text-gray-300">Sales visualization will be added here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Recent Activity</CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Latest business activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className={`p-1.5 rounded-full ${activity.color} bg-opacity-10 flex-shrink-0`}>
                      <activity.icon className={`h-3.5 w-3.5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 leading-tight">{activity.title}</p>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{activity.description}</p>
                      <p className="text-[9px] text-gray-300 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Products */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Top Products</CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Best performing products this month
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{product.name}</p>
                        <p className="text-[10px] text-gray-400">Stock: {product.stock}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-800">{product.sales} sold</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{product.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-800">Performance Metrics</CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Key business performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Order Fulfillment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">98.5%</p>
                    <div className="text-[10px] text-emerald-600">On-time delivery</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Customer Satisfaction</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">4.8/5.0</p>
                    <div className="text-[10px] text-blue-600">Average rating</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Archive className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Inventory Turnover</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">3.2x</p>
                    <div className="text-[10px] text-purple-600">Monthly rate</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-orange-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Growth Rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">+23%</p>
                    <div className="text-[10px] text-orange-600">Month over month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SupplierLayout>
  )
}