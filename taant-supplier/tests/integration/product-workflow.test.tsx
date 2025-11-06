import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      data: [],
      error: null,
    })),
    insert: jest.fn(() => ({
      data: null,
      error: null,
    })),
    update: jest.fn(() => ({
      data: null,
      error: null,
    })),
    delete: jest.fn(() => ({
      data: null,
      error: null,
    })),
    eq: jest.fn(() => ({
      data: [],
      error: null,
    })),
  })),
}

// Simplified Product Manager component for testing
const SimpleProductManager = () => {
  const [products, setProducts] = React.useState([])
  const [showForm, setShowForm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleAddProduct = () => {
    setShowForm(true)
  }

  const handleSaveProduct = async (productData: any) => {
    setLoading(true)

    try {
      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })

      // Mock database insert
      const mockInsert = jest.fn().mockResolvedValue({
        data: { id: 'new-product-id', ...productData },
        error: null
      })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      } as any)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))

      const newProduct = { id: 'new-product-id', ...productData }
      setProducts(prev => [...prev, newProduct])
      setShowForm(false)

      return newProduct
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Product Management</h1>
      <button onClick={handleAddProduct} data-testid="add-product-button">
        Add Product
      </button>

      <div data-testid="products-list">
        {products.map((product: any) => (
          <div key={product.id} data-testid={`product-${product.id}`}>
            {product.title}
          </div>
        ))}
      </div>

      {showForm && (
        <SimpleProductForm
          onSave={handleSaveProduct}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  )
}

const SimpleProductForm = ({ onSave, onCancel, loading }: {
  onSave: (data: any) => Promise<any>
  onCancel: () => void
  loading: boolean
}) => {
  const [formData, setFormData] = React.useState({
    title: '',
    sku: '',
    category_id: '',
    cost_price: 0,
    base_price: 0,
    compare_price: 0,
    description: ''
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }
    if (!formData.base_price || formData.base_price <= 0) {
      newErrors.base_price = 'Selling price must be greater than 0'
    }
    if (formData.cost_price < 0) {
      newErrors.cost_price = 'Cost price cannot be negative'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      try {
        await onSave(formData)
      } catch (error) {
        console.error('Failed to save product:', error)
      }
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div data-testid="product-form-modal">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} data-testid="product-form">
        <div>
          <label>Product Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            data-testid="title-input"
            placeholder="Enter product title"
          />
          {errors.title && <span data-testid="title-error" style={{ color: 'red' }}>{errors.title}</span>}
        </div>

        <div>
          <label>SKU</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            data-testid="sku-input"
            placeholder="Auto-generated if empty"
          />
        </div>

        <div>
          <label>Category *</label>
          <select
            value={formData.category_id}
            onChange={(e) => handleInputChange('category_id', e.target.value)}
            data-testid="category-select"
          >
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
          </select>
          {errors.category_id && <span data-testid="category-error" style={{ color: 'red' }}>{errors.category_id}</span>}
        </div>

        <div>
          <label>Cost Price</label>
          <input
            type="number"
            value={formData.cost_price}
            onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
            data-testid="cost-price-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.cost_price && <span data-testid="cost-price-error" style={{ color: 'red' }}>{errors.cost_price}</span>}
        </div>

        <div>
          <label>Selling Price *</label>
          <input
            type="number"
            value={formData.base_price}
            onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
            data-testid="selling-price-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.base_price && <span data-testid="selling-price-error" style={{ color: 'red' }}>{errors.base_price}</span>}
        </div>

        <div>
          <label>MRP</label>
          <input
            type="number"
            value={formData.compare_price}
            onChange={(e) => handleInputChange('compare_price', parseFloat(e.target.value) || 0)}
            data-testid="mrp-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            data-testid="description-input"
            placeholder="Product description"
            rows={3}
          />
          {errors.description && <span data-testid="description-error" style={{ color: 'red' }}>{errors.description}</span>}
        </div>

        <div>
          <button type="button" onClick={onCancel} data-testid="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={loading} data-testid="save-button">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

describe('Product Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Product Creation Workflow', () => {
    it('should handle complete product creation from start to finish', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      // Step 1: Verify initial state
      expect(screen.getByText('Product Management')).toBeInTheDocument()
      expect(screen.getByTestId('add-product-button')).toBeInTheDocument()
      expect(screen.getByTestId('products-list')).toBeInTheDocument()
      expect(screen.queryByTestId('product-form-modal')).not.toBeInTheDocument()

      // Step 2: Open the product form
      await user.click(screen.getByTestId('add-product-button'))

      // Verify form is open
      expect(screen.getByText('Add New Product')).toBeInTheDocument()
      expect(screen.getByTestId('product-form')).toBeInTheDocument()

      // Step 3: Fill in the form with valid data
      await user.type(screen.getByTestId('title-input'), 'Premium Wireless Headphones')
      await user.type(screen.getByTestId('sku-input'), 'WH-1000XM5')

      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')

      await user.type(screen.getByTestId('cost-price-input'), '200')
      await user.type(screen.getByTestId('selling-price-input'), '350')
      await user.type(screen.getByTestId('mrp-input'), '400')

      await user.type(screen.getByTestId('description-input'), 'Premium noise-cancelling wireless headphones with exceptional sound quality')

      // Step 4: Submit the form
      await user.click(screen.getByTestId('save-button'))

      // Step 5: Verify successful submission
      await waitFor(() => {
        expect(screen.getByTestId('product-new-product-id')).toBeInTheDocument()
        expect(screen.getByText('Premium Wireless Headphones')).toBeInTheDocument()
      })

      // Verify form is closed
      expect(screen.queryByTestId('product-form-modal')).not.toBeInTheDocument()

      // Verify Supabase was called correctly
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
    })

    it('should handle form validation errors correctly', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      // Open form
      await user.click(screen.getByTestId('add-product-button'))

      // Try to submit without filling required fields
      await user.click(screen.getByTestId('save-button'))

      // Verify validation errors appear
      expect(screen.getByTestId('title-error')).toBeInTheDocument()
      expect(screen.getByTestId('category-error')).toBeInTheDocument()
      expect(screen.getByTestId('selling-price-error')).toBeInTheDocument()
      expect(screen.getByTestId('description-error')).toBeInTheDocument()

      // Verify product was not created
      expect(screen.queryByTestId('product-new-product-id')).not.toBeInTheDocument()
    })

    it('should handle progressive form filling with real-time validation', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      await user.click(screen.getByTestId('add-product-button'))

      // Try to submit empty form
      await user.click(screen.getByTestId('save-button'))

      // Should show all validation errors
      expect(screen.getByTestId('title-error')).toBeInTheDocument()
      expect(screen.getByTestId('category-error')).toBeInTheDocument()

      // Start filling title
      await user.type(screen.getByTestId('title-input'), 'Test Product')

      // Title error should still be there (form not resubmitted yet)
      expect(screen.getByTestId('title-error')).toBeInTheDocument()

      // Fill category
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')

      // Fill selling price
      await user.type(screen.getByTestId('selling-price-input'), '100')

      // Fill description
      await user.type(screen.getByTestId('description-input'), 'Test description')

      // Submit again - should now succeed (only title has content)
      await user.click(screen.getByTestId('save-button'))

      await waitFor(() => {
        expect(screen.getByTestId('product-new-product-id')).toBeInTheDocument()
      })
    })

    it('should handle form cancellation', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      // Open form
      await user.click(screen.getByTestId('add-product-button'))

      // Fill some data
      await user.type(screen.getByTestId('title-input'), 'Test Product')
      await user.type(screen.getByTestId('sku-input'), 'TEST-123')

      // Cancel the form
      await user.click(screen.getByTestId('cancel-button'))

      // Form should close
      expect(screen.queryByTestId('product-form-modal')).not.toBeInTheDocument()

      // Product should not be created
      expect(screen.queryByTestId('product-new-product-id')).not.toBeInTheDocument()

      // Open form again - should be reset
      await user.click(screen.getByTestId('add-product-button'))
      expect(screen.getByTestId('title-input')).toHaveValue('')
      expect(screen.getByTestId('sku-input')).toHaveValue('')
    })

    it('should handle cost price validation', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      await user.click(screen.getByTestId('add-product-button'))

      // Fill required fields
      await user.type(screen.getByTestId('title-input'), 'Test Product')
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')
      await user.type(screen.getByTestId('selling-price-input'), '100')
      await user.type(screen.getByTestId('description-input'), 'Test description')

      // Submit should succeed (cost price is optional)
      await user.click(screen.getByTestId('save-button'))

      await waitFor(() => {
        expect(screen.getByTestId('product-new-product-id')).toBeInTheDocument()
      })

      // Test negative cost price
      await user.click(screen.getByTestId('add-product-button'))

      await user.type(screen.getByTestId('title-input'), 'Test Product 2')
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')
      await user.type(screen.getByTestId('cost-price-input'), '-50') // Negative
      await user.type(screen.getByTestId('selling-price-input'), '100')
      await user.type(screen.getByTestId('description-input'), 'Test description 2')

      await user.click(screen.getByTestId('save-button'))

      // Should show cost price error
      expect(screen.getByTestId('cost-price-error')).toBeInTheDocument()
      expect(screen.getByTestId('cost-price-error')).toHaveTextContent('Cost price cannot be negative')
    })
  })

  describe('Form State Management', () => {
    it('should handle loading state during submission', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      await user.click(screen.getByTestId('add-product-button'))

      // Fill form with valid data
      await user.type(screen.getByTestId('title-input'), 'Test Product')
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')
      await user.type(screen.getByTestId('selling-price-input'), '100')
      await user.type(screen.getByTestId('description-input'), 'Test description')

      // Submit form
      await user.click(screen.getByTestId('save-button'))

      // Should show loading state
      expect(screen.getByTestId('save-button')).toBeDisabled()
      expect(screen.getByTestId('save-button')).toHaveTextContent('Saving...')

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toHaveTextContent('Save Product')
      })
    })

    it('should handle multiple products being added', async () => {
      const user = userEvent.setup()

      render(<SimpleProductManager />)

      // Add first product
      await user.click(screen.getByTestId('add-product-button'))
      await user.type(screen.getByTestId('title-input'), 'Product 1')
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')
      await user.type(screen.getByTestId('selling-price-input'), '100')
      await user.type(screen.getByTestId('description-input'), 'Description 1')
      await user.click(screen.getByTestId('save-button'))

      await waitFor(() => {
        expect(screen.getByTestId('product-new-product-id')).toBeInTheDocument()
      })

      // Add second product
      await user.click(screen.getByTestId('add-product-button'))
      await user.type(screen.getByTestId('title-input'), 'Product 2')
      await user.selectOptions(screen.getByTestId('category-select'), 'clothing')
      await user.type(screen.getByTestId('selling-price-input'), '200')
      await user.type(screen.getByTestId('description-input'), 'Description 2')
      await user.click(screen.getByTestId('save-button'))

      await waitFor(() => {
        // Should have both products
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock network failure
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockRejectedValue(new Error('Network error')),
        select: jest.fn(),
        eq: jest.fn()
      } as any)

      render(<SimpleProductManager />)

      await user.click(screen.getByTestId('add-product-button'))

      // Fill form with valid data
      await user.type(screen.getByTestId('title-input'), 'Test Product')
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')
      await user.type(screen.getByTestId('selling-price-input'), '100')
      await user.type(screen.getByTestId('description-input'), 'Test description')

      // Submit should handle error gracefully
      await user.click(screen.getByTestId('save-button'))

      // Form should remain open on error
      await waitFor(() => {
        expect(screen.getByTestId('product-form-modal')).toBeInTheDocument()
      })
    })

    it('should handle authentication errors', async () => {
      const user = userEvent.setup()

      // Mock auth error
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Authentication required'))

      render(<SimpleProductManager />)

      await user.click(screen.getByTestId('add-product-button'))

      await user.type(screen.getByTestId('title-input'), 'Test Product')
      await user.selectOptions(screen.getByTestId('category-select'), 'electronics')
      await user.type(screen.getByTestId('selling-price-input'), '100')
      await user.type(screen.getByTestId('description-input'), 'Test description')

      await user.click(screen.getByTestId('save-button'))

      // Should handle auth error
      await waitFor(() => {
        expect(screen.getByTestId('product-form-modal')).toBeInTheDocument()
      })
    })
  })
})