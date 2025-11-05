'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Table,
  Tag,
  Tooltip,
  Popconfirm,
  Modal,
  Form,
  Row,
  Col,
  Typography,
  Image,
  message,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  CameraOutlined,
  DollarOutlined,
  InboxOutlined,
  StarOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select

interface ProductVariant {
  id: string
  title: string
  sku: string
  price: number
  compare_price?: number
  cost_price?: number
  inventory_quantity: number
  weight?: number
  barcode?: string
  option1_name: string
  option1_value: string
  option2_name: string
  option2_value: string
  option3_name: string
  option3_value: string
  image_id?: string
  image_url?: string
  is_active: boolean
  position: number
}

interface VariantManagerProps {
  variants: ProductVariant[]
  productImages: Array<{ id: string; url: string; alt_text: string; is_primary: boolean }>
  onChange: (variants: ProductVariant[]) => void
}

const VariantManager: React.FC<VariantManagerProps> = ({
  variants,
  productImages,
  onChange
}) => {
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Add new variant
  const handleAdd = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      title: '',
      sku: '',
      price: 0,
      inventory_quantity: 0,
      option1_name: 'Size',
      option1_value: '',
      option2_name: 'Color',
      option2_value: '',
      option3_name: '',
      option3_value: '',
      is_active: true,
      position: variants.length
    }
    setEditingVariant(newVariant)
    form.setFieldsValue(newVariant)
    setModalOpen(true)
  }

  // Edit existing variant
  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant)
    form.setFieldsValue(variant)
    setModalOpen(true)
  }

  // Save variant
  const handleSave = async (values: any) => {
    try {
      if (editingVariant) {
        // Generate SKU if not provided
        if (!values.sku) {
          values.sku = `VAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        }

        const updatedVariant = {
          ...editingVariant,
          ...values
        }

        if (editingVariant.id.startsWith('temp-')) {
          // New variant
          onChange([...variants, updatedVariant])
        } else {
          // Existing variant
          onChange(variants.map(v => v.id === editingVariant.id ? updatedVariant : v))
        }

        message.success('Variant saved successfully')
        setModalOpen(false)
        setEditingVariant(null)
        form.resetFields()
      }
    } catch (error) {
      message.error('Failed to save variant')
      console.error(error)
    }
  }

  // Delete variant
  const handleDelete = (variantId: string) => {
    onChange(variants.filter(v => v.id !== variantId))
    message.success('Variant deleted')
  }

  // Duplicate variant
  const handleDuplicate = (variant: ProductVariant) => {
    const duplicated: ProductVariant = {
      ...variant,
      id: `temp-${Date.now()}`,
      title: `${variant.title} (Copy)`,
      sku: '',
      is_active: true
    }
    onChange([...variants, duplicated])
    message.success('Variant duplicated')
  }

  // Toggle variant active status
  const handleToggleActive = (variantId: string) => {
    onChange(variants.map(v =>
      v.id === variantId ? { ...v, is_active: !v.is_active } : v
    ))
  }

  // Update variant field
  const handleUpdateField = (variantId: string, field: keyof ProductVariant, value: any) => {
    onChange(variants.map(v =>
      v.id === variantId ? { ...v, [field]: value } : v
    ))
  }

  // Quick edit in table
  const columns = [
    {
      title: 'Variant',
      key: 'variant',
      render: (_: any, record: ProductVariant) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.title || 'Untitled Variant'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>SKU: {record.sku}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {record.option1_value && <Tag size="small">{record.option1_name}: {record.option1_value}</Tag>}
            {record.option2_value && <Tag size="small">{record.option2_name}: {record.option2_value}</Tag>}
            {record.option3_value && <Tag size="small">{record.option3_name}: {record.option3_value}</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Image',
      key: 'image',
      render: (_: any, record: ProductVariant) => (
        <div style={{ textAlign: 'center' }}>
          {record.image_url ? (
            <Image
              src={record.image_url}
              alt={record.title}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <Tooltip title="Each variant should have at least one image">
              <div style={{
                width: 50,
                height: 50,
                border: '2px dashed #ff4d4f',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4d4f',
                backgroundColor: '#fff2f0'
              }}>
                <CameraOutlined />
              </div>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Pricing',
      key: 'pricing',
      render: (_: any, record: ProductVariant) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#52c41a' }}>${record.price}</div>
          {record.compare_price && (
            <div style={{
              color: '#999',
              fontSize: '12px',
              textDecoration: 'line-through'
            }}>
              ${record.compare_price}
            </div>
          )}
          {record.cost_price && (
            <div style={{ color: '#ff4d4f', fontSize: '11px' }}>
              Cost: ${record.cost_price}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Inventory',
      key: 'inventory',
      render: (_: any, record: ProductVariant) => (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <InboxOutlined style={{ color: record.inventory_quantity > 0 ? '#52c41a' : '#ff4d4f' }} />
            <span style={{
              color: record.inventory_quantity > 0 ? '#52c41a' : '#ff4d4f',
              fontWeight: 'bold'
            }}>
              {record.inventory_quantity}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.inventory_quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: ProductVariant) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch
            size="small"
            checked={record.is_active}
            onChange={() => handleToggleActive(record.id)}
          />
          <Tag color={record.is_active ? 'success' : 'default'}>
            {record.is_active ? 'Active' : 'Inactive'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ProductVariant) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this variant?"
              description="This action cannot be undone."
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Text strong style={{ fontSize: 16 }}>Product Variants</Text>
          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
            Manage different sizes, colors, and other variations with individual pricing and inventory
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Variant
        </Button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">Total Variants</Text>
            <Text strong>{variants.length}</Text>
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">Active</Text>
            <Text strong style={{ color: '#52c41a' }}>
              {variants.filter(v => v.is_active).length}
            </Text>
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">Low Stock</Text>
            <Text strong style={{ color: '#faad14' }}>
              {variants.filter(v => v.inventory_quantity > 0 && v.inventory_quantity < 10).length}
            </Text>
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">Out of Stock</Text>
            <Text strong style={{ color: '#ff4d4f' }}>
              {variants.filter(v => v.inventory_quantity === 0).length}
            </Text>
          </div>
        </Card>
      </div>

      {/* Variants Table */}
      <Card>
        <Table
          dataSource={variants}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}>
                  <InboxOutlined />
                </div>
                <Text type="secondary">No variants created yet</Text>
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Your First Variant
                  </Button>
                </div>
              </div>
            )
          }}
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={editingVariant?.id.startsWith('temp-') ? 'Create Variant' : 'Edit Variant'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingVariant(null)
          form.resetFields()
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalOpen(false)
            setEditingVariant(null)
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingVariant?.id.startsWith('temp-') ? 'Create Variant' : 'Update Variant'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Variant Title" rules={[{ required: true }]}>
                <Input placeholder="e.g., Small Blue T-Shirt" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sku" label="SKU">
                <Input placeholder="Auto-generated if empty" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="option1_name" label="Option 1 Name" initialValue="Size">
                <Select>
                  <Option value="Size">Size</Option>
                  <Option value="Color">Color</Option>
                  <Option value="Material">Material</Option>
                  <Option value="Style">Style</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="option1_value" label="Option 1 Value">
                <Input placeholder="e.g., Small" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="barcode" label="Barcode">
                <Input placeholder="Optional barcode" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="option2_name" label="Option 2 Name" initialValue="Color">
                <Select>
                  <Option value="Size">Size</Option>
                  <Option value="Color">Color</Option>
                  <Option value="Material">Material</Option>
                  <Option value="Style">Style</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="option2_value" label="Option 2 Value">
                <Input placeholder="e.g., Blue" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label="Weight (kg)">
                <InputNumber style={{ width: '100%' }} placeholder="0.00" step="0.01" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="compare_price" label="Compare Price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cost_price" label="Cost Price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="inventory_quantity" label="Stock Quantity" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          {/* Image Selection */}
          <Form.Item label="Variant Image">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
              <input
                type="file"
                id="variant-image-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const previewUrl = URL.createObjectURL(file)
                    form.setFieldsValue({ image_url: previewUrl })
                    message.success('Variant image uploaded')
                  }
                }}
              />
              <div
                onClick={() => document.getElementById('variant-image-upload')?.click()}
                style={{
                  width: 80,
                  height: 80,
                  border: '1px dashed #d9d9d9',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff'
                  e.currentTarget.style.color = '#1890ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d9d9d9'
                  e.currentTarget.style.color = '#999'
                }}
              >
                <CameraOutlined style={{ fontSize: 20 }} />
              </div>
              {productImages.map(image => (
                <div
                  key={image.id}
                  onClick={() => {
                    form.setFieldsValue({ image_url: image.url })
                    message.success(`Selected image: ${image.alt_text}`)
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    border: form.getFieldValue('image_url') === image.url ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    borderRadius: 4,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1890ff'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = form.getFieldValue('image_url') === image.url ? '#1890ff' : '#d9d9d9'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt_text}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                  {form.getFieldValue('image_url') === image.url && (
                    <div style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: '#1890ff',
                      color: 'white',
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Tips */}
      <Card style={{ marginTop: 16 }} size="small">
        <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
          <StarOutlined style={{ color: '#1890ff', marginTop: 2 }} />
          <div>
            <Text strong>Variant Management Tips:</Text>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, color: '#666', fontSize: 13 }}>
              <li>Use consistent option names (Size, Color, etc.) across all variants</li>
              <li>Set proper inventory levels to track stock accurately</li>
              <li>Associate unique images with each variant for better visualization</li>
              <li>Enable/disable variants without deleting them</li>
              <li>Use duplicate feature to quickly create similar variants</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default VariantManager