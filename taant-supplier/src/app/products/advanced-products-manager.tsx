'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  Table,
  Divider,
  Row,
  Col,
  Switch,
  InputNumber,
  TreeSelect,
  AutoComplete,
  Collapse,
  Image,
  UploadProps,
  Dropdown,
  Menu,
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
  CameraOutlined,
  DragOutlined,
  CopyOutlined,
  SaveOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  MenuOutlined,
  FileImageOutlined,
  FileTextOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { supabase } from '../../lib/supabase/client'
import type { UploadFile, UploadProps as AntUploadProps } from 'antd/es/upload/interface'
import ImageUploadManager from '../../components/products/image-upload-manager'
import VariantManager from '../../components/products/variant-manager'
import APlusContentManager from '../../components/products/a-plus-content-manager'
import FAQManager from '../../components/products/faq-manager'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { TextArea } = AntInput
const { Panel } = Collapse

// Enhanced Product Interface
interface Product {
  id: string
  title: string
  short_description: string
  description: string
  a_plus_content: string
  a_plus_sections: Array<{
    id: string
    type: 'text' | 'image_text' | 'text_image'
    title?: string
    content: string
    image?: string
    position: number
    formatting?: {
      bold?: boolean
      italic?: boolean
      underline?: boolean
      align?: 'left' | 'center' | 'right'
    }
  }>
  sku: string
  slug: string
  status: string
  base_price: number
  compare_price: number
  category_id: string
  brand_id: string
  images: ProductImage[]
  variants: ProductVariant[]
  faqs: ProductFAQ[]
  specifications: Record<string, any>
  features: string[]
  warranty_months: number
  warranty_text: string
  tags: string[]
  seo_title: string
  seo_description: string
  created_at: string
  updated_at: string
}

interface ProductImage {
  id: string
  url: string
  alt_text: string
  position: number
  is_primary: boolean
}

interface ProductVariant {
  id: string
  title: string
  sku: string
  price: number
  compare_price: number
  inventory_quantity: number
  option1_name: string
  option1_value: string
  option2_name: string
  option2_value: string
  option3_name: string
  option3_value: string
  image_id?: string
  is_active: boolean
}

interface ProductFAQ {
  id: string
  question: string
  answer: string
  position: number
  is_active: boolean
}

// Advanced Product Manager Component
const AdvancedProductManager: React.FC = () => {
  // State Management
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // Form states
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1')
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
  const [productFAQs, setProductFAQs] = useState<ProductFAQ[]>([])
  const [features, setFeatures] = useState<string[]>([''])
  const [specifications, setSpecifications] = useState<Record<string, string>>({})
  const [aPlusSections, setAPlusSections] = useState<Array<{
    id: string
    type: 'text' | 'image_text' | 'text_image'
    title?: string
    content: string
    image?: string
    position: number
    formatting?: {
      bold?: boolean
      italic?: boolean
      underline?: boolean
      align?: 'left' | 'center' | 'right'
    }
  }>>([])

  // Validation errors tracking
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(name, slug),
          category:categories(name, slug),
          images:product_images(*),
          variants:product_variants(*),
          faqs:product_faqs(*)
        `)
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

  // Image Management Functions
  const handleImageUpload: AntUploadProps['onChange'] = async ({ fileList }) => {
    const newImages = fileList.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file.originFileObj as File),
      alt_text: file.name,
      position: productImages.length + index,
      is_primary: productImages.length === 0 && index === 0
    }))

    setProductImages(prev => [...prev, ...newImages])
    message.success(`${fileList.length} images uploaded`)
  }

  const removeImage = (imageId: string) => {
    setProductImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      // If primary image was removed, make first image primary
      if (prev.find(img => img.id === imageId)?.is_primary && updated.length > 0) {
        updated[0].is_primary = true
      }
      // Update positions
      return updated.map((img, index) => ({ ...img, position: index }))
    })
  }

  const setPrimaryImage = (imageId: string) => {
    setProductImages(prev => prev.map(img => ({
      ...img,
      is_primary: img.id === imageId
    })))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const draggedImage = productImages[fromIndex]
    const newImages = [...productImages]
    newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, draggedImage)

    // Update positions
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      position: index
    }))

    setProductImages(updatedImages)
  }

  // Variant Management Functions
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      title: '',
      sku: '',
      price: 0,
      compare_price: null,
      inventory_quantity: 0,
      option1_name: 'Size',
      option1_value: '',
      option2_name: 'Color',
      option2_value: '',
      option3_name: '',
      option3_value: '',
      is_active: true
    }
    setProductVariants(prev => [...prev, newVariant])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setProductVariants(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeVariant = (index: number) => {
    setProductVariants(prev => prev.filter((_, i) => i !== index))
  }

  // FAQ Management Functions
  const addFAQ = () => {
    const newFAQ: ProductFAQ = {
      id: `temp-${Date.now()}`,
      question: '',
      answer: '',
      position: productFAQs.length,
      is_active: true
    }
    setProductFAQs(prev => [...prev, newFAQ])
  }

  const updateFAQ = (index: number, field: keyof ProductFAQ, value: any) => {
    setProductFAQs(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeFAQ = (index: number) => {
    setProductFAQs(prev => prev.filter((_, i) => i !== index))
  }

  // Features Management
  const addFeature = () => {
    setFeatures(prev => [...prev, ''])
  }

  const updateFeature = (index: number, value: string) => {
    setFeatures(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const removeFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }

  // Specifications Management
  const updateSpecification = (key: string, value: string) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const removeSpecification = (key: string) => {
    setSpecifications(prev => {
      const { [key]: removed, ...rest } = prev
      return rest
    })
  }

  const addSpecification = () => {
    const key = `spec_${Date.now()}`
    setSpecifications(prev => ({
      ...prev,
      [key]: ''
    }))
  }

  // Validate form data
  const validateFormData = (values: any) => {
    const errors: Record<string, string> = {}

    // Basic validation
    if (!values.title || values.title.trim() === '') {
      errors['1'] = 'Product title is required'
    }
    if (!values.category_id) {
      errors['1'] = 'Category is required'
    }
    if (!values.base_price || values.base_price <= 0) {
      errors['1'] = 'Valid price is required'
    }

    // Images validation
    if (productImages.length === 0) {
      errors['2'] = 'At least one product image is required'
    }

    // Variants validation
    const variantsWithoutImages = productVariants.filter(v => !v.image_url && v.is_active)
    if (variantsWithoutImages.length > 0) {
      errors['3'] = `${variantsWithoutImages.length} active variant(s) missing images`
    }

    // A+ content validation
    if (aPlusSections.length === 0 && (!values.description || values.description.trim() === '')) {
      errors['4'] = 'Either description or A+ content sections are required'
    }

    // FAQs validation
    const incompleteFAQs = productFAQs.filter(faq =>
      faq.is_active && (!faq.question.trim() || !faq.answer.trim())
    )
    if (incompleteFAQs.length > 0) {
      errors['5'] = `${incompleteFAQs.length} FAQ(s) incomplete`
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save Product
  const handleSaveProduct = async (values: any) => {
    try {
      setLoading(true)

      // Validate first
      const errors = {}
      // Basic validation
      if (!values.title || values.title.trim() === '') {
        errors['1'] = 'Product title is required'
      }
      if (!values.category_id) {
        errors['1'] = 'Category is required'
      }
      if (!values.base_price || values.base_price <= 0) {
        errors['1'] = 'Valid price is required'
      }

      // Images validation
      if (productImages.length === 0) {
        errors['2'] = 'At least one product image is required'
      }

      // Variants validation
      const variantsWithoutImages = productVariants.filter(v => !v.image_url && v.is_active)
      if (variantsWithoutImages.length > 0) {
        errors['3'] = `${variantsWithoutImages.length} active variant(s) missing images`
      }

      // A+ content validation
      if (aPlusSections.length === 0 && (!values.description || values.description.trim() === '')) {
        errors['4'] = 'Either description or A+ content sections are required'
      }

      // FAQs validation
      const incompleteFAQs = productFAQs.filter(faq =>
        faq.is_active && (!faq.question.trim() || !faq.answer.trim())
      )
      if (incompleteFAQs.length > 0) {
        errors['5'] = `${incompleteFAQs.length} FAQ(s) incomplete`
      }

      setValidationErrors(errors)

      if (Object.keys(errors).length > 0) {
        // Find first tab with errors and switch to it
        const firstErrorTab = Object.keys(errors)[0]
        setActiveTab(firstErrorTab)
        message.error('Please fix validation errors before saving')
        setLoading(false)
        return
      }

      // Generate SKU and slug
      const sku = `SKU-${Date.now().toString(36).toUpperCase()}`
      const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Prepare product data
      const productData = {
        ...values,
        sku,
        slug,
        supplier_id: 'current-supplier-id', // This should come from auth
        a_plus_content: values.a_plus_content || '',
        a_plus_sections: aPlusSections,
        specifications,
        features: features.filter(f => f.trim() !== ''),
        images: productImages.map((img, index) => ({
          url: img.url,
          alt_text: img.alt_text,
          position: index,
          is_primary: img.is_primary
        })),
        variants: productVariants.map(variant => ({
          ...variant,
          sku: variant.sku || `VAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        })),
        faqs: productFAQs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== ''),
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        message.success('Product updated successfully')
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        message.success('Product created successfully')
      }

      // Reset form and close modal
      form.resetFields()
      setProductImages([])
      setProductVariants([])
      setProductFAQs([])
      setFeatures([''])
      setSpecifications({})
      setAPlusSections([])
      setValidationErrors({})
      setModalOpen(false)
      setEditingProduct(null)

      // Refresh products list
      await fetchProducts()
    } catch (error) {
      message.error('Failed to save product')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Load product for editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    form.setFieldsValue(product)
    setProductImages(product.images || [])
    setProductVariants(product.variants || [])
    setProductFAQs(product.faqs || [])
    setFeatures(product.features?.length > 0 ? product.features : [''])
    setSpecifications(product.specifications || {})
    setModalOpen(true)
  }

  // Table columns
  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: Product) => (
        <Space>
          {record.images && record.images.length > 0 ? (
            <Image
              src={record.images.find(img => img.is_primary)?.url || record.images[0]?.url}
              alt={record.title}
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 8 }}
              fallback="/placeholder-image.png"
            />
          ) : (
            <Avatar icon={<ShopOutlined />} size={48} />
          )}
          <div>
            <div style={{ fontWeight: 'bold', maxWidth: 200 }}>{record.title}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>SKU: {record.sku}</div>
            {record.variants && record.variants.length > 0 && (
              <Tag size="small" color="blue">{record.variants.length} variants</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Product) => (
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
      title: 'Price',
      key: 'price',
      render: (_: any, record: Product) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>${record.base_price}</div>
          {record.compare_price && (
            <div style={{
              color: '#999',
              fontSize: '12px',
              textDecoration: 'line-through'
            }}>
              ${record.compare_price}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Content',
      key: 'content',
      render: (_: any, record: Product) => (
        <Space direction="vertical" size="small">
          {record.a_plus_content && (
            <Tag size="small" color="purple" icon={<StarOutlined />}>A+ Content</Tag>
          )}
          {record.faqs && record.faqs.length > 0 && (
            <Tag size="small" color="green" icon={<QuestionCircleOutlined />}>
              {record.faqs.length} FAQs
            </Tag>
          )}
          {record.images && record.images.length > 0 && (
            <Tag size="small" color="blue" icon={<CameraOutlined />}>
              {record.images.length} images
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Tooltip title="View">
            <Button size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this product?"
              description="Are you sure you want to delete this product?"
              onConfirm={() => {/* handleDelete */}}
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
      {/* Header with Actions */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Advanced Products Management</Title>
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
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="electronics">Electronics</Select.Option>
              <Select.Option value="clothing">Clothing</Select.Option>
              <Select.Option value="home">Home & Garden</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

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
        />
      </Card>

      {/* Advanced Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingProduct(null)
          form.resetFields()
          setProductImages([])
          setProductVariants([])
          setProductFAQs([])
          setFeatures([''])
          setSpecifications({})
        }}
        width={1200}
        footer={[
          <Button key="back" onClick={() => {
            setModalOpen(false)
            setEditingProduct(null)
            form.resetFields()
            setProductImages([])
            setProductVariants([])
            setProductFAQs([])
            setFeatures([''])
            setSpecifications({})
          }}>
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
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProduct}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: '1',
                label: (
                  <span>
                    Basic Info
                    {validationErrors['1'] && (
                      <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                        ⚠️ Error
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="title"
                          label="Product Title"
                          rules={[{ required: true, message: 'Please enter product title' }]}
                        >
                          <AntInput placeholder="Enter product title" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="sku" label="SKU">
                          <AntInput placeholder="Auto-generated if empty" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="short_description" label="Short Description">
                      <TextArea rows={2} placeholder="Brief product description for listings" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
                          <Select placeholder="Select category">
                            <Select.Option value="electronics">Electronics</Select.Option>
                            <Select.Option value="clothing">Clothing</Select.Option>
                            <Select.Option value="home">Home & Garden</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="brand_id" label="Brand">
                          <Select placeholder="Select brand" allowClear>
                            <Select.Option value="apple">Apple</Select.Option>
                            <Select.Option value="samsung">Samsung</Select.Option>
                            <Select.Option value="sony">Sony</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="status" label="Status" initialValue="draft">
                          <Select>
                            <Select.Option value="draft">Draft</Select.Option>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="base_price" label="Price" rules={[{ required: true }]}>
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
                        <Form.Item name="tags" label="Tags">
                          <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="Add tags"
                            tokenSeparators={[',']}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )
              },
              {
                key: '2',
                label: (
                  <span>
                    Images
                    {validationErrors['2'] && (
                      <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                        ⚠️ Required
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <ImageUploadManager
                    images={productImages}
                    onChange={setProductImages}
                    maxImages={10}
                  />
                )
              },
              {
                key: '3',
                label: (
                  <span>
                    Variants
                    {validationErrors['3'] && (
                      <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                        ⚠️ Missing Images
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <VariantManager
                    variants={productVariants}
                    productImages={productImages}
                    onChange={setProductVariants}
                  />
                )
              },
              {
                key: '4',
                label: (
                  <span>
                    A+ Content
                    {validationErrors['4'] && (
                      <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                        ⚠️ Required
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <APlusContentManager
                    sections={aPlusSections}
                    onChange={setAPlusSections}
                  />
                )
              },
              {
                key: '5',
                label: (
                  <span>
                    FAQs
                    {validationErrors['5'] && (
                      <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                        ⚠️ Incomplete
                      </Tag>
                    )}
                  </span>
                ),
                children: (
                  <FAQManager
                    faqs={productFAQs}
                    onChange={setProductFAQs}
                  />
                )
              },
              {
                key: '6',
                label: 'SEO',
                children: (
                  <>
                    <Form.Item name="seo_title" label="SEO Title">
                      <AntInput placeholder="SEO Title (50-60 characters recommended)" />
                    </Form.Item>

                    <Form.Item name="seo_description" label="SEO Description">
                      <TextArea rows={3} placeholder="SEO Description (150-160 characters recommended)" />
                    </Form.Item>

                    <Form.Item name="tags" label="Tags">
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="Add tags for better discoverability"
                        tokenSeparators={[',']}
                      />
                    </Form.Item>
                  </>
                )
              }
            ]}
          />
        </Form>
      </Modal>
    </div>
  )
}

export default AdvancedProductManager