import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, Input, InputNumber, Select } from 'antd'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the validation functions that we'll extract from the main component
const validateProductForm = (values: any, additionalData: any) => {
  const errors: Record<string, string> = {}

  // Basic validation
  if (!values.title || values.title.trim() === '') {
    errors['1'] = 'Product title is required'
  } else if (values.title.length > 200) {
    errors['1'] = 'Title must be less than 200 characters'
  }

  if (!values.category_id) {
    errors['1'] = 'Category is required'
  }

  if (!values.base_price || values.base_price <= 0) {
    errors['1'] = 'Selling price must be greater than 0'
  }

  // Cost price validation (should be >= 0)
  if (values.cost_price < 0) {
    errors['1'] = 'Cost price cannot be negative'
  }

  // MRP validation (should be >= selling price if provided)
  if (values.compare_price && values.base_price && values.compare_price < values.base_price) {
    errors['1'] = 'MRP should be greater than or equal to selling price'
  }

  // SKU validation
  if (values.sku && !/^[A-Z0-9-_]*$/i.test(values.sku)) {
    errors['1'] = 'SKU can only contain letters, numbers, hyphens, and underscores'
  }

  // Product Details validation
  if (!additionalData.simpleFields || additionalData.simpleFields.length === 0) {
    errors['6'] = 'Product details are required'
  }

  // Product Information validation
  if (!values.description || values.description.trim() === '') {
    errors['7'] = 'Product description is required'
  }

  return errors
}

const TestFormComponent = ({ onSubmit, initialValues = {} }) => {
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    const errors = validateProductForm(values, {
      simpleFields: [],
      productVariants: [],
      productFAQs: []
    })

    if (Object.keys(errors).length === 0) {
      await onSubmit(values)
    } else {
      // Set form errors for testing
      Object.keys(errors).forEach(key => {
        if (key === '1') {
          if (errors[key].includes('title')) {
            form.setFields([{ name: 'title', errors: [errors[key]] }])
          }
          if (errors[key].includes('Category')) {
            form.setFields([{ name: 'category_id', errors: [errors[key]] }])
          }
          if (errors[key].includes('Selling price')) {
            form.setFields([{ name: 'base_price', errors: [errors[key]] }])
          }
          if (errors[key].includes('Cost price')) {
            form.setFields([{ name: 'cost_price', errors: [errors[key]] }])
          }
          if (errors[key].includes('MRP')) {
            form.setFields([{ name: 'compare_price', errors: [errors[key]] }])
          }
          if (errors[key].includes('SKU')) {
            form.setFields([{ name: 'sku', errors: [errors[key]] }])
          }
        }
      })
      throw new Error('Validation failed')
    }
  }

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      initialValues={{
        status: 'draft',
        base_price: 0,
        cost_price: 0,
        compare_price: 0,
        ...initialValues
      }}
      layout="vertical"
    >
      <Form.Item
        name="title"
        label="Product Title"
        rules={[{ required: true, message: 'Please enter product title' }]}
      >
        <Input placeholder="Enter product title" />
      </Form.Item>

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
        <Input placeholder="Auto-generated if empty" />
      </Form.Item>

      <Form.Item name="category_id" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
        <Select placeholder="Select category">
          <Select.Option value="electronics">Electronics</Select.Option>
          <Select.Option value="clothing">Clothing</Select.Option>
          <Select.Option value="books">Books</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="cost_price" label="Cost Price">
        <InputNumber
          style={{ width: '100%' }}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
          placeholder="0.00"
          min={0}
          precision={2}
        />
      </Form.Item>

      <Form.Item name="base_price" label="Selling Price" rules={[{ required: true, message: 'Please enter selling price' }]}>
        <InputNumber
          style={{ width: '100%' }}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
          placeholder="0.00"
          min={0}
          precision={2}
        />
      </Form.Item>

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

      <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter product description' }]}>
        <Input.TextArea rows={3} placeholder="Product description" />
      </Form.Item>

      <button type="submit">Submit</button>
    </Form>
  )
}

describe('Product Form Validation', () => {
  let mockSubmit: jest.MockedFunction<any>

  beforeEach(() => {
    mockSubmit = jest.fn()
  })

  describe('Required Field Validation', () => {
    it('should require product title', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter product title')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should require category', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please select a category')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should require selling price', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter selling price')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should require description', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '100')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter product description')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Price Validation', () => {
    it('should validate cost price is non-negative', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const costPriceInput = screen.getByLabelText('Cost Price')
      await user.clear(costPriceInput)
      await user.type(costPriceInput, '-10')

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '100')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Cost price cannot be negative')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should validate MRP is greater than or equal to selling price', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const costPriceInput = screen.getByLabelText('Cost Price')
      await user.type(costPriceInput, '50')

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '100')

      const mrpInput = screen.getByLabelText('MRP')
      await user.type(mrpInput, '80') // MRP less than selling price

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('MRP should be greater than or equal to selling price')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should allow MRP equal to selling price', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const costPriceInput = screen.getByLabelText('Cost Price')
      await user.type(costPriceInput, '50')

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '100')

      const mrpInput = screen.getByLabelText('MRP')
      await user.type(mrpInput, '100') // MRP equal to selling price

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: 'Test Product',
          category_id: 'electronics',
          cost_price: 50,
          base_price: 100,
          compare_price: 100,
          description: 'Test description',
          status: 'draft'
        })
      })
    })
  })

  describe('SKU Validation', () => {
    it('should accept valid SKU formats', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const skuInput = screen.getByLabelText('SKU')
      await user.type(skuInput, 'TEST-123_ABC')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '100')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            sku: 'TEST-123_ABC'
          })
        )
      })
    })

    it('should reject invalid SKU with special characters', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Test Product')

      const skuInput = screen.getByLabelText('SKU')
      await user.type(skuInput, 'TEST@123') // Invalid character @

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/SKU can only contain letters/)).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Title Length Validation', () => {
    it('should accept titles within 200 characters', async () => {
      const user = userEvent.setup()
      const validTitle = 'A'.repeat(199) // 199 characters

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, validTitle)

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '100')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: validTitle
          })
        )
      })
    })

    it('should reject titles over 200 characters', async () => {
      const user = userEvent.setup()
      const longTitle = 'A'.repeat(201) // 201 characters

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, longTitle)

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Title must be less than 200 characters')).toBeInTheDocument()
      })
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Successful Form Submission', () => {
    it('should submit form with all valid data', async () => {
      const user = userEvent.setup()

      render(<TestFormComponent onSubmit={mockSubmit} />)

      const titleInput = screen.getByLabelText('Product Title')
      await user.type(titleInput, 'Premium Wireless Headphones')

      const skuInput = screen.getByLabelText('SKU')
      await user.type(skuInput, 'WH-1000XM5')

      const categorySelect = screen.getByLabelText('Category')
      await user.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      const costPriceInput = screen.getByLabelText('Cost Price')
      await user.type(costPriceInput, '200')

      const sellingPriceInput = screen.getByLabelText('Selling Price')
      await user.type(sellingPriceInput, '350')

      const mrpInput = screen.getByLabelText('MRP')
      await user.type(mrpInput, '400')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'Premium noise-cancelling wireless headphones with exceptional sound quality')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: 'Premium Wireless Headphones',
          sku: 'WH-1000XM5',
          category_id: 'electronics',
          cost_price: 200,
          base_price: 350,
          compare_price: 400,
          description: 'Premium noise-cancelling wireless headphones with exceptional sound quality',
          status: 'draft'
        })
      })
    })
  })
})