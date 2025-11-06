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
  ColorPicker,
  AutoComplete,
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
  options: Array<{ id: string; name: string; value: string }> // Dynamic options with IDs
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

// Common option types
const COMMON_OPTION_TYPES = [
  'Size',
  'Color',
  'Material',
  'Style',
  'Fit',
  'Length',
  'Pattern',
  'Weight',
  'Gender',
  'Age Group',
  'Season',
  'Occasion',
  'Brand',
  'Model',
  'Finish',
  'Warranty'
]

// Common colors for quick selection
const COMMON_COLORS = [
  { label: 'Red', value: '#FF0000' },
  { label: 'Blue', value: '#0000FF' },
  { label: 'Green', value: '#00FF00' },
  { label: 'Yellow', value: '#FFFF00' },
  { label: 'Orange', value: '#FFA500' },
  { label: 'Purple', value: '#800080' },
  { label: 'Pink', value: '#FFC0CB' },
  { label: 'Brown', value: '#964B00' },
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Gray', value: '#808080' },
  { label: 'Navy', value: '#000080' },
  { label: 'Teal', value: '#008080' },
  { label: 'Gold', value: '#FFD700' },
  { label: 'Silver', value: '#C0C0C0' },
]

const VariantManager: React.FC<VariantManagerProps> = ({
  variants,
  productImages,
  onChange
}) => {
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [customOptions, setCustomOptions] = useState<string[]>([])

  // Get all option types (common + custom)
  const getAllOptionTypes = () => {
    const allTypes = [...COMMON_OPTION_TYPES]
    // Add existing options from variants
    variants.forEach(variant => {
      [variant.option1_name, variant.option2_name, variant.option3_name].forEach(option => {
        if (option && !allTypes.includes(option)) {
          allTypes.push(option)
        }
      })
    })
    // Add custom options
    customOptions.forEach(option => {
      if (!allTypes.includes(option)) {
        allTypes.push(option)
      }
    })
    return [...new Set(allTypes)] // Remove duplicates
  }

  // Add custom option
  const handleAddCustomOption = (optionName: string) => {
    if (optionName && !COMMON_OPTION_TYPES.includes(optionName) && !customOptions.includes(optionName)) {
      setCustomOptions([...customOptions, optionName])
    }
  }

  // Dynamic Options Component
const DynamicOptions = ({ options, onChange, onAdd, onRemove }: {
  options: Array<{ id: string; name: string; value: string }>
  onChange: (optionId: string, field: 'name' | 'value', value: string) => void
  onAdd: () => void
  onRemove: (optionId: string) => void
}) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <Text strong>Variant Options</Text>
      <Button size="small" icon={<PlusOutlined />} onClick={onAdd}>
        Add Option
      </Button>
    </div>
    <div style={{ display: 'grid', gap: 12 }}>
      {options.map((option, index) => (
        <div key={option.id} style={{
          padding: 12,
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          backgroundColor: '#fafafa'
        }}>
          <Row gutter={8} align="middle">
            <Col span={1}>
              <Text strong style={{ color: '#1890ff' }}>{index + 1}</Text>
            </Col>
            <Col span={8}>
              <AutoComplete
                value={option.name}
                placeholder="Option name (e.g., Size, Color)"
                options={getAllOptionTypes().map(type => ({ label: type, value: type }))}
                filterOption={(inputValue, option) =>
                  option!.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                }
                onChange={(value) => onChange(option.id, 'name', value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={10}>
              {option.name?.toLowerCase() === 'color' ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Input
                    value={option.value}
                    placeholder="Color value"
                    onChange={(e) => onChange(option.id, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <ColorPicker
                    showText
                    allowClear
                    presets={[
                      {
                        label: 'Common Colors',
                        colors: COMMON_COLORS.map(c => c.value),
                      },
                    ]}
                    onChange={(color, hex) => {
                      if (color && hex) {
                        const colorName = COMMON_COLORS.find(c => c.value === hex)?.label || hex
                        onChange(option.id, 'value', colorName)
                      }
                    }}
                    format="hex"
                  />
                </div>
              ) : (
                <Input
                  value={option.value}
                  placeholder="Option value (e.g., Small, Blue)"
                  onChange={(e) => onChange(option.id, 'value', e.target.value)}
                />
              )}
            </Col>
            <Col span={3}>
              {options.length > 1 && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onRemove(option.id)}
                  style={{ width: '100%' }}
                >
                  Remove
                </Button>
              )}
            </Col>
          </Row>
        </div>
      ))}
    </div>
    {options.length === 0 && (
      <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
        No options added yet. Click "Add Option" to get started.
      </div>
    )}
  </div>
)

  // Add new variant
  const handleAdd = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      title: '',
      sku: '',
      price: 0,
      inventory_quantity: 0,
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Size', value: '' },
        { id: `opt-${Date.now()}-2`, name: 'Color', value: '' }
      ],
      is_active: true,
      position: variants.length
    }
    setEditingVariant(newVariant)
    form.setFieldsValue(newVariant)
    setModalOpen(true)
  }

  // Add option to variant
  const addVariantOption = () => {
    if (!editingVariant) return

    const newOption = {
      id: `opt-${Date.now()}-${editingVariant.options.length + 1}`,
      name: '',
      value: ''
    }

    const updatedVariant = {
      ...editingVariant,
      options: [...editingVariant.options, newOption]
    }
    setEditingVariant(updatedVariant)
    form.setFieldsValue(updatedVariant)
  }

  // Remove option from variant
  const removeVariantOption = (optionId: string) => {
    if (!editingVariant || editingVariant.options.length <= 1) {
      return
    }

    const updatedVariant = {
      ...editingVariant,
      options: editingVariant.options.filter(option => option.id !== optionId)
    }
    setEditingVariant(updatedVariant)
    form.setFieldsValue(updatedVariant)
  }

  // Update variant option
  const updateVariantOption = (optionId: string, field: 'name' | 'value', value: string) => {
    if (!editingVariant) return

    const updatedOptions = editingVariant.options.map(option =>
      option.id === optionId ? { ...option, [field]: value } : option
    )

    const updatedVariant = {
      ...editingVariant,
      options: updatedOptions
    }
    setEditingVariant(updatedVariant)
    form.setFieldsValue({ options: updatedOptions })
  }

  // Convert old variant format to new format (for backward compatibility)
  const convertVariantToNewFormat = (variant: any): ProductVariant => {
    if (variant.options && Array.isArray(variant.options)) {
      return variant
    }

    // Convert old format to new format
    const options: Array<{ id: string; name: string; value: string }> = []
    const timestamp = Date.now()

    if (variant.option1_name && variant.option1_value) {
      options.push({ id: `opt-${timestamp}-1`, name: variant.option1_name, value: variant.option1_value })
    }
    if (variant.option2_name && variant.option2_value) {
      options.push({ id: `opt-${timestamp}-2`, name: variant.option2_name, value: variant.option2_value })
    }
    if (variant.option3_name && variant.option3_value) {
      options.push({ id: `opt-${timestamp}-3`, name: variant.option3_name, value: variant.option3_value })
    }
    if (variant.option4_name && variant.option4_value) {
      options.push({ id: `opt-${timestamp}-4`, name: variant.option4_name, value: variant.option4_value })
    }
    if (variant.option5_name && variant.option5_value) {
      options.push({ id: `opt-${timestamp}-5`, name: variant.option5_name, value: variant.option5_value })
    }

    return {
      ...variant,
      options,
      option1_name: undefined,
      option1_value: undefined,
      option2_name: undefined,
      option2_value: undefined,
      option3_name: undefined,
      option3_value: undefined,
      option4_name: undefined,
      option4_value: undefined,
      option5_name: undefined,
      option5_value: undefined,
      barcode: undefined
    }
  }

  // Edit existing variant
  const handleEdit = (variant: ProductVariant) => {
    const convertedVariant = convertVariantToNewFormat(variant)
    setEditingVariant(convertedVariant)
    form.setFieldsValue(convertedVariant)
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
    const convertedVariant = convertVariantToNewFormat(variant)
    const duplicated: ProductVariant = {
      ...convertedVariant,
      id: `temp-${Date.now()}`,
      title: `${variant.title} (Copy)`,
      sku: '',
      options: convertedVariant.options.map((option, index) => ({
        ...option,
        id: `opt-${Date.now()}-${index + 1}`
      })),
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
      render: (_: any, record: ProductVariant) => {
        const variant = convertVariantToNewFormat(record)
        return (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{variant.title || 'Untitled Variant'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>SKU: {variant.sku}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
              {variant.options?.map((option, index) => (
                option.value && (
                  <Tag
                    key={option.id}
                    size="small"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {option.name?.toLowerCase() === 'color' && (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: option.value.includes('#') ? option.value :
                            COMMON_COLORS.find(c => c.label.toLowerCase() === option.value.toLowerCase())?.value || '#ccc',
                          border: '1px solid #d9d9d9'
                        }}
                      />
                    )}
                    {option.name}: {option.value}
                  </Tag>
                )
              ))}
            </div>
          </div>
        )
      },
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

          {/* Dynamic Options Section */}
          <DynamicOptions
            options={editingVariant?.options || []}
            onChange={updateVariantOption}
            onAdd={addVariantOption}
            onRemove={removeVariantOption}
          />

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
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  precision={0}
                  controls={true}
                  keyboard={true}
                  parser={(value: string) => {
                    // Only allow digits
                    const digitsOnly = value.replace(/[^\d]/g, '')
                    return parseInt(digitsOnly) || 0
                  }}
                  formatter={(value: number | string | undefined) => {
                    if (value === undefined || value === null) return ''
                    return Math.floor(Number(value)).toString()
                  }}
                />
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

      </div>
  )
}

export default VariantManager