'use client'

import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Divider,
  Typography,
  Alert
} from 'antd'
import { EditOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

interface UserEditFormProps {
  visible: boolean
  onCancel: () => void
  onSubmit: (values: any) => Promise<void>
  initialValues?: {
    id: string
    email?: string
    full_name?: string
    role?: string
    status?: string
  }
  loading?: boolean
}

export function UserEditForm({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading = false
}: UserEditFormProps) {
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true)
    try {
      // Prepare update payload
      const updatePayload: any = {
        id: initialValues?.id,
        profile: {
          role: values.role,
          full_name: values.full_name,
        },
        user_metadata: {
          full_name: values.full_name,
        }
      }

      // Only include email if it's different
      if (values.email !== initialValues?.email) {
        updatePayload.email = values.email
      }

      // Include password if provided
      if (values.password) {
        updatePayload.password = values.password
      }

      await onSubmit(updatePayload)
      form.resetFields()
      onCancel()
      message.success('User updated successfully')
    } catch (error: any) {
      console.error('Update error:', error)
      message.error(error.message || 'Failed to update user')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>Edit User</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      {initialValues && (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            email: initialValues.email,
            full_name: initialValues.full_name,
            role: initialValues.role,
            status: initialValues.status || 'active',
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Full Name"
            name="full_name"
            rules={[
              { required: true, message: 'Please input full name!' }
            ]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[
              { required: true, message: 'Please select a role!' }
            ]}
          >
            <Select placeholder="Select user role">
              <Option value="admin">Admin</Option>
              <Option value="supplier">Supplier</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[
              { required: true, message: 'Please select a status!' }
            ]}
          >
            <Select placeholder="Select user status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Divider>
            <Text type="secondary">Password Reset</Text>
          </Divider>

          <Alert
            message="Password Reset"
            description="Leave password empty to keep current password. Fill only if you want to change it."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter new password (optional)" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('password')) {
                    return Promise.resolve()
                  }
                  if (value !== getFieldValue('password')) {
                    return Promise.reject(new Error('Passwords do not match!'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading || loading}
                style={{ minWidth: 100 }}
              >
                Update User
              </Button>
              <Button onClick={onCancel} disabled={submitLoading}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}