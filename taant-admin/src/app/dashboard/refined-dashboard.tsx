'use client'

import React from 'react'
import { useList, useParsed } from '@refinedev/core'
import { Card, Row, Col, Statistic, Typography, Avatar, Progress, Tag } from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  InboxOutlined,
  TeamOutlined,
  RiseOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function RefinedDashboard() {
  const { data: usersData, isLoading: usersLoading } = useList({
    resource: 'users',
    meta: {
      select: 'id, email, created_at, last_sign_in_at, user_metadata'
    }
  })

  const users = usersData?.data || []

  // Calculate statistics
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.profile?.role === 'admin').length
  const supplierUsers = users.filter(u => u.profile?.role === 'supplier').length
  const customerUsers = users.filter(u => u.profile?.role === 'customer').length

  const activeUsers = users.filter(u => u.last_sign_in_at).length
  const recentUsers = users.filter(u => {
    const thirtyDaysAgo = dayjs().subtract(30, 'day')
    return dayjs(u.created_at).isAfter(thirtyDaysAgo)
  }).length

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      prefix: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Admin Users',
      value: adminUsers,
      icon: <TeamOutlined className="text-2xl text-red-500" />,
      prefix: <TeamOutlined />,
      color: '#f5222d'
    },
    {
      title: 'Suppliers',
      value: supplierUsers,
      icon: <InboxOutlined className="text-2xl text-green-500" />,
      prefix: <InboxOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Customers',
      value: customerUsers,
      icon: <ShoppingCartOutlined className="text-2xl text-orange-500" />,
      prefix: <ShoppingCartOutlined />,
      color: '#fa8c16'
    }
  ]

  const recentUserStats = [
    {
      title: 'Active Users',
      value: activeUsers,
      total: totalUsers,
      icon: <RiseOutlined className="text-green-500" />
    },
    {
      title: 'New Users (30 days)',
      value: recentUsers,
      total: totalUsers,
      icon: <UserOutlined className="text-blue-500" />
    }
  ]

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="mb-2">
          Dashboard Overview
        </Title>
        <Text type="secondary">
          Welcome to the Taant Admin Panel. Here's what's happening on your platform.
        </Text>
      </div>

      {/* Main Statistics */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={{ color: stat.color }}
              />
              <div className="mt-4 flex items-center">
                {stat.icon}
                <Text type="secondary" className="ml-2 text-sm">
                  Total registered users
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* User Activity Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="User Activity" className="h-full">
            <div className="space-y-4">
              {recentUserStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {stat.icon}
                    <span className="ml-3 font-medium">{stat.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">{stat.value}</span>
                    <Text type="secondary">/ {stat.total}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="User Distribution" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag color="red">Admin</Tag>
                  <span className="ml-2">Administrators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    percent={totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0}
                    size="small"
                    className="w-24"
                  />
                  <span className="font-medium">{adminUsers}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag color="green">Supplier</Tag>
                  <span className="ml-2">Suppliers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    percent={totalUsers > 0 ? Math.round((supplierUsers / totalUsers) * 100) : 0}
                    size="small"
                    className="w-24"
                    strokeColor="#52c41a"
                  />
                  <span className="font-medium">{supplierUsers}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag color="orange">Customer</Tag>
                  <span className="ml-2">Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress
                    percent={totalUsers > 0 ? Math.round((customerUsers / totalUsers) * 100) : 0}
                    size="small"
                    className="w-24"
                    strokeColor="#fa8c16"
                  />
                  <span className="font-medium">{customerUsers}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Recent Users" extra={<Text type="secondary">Latest 5 users</Text>}>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      size="large"
                      icon={<UserOutlined />}
                      src={user.user_metadata?.avatar_url}
                    />
                    <div>
                      <div className="font-medium">
                        {user.profile?.full_name || 'No name set'}
                      </div>
                      <Text type="secondary" className="text-sm">
                        {user.email}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <div>
                      <Tag color={user.profile?.role === 'admin' ? 'red' :
                                user.profile?.role === 'supplier' ? 'green' : 'orange'}>
                        {user.profile?.role || 'customer'}
                      </Tag>
                    </div>
                    <Text type="secondary" className="text-xs">
                      Joined {dayjs(user.created_at).format('MMM DD, YYYY')}
                    </Text>
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