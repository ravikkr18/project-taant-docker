'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  Spin,
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
  ReloadOutlined,
} from '@ant-design/icons'
import apiClient from '../../lib/api-client'

const { Text } = Typography

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
}

interface OptimizedVariantManagerProps {
  productId: string
  productImages: Array<{ id: string; url: string; alt_text: string; is_primary: boolean }>
  initialVariants?: ProductVariant[]
  onVariantCountChange?: (count: number) => void
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


// Cache for variant data to avoid repeated API calls
const variantCache = new Map<string, { data: ProductVariant[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to get color hex from color name or hex
const getColorHex = (colorValue: string): string => {
  if (!colorValue) return '#ccc'

  const color = colorValue.trim().toLowerCase()

  // If it's already a hex color (with or without #), return as-is
  if (color.match(/^#?[0-9a-f]{3,6}$/i)) {
    return color.startsWith('#') ? color : `#${color}`
  }

  // Handle rgb/rgba colors
  if (color.startsWith('rgb(') || color.startsWith('rgba(')) {
    // Convert rgb/rgba to hex (simplified)
    const rgbMatch = color.match(/\d+/g)
    if (rgbMatch && rgbMatch.length >= 3) {
      const r = parseInt(rgbMatch[0]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
  }

  // Handle hsl/hsla colors (convert to rgb then hex)
  if (color.startsWith('hsl(') || color.startsWith('hsla(')) {
    // For simplicity, return a default color for hsl
    return '#888'
  }

  // Try to find in common colors by label (case insensitive)
  const colorMatch = COMMON_COLORS.find(c =>
    c.label.toLowerCase() === color
  )
  if (colorMatch) {
    return colorMatch.value
  }

  // Additional common CSS color names
  const cssColorMap: { [key: string]: string } = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'grey': '#808080',
    'navy': '#000080',
    'teal': '#008080',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'fuchsia': '#FF00FF',
    'maroon': '#800000',
    'olive': '#808000',
    'lightblue': '#ADD8E6',
    'lightgreen': '#90EE90',
    'lightgray': '#D3D3D3',
    'darkgray': '#A9A9A9',
    'darkgrey': '#A9A9A9',
    'lightcoral': '#F08080',
    'indianred': '#CD5C5C',
    'mediumblue': '#0000CD',
    'mediumseagreen': '#3CB371'
  }

  if (cssColorMap[color]) {
    return cssColorMap[color]
  }

  // Fallback to default gray
  return '#ccc'
}

const OptimizedVariantManager: React.FC<OptimizedVariantManagerProps> = ({
  productId,
  productImages,
  initialVariants = [],
  onVariantCountChange
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]) // Start empty to force API call
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')

  // Load variants lazily - only when this component is first used
  const loadVariants = useCallback(async (forceRefresh = false) => {
    if (!productId) return

    // Check if already loaded and not forcing refresh
    if (!forceRefresh && isLoaded) return

    setLoading(true)
    try {
      // Skip cache if forcing refresh
      if (!forceRefresh) {
        const cached = variantCache.get(productId)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setVariants(cached.data)
          setIsLoaded(true)
          if (onVariantCountChange) {
            onVariantCountChange(cached.data.length)
          }
          setLoading(false)
          return
        }
      }

      const fetchedVariants = await apiClient.getProductVariants(productId)
      setVariants(fetchedVariants)
      setIsLoaded(true)

      // Update variant count callback
      if (onVariantCountChange) {
        onVariantCountChange(fetchedVariants.length)
      }

      // Cache the result
      variantCache.set(productId, {
        data: fetchedVariants,
        timestamp: Date.now()
      })

      // Clear old cache entries
      const now = Date.now()
      variantCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          variantCache.delete(key)
        }
      })
    } catch (error) {
      console.error('Failed to load variants:', error)
      message.error('Failed to load variants')
    } finally {
      setLoading(false)
    }
  }, [productId, isLoaded, onVariantCountChange])

  // Instant variant save/update function
  const saveVariantInstantly = useCallback(async (variant: ProductVariant) => {
    try {
      let savedVariant
      if (variant.id.startsWith('temp-')) {
        // Create new variant
        savedVariant = await apiClient.createProductVariant(productId, variant)
        message.success('Variant created successfully')
      } else {
        // Update existing variant
        savedVariant = await apiClient.updateProductVariant(productId, variant.id, variant)
        message.success('Variant updated successfully')
      }

      // Update local state with the saved variant
      setVariants(prev => {
        if (variant.id.startsWith('temp-')) {
          // Replace temp variant with saved one
          return prev.map(v => v.id === variant.id ? savedVariant : v)
        } else {
          // Update existing variant
          return prev.map(v => v.id === variant.id ? savedVariant : v)
        }
      })

      // Update cache
      const cached = variantCache.get(productId)
      if (cached) {
        const updatedCache = cached.data.map(v =>
          v.id === variant.id ? savedVariant : v
        )
        variantCache.set(productId, {
          data: updatedCache,
          timestamp: Date.now()
        })
      }

      return savedVariant
    } catch (error) {
      console.error('Failed to save variant:', error)
      message.error('Failed to save variant')
      return null
    }
  }, [productId])

  
  // Delete variant instantly
  const deleteVariantInstantly = useCallback(async (variantId: string) => {
    try {
      await apiClient.deleteProductVariant(productId, variantId)
      setVariants(prev => {
        const newVariantsList = prev.filter(v => v.id !== variantId)
        // Update variant count callback
        if (onVariantCountChange) {
          onVariantCountChange(newVariantsList.length)
        }
        return newVariantsList
      })
      message.success('Variant deleted successfully')

      // Update cache
      const cached = variantCache.get(productId)
      if (cached) {
        const updatedCache = cached.data.filter(v => v.id !== variantId)
        variantCache.set(productId, {
          data: updatedCache,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('Failed to delete variant:', error)
      message.error('Failed to delete variant')
    }
  }, [productId, onVariantCountChange])

  // Update variant option locally (no save until button click)
  const updateVariantOption = useCallback((optionId: string, field: 'name' | 'value', newValue: string, variant: ProductVariant) => {
    const updatedVariant = {
      ...variant,
      options: variant.options.map(option =>
        option.id === optionId ? { ...option, [field]: newValue } : option
      )
    }

    // Only update the editing variant state, not the main variants array
    setEditingVariant(updatedVariant)
  }, [])

  // Toggle variant active status with instant save
  const handleToggleActive = useCallback((variantId: string) => {
    const variant = variants.find(v => v.id === variantId)
    if (!variant) return

    const updatedVariant = { ...variant, is_active: !variant.is_active }
    setVariants(prev => prev.map(v => v.id === variantId ? updatedVariant : v))

    // Save immediately for toggle action
    saveVariantInstantly(updatedVariant)
  }, [variants, saveVariantInstantly])

  // Add new variant
  const handleAdd = useCallback(() => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      title: '',
      sku: '',
      price: 0,
      inventory_quantity: 0,
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Size', value: '' },
        { id: `opt-${Date.now()}-2`, name: 'Color', value: '' },
        { id: `opt-${Date.now()}-3`, name: '', value: '' } // Third option ready but empty
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

    // Load variants if not already loaded
    if (!isLoaded) {
      loadVariants()
    }
  }, [variants.length, isLoaded, loadVariants])

  // Edit existing variant
  const handleEdit = useCallback((variant: ProductVariant) => {
    setEditingVariant(variant)
    form.setFieldsValue({
      title: variant.title,
      sku: variant.sku,
      price: variant.price,
      compare_price: variant.compare_price,
      cost_price: variant.cost_price,
      inventory_quantity: variant.inventory_quantity,
      weight: variant.weight,
      is_active: variant.is_active
    })

    if (variant.image_id) {
      const existingImage = productImages.find(img => img.id === variant.image_id)
      if (existingImage) {
        setSelectedImageUrl(existingImage.url)
      }
    } else {
      setSelectedImageUrl('')
    }

    setModalOpen(true)

    // Load variants if not already loaded
    if (!isLoaded) {
      loadVariants()
    }
  }, [productImages, isLoaded, loadVariants])

  // Save variant (from modal)
  const handleSave = useCallback(async (values: any) => {
    try {
      if (!editingVariant) return

      // Generate SKU if not provided
      if (!values.sku) {
        values.sku = `VAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      }

      // Handle image selection
      let imageId = editingVariant.image_id
      if (selectedImageUrl) {
        const selectedImage = productImages.find(img => img.url === selectedImageUrl)
        if (selectedImage) {
          imageId = selectedImage.id
        }
      }

      const updatedVariant = {
        ...editingVariant,
        ...values,
        image_id: imageId,
      }

      let savedVariant
      let newVariantsList

      if (editingVariant.id.startsWith('temp-')) {
        // Create new variant
        savedVariant = await apiClient.createProductVariant(productId, updatedVariant)
        message.success('Variant created successfully')

        // Add new variant to the list
        setVariants(prev => {
          newVariantsList = [...prev, savedVariant]
          // Update variant count callback
          if (onVariantCountChange) {
            onVariantCountChange(newVariantsList.length)
          }
          return newVariantsList
        })
      } else {
        // Update existing variant
        savedVariant = await apiClient.updateProductVariant(productId, editingVariant.id, updatedVariant)
        message.success('Variant updated successfully')

        // Update existing variant in the list
        setVariants(prev => {
          newVariantsList = prev.map(v => v.id === editingVariant.id ? savedVariant : v)
          // Update variant count callback (count stays same for updates)
          if (onVariantCountChange) {
            onVariantCountChange(newVariantsList.length)
          }
          return newVariantsList
        })
      }

      // Update cache
      const cached = variantCache.get(productId)
      if (cached) {
        const updatedCache = editingVariant.id.startsWith('temp-')
          ? [...cached.data, savedVariant]
          : cached.data.map(v => v.id === editingVariant.id ? savedVariant : v)

        variantCache.set(productId, {
          data: updatedCache,
          timestamp: Date.now()
        })
      }

      setModalOpen(false)
      setEditingVariant(null)
      setSelectedImageUrl('')
      form.resetFields()
    } catch (error) {
      message.error('Failed to save variant')
      console.error(error)
    }
  }, [editingVariant, selectedImageUrl, productImages, productId, onVariantCountChange])

  // Refresh variants function
  const handleRefresh = useCallback(async () => {
    await loadVariants(true) // Force refresh by bypassing cache
    message.success('Variants refreshed')
  }, [loadVariants])

  // Delete variant
  const handleDelete = useCallback((variantId: string) => {
    deleteVariantInstantly(variantId)
  }, [deleteVariantInstantly])

  // Duplicate variant
  const handleDuplicate = useCallback(async (variant: ProductVariant) => {
    try {
      const timestamp = Date.now()
      const duplicated: ProductVariant = {
        ...variant,
        id: `temp-${timestamp}`,
        title: `${variant.title} (Copy)`,
        sku: '',
        options: variant.options.map((option, index) => ({
          ...option,
          id: `opt-${timestamp}-${index + 1}`
        })),
        is_active: true
      }

      // Create the duplicated variant via API
      const savedVariant = await apiClient.createProductVariant(productId, duplicated)

      // Update local state with the saved variant
      setVariants(prev => {
        const newVariantsList = [...prev, savedVariant]
        // Update variant count callback
        if (onVariantCountChange) {
          onVariantCountChange(newVariantsList.length)
        }
        return newVariantsList
      })

      // Update cache
      const cached = variantCache.get(productId)
      if (cached) {
        variantCache.set(productId, {
          data: [...cached.data, savedVariant],
          timestamp: Date.now()
        })
      }

      message.success('Variant duplicated')
    } catch (error) {
      console.error('Failed to duplicate variant:', error)
      message.error('Failed to duplicate variant')
    }
  }, [productId, onVariantCountChange])

  // Memoized table columns to prevent re-renders
  const columns = useMemo(() => [
    {
      title: 'Variant',
      key: 'variant',
      render: (_: any, record: ProductVariant) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.title || 'Untitled Variant'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>SKU: {record.sku}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {record.options?.map((option, index) => (
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
                        backgroundColor: getColorHex(option.value),
                        border: '1px solid #d9d9d9',
                        display: 'inline-block',
                        flexShrink: 0
                      }}
                    />
                  )}
                  {option.name}: {option.value}
                </Tag>
              )
            ))}
          </div>
        </div>
      ),
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
          <Tooltip title="Update Variant">
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
  ], [productImages, handleToggleActive, handleEdit, handleDuplicate, handleDelete])

  // Load variants immediately when component mounts
  useEffect(() => {
    loadVariants()
  }, [loadVariants])

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
        <div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Variant
          </Button>
        </div>
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
        <Spin spinning={loading}>
          <Table
            dataSource={variants}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{
              emptyText: loading ? (
                // Loading skeleton
                <div style={{ textAlign: 'center', padding: 32 }}>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: 150, height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ width: 100, height: 12, background: '#f0f0f0', borderRadius: 4 }} />
                      </div>
                      <div style={{ width: 80, height: 16, background: '#f0f0f0', borderRadius: 4 }} />
                      <div style={{ width: 60, height: 16, background: '#f0f0f0', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              ) : (
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
        </Spin>
      </Card>

      {/* Update Variant Modal */}
      <Modal
        title="Update Variant"
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
            Update Variant
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
                  disabled={editingVariant && !editingVariant.id.startsWith('temp-') && editingVariant.sku !== ''}
                  title={editingVariant && !editingVariant.id.startsWith('temp-') ?
                    "SKU cannot be modified once generated" :
                    "Enter SKU or leave empty to auto-generate"
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Options Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text strong>Update Variant Options</Text>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  if (!editingVariant) return
                  const timestamp = Date.now()
                  const random = Math.random().toString(36).substr(2, 9)
                  const newOption = {
                    id: `opt-${timestamp}-${random}-${editingVariant.options.length + 1}`,
                    name: '',
                    value: ''
                  }
                  const updatedVariant = {
                    ...editingVariant,
                    options: [...editingVariant.options, newOption]
                  }
                  setEditingVariant(updatedVariant)
                }}
              >
                Add Option
              </Button>
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
                      <Input
                        value={option.name}
                        placeholder="Option name (e.g., Size, Color)"
                        onChange={(e) => updateVariantOption(option.id, 'name', e.target.value, editingVariant!)}
                      />
                    </Col>
                    <Col span={9}>
                      {option.name?.toLowerCase() === 'color' ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Input
                            value={option.value}
                            placeholder="Color value"
                            onChange={(e) => updateVariantOption(option.id, 'value', e.target.value, editingVariant!)}
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
                                updateVariantOption(option.id, 'value', colorName, editingVariant!)
                              }
                            }}
                            format="hex"
                          />
                        </div>
                      ) : (
                        <Input
                          value={option.value}
                          placeholder="Option value (e.g., Small, Blue)"
                          onChange={(e) => updateVariantOption(option.id, 'value', e.target.value, editingVariant!)}
                        />
                      )}
                    </Col>
                    <Col span={3}>
                      {editingVariant.options.length > 1 && (
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            if (!editingVariant) return
                            const updatedVariant = {
                              ...editingVariant,
                              options: editingVariant.options.filter(opt => opt.id !== option.id)
                            }
                            setEditingVariant(updatedVariant)
                          }}
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
          </div>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="compare_price" label="Compare Price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cost_price" label="Cost Price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/₹\s?|(,*)/g, '')}
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
                    setSelectedImageUrl(previewUrl)
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
                    setSelectedImageUrl(image.url)
                    message.success(`Selected image: ${image.alt_text}`)
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    border: selectedImageUrl === image.url ? '2px solid #1890ff' : '1px solid #d9d9d9',
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
                    e.currentTarget.style.borderColor = selectedImageUrl === image.url ? '#1890ff' : '#d9d9d9'
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
                  {selectedImageUrl === image.url && (
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

export default OptimizedVariantManager