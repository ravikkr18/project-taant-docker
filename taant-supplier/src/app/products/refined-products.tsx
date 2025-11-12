'use client'

import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input as AntInput,
  message,
  Popconfirm,
  Badge,
  Alert,
  Upload,
  Tabs,
  Rate,
  Table,
} from 'antd'
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ShopOutlined,
  DollarOutlined,
  InboxOutlined,
  StarOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { supabase } from '../../lib/supabase/client'

const { Title } = Typography
const { Search } = Input
const { TextArea } = AntInput
const { TabPane } = Tabs

// Product Create/Edit Modal Component
const ProductModal = ({
  open,
  onClose,
  editingProduct,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editingProduct?: any
  onSave: (data: any) => Promise<void>
}) => {
  const [activeTab, setActiveTab] = useState('1')
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (editingProduct && open) {
      form.setFieldsValue(editingProduct)
    } else if (open) {
      form.resetFields()
    }
  }, [editingProduct, open, form])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      await onSave(values)
      form.resetFields()
      onClose()
      message.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`)
    } catch (error) {
      message.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={editingProduct ? 'Edit Product' : 'Create New Product'}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {editingProduct ? 'Update Product' : 'Create Product'}
        </Button>,
      ]}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Basic Info" key="1">
            <Form.Item
              name="title"
              label="Product Title"
              rules={[{ required: true, message: 'Please enter product title' }]}
            >
              <AntInput placeholder="Enter product title" />
            </Form.Item>

            <Form.Item name="short_description" label="Short Description">
              <TextArea rows={2} placeholder="Brief product description" />
            </Form.Item>

            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="electronics">Electronics</Select.Option>
                <Select.Option value="clothing">Clothing</Select.Option>
                <Select.Option value="home">Home & Garden</Select.Option>
                <Select.Option value="sports">Sports & Outdoors</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Status" initialValue="draft">
              <Select>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </TabPane>

          <TabPane tab="Pricing & Inventory" key="2">
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter product price' }]}
            >
              <AntInput
                type="number"
                prefix={<DollarOutlined />}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item name="compare_price" label="Compare Price">
              <AntInput
                type="number"
                prefix={<DollarOutlined />}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item name="inventory_quantity" label="Stock Quantity">
              <AntInput
                type="number"
                prefix={<InboxOutlined />}
                placeholder="0"
              />
            </Form.Item>
          </TabPane>

          <TabPane tab="Images" key="3">
            <Alert
              message="Product Images"
              description="Upload high-quality product images. First image will be the primary image."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Upload.Dragger>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for a single or bulk upload.</p>
            </Upload.Dragger>
          </TabPane>

          <TabPane tab="Description" key="4">
            <Form.Item name="description" label="Product Description">
              <TextArea rows={6} placeholder="Describe your product in detail..." />
            </Form.Item>
          </TabPane>

          <TabPane tab="SEO" key="5">
            <Form.Item name="seo_title" label="SEO Title">
              <AntInput placeholder="SEO Title (50-60 characters recommended)" />
            </Form.Item>

            <Form.Item name="seo_description" label="SEO Description">
              <TextArea rows={3} placeholder="SEO Description (150-160 characters recommended)" />
            </Form.Item>

            <Form.Item name="tags" label="Tags">
              <AntInput placeholder="Comma-separated tags for better discoverability" />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  )
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        message.error('Failed to fetch products')
        console.error(error)
      } else {
        setProducts(data || [])
        setPagination(prev => ({ ...prev, total: data?.length || 0 }))
      }
    } catch (error) {
      message.error('Failed to fetch products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCreate = async (data: any) => {
    try {
      // Generate SKU and slug
      const sku = `SKU-${Date.now().toString(36).toUpperCase()}`
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const { error } = await supabase
        .from('products')
        .insert({
          ...data,
          sku,
          slug,
          supplier_id: 'current-supplier-id', // This should come from auth
        })

      if (error) throw error

      await fetchProducts()
    } catch (error) {
      throw error
    }
  }

  const handleUpdate = async (data: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', editingProduct.id)

      if (error) throw error

      await fetchProducts()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      message.success('Product deleted successfully')
      await fetchProducts()
    } catch (error) {
      message.error('Failed to delete product')
      console.error(error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${selectedIds.length} products?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .in('id', selectedIds)

          if (error) throw error

          setSelectedIds([])
          message.success('Products deleted successfully')
          await fetchProducts()
        } catch (error) {
          message.error('Failed to delete products')
          console.error(error)
        }
      },
    })
  }

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: any) => (
        <Space>
          <Avatar icon={<ShopOutlined />} size={48} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.title}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>SKU: {record.sku}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Tag
          color={
            record.status === 'active'
              ? 'success'
              : record.status === 'draft'
              ? 'warning'
              : 'default'
          }
        >
          {record.status}
        </Tag>
      ),
    },
    {
      title: 'Created',
      key: 'created',
      render: (_: any, record: any) => (
        <span>{new Date(record.created_at).toLocaleDateString()}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingProduct(record)
                setModalOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this product?"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedIds(selectedRowKeys as string[])
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        const allIds = products.map((item) => item.id)
        setSelectedIds(allIds)
      } else {
        setSelectedIds([])
      }
    },
  }

  return (
    <div>
      {/* Header with Actions */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Products Management</Title>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => {}}>
            Import
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => {}}>
            Export
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchProducts}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Product
          </Button>
        </Space>
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Search products..."
            style={{ width: 300 }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: 150 }}
            placeholder="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Select.Option value="">All Status</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Space>
      </div>

      {/* Selected Actions */}
      {selectedIds.length > 0 && (
        <Alert
          message={`${selectedIds.length} products selected`}
          action={
            <Space>
              <Button size="small" onClick={() => setSelectedIds([])}>
                Clear Selection
              </Button>
              <Button size="small" danger onClick={handleBulkDelete}>
                Delete Selected ({selectedIds.length})
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Products Table */}
      <Card>
        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }))
            },
          }}
          rowSelection={rowSelection}
        />
      </Card>

      {/* Create/Edit Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        editingProduct={editingProduct}
        onSave={editingProduct ? handleUpdate : handleCreate}
      />
    </div>
  )
}

export default ProductList