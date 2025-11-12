'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Typography, Progress, Tag } from 'antd'
import {
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  InboxOutlined,
  RiseOutlined,
  EyeOutlined,
  StarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function RefinedDashboard() {
  // Mock data for now - will be replaced with real API calls
  const stats = [
    {
      title: 'Total Products',
      value: 1248,
      icon: <ShopOutlined className="text-2xl text-blue-500" />,
      prefix: <ShopOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Active Products',
      value: 1102,
      icon: <InboxOutlined className="text-2xl text-green-500" />,
      prefix: <InboxOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Total Orders',
      value: 8647,
      icon: <ShoppingCartOutlined className="text-2xl text-orange-500" />,
      prefix: <ShoppingCartOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'Total Revenue',
      value: 284750,
      icon: <DollarOutlined className="text-2xl text-green-600" />,
      prefix: '$',
      color: '#52c41a'
    },
    {
      title: 'Product Views',
      value: 45892,
      icon: <EyeOutlined className="text-2xl text-purple-500" />,
      prefix: <EyeOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Avg Rating',
      value: 4.3,
      icon: <StarOutlined className="text-2xl text-yellow-500" />,
      prefix: <StarOutlined />,
      precision: 1,
      color: '#faad14'
    }
  ]

  const productStats = {
    total: 1248,
    active: 1102,
    outOfStock: 89,
    lowStock: 57,
    inactive: 146
  }

  const recentOrders = [
    { id: 'ORD-2024-001', product: 'Wireless Headphones', amount: 89.99, status: 'delivered' },
    { id: 'ORD-2024-002', product: 'Smart Watch', amount: 299.99, status: 'processing' },
    { id: 'ORD-2024-003', product: 'Laptop Stand', amount: 45.99, status: 'shipped' },
    { id: 'ORD-2024-004', product: 'USB-C Cable', amount: 19.99, status: 'pending' },
    { id: 'ORD-2024-005', product: 'Bluetooth Speaker', amount: 79.99, status: 'delivered' }
  ]

  const topProducts = [
    { name: 'Wireless Headphones', sales: 1247, revenue: 112179, rating: 4.5 },
    { name: 'Smart Watch', sales: 892, revenue: 267592, rating: 4.3 },
    { name: 'Laptop Stand', sales: 756, revenue: 34772, rating: 4.7 },
    { name: 'USB-C Cable', sales: 2341, revenue: 46809, rating: 4.1 }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'green'
      case 'shipped': return 'blue'
      case 'processing': return 'orange'
      case 'pending': return 'red'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2} className="mb-2">
          Supplier Dashboard Overview
        </Title>
        <Text type="secondary">
          Welcome to the Taant Supplier Panel. Here's what's happening with your products.
        </Text>
      </div>

      {/* Main Statistics */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={index}>
            <Card className="text-center hover:shadow-lg transition-shadow">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                precision={stat.precision}
                valueStyle={{ color: stat.color, fontSize: '28px', fontWeight: 'bold' }}
              />
              <div className="mt-2">
                {React.cloneElement(stat.icon, { style: { fontSize: '24px', color: stat.color } })}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Product Status Overview */}
      <Card title="Product Status Overview" className="h-full">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag color="green">Active</Tag>
                  <span className="ml-2">Active Products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    percent={Math.round((productStats.active / productStats.total) * 100)}
                    size="small"
                    showInfo={false}
                    strokeColor="#52c41a"
                  />
                  <Text className="font-medium">{productStats.active}</Text>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag color="orange">Low Stock</Tag>
                  <span className="ml-2">Low Stock Items</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    percent={Math.round((productStats.lowStock / productStats.total) * 100)}
                    size="small"
                    showInfo={false}
                    strokeColor="#fa8c16"
                  />
                  <Text className="font-medium">{productStats.lowStock}</Text>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag color="red">Out of Stock</Tag>
                  <span className="ml-2">Out of Stock</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    percent={Math.round((productStats.outOfStock / productStats.total) * 100)}
                    size="small"
                    showInfo={false}
                    strokeColor="#ff4d4f"
                  />
                  <Text className="font-medium">{productStats.outOfStock}</Text>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="space-y-4">
              <Text strong>Inventory Summary</Text>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{productStats.total}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{productStats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-2xl font-bold text-orange-600">{productStats.lowStock}</div>
                  <div className="text-sm text-gray-600">Low Stock</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-600">{productStats.outOfStock}</div>
                  <div className="text-sm text-gray-600">Out of Stock</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Orders" className="h-full">
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{order.product}</div>
                    <div className="text-sm text-gray-500">{order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${order.amount}</div>
                    <Tag color={getStatusColor(order.status)}>
                      {order.status}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Performing Products" className="h-full">
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {product.sales} sold • ${product.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <StarOutlined className="text-yellow-500 mr-1" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.sales} sales
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}