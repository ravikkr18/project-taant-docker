'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
import apiClient from '../../lib/api-client'
import type { UploadFile, UploadProps as AntUploadProps } from 'antd/es/upload/interface'
import ImageUploadManager from '../../components/products/image-upload-manager'
import VariantManager, { ProductVariant } from '../../components/products/variant-manager'
import OptimizedVariantManager from '../../components/products/optimized-variant-manager'
import APlusContentImagesManager from '../../components/products/a-plus-content-images-manager'
import FAQManager from '../../components/products/faq-manager'
import SimpleWysiwygEditor from '../../components/ui/simple-wysiwyg-editor'
import SimpleDynamicFields from '../../components/products/simple-dynamic-fields-final'
import InformationSectionsManager from '../../components/products/information-sections-manager-final'
import FloatingHelp from '../../components/ui/floating-help'
import ProductOptionsManager from '../../components/products/product-options-manager'

const { Title, Text, Paragraph } = Typography
const { Search } = Input
const { TextArea } = AntInput
const { Panel } = Collapse

// Dynamic Field Interfaces
interface SimpleField {
  id: string
  option: string
  value: string | number | null
}

interface InfoItem {
  id: string
  key: string
  value: string
}

interface InfoSection {
  id: string
  title: string
  items: InfoItem[]
  isExpanded: boolean
}

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
  cost_price: number
  compare_price: number
  category_id: string
  brand_id: string
  images?: ProductImage[]
  product_images?: ProductImage[]
  product_variants?: any[]
  variants: ProductVariant[]
  faqs: ProductFAQ[]
  suppliers?: {
    id: string
    business_name: string
    slug: string
    rating: number
    is_verified: boolean
    status: string
  }
  variant_count?: number
  total_revenue?: number
  total_sales?: number
  rating?: number
  total_reviews?: number
  view_count?: number
  wishlist_count?: number
  is_featured?: boolean
  specifications: Record<string, any>
  features: string[]
  warranty_months: number
  warranty_text: string
  tags: string[]
  seo_title: string
  seo_description: string
  // Product Details fields
  weight?: number
  length?: number
  width?: number
  height?: number
  origin_country?: string
  manufacturer?: string
  model_number?: string
  shipping_requirements?: string
  // Product Information fields
  included_items?: string[]
  compatibility?: string
  safety_warnings?: string
  care_instructions?: string
  // Dynamic fields and information sections
  simple_fields?: SimpleField[]
  information_sections?: InfoSection[]
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
  const [contentImages, setContentImages] = useState<Array<any>>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [originalVariants, setOriginalVariants] = useState<ProductVariant[]>([])
  const [variantsWereModified, setVariantsWereModified] = useState(false)
  const [calculatedVolume, setCalculatedVolume] = useState<string>('0.00')

  // Calculate volume instantly when dimensions change
  const calculateVolume = useCallback(() => {
    const formValues = form.getFieldsValue(['length', 'width', 'height'])
    const length = formValues.length || 0
    const width = formValues.width || 0
    const height = formValues.height || 0

    const volume = (length * width * height) / 1000000 // Convert cm³ to m³
    const volumeLiters = (length * width * height) / 1000 // Convert cm³ to liters

    if (volume > 0) {
      if (volume >= 1) {
        setCalculatedVolume(`${volume.toFixed(4)} m³`)
      } else {
        setCalculatedVolume(`${volumeLiters.toFixed(2)} L`)
      }
    } else {
      setCalculatedVolume('0.00 L')
    }
  }, [form])

  // Calculate volume when product is loaded
  useEffect(() => {
    if (editingProduct) {
      calculateVolume()
    }
  }, [editingProduct, calculateVolume])

  // Helper function to check if variants have been modified
  const areVariantsModified = (newVariants: ProductVariant[], originalVariants: ProductVariant[]): boolean => {
    if (newVariants.length !== originalVariants.length) return true

    return newVariants.some((newVariant, index) => {
      const originalVariant = originalVariants[index]
      if (!originalVariant) return true

      // Compare key fields to detect actual changes
      return (
        newVariant.title !== originalVariant.title ||
        newVariant.price !== originalVariant.price ||
        newVariant.compare_price !== originalVariant.compare_price ||
        newVariant.cost_price !== originalVariant.cost_price ||
        newVariant.sku !== originalVariant.sku ||
        newVariant.weight !== originalVariant.weight ||
        newVariant.inventory_quantity !== originalVariant.inventory_quantity ||
        newVariant.is_active !== originalVariant.is_active ||
        JSON.stringify(newVariant.options) !== JSON.stringify(originalVariant.options) ||
        newVariant.position !== originalVariant.position ||
        newVariant.image_id !== originalVariant.image_id
      )
    })
  }

  // Debug: Log contentImages changes
  React.useEffect(() => {
    console.log('AdvancedProductsManager - contentImages state updated:', contentImages.length, contentImages.map(img => ({ id: img.id, url: img.url.substring(0, 50) + '...', alt_text: img.alt_text })))
  }, [contentImages])

  // Debug: Create a wrapper function to track setContentImages calls
  const setContentImagesWithLogging = useCallback((newImages: any[]) => {
    console.log('AdvancedProductsManager - setContentImages called with:', newImages.length, 'images')
    console.log('AdvancedProductsManager - New images preview:', newImages.map(img => ({ id: img.id, hasUrl: !!img.url, urlType: img.url?.substring(0, 10) })))
    setContentImages(newImages)
  }, [])
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
  // New dynamic fields and information sections state
  const [simpleFields, setSimpleFields] = useState<SimpleField[]>([])
  const [informationSections, setInformationSections] = useState<InfoSection[]>([])

  
  // Validation errors tracking
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const hasInitialized = useRef(false)

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🪟 MODAL STATE CHANGED - modalOpen:', modalOpen, 'editingProduct:', editingProduct?.title || 'null')
  }, [modalOpen, editingProduct])

  // Debug: Log tab changes
  useEffect(() => {
    console.log('📋 TAB CHANGED - activeTab:', activeTab, 'for product:', editingProduct?.title || 'null')
  }, [activeTab, editingProduct])

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Custom tab change handler with variant refresh logic
  const handleTabChange = (tabKey: string) => {
    console.log('🔥🔥🔥 TAB CHANGE FIRED! - to tab:', tabKey, 'for product:', editingProduct?.title || 'null')

    // If switching to Variants tab (key '3'), reload variants from current product
    if (tabKey === '3' && editingProduct) {
      console.log('🔄 SWITCHING TO VARIANTS TAB - Reloading fresh variant data for product:', editingProduct.title)

      const variants = editingProduct.product_variants || editingProduct.variants || []
      console.log('📦 LOADING VARIANTS FROM PRODUCT - Found', variants.length, 'variants')
      console.log('📋 RAW VARIANTS DATA:', JSON.stringify(variants, null, 2))

      // Reset variant state with fresh data from the current product
      setProductVariants(JSON.parse(JSON.stringify(variants))) // Deep copy to prevent reference issues
      setOriginalVariants(JSON.parse(JSON.stringify(variants))) // Reset original variants
      setVariantsWereModified(false) // Reset modification flag

      console.log('✅ VARIANTS REFRESHED - Product variants loaded fresh for tab switch')
    }

    // If switching to Images tab (key '2'), refresh images to ensure latest data
    if (tabKey === '2' && editingProduct) {
      console.log('🔄 SWITCHING TO IMAGES TAB - Refreshing images for product:', editingProduct.title)
      loadProductImages(editingProduct.id)
    }

    // Set the new active tab
    setActiveTab(tabKey)
    console.log('✅ TAB SWITCHED TO:', tabKey)
  }

  // Debug: Log when validationErrors changes
  useEffect(() => {
    console.log('validationErrors state updated:', validationErrors)
    console.log('Object.keys(validationErrors):', Object.keys(validationErrors))

    // Clear field errors when validation errors are cleared
    if (Object.keys(validationErrors).length === 0) {
      setFieldErrors({})
    }
  }, [validationErrors])

  // Validation error summary component
  const ValidationErrorSummary = () => {
    const errorCount = Object.keys(validationErrors).length
    if (errorCount === 0) return null

    const tabNames: Record<string, string> = {
      '1': 'Basic Info',
      '2': 'Images',
      '3': 'Variants',
      '4': 'A+ Content',
      '5': 'FAQs',
      '6': 'Product Details',
      '7': 'Product Information'
    }

    return (
      <Alert
        message={`${errorCount} Validation Error${errorCount > 1 ? 's' : ''} Found`}
        description={
          <div>
            <p>Please fix the following errors:</p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {Object.entries(validationErrors).map(([tabKey, errorMessage]) => (
                <li key={tabKey}>
                  <strong>{tabNames[tabKey] || `Tab ${tabKey}`}:</strong> {errorMessage}
                </li>
              ))}
            </ul>
          </div>
        }
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
        closable
      />
    )
  }

  // Load content images for a product
  const loadContentImages = async (productId: string) => {
    console.log('🔄 Loading content images for product:', productId)
    if (!productId) {
      console.log('❌ No productId provided, setting empty contentImages')
      setContentImages([])
      return
    }

    try {
      console.log('📡 Calling API to get content images...')
      const images = await apiClient.getAPlusContentImages(productId)
      console.log('✅ Content images loaded:', images.length, images)
      setContentImages(images)
    } catch (error) {
      console.error('❌ Failed to load content images:', error)
      setContentImages([])
    }
  }

  // Load product images for a product
  const loadProductImages = async (productId: string) => {
    console.log('🔄 Loading product images for product:', productId)
    if (!productId) {
      console.log('❌ No productId provided, setting empty productImages')
      setProductImages([])
      return
    }

    try {
      console.log('📡 Calling API to get product images...')
      const images = await apiClient.getProductImages(productId)
      console.log('✅ Product images loaded:', images.length, images)
      setProductImages(images)
    } catch (error) {
      console.error('❌ Failed to load product images:', error)
      setProductImages([])
    }
  }

  // Memoized tab items to ensure proper re-rendering when validationErrors changes
  const tabItems = useMemo(() => [
    {
      key: '1',
      label: (
        <span>
          Basic Info
          {validationErrors['1'] && (
            <Tooltip title={validationErrors['1']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['1']}
              </Tag>
            </Tooltip>
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
                style={{ marginBottom: 8 }}
                help={fieldErrors['title']}
                validateStatus={fieldErrors['title'] ? 'error' : ''}
                rules={[
                  { required: true, message: 'Please enter product title' },
                  { max: 200, message: 'Title must be less than 200 characters' },
                  {
                    pattern: /^[^<>]*$/,
                    message: 'Title cannot contain HTML tags'
                  }
                ]}
              >
                <AntInput placeholder="Enter product title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[
                  { max: 50, message: 'SKU must be less than 50 characters' },
                  {
                    pattern: /^[A-Z0-9-_]*$/i,
                    message: 'SKU can only contain letters, numbers, hyphens, and underscores'
                  }
                ]}
              >
                <AntInput
                  placeholder="Auto-generated if empty"
                  disabled={editingProduct?.sku !== ''}
                  title={editingProduct?.sku ?
                    "SKU cannot be modified once generated" :
                    "Enter SKU or leave empty to auto-generate"
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="short_description"
            label="Short Description"
            rules={[
              { max: 160, message: 'Short description must be less than 160 characters' },
              {
                pattern: /^[^<>]*$/,
                message: 'Description cannot contain HTML tags'
              }
            ]}
          >
            <TextArea rows={2} placeholder="Brief product description for listings" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="category_id"
                label="Category"
                style={{ marginBottom: 8 }}
                help={fieldErrors['category_id']}
                validateStatus={fieldErrors['category_id'] ? 'error' : ''}
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select placeholder="Select category">
                  {categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
                        <Col span={12}>
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
            <Col span={6}>
              <Form.Item
                name="cost_price"
                label="Cost Price"
                style={{ marginBottom: 8 }}
                help={fieldErrors['cost_price']}
                validateStatus={fieldErrors['cost_price'] ? 'error' : ''}
                rules={[{ required: true, message: 'Please enter cost price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/₹\s?|(,*)/g, '')) as any}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="base_price"
                label="Selling Price"
                style={{ marginBottom: 8 }}
                help={fieldErrors['base_price']}
                validateStatus={fieldErrors['base_price'] ? 'error' : ''}
                rules={[{ required: true, message: 'Please enter selling price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/₹\s?|(,*)/g, '')) as any}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="compare_price" label="MRP">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/₹\s?|(,*)/g, '')) as any}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            </Row>

          <Divider>Product Inventory & Options</Divider>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="quantity"
                label="Quantity"
                style={{ marginBottom: 8 }}
                help="Main product inventory quantity"
                rules={[
                  { required: true, message: 'Please enter quantity' },
                  { type: 'number', min: 0, message: 'Quantity must be 0 or greater' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  precision={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/\$s?|(,*)/g, '')) as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="options"
                label="Product Options"
                style={{ marginBottom: 8 }}
                help="Add options similar to variant options (e.g., Color, Size, etc.)"
              >
                <ProductOptionsManager />
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
            <Tooltip title={validationErrors['2']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['2']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <ImageUploadManager
            images={productImages}
            onChange={setProductImages}
            maxImages={10}
            productId={editingProduct?.id}
          />
            </>
      )
    },
    {
      key: '3',
      label: (
        <span>
          Variants
          {validationErrors['3'] && (
            <Tooltip title={validationErrors['3']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['3']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          {editingProduct ? (
            <OptimizedVariantManager
              key={`variants-${editingProduct.id}`}
              productId={editingProduct.id}
              initialVariants={productVariants}
              onVariantCountChange={(count) => {
                // Update the editing product with new variant count
                setEditingProduct(prev => {
                  if (prev) {
                    return { ...prev, variant_count: count }
                  }
                  return prev
                })
              }}
            />
          ) : (
            <VariantManager
              variants={productVariants}
              productImages={productImages}
              onChange={(newVariants) => {
                console.log('ProductVariants changed from:', productVariants)
                console.log('ProductVariants changed to:', newVariants)
                setProductVariants(newVariants)

                // Check if variants were actually modified compared to original
                const modified = areVariantsModified(newVariants, originalVariants)
                console.log('Variants were modified:', modified)
                setVariantsWereModified(modified)
              }}
            />
          )}
          </>
      )
    },
    {
      key: '4',
      label: (
        <span>
          A+ Content
          {validationErrors['4'] && (
            <Tooltip title={validationErrors['4']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['4']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <APlusContentImagesManager
            key={`content-images-${editingProduct?.id || 'new'}`}
            productId={editingProduct?.id || ''}
            onChange={setContentImagesWithLogging}
          />
            </>
      )
    },
    {
      key: '5',
      label: (
        <span>
          FAQs
          {validationErrors['5'] && (
            <Tooltip title={validationErrors['5']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['5']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <FAQManager
            faqs={productFAQs}
            onChange={setProductFAQs}
          />
              </>
      )
    },
    {
      key: '6',
      label: (
        <span>
          Product Details
          {validationErrors['6'] && (
            <Tooltip title={validationErrors['6']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['6']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <Card title="Basic Specifications" style={{ marginBottom: 16 }}>
            <Row gutter={[12, 8]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="weight" label="Weight (kg)" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                                      />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="warranty_months" label="Warranty (months)" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                                        precision={0}
                    controls={true}
                    keyboard={true}
                    parser={(value: string | undefined) => {
                      // Only allow digits
                      const digitsOnly = (value || '').replace(/[^\d]/g, '')
                      return parseInt(digitsOnly) || 0
                    }}
                    formatter={(value: number | string | undefined) => {
                      if (value === undefined || value === null) return ''
                      return Math.floor(Number(value)).toString()
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item
                  name="origin_country"
                  label="Country of Origin"
                  style={{ marginBottom: 8 }}
                  help={fieldErrors['origin_country']}
                  validateStatus={fieldErrors['origin_country'] ? 'error' : ''}
                >
                  <Select
                    placeholder="Select country"
                    allowClear
                    size="small"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Select.Option value="AF">Afghanistan</Select.Option>
                    <Select.Option value="AL">Albania</Select.Option>
                    <Select.Option value="DZ">Algeria</Select.Option>
                    <Select.Option value="AS">American Samoa</Select.Option>
                    <Select.Option value="AD">Andorra</Select.Option>
                    <Select.Option value="AO">Angola</Select.Option>
                    <Select.Option value="AI">Anguilla</Select.Option>
                    <Select.Option value="AQ">Antarctica</Select.Option>
                    <Select.Option value="AG">Antigua and Barbuda</Select.Option>
                    <Select.Option value="AR">Argentina</Select.Option>
                    <Select.Option value="AM">Armenia</Select.Option>
                    <Select.Option value="AW">Aruba</Select.Option>
                    <Select.Option value="AU">Australia</Select.Option>
                    <Select.Option value="AT">Austria</Select.Option>
                    <Select.Option value="AZ">Azerbaijan</Select.Option>
                    <Select.Option value="BS">Bahamas</Select.Option>
                    <Select.Option value="BH">Bahrain</Select.Option>
                    <Select.Option value="BD">Bangladesh</Select.Option>
                    <Select.Option value="BB">Barbados</Select.Option>
                    <Select.Option value="BY">Belarus</Select.Option>
                    <Select.Option value="BE">Belgium</Select.Option>
                    <Select.Option value="BZ">Belize</Select.Option>
                    <Select.Option value="BJ">Benin</Select.Option>
                    <Select.Option value="BM">Bermuda</Select.Option>
                    <Select.Option value="BT">Bhutan</Select.Option>
                    <Select.Option value="BO">Bolivia</Select.Option>
                    <Select.Option value="BQ">Bonaire, Sint Eustatius and Saba</Select.Option>
                    <Select.Option value="BA">Bosnia and Herzegovina</Select.Option>
                    <Select.Option value="BW">Botswana</Select.Option>
                    <Select.Option value="BR">Brazil</Select.Option>
                    <Select.Option value="IO">British Indian Ocean Territory</Select.Option>
                    <Select.Option value="BN">Brunei Darussalam</Select.Option>
                    <Select.Option value="BG">Bulgaria</Select.Option>
                    <Select.Option value="BF">Burkina Faso</Select.Option>
                    <Select.Option value="BI">Burundi</Select.Option>
                    <Select.Option value="CV">Cabo Verde</Select.Option>
                    <Select.Option value="KH">Cambodia</Select.Option>
                    <Select.Option value="CM">Cameroon</Select.Option>
                    <Select.Option value="CA">Canada</Select.Option>
                    <Select.Option value="KY">Cayman Islands</Select.Option>
                    <Select.Option value="CF">Central African Republic</Select.Option>
                    <Select.Option value="TD">Chad</Select.Option>
                    <Select.Option value="CL">Chile</Select.Option>
                    <Select.Option value="CN">China</Select.Option>
                    <Select.Option value="CX">Christmas Island</Select.Option>
                    <Select.Option value="CC">Cocos (Keeling) Islands</Select.Option>
                    <Select.Option value="CO">Colombia</Select.Option>
                    <Select.Option value="KM">Comoros</Select.Option>
                    <Select.Option value="CG">Congo</Select.Option>
                    <Select.Option value="CD">Congo, Democratic Republic of the</Select.Option>
                    <Select.Option value="CK">Cook Islands</Select.Option>
                    <Select.Option value="CR">Costa Rica</Select.Option>
                    <Select.Option value="CI">Côte d'Ivoire</Select.Option>
                    <Select.Option value="HR">Croatia</Select.Option>
                    <Select.Option value="CU">Cuba</Select.Option>
                    <Select.Option value="CW">Curaçao</Select.Option>
                    <Select.Option value="CY">Cyprus</Select.Option>
                    <Select.Option value="CZ">Czechia</Select.Option>
                    <Select.Option value="DK">Denmark</Select.Option>
                    <Select.Option value="DJ">Djibouti</Select.Option>
                    <Select.Option value="DM">Dominica</Select.Option>
                    <Select.Option value="DO">Dominican Republic</Select.Option>
                    <Select.Option value="EC">Ecuador</Select.Option>
                    <Select.Option value="EG">Egypt</Select.Option>
                    <Select.Option value="SV">El Salvador</Select.Option>
                    <Select.Option value="GQ">Equatorial Guinea</Select.Option>
                    <Select.Option value="ER">Eritrea</Select.Option>
                    <Select.Option value="EE">Estonia</Select.Option>
                    <Select.Option value="SZ">Eswatini</Select.Option>
                    <Select.Option value="ET">Ethiopia</Select.Option>
                    <Select.Option value="FK">Falkland Islands (Malvinas)</Select.Option>
                    <Select.Option value="FO">Faroe Islands</Select.Option>
                    <Select.Option value="FJ">Fiji</Select.Option>
                    <Select.Option value="FI">Finland</Select.Option>
                    <Select.Option value="FR">France</Select.Option>
                    <Select.Option value="GF">French Guiana</Select.Option>
                    <Select.Option value="PF">French Polynesia</Select.Option>
                    <Select.Option value="TF">French Southern Territories</Select.Option>
                    <Select.Option value="GA">Gabon</Select.Option>
                    <Select.Option value="GM">Gambia</Select.Option>
                    <Select.Option value="GE">Georgia</Select.Option>
                    <Select.Option value="DE">Germany</Select.Option>
                    <Select.Option value="GH">Ghana</Select.Option>
                    <Select.Option value="GI">Gibraltar</Select.Option>
                    <Select.Option value="GR">Greece</Select.Option>
                    <Select.Option value="GL">Greenland</Select.Option>
                    <Select.Option value="GD">Grenada</Select.Option>
                    <Select.Option value="GP">Guadeloupe</Select.Option>
                    <Select.Option value="GU">Guam</Select.Option>
                    <Select.Option value="GT">Guatemala</Select.Option>
                    <Select.Option value="GG">Guernsey</Select.Option>
                    <Select.Option value="GN">Guinea</Select.Option>
                    <Select.Option value="GW">Guinea-Bissau</Select.Option>
                    <Select.Option value="GY">Guyana</Select.Option>
                    <Select.Option value="HT">Haiti</Select.Option>
                    <Select.Option value="VA">Holy See</Select.Option>
                    <Select.Option value="HN">Honduras</Select.Option>
                    <Select.Option value="HK">Hong Kong</Select.Option>
                    <Select.Option value="HU">Hungary</Select.Option>
                    <Select.Option value="IS">Iceland</Select.Option>
                    <Select.Option value="IN">India</Select.Option>
                    <Select.Option value="ID">Indonesia</Select.Option>
                    <Select.Option value="IR">Iran, Islamic Republic of</Select.Option>
                    <Select.Option value="IQ">Iraq</Select.Option>
                    <Select.Option value="IE">Ireland</Select.Option>
                    <Select.Option value="IM">Isle of Man</Select.Option>
                    <Select.Option value="IL">Israel</Select.Option>
                    <Select.Option value="IT">Italy</Select.Option>
                    <Select.Option value="JM">Jamaica</Select.Option>
                    <Select.Option value="JP">Japan</Select.Option>
                    <Select.Option value="JE">Jersey</Select.Option>
                    <Select.Option value="JO">Jordan</Select.Option>
                    <Select.Option value="KZ">Kazakhstan</Select.Option>
                    <Select.Option value="KE">Kenya</Select.Option>
                    <Select.Option value="KI">Kiribati</Select.Option>
                    <Select.Option value="KP">Korea, Democratic People's Republic of</Select.Option>
                    <Select.Option value="KR">Korea, Republic of</Select.Option>
                    <Select.Option value="KW">Kuwait</Select.Option>
                    <Select.Option value="KG">Kyrgyzstan</Select.Option>
                    <Select.Option value="LA">Lao People's Democratic Republic</Select.Option>
                    <Select.Option value="LV">Latvia</Select.Option>
                    <Select.Option value="LB">Lebanon</Select.Option>
                    <Select.Option value="LS">Lesotho</Select.Option>
                    <Select.Option value="LR">Liberia</Select.Option>
                    <Select.Option value="LY">Libya</Select.Option>
                    <Select.Option value="LI">Liechtenstein</Select.Option>
                    <Select.Option value="LT">Lithuania</Select.Option>
                    <Select.Option value="LU">Luxembourg</Select.Option>
                    <Select.Option value="MO">Macao</Select.Option>
                    <Select.Option value="MG">Madagascar</Select.Option>
                    <Select.Option value="MW">Malawi</Select.Option>
                    <Select.Option value="MY">Malaysia</Select.Option>
                    <Select.Option value="MV">Maldives</Select.Option>
                    <Select.Option value="ML">Mali</Select.Option>
                    <Select.Option value="MT">Malta</Select.Option>
                    <Select.Option value="MH">Marshall Islands</Select.Option>
                    <Select.Option value="MQ">Martinique</Select.Option>
                    <Select.Option value="MR">Mauritania</Select.Option>
                    <Select.Option value="MU">Mauritius</Select.Option>
                    <Select.Option value="YT">Mayotte</Select.Option>
                    <Select.Option value="MX">Mexico</Select.Option>
                    <Select.Option value="FM">Micronesia, Federated States of</Select.Option>
                    <Select.Option value="MD">Moldova, Republic of</Select.Option>
                    <Select.Option value="MC">Monaco</Select.Option>
                    <Select.Option value="MN">Mongolia</Select.Option>
                    <Select.Option value="ME">Montenegro</Select.Option>
                    <Select.Option value="MS">Montserrat</Select.Option>
                    <Select.Option value="MA">Morocco</Select.Option>
                    <Select.Option value="MZ">Mozambique</Select.Option>
                    <Select.Option value="MM">Myanmar</Select.Option>
                    <Select.Option value="NA">Namibia</Select.Option>
                    <Select.Option value="NR">Nauru</Select.Option>
                    <Select.Option value="NP">Nepal</Select.Option>
                    <Select.Option value="NL">Netherlands</Select.Option>
                    <Select.Option value="NC">New Caledonia</Select.Option>
                    <Select.Option value="NZ">New Zealand</Select.Option>
                    <Select.Option value="NI">Nicaragua</Select.Option>
                    <Select.Option value="NE">Niger</Select.Option>
                    <Select.Option value="NG">Nigeria</Select.Option>
                    <Select.Option value="NU">Niue</Select.Option>
                    <Select.Option value="NF">Norfolk Island</Select.Option>
                    <Select.Option value="MK">North Macedonia</Select.Option>
                    <Select.Option value="MP">Northern Mariana Islands</Select.Option>
                    <Select.Option value="NO">Norway</Select.Option>
                    <Select.Option value="OM">Oman</Select.Option>
                    <Select.Option value="PK">Pakistan</Select.Option>
                    <Select.Option value="PW">Palau</Select.Option>
                    <Select.Option value="PS">Palestine, State of</Select.Option>
                    <Select.Option value="PA">Panama</Select.Option>
                    <Select.Option value="PG">Papua New Guinea</Select.Option>
                    <Select.Option value="PY">Paraguay</Select.Option>
                    <Select.Option value="PE">Peru</Select.Option>
                    <Select.Option value="PH">Philippines</Select.Option>
                    <Select.Option value="PL">Poland</Select.Option>
                    <Select.Option value="PT">Portugal</Select.Option>
                    <Select.Option value="PR">Puerto Rico</Select.Option>
                    <Select.Option value="QA">Qatar</Select.Option>
                    <Select.Option value="RE">Réunion</Select.Option>
                    <Select.Option value="RO">Romania</Select.Option>
                    <Select.Option value="RU">Russian Federation</Select.Option>
                    <Select.Option value="RW">Rwanda</Select.Option>
                    <Select.Option value="BL">Saint Barthélemy</Select.Option>
                    <Select.Option value="SH">Saint Helena, Ascension and Tristan da Cunha</Select.Option>
                    <Select.Option value="KN">Saint Kitts and Nevis</Select.Option>
                    <Select.Option value="LC">Saint Lucia</Select.Option>
                    <Select.Option value="MF">Saint Martin (French part)</Select.Option>
                    <Select.Option value="PM">Saint Pierre and Miquelon</Select.Option>
                    <Select.Option value="VC">Saint Vincent and the Grenadines</Select.Option>
                    <Select.Option value="WS">Samoa</Select.Option>
                    <Select.Option value="SM">San Marino</Select.Option>
                    <Select.Option value="ST">Sao Tome and Principe</Select.Option>
                    <Select.Option value="SA">Saudi Arabia</Select.Option>
                    <Select.Option value="SN">Senegal</Select.Option>
                    <Select.Option value="RS">Serbia</Select.Option>
                    <Select.Option value="SC">Seychelles</Select.Option>
                    <Select.Option value="SL">Sierra Leone</Select.Option>
                    <Select.Option value="SG">Singapore</Select.Option>
                    <Select.Option value="SX">Sint Maarten (Dutch part)</Select.Option>
                    <Select.Option value="SK">Slovakia</Select.Option>
                    <Select.Option value="SI">Slovenia</Select.Option>
                    <Select.Option value="SB">Solomon Islands</Select.Option>
                    <Select.Option value="SO">Somalia</Select.Option>
                    <Select.Option value="ZA">South Africa</Select.Option>
                    <Select.Option value="GS">South Georgia and the South Sandwich Islands</Select.Option>
                    <Select.Option value="SS">South Sudan</Select.Option>
                    <Select.Option value="ES">Spain</Select.Option>
                    <Select.Option value="LK">Sri Lanka</Select.Option>
                    <Select.Option value="SD">Sudan</Select.Option>
                    <Select.Option value="SR">Suriname</Select.Option>
                    <Select.Option value="SJ">Svalbard and Jan Mayen</Select.Option>
                    <Select.Option value="SE">Sweden</Select.Option>
                    <Select.Option value="CH">Switzerland</Select.Option>
                    <Select.Option value="SY">Syrian Arab Republic</Select.Option>
                    <Select.Option value="TW">Taiwan, Province of China</Select.Option>
                    <Select.Option value="TJ">Tajikistan</Select.Option>
                    <Select.Option value="TZ">Tanzania, United Republic of</Select.Option>
                    <Select.Option value="TH">Thailand</Select.Option>
                    <Select.Option value="TL">Timor-Leste</Select.Option>
                    <Select.Option value="TG">Togo</Select.Option>
                    <Select.Option value="TK">Tokelau</Select.Option>
                    <Select.Option value="TO">Tonga</Select.Option>
                    <Select.Option value="TT">Trinidad and Tobago</Select.Option>
                    <Select.Option value="TN">Tunisia</Select.Option>
                    <Select.Option value="TR">Turkey</Select.Option>
                    <Select.Option value="TM">Turkmenistan</Select.Option>
                    <Select.Option value="TC">Turks and Caicos Islands</Select.Option>
                    <Select.Option value="TV">Tuvalu</Select.Option>
                    <Select.Option value="UG">Uganda</Select.Option>
                    <Select.Option value="UA">Ukraine</Select.Option>
                    <Select.Option value="AE">United Arab Emirates</Select.Option>
                    <Select.Option value="GB">United Kingdom</Select.Option>
                    <Select.Option value="US">United States</Select.Option>
                    <Select.Option value="UM">United States Minor Outlying Islands</Select.Option>
                    <Select.Option value="UY">Uruguay</Select.Option>
                    <Select.Option value="UZ">Uzbekistan</Select.Option>
                    <Select.Option value="VU">Vanuatu</Select.Option>
                    <Select.Option value="VE">Venezuela, Bolivarian Republic of</Select.Option>
                    <Select.Option value="VN">Viet Nam</Select.Option>
                    <Select.Option value="VG">Virgin Islands, British</Select.Option>
                    <Select.Option value="VI">Virgin Islands, U.S.</Select.Option>
                    <Select.Option value="WF">Wallis and Futuna</Select.Option>
                    <Select.Option value="EH">Western Sahara</Select.Option>
                    <Select.Option value="YE">Yemen</Select.Option>
                    <Select.Option value="ZM">Zambia</Select.Option>
                    <Select.Option value="ZW">Zimbabwe</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item
                  name="model_number"
                  label="Model Number (Optional)"
                  style={{ marginBottom: 8 }}
                  rules={[
                    { max: 50, message: 'Model number must be less than 50 characters' },
                    {
                      pattern: /^[A-Z0-9-_\s]*$/i,
                      message: 'Model number can only contain letters, numbers, hyphens, underscores, and spaces'
                    }
                  ]}
                >
                  <AntInput placeholder="Model/part number" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Dimensions (cm)" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 12]}>
              <Col xs={24} lg={16}>
                <Form.Item label="Product Dimensions" style={{ marginBottom: 12 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    backgroundColor: '#fafafa'
                  }}>
                    <Form.Item name="length" noStyle style={{ flex: 1, margin: 0 }}>
                      <InputNumber
                        placeholder="Length"
                        step={0.1}
                        min={0}
                        size="small"
                        style={{ width: '100%', fontWeight: '500' }}
                        addonBefore="L"
                        onBlur={calculateVolume}
                      />
                    </Form.Item>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1890ff',
                      padding: '0 4px'
                    }}>
                      ×
                    </span>
                    <Form.Item name="width" noStyle style={{ flex: 1, margin: 0 }}>
                      <InputNumber
                        placeholder="Width"
                        step={0.1}
                        min={0}
                        size="small"
                        style={{ width: '100%', fontWeight: '500' }}
                        addonBefore="W"
                        onBlur={calculateVolume}
                      />
                    </Form.Item>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1890ff',
                      padding: '0 4px'
                    }}>
                      ×
                    </span>
                    <Form.Item name="height" noStyle style={{ flex: 1, margin: 0 }}>
                      <InputNumber
                        placeholder="Height"
                        step={0.1}
                        min={0}
                        size="small"
                        style={{ width: '100%', fontWeight: '500' }}
                        addonBefore="H"
                        onBlur={calculateVolume}
                      />
                    </Form.Item>
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      marginLeft: 8,
                      fontWeight: '500'
                    }}>
                      cm
                    </span>
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item label="Volume" style={{ marginBottom: 12 }}>
                  <Input
                    value={calculatedVolume}
                    readOnly
                    size="small"
                    style={{
                      backgroundColor: '#f0f8ff',
                      color: '#1890ff',
                      fontWeight: '600',
                      textAlign: 'center',
                      border: '1px solid #b3d8ff',
                      fontSize: '14px'
                    }}
                    placeholder="L × W × H"
                    prefix={<span style={{ color: '#1890ff' }}>📦</span>}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Additional Information" style={{ marginBottom: 16 }}>
            <Row gutter={[12, 8]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="manufacturer"
                  label="Manufacturer"
                  style={{ marginBottom: 8 }}
                  help={fieldErrors['manufacturer']}
                  validateStatus={fieldErrors['manufacturer'] ? 'error' : ''}
                  rules={[
                    { max: 100, message: 'Manufacturer name must be less than 100 characters' },
                    {
                      pattern: /^[^<>]*$/,
                      message: 'Manufacturer name cannot contain HTML tags'
                    }
                  ]}
                >
                  <AntInput placeholder="Manufacturer name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[12, 8]}>
              <Col xs={24}>
                <Form.Item name="warranty_text" label="Warranty Information" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    placeholder="Detailed warranty information and terms"
                                      />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[12, 8]}>
              <Col xs={24}>
                <Form.Item name="shipping_requirements" label="Shipping Requirements" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    placeholder="Special shipping instructions or requirements"
                                      />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <SimpleDynamicFields
            fields={simpleFields}
            onChange={setSimpleFields}
            title="Additional Product Details"
          />

          </>
      )
    },
    {
      key: '7',
      label: (
        <span>
          Product Information
          {validationErrors['7'] && (
            <Tooltip title={validationErrors['7']}>
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['7']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <Form.Item
            name="description"
            label="Detailed Description"
            style={{ marginBottom: 8 }}
            help={fieldErrors['description']}
            validateStatus={fieldErrors['description'] ? 'error' : ''}
          >
            <SimpleWysiwygEditor
              value={form.getFieldValue('description') || ''}
              onChange={(value) => form.setFieldValue('description', value)}
              placeholder="Comprehensive product description with features, benefits, and use cases"
              height={200}
            />
          </Form.Item>

          <div>
            <Form.Item name="features" label="Key Features">
              <Input.TextArea
                placeholder="• Premium quality material&#10;• Easy to install&#10;• Energy efficient design&#10;• 2-year warranty included"
                rows={6}
              />
            </Form.Item>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              💡 Enter one feature per line (press Enter for new line)
            </div>
          </div>

          <InformationSectionsManager
            sections={informationSections}
            onChange={setInformationSections}
            title="Product Information Sections"
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="included_items" label="What's in the Box">
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="List included items"
                  tokenSeparators={[',', '\n']}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="compatibility" label="Compatibility">
                <SimpleWysiwygEditor
                  value={form.getFieldValue('compatibility') || ''}
                  onChange={(value) => form.setFieldValue('compatibility', value)}
                  placeholder="Compatibility information with other products or systems"
                  height={120}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="safety_warnings" label="Safety Warnings & Usage Instructions">
            <SimpleWysiwygEditor
              value={form.getFieldValue('safety_warnings') || ''}
              onChange={(value) => form.setFieldValue('safety_warnings', value)}
              placeholder="Important safety information and usage guidelines"
              height={120}
            />
          </Form.Item>

          <Form.Item name="care_instructions" label="Care & Maintenance">
            <SimpleWysiwygEditor
              value={form.getFieldValue('care_instructions') || ''}
              onChange={(value) => form.setFieldValue('care_instructions', value)}
              placeholder="Instructions for product care and maintenance"
              height={100}
            />
          </Form.Item>

          </>
      )
    },
    {
      key: '8',
      label: 'SEO',
      children: (
        <>
          <Form.Item
            name="seo_title"
            label="SEO Title"
            rules={[
              { max: 60, message: 'SEO title should be 50-60 characters for best results' },
              {
                pattern: /^[^<>]*$/,
                message: 'SEO title cannot contain HTML tags'
              }
            ]}
          >
            <AntInput placeholder="SEO Title (50-60 characters recommended)" />
          </Form.Item>

          <Form.Item
            name="seo_description"
            label="SEO Description"
            rules={[
              { max: 160, message: 'SEO description should be 150-160 characters for best results' },
              {
                pattern: /^[^<>]*$/,
                message: 'SEO description cannot contain HTML tags'
              }
            ]}
          >
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
  ], [validationErrors, productImages, productVariants, aPlusSections, productFAQs])

  // Helper function to get supplier ID for current user
  // TODO: Replace with backend API call for supplier authentication
  const getSupplierId = async () => {
    // Temporarily hardcoded supplier ID to fix immediate connectivity issues
    // In production, this should call the backend to get the authenticated supplier's ID
    return 'fa0ca8e0-f848-45b9-b107-21e56b38573f'
  }

  // Fetch products
  const fetchProducts = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const supplierId = await getSupplierId()

      const response = await apiClient.getProducts(
        supplierId,
        categoryFilter,
        page,
        pageSize,
        searchValue,
        statusFilter
      )

      // Check if response has the expected structure
      if (response && response.data) {
        setProducts((response.data || []) as any)
        setPagination(prev => ({
          ...prev,
          current: response.pagination?.page || page,
          pageSize: response.pagination?.limit || pageSize,
          total: response.pagination?.total || 0
        }))
      } else {
        message.error('Invalid API response format')
        setProducts([])
        setPagination(prev => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      // Handle cache-related errors specifically
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Cache expired') || errorMessage.includes('304')) {
        message.error('Cache expired, refreshing data...')
        // Retry once after a short delay for cache issues
        setTimeout(() => {
          fetchProducts(page, pageSize)
        }, 1000)
      } else {
        message.error(`Failed to fetch products: ${errorMessage}`)
        setProducts([])
        setPagination(prev => ({ ...prev, total: 0 }))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial page load only - prevent double execution in strict mode
    console.log('Products Manager useEffect triggered, hasInitialized:', hasInitialized.current)
    if (hasInitialized.current) return

    // Set ref immediately to prevent second execution
    hasInitialized.current = true

    const loadInitialData = async () => {
      console.log('Starting initial data load...')
      setIsInitialLoad(true)
      await fetchProducts(1, 10) // Use hardcoded initial page size
      setIsInitialLoad(false)
      console.log('Initial data load completed.')
    }
    loadInitialData()
  }, [])

  // Refetch products when filters change (but not on initial load)
  useEffect(() => {
    // Skip if this is the initial load
    if (isInitialLoad) {
      return
    }

    const debounceTimer = setTimeout(() => {
      fetchProducts(1, pagination.pageSize)
    }, 300) // Debounce search

    return () => clearTimeout(debounceTimer)
  }, [searchValue, statusFilter, categoryFilter])

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
      compare_price: undefined,
      cost_price: undefined,
      inventory_quantity: 0,
      weight: undefined,
      options: [],
      image_id: undefined,
      is_active: true,
      position: productVariants.length
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
    const fieldErrors: Record<string, string> = {}

    // Basic validation - accumulate all basic info errors
    const basicInfoErrors: string[] = []

    if (!values.title || values.title.trim() === '') {
      basicInfoErrors.push('Product title is required')
    }
    if (!values.category_id) {
      basicInfoErrors.push('Category is required')
    }
    if (!values.base_price || values.base_price <= 0) {
      basicInfoErrors.push('Valid selling price is required')
    }

    // Combine basic info errors into one message
    if (basicInfoErrors.length > 0) {
      errors['1'] = basicInfoErrors.join(', ')
    }

    // Images validation
    if (productImages.length === 0) {
      errors['2'] = 'At least one product image is required'
    }

    // Variants validation
    const variantsWithoutImages = productVariants.filter(v => !v.image_id && v.is_active)
    if (variantsWithoutImages.length > 0) {
      errors['3'] = `${variantsWithoutImages.length} active variant(s) missing images`
    }

    // A+ content validation - now optional
    // No longer required to have A+ content

    // FAQs validation
    const incompleteFAQs = productFAQs.filter(faq =>
      faq.is_active && (!faq.question.trim() || !faq.answer.trim())
    )
    if (incompleteFAQs.length > 0) {
      errors['5'] = `${incompleteFAQs.length} FAQ(s) incomplete`
    }

    // Product Details validation - made optional
    // Note: Product details are now optional - users can add them if they want
    // No validation required for Additional Product Details section

    // Product Information validation - made optional
    // Note: Product Information Sections are now optional - users can add them if they want

    setValidationErrors(errors)
    setFieldErrors(fieldErrors)
    return Object.keys(errors).length === 0
  }

  // Handle Add Product button click
  const handleAddProduct = () => {
    setEditingProduct(null)
    form.resetFields()

    // Initialize with default values for new product
    const initialValues = {
      status: 'draft',
      base_price: 0,
      cost_price: 0,
      compare_price: 0,
      warranty_months: 0,
      features: [],
      tags: [],
      // Product Details defaults
      weight: null,
      length: null,
      width: null,
      height: null,
      manufacturer: '',
      model_number: '',
      warranty_text: '',
      shipping_requirements: '',
      origin_country: null,
      // Product Information defaults
      description: '',
      included_items: [],
      compatibility: '',
      safety_warnings: '',
      care_instructions: '',
      specifications: '',
      seo_title: '',
      seo_description: ''
    }

    form.setFieldsValue(initialValues)

    // Clear images for new product
    setProductImages([])
    setProductVariants([])
    setProductFAQs([])
    setAPlusSections([])
    setContentImages([])

    // Don't reset simpleFields and informationSections - let components initialize themselves
    setValidationErrors({})
    setActiveTab('1')
    setModalOpen(true)
  }

  // Handle Create Product button click - immediate validation
  const handleCreateProductClick = async () => {
    setLoading(true)

    // Get current form values
    const formValues = form.getFieldsValue()
    console.log('Create Product clicked, current form values:', formValues)

    // Validate first
    const errors: Record<string, string> = {}
    const fieldErrors: Record<string, string> = {}
    // Basic validation with field-level errors
    const basicInfoErrors = []
    if (!formValues.title || formValues.title.trim() === '') {
      basicInfoErrors.push('Product title')
      fieldErrors['title'] = 'Product title is required'
    }
    if (!formValues.category_id) {
      basicInfoErrors.push('Category')
      fieldErrors['category_id'] = 'Category is required'
    }
    if (!formValues.base_price || formValues.base_price <= 0) {
      basicInfoErrors.push('Selling price')
      fieldErrors['base_price'] = 'Valid selling price is required'
    }
    if (!formValues.cost_price || formValues.cost_price <= 0) {
      basicInfoErrors.push('Cost price')
      fieldErrors['cost_price'] = 'Valid cost price is required'
    }

    if (basicInfoErrors.length > 0) {
      errors['1'] = `Missing required fields: ${basicInfoErrors.join(', ')}`
    }

    // Images validation
    if (productImages.length === 0) {
      errors['2'] = 'At least one product image is required'
    }

    // Variants validation
    const variantsWithoutImages = productVariants.filter(v => !v.image_id && v.is_active)
    if (variantsWithoutImages.length > 0) {
      errors['3'] = `${variantsWithoutImages.length} active variant(s) missing images`
    }

    // A+ content validation - now optional
    // No longer required to have A+ content

    // FAQs validation
    const incompleteFAQs = productFAQs.filter(faq =>
      faq.is_active && (!faq.question.trim() || !faq.answer.trim())
    )
    if (incompleteFAQs.length > 0) {
      errors['5'] = `${incompleteFAQs.length} FAQ(s) incomplete`
    }

    // Product Details validation - made optional
    // Note: Product details are now optional - users can add them if they want
    // No validation required for Additional Product Details section

    // Product Information validation - made optional
    // Note: Product Information Sections are now optional - users can add them if they want

    console.log('Validation errors found on button click:', errors)
    setValidationErrors(errors)
    setFieldErrors(fieldErrors)

    if (Object.keys(errors).length > 0) {
      // Find first tab with errors and switch to it
      const firstErrorTab = Object.keys(errors)[0]
      console.log('Switching to first error tab:', firstErrorTab)
      setActiveTab(firstErrorTab)
      message.error('Please fix validation errors before saving')
      setLoading(false)
      return
    }

    // If validation passes, submit the form
    console.log('Validation passed, submitting form')
    form.submit()
  }

  // Save Product
  const handleSaveProduct = async (values: any) => {
    try {
      setLoading(true)

      // TODO: Implement proper authentication check via backend
      // Temporarily skipping authentication to fix immediate issues

      // Validate first
      const errors: Record<string, string> = {}
    const fieldErrors: Record<string, string> = {}
      // Basic validation with field-level errors
      const basicInfoErrors = []
      if (!values.title || values.title.trim() === '') {
        basicInfoErrors.push('Product title')
        fieldErrors['title'] = 'Product title is required'
      }
      if (!values.category_id) {
        basicInfoErrors.push('Category')
        fieldErrors['category_id'] = 'Category is required'
      }
      if (!values.base_price || values.base_price <= 0) {
        basicInfoErrors.push('Selling price')
        fieldErrors['base_price'] = 'Valid selling price is required'
      }
      if (!values.cost_price || values.cost_price <= 0) {
        basicInfoErrors.push('Cost price')
        fieldErrors['cost_price'] = 'Valid cost price is required'
      }

      if (basicInfoErrors.length > 0) {
        errors['1'] = `Missing required fields: ${basicInfoErrors.join(', ')}`
      }

      // Images validation
      if (productImages.length === 0) {
        errors['2'] = 'At least one product image is required'
      }

      // Variants validation
      const variantsWithoutImages = productVariants.filter(v => !v.image_id && v.is_active)
      if (variantsWithoutImages.length > 0) {
        errors['3'] = `${variantsWithoutImages.length} active variant(s) missing images`
      }

      // A+ content validation - now optional
      // No longer required to have A+ content

      // FAQs validation
      const incompleteFAQs = productFAQs.filter(faq =>
        faq.is_active && (!faq.question.trim() || !faq.answer.trim())
      )
      if (incompleteFAQs.length > 0) {
        errors['5'] = `${incompleteFAQs.length} FAQ(s) incomplete`
      }

      // Product Details validation - made optional
      // Note: Product details are now optional - users can add them if they want
      // Only validate basic required fields in other tabs

      // Product Information validation - made optional
      // Note: Product Information Sections are now optional - users can add them if they want

      console.log('Validation errors found:', errors)
      setValidationErrors(errors)
    setFieldErrors(fieldErrors)

      // Force a re-render by using setTimeout to ensure state is updated
      setTimeout(() => {
        if (Object.keys(errors).length > 0) {
          console.log('Switching to first error tab:', Object.keys(errors)[0])
          // Find first tab with errors and switch to it
          const firstErrorTab = Object.keys(errors)[0]
          setActiveTab(firstErrorTab)
          message.error('Please fix validation errors before saving')
          setLoading(false)
          return
        }
      }, 100)

      // Generate SKU and slug - use existing SKU for updates
      const sku = editingProduct ? editingProduct.sku : `SKU-${Date.now().toString(36).toUpperCase()}`

      // Generate unique slug
      const generateUniqueSlug = async (title: string, sku: string): Promise<string> => {
        // Create title-based slug
        let titleSlug = title.toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

        // Clean SKU for URL use
        let cleanSku = sku.toLowerCase()
          .replace(/[^a-z0-9-]/g, '') // Keep only alphanumeric and hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

        // If title slug is empty, use just SKU
        if (!titleSlug) {
          titleSlug = 'product'
        }

        // Create base slug with both title and SKU for reliability
        const baseSlug = `${titleSlug}-${cleanSku}`

        let slug = baseSlug
        let counter = 1

        // Check if slug exists and add counter if needed
        while (true) {
          try {
            const response = await fetch(`http://94.136.187.1:4000/public/products/slug/${slug}`)
            const data = await response.json()

            if (!data.success) {
              // Slug doesn't exist, return it
              return slug
            }

            // Slug exists, add counter
            slug = `${baseSlug}-${counter}`
            counter++
          } catch (error) {
            // If API call fails, return the slug (probably doesn't exist)
            return slug
          }
        }
      }

      const slug = editingProduct?.slug || await generateUniqueSlug(values.title, sku)

      // Use current productImages state - ImageUploadManager keeps it in sync with database
      const finalImages = productImages
      console.log('🎯 Using current productImages state for save:', finalImages.length, finalImages)

      // Prepare product data
      const productData = {
        ...values,
        sku,
        slug,
        supplier_id: await getSupplierId(),
        a_plus_content: values.a_plus_content || '',
        a_plus_sections: aPlusSections,
        specifications,
        features: values.features ? values.features.split('\n').filter(f => f.trim() !== '') : [],
        // Ensure new fields are included
        weight: values.weight || null,
        length: values.length || null,
        width: values.width || null,
        height: values.height || null,
        quantity: values.quantity || 0,
        options: values.options || [],
        warranty_months: values.warranty_months || 0,
        warranty_text: values.warranty_text || '',
        origin_country: values.origin_country || null,
        manufacturer: values.manufacturer || '',
        model_number: values.model_number || '',
        shipping_requirements: values.shipping_requirements || '',
        description: values.description || '',
        included_items: values.included_items || [],
        compatibility: values.compatibility || '',
        safety_warnings: values.safety_warnings || '',
        care_instructions: values.care_instructions || '',
        // Include dynamic fields and information sections
        simple_fields: simpleFields,
        information_sections: informationSections,
        images: finalImages.map((img, index) => ({
          url: img.url,
          alt_text: img.alt_text,
          position: index,
          is_primary: img.is_primary
        })),
        // Include variants for new products or only if they were actually modified for existing products
        ...(editingProduct ? (variantsWereModified ? {
          variants: productVariants.map(variant => {
            // For existing variants, preserve the original SKU
            const originalVariant = editingProduct?.product_variants?.find(v => v.id === variant.id);
            return {
              ...variant,
              sku: originalVariant?.sku || variant.sku || `VAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
            };
          })
        } : {}) : {
          variants: productVariants.map(variant => ({
            ...variant,
            sku: variant.sku || `VAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
          }))
        }),
        faqs: productFAQs.filter(faq => faq.question.trim() !== '' && faq.answer.trim() !== ''),
      }

      const supplierId = await getSupplierId()

      console.log('🔍 SAVE PRODUCT DEBUG - editingProduct:', editingProduct)
      console.log('🔍 SAVE PRODUCT DEBUG - variantsWereModified:', variantsWereModified)
      console.log('🔍 SAVE PRODUCT DEBUG - productData keys:', Object.keys(productData))
      console.log('🔍 SAVE PRODUCT DEBUG - variants in data:', 'variants' in productData)
      if ('variants' in productData) {
        console.log('🔍 SAVE PRODUCT DEBUG - number of variants:', productData.variants?.length)
      }

      if (editingProduct) {
        // Update existing product
        await apiClient.updateProduct(editingProduct.id, productData, supplierId)
        message.success('Product updated successfully')
      } else {
        // Create new product
        await apiClient.createProduct(productData)
        message.success('Product created successfully')
      }

      // Reset form and close modal
      form.resetFields()
      setProductImages([])
      setProductVariants([])
      setOriginalVariants([])
      setVariantsWereModified(false)
      setProductFAQs([])
      setFeatures([''])
      setSpecifications({})
      setAPlusSections([])
      setContentImages([])
      // Don't reset simpleFields and informationSections
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
    console.log('🔄 OPENING PRODUCT EDIT - Clearing all previous state and loading new product:', product.title)

    setEditingProduct(product)

    // Reset ALL state variables to ensure no data leakage between products
    setActiveTab('1') // Reset to first tab
    setValidationErrors({}) // Clear previous validation errors
    setFieldErrors({}) // Clear previous field errors
    setIsInitialLoad(true) // Reset initial load flag

    // Set all fields including the new ones
    const formValues = {
      ...product,
      features: (product.features || []).join('\n'),
      tags: product.tags || [],
      // Product Details fields with defaults
      weight: product.weight || null,
      length: product.length || null,
      width: product.width || null,
      height: product.height || null,
          shipping_requirements: product.shipping_requirements || '',
      origin_country: product.origin_country || null,
      // Pricing fields with defaults
      cost_price: product.cost_price || 0,
      // Product Information fields with defaults
      description: product.description || '',
      included_items: product.included_items || [],
      compatibility: product.compatibility || '',
      safety_warnings: product.safety_warnings || '',
      care_instructions: product.care_instructions || '',
      specifications: product.specifications || '',
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || ''
    }

    form.setFieldsValue(formValues)

    // Load product images immediately when opening modal for editing
    loadProductImages(product.id)

    // Load content images from the new table
    loadContentImages(product.id)

    const variants = product.product_variants || product.variants || []
    setProductVariants(variants)
    setOriginalVariants(JSON.parse(JSON.stringify(variants))) // Store deep copy for comparison
    setVariantsWereModified(false) // Reset modification flag when loading product
    setProductFAQs(product.faqs || [])
    setAPlusSections(product.a_plus_sections || [])

        setSpecifications(product.specifications || {})
    setSimpleFields(product.simple_fields || [])
    setInformationSections(product.information_sections || [])

    // IMPORTANT: Set modalOpen last after all state is properly initialized
    setModalOpen(true)

    console.log('✅ PRODUCT EDIT LOADED - All state reset and new product data loaded')
  }

  // Table columns
  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: Product) => (
        <Space>
          {(record.product_images || record.images) && (record.product_images || record.images)!.length > 0 ? (
            <Image
              src={(record.product_images || record.images || []).find(img => img?.is_primary)?.url || (record.product_images || record.images || [])[0]?.url}
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
            <div style={{ color: '#666', fontSize: '11px' }}>
              {record.suppliers?.business_name || 'Unknown Supplier'}
              {record.suppliers?.is_verified && (
                <Tag color="success" style={{ marginLeft: 4 }}>✓</Tag>
              )}
            </div>
            <div style={{ marginTop: 4 }}>
              {(record.variant_count || 0) > 0 && (
                <Tag color="blue">{record.variant_count} variants</Tag>
              )}
              {(record.product_images || record.images) && (record.product_images || record.images)!.length > 0 && (
                <Tag color="green">{(record.product_images || record.images)!.length} images</Tag>
              )}
            </div>
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
          <div style={{ fontWeight: 'bold' }}>₹{record.base_price}</div>
          {record.compare_price && (
            <div style={{
              color: '#999',
              fontSize: '12px',
              textDecoration: 'line-through'
            }}>
              ₹{record.compare_price}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Supplier',
      key: 'supplier',
      render: (_: any, record: Product) => (
        <Space direction="vertical" size="small">
          <div style={{ fontWeight: 'bold' }}>
            {record.suppliers?.business_name || 'Unknown Supplier'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.suppliers?.rating && (
              <Tag color="gold">⭐ {record.suppliers.rating}</Tag>
            )}
            {record.suppliers?.is_verified && (
              <Tag color="success">Verified</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Metrics',
      key: 'content',
      render: (_: any, record: Product) => (
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '11px', color: '#666' }}>
            <div>💰 Revenue: ₹${record.total_revenue?.toFixed(2) || '0.00'}</div>
            <div>📊 Sales: {record.total_sales || 0}</div>
            <div>⭐ Rating: {record.rating || '0.0'} ({record.total_reviews || 0} reviews)</div>
            <div>👁️ Views: {record.view_count?.toLocaleString() || 0}</div>
            <div>❤️ Wishlist: {record.wishlist_count || 0}</div>
          </div>
          <div>
            {record.a_plus_content && (
              <Tag color="purple" icon={<StarOutlined />}>A+ Content</Tag>
            )}
            {record.faqs && record.faqs.length > 0 && (
              <Tag color="green" icon={<QuestionCircleOutlined />}>
                {record.faqs.length} FAQs
              </Tag>
            )}
            {record.is_featured && (
              <Tag color="gold" icon={<StarOutlined />}>Featured</Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Tooltip title="View on Store">
            <Button
                            icon={<EyeOutlined />}
              onClick={() => {
                const frontendUrl = `http://94.136.187.1:3007/products/${record.slug}`
                window.open(frontendUrl, '_blank')
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
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
              <Button danger icon={<DeleteOutlined />} />
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
          <Button icon={<ReloadOutlined />} onClick={() => fetchProducts()}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
            Add Product
          </Button>
        </Space>
      </div>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
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
            pageSizeOptions: ['10', '20', '30', '40'],
            onChange: (page, pageSize) => {
              fetchProducts(page, pageSize || 10)
            },
          }}
        />
      </Card>

      {/* Advanced Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
        open={modalOpen}
        maskClosable={false}
        onCancel={() => {
          console.log('🚫 CLOSING MODAL - Clearing all state')
          setModalOpen(false)
          setEditingProduct(null)
          form.resetFields()

          // Clear ALL product-related state to prevent data leakage
          setProductImages([])
          setProductVariants([])
          setOriginalVariants([])
          setVariantsWereModified(false)
          setProductFAQs([])
          setFeatures([''])
          setSpecifications({})
          setAPlusSections([])
          setContentImages([])
          setActiveTab('1') // Reset to first tab
          setValidationErrors({}) // Clear validation errors
          setFieldErrors({}) // Clear field errors
          setIsInitialLoad(true) // Reset initial load flag
          // Don't reset simpleFields and informationSections as per comment
        }}
        width={1200}
        footer={[
          <Button key="back" onClick={() => {
            console.log('🚫 CANCEL BUTTON CLICKED - Clearing all state')
            setModalOpen(false)
            setEditingProduct(null)
            form.resetFields()

            // Clear ALL product-related state to prevent data leakage
            setProductImages([])
            setProductVariants([])
            setOriginalVariants([])
            setVariantsWereModified(false)
            setProductFAQs([])
            setFeatures([''])
            setSpecifications({})
            setAPlusSections([])
            setContentImages([])
            setActiveTab('1') // Reset to first tab
            setValidationErrors({}) // Clear validation errors
            setFieldErrors({}) // Clear field errors
            setIsInitialLoad(true) // Reset initial load flag
          }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleCreateProductClick}
          >
            {editingProduct ? 'Update Product' : 'Create Product'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProduct}>
          <ValidationErrorSummary />
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
          />
          {modalOpen && <FloatingHelp tabId={activeTab} />}
        </Form>
      </Modal>
    </div>
  )
}

export default AdvancedProductManager