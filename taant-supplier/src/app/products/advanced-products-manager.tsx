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
import VariantManager from '../../components/products/variant-manager'
import APlusContentManager from '../../components/products/a-plus-content-manager'
import FAQManager from '../../components/products/faq-manager'
import TiptapEditor from '../../components/ui/tiptap-editor'
import SimpleDynamicFields from '../../components/products/simple-dynamic-fields-final'
import InformationSectionsManager from '../../components/products/information-sections-manager-final'
import FloatingHelp from '../../components/ui/floating-help'

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
  // New dynamic fields and information sections state
  const [simpleFields, setSimpleFields] = useState<SimpleField[]>([])
  const [informationSections, setInformationSections] = useState<InfoSection[]>([])

  
  // Validation errors tracking
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const hasInitialized = useRef(false)

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

  // Memoized tab items to ensure proper re-rendering when validationErrors changes
  const tabItems = useMemo(() => [
    {
      key: '1',
      label: (
        <span>
          Basic Info
          {validationErrors['1'] && (
            <Tooltip title={validationErrors['1']}>
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
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
                <AntInput placeholder="Auto-generated if empty" />
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
                  <Select.Option value="electronics">Electronics</Select.Option>
                  <Select.Option value="clothing">Clothing</Select.Option>
                  <Select.Option value="home">Home & Garden</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="brand_id" label="Brand">
                <Select placeholder="Select brand" allowClear>
                  <Select.Option value="apple">Apple</Select.Option>
                  <Select.Option value="samsung">Samsung</Select.Option>
                  <Select.Option value="sony">Sony</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
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
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
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
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
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
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0.00"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
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
            <Tooltip title={validationErrors['2']}>
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
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
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['3']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <VariantManager
            variants={productVariants}
            productImages={productImages}
            onChange={setProductVariants}
          />
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
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['4']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <APlusContentManager
            sections={aPlusSections}
            onChange={setAPlusSections}
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
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
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
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                ⚠️ {validationErrors['6']}
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
      children: (
        <>
          <Card size="small" title="Basic Specifications" style={{ marginBottom: 16 }}>
            <Row gutter={[12, 8]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="weight" label="Weight (kg)" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    step={0.01}
                    min={0}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="warranty_months" label="Warranty (months)" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    size="small"
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
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item
                  name="origin_country"
                  label="Country of Origin"
                  style={{ marginBottom: 8 }}
                  help={fieldErrors['origin_country']}
                  validateStatus={fieldErrors['origin_country'] ? 'error' : ''}
                >
                  <Select placeholder="Select" allowClear size="small">
                    <Select.Option value="CN">China</Select.Option>
                    <Select.Option value="US">United States</Select.Option>
                    <Select.Option value="IN">India</Select.Option>
                    <Select.Option value="JP">Japan</Select.Option>
                    <Select.Option value="KR">South Korea</Select.Option>
                    <Select.Option value="DE">Germany</Select.Option>
                    <Select.Option value="GB">United Kingdom</Select.Option>
                    <Select.Option value="VN">Vietnam</Select.Option>
                    <Select.Option value="TW">Taiwan</Select.Option>
                    <Select.Option value="MX">Mexico</Select.Option>
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
                  <AntInput placeholder="Model/part number" size="small" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="Dimensions (cm)" style={{ marginBottom: 16 }}>
            <Row gutter={[12, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="length" label="Length" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.0"
                    step={0.1}
                    min={0}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="width" label="Width" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.0"
                    step={0.1}
                    min={0}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="height" label="Height" style={{ marginBottom: 8 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.0"
                    step={0.1}
                    min={0}
                    size="small"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Volume" style={{ marginBottom: 8 }}>
                  <Input
                    value="Auto"
                    readOnly
                    size="small"
                    style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                    placeholder="Calculated automatically"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="Additional Information" style={{ marginBottom: 16 }}>
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
                  <AntInput placeholder="Manufacturer name" size="small" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[12, 8]}>
              <Col xs={24}>
                <Form.Item name="warranty_text" label="Warranty Information" style={{ marginBottom: 8 }}>
                  <TextArea
                    rows={2}
                    placeholder="Detailed warranty information and terms"
                    size="small"
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
                    size="small"
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
              <Tag color="red" size="small" style={{ marginLeft: 8 }}>
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
            <TiptapEditor
              value={form.getFieldValue('description') || ''}
              onChange={(value) => form.setFieldValue('description', value)}
              placeholder="Comprehensive product description with features, benefits, and use cases"
              height={200}
            />
          </Form.Item>

          <Form.Item name="features" label="Key Features">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Add key features (press Enter to add each feature)"
              tokenSeparators={[',', '\n']}
            />
          </Form.Item>

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
                <TiptapEditor
                  value={form.getFieldValue('compatibility') || ''}
                  onChange={(value) => form.setFieldValue('compatibility', value)}
                  placeholder="Compatibility information with other products or systems"
                  height={120}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="safety_warnings" label="Safety Warnings & Usage Instructions">
            <TiptapEditor
              value={form.getFieldValue('safety_warnings') || ''}
              onChange={(value) => form.setFieldValue('safety_warnings', value)}
              placeholder="Important safety information and usage guidelines"
              height={120}
            />
          </Form.Item>

          <Form.Item name="care_instructions" label="Care & Maintenance">
            <TiptapEditor
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
        setProducts(response.data || [])
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
      if (error.message?.includes('Cache expired') || error.message?.includes('304')) {
        message.error('Cache expired, refreshing data...')
        // Retry once after a short delay for cache issues
        setTimeout(() => {
          fetchProducts(page, pageSize)
        }, 1000)
      } else {
        message.error(`Failed to fetch products: ${error.message || 'Unknown error'}`)
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
    const variantsWithoutImages = productVariants.filter(v => !v.image_url && !v.image_id && v.is_active)
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
    setProductImages([])
    setProductVariants([])
    setProductFAQs([])
    setAPlusSections([])
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
    const errors = {}
    const fieldErrors = {}
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
    const variantsWithoutImages = productVariants.filter(v => !v.image_url && !v.image_id && v.is_active)
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
      const errors = {}
    const fieldErrors = {}
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
      const variantsWithoutImages = productVariants.filter(v => !v.image_url && !v.image_id && v.is_active)
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

      // Generate SKU and slug
      const sku = `SKU-${Date.now().toString(36).toUpperCase()}`
      const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      // Prepare product data
      const productData = {
        ...values,
        sku,
        slug,
        supplier_id: await getSupplierId(),
        a_plus_content: values.a_plus_content || '',
        a_plus_sections: aPlusSections,
        specifications,
        features: features.filter(f => f.trim() !== ''),
        // Ensure new fields are included
        weight: values.weight || null,
        length: values.length || null,
        width: values.width || null,
        height: values.height || null,
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

      const supplierId = await getSupplierId()

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
      setProductFAQs([])
      setFeatures([''])
      setSpecifications({})
      setAPlusSections([])
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
    setEditingProduct(product)

    // Set all fields including the new ones
    const formValues = {
      ...product,
      features: product.features || [],
      tags: product.tags || [],
      // Product Details fields with defaults
      weight: product.weight || null,
      length: product.length || null,
      width: product.width || null,
      height: product.height || null,
      manufacturer: product.manufacturer || '',
      model_number: product.model_number || '',
      warranty_text: product.warranty_text || '',
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
    setProductImages(product.product_images || product.images || [])
    setProductVariants(product.product_variants || product.variants || [])
    setProductFAQs(product.faqs || [])
    setAPlusSections(product.a_plus_sections || [])
    setFeatures(product.features?.length > 0 ? product.features : [''])
    setSpecifications(product.specifications || {})
    setSimpleFields(product.simple_fields || [])
    setInformationSections(product.information_sections || [])
    setModalOpen(true)
  }

  // Table columns
  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: Product) => (
        <Space>
          {(record.product_images || record.images) && (record.product_images || record.images).length > 0 ? (
            <Image
              src={(record.product_images || record.images).find(img => img.is_primary)?.url || (record.product_images || record.images)[0]?.url}
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
                <Tag size="small" color="success" style={{ marginLeft: 4 }}>✓</Tag>
              )}
            </div>
            <div style={{ marginTop: 4 }}>
              {record.variant_count > 0 && (
                <Tag size="small" color="blue">{record.variant_count} variants</Tag>
              )}
              {(record.product_images || record.images) && (record.product_images || record.images).length > 0 && (
                <Tag size="small" color="green">{(record.product_images || record.images).length} images</Tag>
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
      title: 'Supplier',
      key: 'supplier',
      render: (_: any, record: Product) => (
        <Space direction="vertical" size="small">
          <div style={{ fontWeight: 'bold' }}>
            {record.suppliers?.business_name || 'Unknown Supplier'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.suppliers?.rating && (
              <Tag size="small" color="gold">⭐ {record.suppliers.rating}</Tag>
            )}
            {record.suppliers?.is_verified && (
              <Tag size="small" color="success">Verified</Tag>
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
            <div>💰 Revenue: ${record.total_revenue?.toFixed(2) || '0.00'}</div>
            <div>📊 Sales: {record.total_sales || 0}</div>
            <div>⭐ Rating: {record.rating || '0.0'} ({record.total_reviews || 0} reviews)</div>
            <div>👁️ Views: {record.view_count?.toLocaleString() || 0}</div>
            <div>❤️ Wishlist: {record.wishlist_count || 0}</div>
          </div>
          <div>
            {record.a_plus_content && (
              <Tag size="small" color="purple" icon={<StarOutlined />}>A+ Content</Tag>
            )}
            {record.faqs && record.faqs.length > 0 && (
              <Tag size="small" color="green" icon={<QuestionCircleOutlined />}>
                {record.faqs.length} FAQs
              </Tag>
            )}
            {record.is_featured && (
              <Tag size="small" color="gold" icon={<StarOutlined />}>Featured</Tag>
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
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                const frontendUrl = `http://94.136.187.1:3007/products/${record.slug}`
                window.open(frontendUrl, '_blank')
              }}
            />
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
          setModalOpen(false)
          setEditingProduct(null)
          form.resetFields()
          setProductImages([])
          setProductVariants([])
          setProductFAQs([])
          setFeatures([''])
          setSpecifications({})
          // Don't reset simpleFields and informationSections
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
            onChange={setActiveTab}
            items={tabItems}
          />
          {modalOpen && <FloatingHelp tabId={activeTab} />}
        </Form>
      </Modal>
    </div>
  )
}

export default AdvancedProductManager