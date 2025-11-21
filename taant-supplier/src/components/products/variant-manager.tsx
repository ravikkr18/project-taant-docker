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
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  CameraOutlined,
  DollarOutlined,
  InboxOutlined,
  CheckOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select
import VariantImageUploadManager from './variant-image-upload-manager'

// Common option names
const COMMON_OPTIONS = [
  'Color',
  'Size',
  'Material',
  'Style',
  'Weight',
  'Dimensions',
  'Finish',
  'Pattern',
  'Fit',
  'Length',
  'Width',
  'Height',
]

interface VariantImage {
  id: string
  url: string
  alt_text: string
  position: number
  is_primary: boolean
  file_name?: string
  file_size?: number
  file_type?: string
}

export interface ProductVariant {
  id: string
  title: string
  sku: string
  price: number
  compare_price?: number
  cost_price?: number
  inventory_quantity: number
  weight?: number
  options: Array<{ id: string; name: string; value: string }>
  image_id?: string
  is_active: boolean
  position: number
  variant_images?: VariantImage[]
}

interface VariantManagerProps {
  variants: ProductVariant[]
  productImages: Array<{ id: string; url: string; alt_text: string; is_primary: boolean }>
  onChange: (variants: ProductVariant[]) => void
}

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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')

  // Simple update variant function that also updates parent state
  const updateVariantOption = (optionId: string, field: 'name' | 'value', newValue: string) => {
    if (!editingVariant) return

    const updatedVariant = {
      ...editingVariant,
      options: editingVariant.options.map(option =>
        option.id === optionId ? { ...option, [field]: newValue } : option
      )
    }

    setEditingVariant(updatedVariant)

    // Immediately update parent state to keep it in sync
    const updatedVariants = variants.map(v =>
      v.id === editingVariant.id ? updatedVariant : v
    )
    onChange(updatedVariants)
  }

  // Add option to current variant
  const addVariantOption = () => {
    if (!editingVariant) return

    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    const newOption = {
      id: `opt-${timestamp}-${random}-${editingVariant.options.length + 1}`,
      name: '',
      value: ''
    }

    setEditingVariant(prev => {
      if (!prev) return prev
      return {
        ...prev,
        options: [...prev.options, newOption]
      }
    })
  }

  // Remove option from current variant
  const removeVariantOption = (optionId: string) => {
    if (!editingVariant || editingVariant.options.length <= 1) return

    setEditingVariant(prev => {
      if (!prev) return prev
      return {
        ...prev,
        options: prev.options.filter(option => option.id !== optionId)
      }
    })
  }

  // Convert variant format - now only handles JSON options
  const convertVariantToNewFormat = (variant: any): ProductVariant => {
    // All variants should now have options in JSON format
    const options = (variant.options || []).map((option: any, index: number) => ({
      id: option.id || `opt-${Date.now()}-${index + 1}`,
      name: option.name || '',
      value: option.value || ''
    }))

    return {
      ...variant,
      options,
      // Clean up old fields
      option1_name: undefined, option1_value: undefined,
      option2_name: undefined, option2_value: undefined,
      option3_name: undefined, option3_value: undefined,
      option4_name: undefined, option4_value: undefined,
      barcode: undefined
    }
  }

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
    form.setFieldsValue({
      title: '',
      sku: '',
      price: 0,
      inventory_quantity: 0,
      is_active: true
    })
    setSelectedImageUrl('')
    setModalOpen(true)
  }

  // Edit existing variant
  const handleEdit = (variant: ProductVariant) => {
    const convertedVariant = convertVariantToNewFormat(variant)
    setEditingVariant(convertedVariant)

    form.setFieldsValue({
      title: convertedVariant.title,
      sku: convertedVariant.sku,
      price: convertedVariant.price,
      compare_price: convertedVariant.compare_price,
      cost_price: convertedVariant.cost_price,
      inventory_quantity: convertedVariant.inventory_quantity,
      weight: convertedVariant.weight,
      is_active: convertedVariant.is_active
    })

    // Set selected image URL from image_id
    if (convertedVariant.image_id) {
      const existingImage = productImages.find(img => img.id === convertedVariant.image_id)
      if (existingImage) {
        setSelectedImageUrl(existingImage.url)
      }
    } else {
      setSelectedImageUrl('')
    }

    setModalOpen(true)
  }

  // Save variant
  const handleSave = async (values: any) => {
    try {
      if (!editingVariant) return

      
      // Generate SKU if not provided (only for new variants)
      if (!values.sku && !editingVariant.id) {
        values.sku = `VAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      } else if (!values.sku && editingVariant.sku) {
        // Use existing SKU for updates
        values.sku = editingVariant.sku
      }

      // Handle image selection
      let imageId = editingVariant.image_id
      if (selectedImageUrl) {
        const selectedImage = productImages.find(img => img.url === selectedImageUrl)
        if (selectedImage) {
          imageId = selectedImage.id
        }
      }

      // Create variant in both new and old format for compatibility
      const updatedVariant = {
        ...editingVariant,
        ...values,
        image_id: imageId,
        // Use the options array directly - no more column conversion needed
        options: editingVariant.options,
        // Include variant_images from editingVariant state
        variant_images: editingVariant.variant_images,
      }

      
      if (editingVariant.id.startsWith('temp-')) {
        // New variant
        onChange([...variants, updatedVariant])
        message.success('Variant created successfully')
      } else {
        // Existing variant - update it instead of creating new one
        onChange(variants.map(v => v.id === editingVariant.id ? updatedVariant : v))
        message.success('Variant updated successfully')
      }

      setModalOpen(false)
      setEditingVariant(null)
      setSelectedImageUrl('')
      form.resetFields()
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
    const timestamp = Date.now()
    const duplicated: ProductVariant = {
      ...convertedVariant,
      id: `temp-${timestamp}`,
      title: `${variant.title} (Copy)`,
      sku: '',
      options: convertedVariant.options.map((option, index) => ({
        ...option,
        id: `opt-${timestamp}-${index + 1}`
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

  // Table columns
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
      render: (_: any, record: ProductVariant) => {
        const variantImage = productImages.find(img => img.id === record.image_id)
        return (
          <div style={{ textAlign: 'center' }}>
            {variantImage ? (
              <Image
                src={variantImage.url}
                alt={variantImage.alt_text}
                width={50}
                height={50}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                preview={false}
              />
            ) : record.image_id ? (
              <div style={{
                width: 50,
                height: 50,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#52c41a',
                backgroundColor: '#f6ffed'
              }}>
                <CheckOutlined />
              </div>
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
        )
      },
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
              <Button danger icon={<DeleteOutlined />} />
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
        title={editingVariant?.id.startsWith('temp-') ? 'Create Variant' : 'Update Variant'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingVariant(null)
          setSelectedImageUrl('')
          form.resetFields()
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalOpen(false)
            setEditingVariant(null)
            setSelectedImageUrl('')
            form.resetFields()
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingVariant && !editingVariant.id.startsWith('temp-') ? 'Update Variant' : 'Create Variant'}
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
                <Input
                  placeholder="Auto-generated if empty"
                  disabled={!editingVariant?.id.startsWith('temp-') && editingVariant?.sku !== ''}
                  title={editingVariant?.id.startsWith('temp-') ?
                    "Enter SKU or leave empty to auto-generate" :
                    "SKU cannot be modified once generated"
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Options Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text strong>{editingVariant?.id.startsWith('temp-') ? 'Create Variant Options' : 'Update Variant Options'}</Text>
              {editingVariant?.id.startsWith('temp-') && (
                <Button icon={<PlusOutlined />} onClick={addVariantOption}>
                  Add Option
                </Button>
              )}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {editingVariant?.options.map((option, index) => (
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
                      <Select
                        value={option.name}
                        placeholder="Option name (e.g., Size, Color)"
                        onChange={(newValue) => updateVariantOption(option.id, 'name', newValue)}
                        style={{ width: '100%' }}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {COMMON_OPTIONS.map(commonOption => (
                          <Option key={commonOption} value={commonOption}>
                            {commonOption}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={10}>
                      {option.name?.toLowerCase() === 'color' ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Input
                            value={option.value}
                            placeholder="Color value"
                            onChange={(e) => updateVariantOption(option.id, 'value', e.target.value)}
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
                                updateVariantOption(option.id, 'value', colorName)
                              }
                            }}
                            format="hex"
                          />
                        </div>
                      ) : (
                        <Input
                          value={option.value}
                          placeholder="Option value (e.g., Small, Blue)"
                          onChange={(e) => updateVariantOption(option.id, 'value', e.target.value)}
                        />
                      )}
                    </Col>
                    <Col span={3}>
                      {editingVariant.options.length > 1 && editingVariant.id.startsWith('temp-') && (
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeVariantOption(option.id)}
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
            {editingVariant?.options.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                {editingVariant?.id.startsWith('temp-')
                  ? 'No options added yet. Click "Add Option" to get started.'
                  : 'No options configured for this variant.'
                }
              </div>
            )}
          </div>

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
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          {/* Variant Images */}
          <Form.Item label="Variant Images">
            <VariantImageUploadManager
              images={editingVariant?.variant_images || []}
              onChange={(variantImages) => {
                setEditingVariant(prev => {
                  if (!prev) return prev
                  return {
                    ...prev,
                    variant_images: variantImages
                  }
                })

                // Update parent state immediately
                const updatedVariants = variants.map(v =>
                  v.id === editingVariant.id
                    ? { ...v, variant_images: variantImages }
                    : v
                )
                onChange(updatedVariants)
              }}
              variantId={editingVariant?.id}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default VariantManager