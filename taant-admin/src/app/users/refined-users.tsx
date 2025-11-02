'use client'

import React, { useState } from 'react'
import {
  List,
  EditButton,
  DeleteButton,
  useTable,
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

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography

export default function RefinedUsers() {
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const { tableProps } = useTable({
    resource: 'users',
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
  })

  const { data: usersData, isLoading, refetch } = useList({
    resource: 'users',
    pagination: {
      current: tableProps.pagination && typeof tableProps.pagination === 'object' ? tableProps.pagination.current : 1,
      pageSize: tableProps.pagination && typeof tableProps.pagination === 'object' ? tableProps.pagination.pageSize : 10,
    },
    filters: [
      ...(searchText ? [{
        field: 'email',
        operator: 'contains' as const,
        value: searchText,
      }] : []),
      ...(roleFilter !== 'all' ? [{
        field: 'profile.role',
        operator: 'eq' as const,
        value: roleFilter,
      }] : []),
    ],
    sorters: [
      {
        field: 'created_at',
        order: 'desc',
      },
    ],
  })

  const users = usersData?.data || []
  const total = usersData?.total || 0

  const { mutate: mutateDelete } = useDelete()
  const { mutate: mutateUpdate } = useUpdate()

  
  // Calculate statistics
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.profile?.role === 'admin').length
  const supplierUsers = users.filter(u => u.profile?.role === 'supplier').length
  const customerUsers = users.filter(u => u.profile?.role === 'customer').length
  const activeUsers = users.filter(u => u.last_sign_in_at).length

  const handleEdit = (record: any) => {
    setEditingUser({
      id: record.id,
      email: record.email,
      full_name: record.profile?.full_name || record.user_metadata?.full_name,
      role: record.profile?.role,
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
    // Trigger refetch to apply new search
    refetch()
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value)
    // Trigger refetch to apply new filter
    refetch()
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
      render: (_: any, record: any) => (
        <Badge
          status={record.last_sign_in_at ? 'success' : 'default'}
          text={record.last_sign_in_at ? 'Active' : 'Inactive'}
        />
      ),
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
      render: (_: any, record: any) => (
        <Space>
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
      ),
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
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Admin Users"
              value={adminUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Suppliers"
              value={supplierUsers}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers}
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
            <Search
              placeholder="Search users by email or name..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
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
            {...tableProps}
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{
              ...tableProps.pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
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