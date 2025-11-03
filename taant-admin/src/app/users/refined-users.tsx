'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  List,
  EditButton,
  DeleteButton,
} from '@refinedev/antd'
import { useList, useDelete, useUpdate } from '@refinedev/core'
import { UserEditForm } from '../../components/admin/user-edit-form'
import {
  Table,
  Avatar,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Progress
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TeamOutlined,
  ShopOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { Title, Text } = Typography

export default function RefinedUsers() {
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [debouncedSearchText, setDebouncedSearchText] = useState('')

  // Debounce search input to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchText])

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })

  // Optimize filters to prevent unnecessary re-renders
  const filters = useMemo(() => [
    ...(debouncedSearchText ? [{
      field: 'email',
      operator: 'contains' as const,
      value: debouncedSearchText,
    }] : []),
    ...(roleFilter !== 'all' ? [{
      field: 'profile.role',
      operator: 'eq' as const,
      value: roleFilter,
    }] : []),
  ], [debouncedSearchText, roleFilter])

  const { data: usersData, isLoading, refetch } = useList({
    resource: 'users',
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
    },
    filters,
    sorters: [
      {
        field: 'created_at',
        order: 'desc',
      },
    ],
    // Add caching to improve performance
    queryOptions: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    },
  })

  const users = usersData?.data || []
  const total = usersData?.total || 0

  // Handle initial loading state
  useEffect(() => {
    if (!isLoading && isInitialLoading) {
      setIsInitialLoading(false)
    }
  }, [isLoading, isInitialLoading])

  const { mutate: mutateDelete } = useDelete()
  const { mutate: mutateUpdate } = useUpdate()

  // Calculate statistics with useMemo for performance
  const statistics = useMemo(() => {
    const totalUsers = users.length
    const adminUsers = users.filter(u => u.profile?.role === 'admin').length
    const supplierUsers = users.filter(u => u.profile?.role === 'supplier').length
    const customerUsers = users.filter(u => u.profile?.role === 'customer').length
    const activeUsers = users.filter(u => u.last_sign_in_at).length

    return {
      totalUsers,
      adminUsers,
      supplierUsers,
      customerUsers,
      activeUsers
    }
  }, [users])

  const handleStatusToggle = async (record: any) => {
    const currentStatus = record.profile?.status || 'active'
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? 'activate' : 'deactivate'

    Modal.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      content: `Are you sure you want to ${action} ${record.email}?`,
      okText: action.charAt(0).toUpperCase() + action.slice(1),
      okType: newStatus === 'active' ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await mutateUpdate({
            resource: 'users',
            id: record.id,
            variables: { status: newStatus },
            mutationMode: 'pessimistic',
          })
          message.success(`User ${action}d successfully`)
          refetch()
        } catch (error) {
          message.error(`Failed to ${action} user`)
        }
      },
    })
  }

  const handleEdit = (record: any) => {
    setEditingUser({
      id: record.id,
      email: record.email,
      full_name: record.profile?.full_name || record.user_metadata?.full_name,
      role: record.profile?.role,
      status: record.profile?.status || 'active',
    })
    setEditModalVisible(true)
  }

  const handleUpdate = async (values: any) => {
    try {
      await mutateUpdate({
        resource: 'users',
        id: editingUser?.id,
        variables: values,
        mutationMode: 'pessimistic',
      })
      refetch()
    } catch (error) {
      throw error // Re-throw to let the form handle the error
    }
  }

  const handleDelete = async (record: any) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete ${record.email}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await mutateDelete({
            resource: 'users',
            id: record.id,
            mutationMode: 'pessimistic',
          })
          message.success('User deleted successfully')
          refetch()
        } catch (error) {
          message.error('Failed to delete user')
        }
      },
    })
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 })) // Reset to first page when searching
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    setPagination(prev => ({ ...prev, current: 1 })) // Reset to first page when filtering
  }

  const handleRefresh = () => {
    refetch()
    message.success('Data refreshed')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red'
      case 'supplier': return 'green'
      case 'customer': return 'blue'
      default: return 'default'
    }
  }

  const columns = [
    {
      title: 'User',
      dataIndex: 'email',
      key: 'user',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size="large"
            icon={<UserOutlined />}
            src={record.user_metadata?.avatar_url}
          />
          <div>
            <div className="font-medium">
              {record.profile?.full_name || 'No name set'}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MailOutlined className="mr-1" />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: ['profile', 'role'],
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {role?.toUpperCase() || 'CUSTOMER'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        const currentStatus = record.profile?.status || 'active'
        const isActive = currentStatus === 'active'

        return (
          <Badge
            status={isActive ? 'success' : 'default'}
            text={isActive ? 'Active' : 'Inactive'}
          />
        )
      },
    },
    {
      title: 'Joined Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2" />
          {dayjs(date).format('MMM DD, YYYY')}
        </div>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'last_sign_in_at',
      key: 'last_sign_in_at',
      render: (date: string) => (
        <Text type="secondary">
          {date ? dayjs(date).format('MMM DD, YYYY') : 'Never'}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const currentStatus = record.profile?.status || 'active'
        const isActive = currentStatus === 'active'

        return (
          <Space>
            <Tooltip title={isActive ? 'Deactivate User' : 'Activate User'}>
              <Button
                size="small"
                type={isActive ? 'default' : 'primary'}
                icon={isActive ? <EyeOutlined /> : <EyeOutlined />}
                onClick={() => handleStatusToggle(record)}
              />
            </Tooltip>
            <Tooltip title="Edit User">
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Delete User">
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">User Management</Title>
          <Text type="secondary">
            Manage all registered users and their permissions
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Admin Users"
              value={statistics.adminUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Suppliers"
              value={statistics.supplierUsers}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={statistics.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Search users by email or name..."
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchText(value)
                  if (!value) {
                    handleSearch('')
                  }
                }}
                onPressEnter={() => handleSearch(searchText)}
              />
              <Button
                size="large"
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleSearch(searchText)}
              />
            </Space.Compact>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by role"
              size="large"
              value={roleFilter}
              onChange={handleRoleFilter}
              className="w-full"
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="supplier">Supplier</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <div className="text-right">
              <Text type="secondary">
                Showing {users.length} of {total} users
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <List>
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize })
              },
              onShowSizeChange: (current, size) => {
                setPagination({ current: 1, pageSize: size })
              },
            }}
            loading={isLoading}
            scroll={{ x: 800 }}
          />
        </List>
      </Card>

      {/* User Edit Form Modal */}
      <UserEditForm
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleUpdate}
        initialValues={editingUser}
        loading={isLoading}
      />
    </div>
  )
}