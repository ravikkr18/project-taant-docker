import { describe, it, expect } from '@jest/globals'

// Form validation utilities that match the real form logic
const validateProductField = (field: string, value: any) => {
  switch (field) {
    case 'title':
      if (!value || value.trim() === '') {
        return 'Product title is required'
      }
      if (value.length > 200) {
        return 'Title must be less than 200 characters'
      }
      if (!/^[^<>]*$/.test(value)) {
        return 'Title cannot contain HTML tags'
      }
      return null

    case 'sku':
      if (value && !/^[A-Z0-9-_]*$/i.test(value)) {
        return 'SKU can only contain letters, numbers, hyphens, and underscores'
      }
      if (value && value.length > 50) {
        return 'SKU must be less than 50 characters'
      }
      return null

    case 'category_id':
      if (!value) {
        return 'Category is required'
      }
      return null

    case 'base_price':
      if (!value || value <= 0) {
        return 'Selling price must be greater than 0'
      }
      return null

    case 'cost_price':
      if (value < 0) {
        return 'Cost price cannot be negative'
      }
      return null

    case 'compare_price':
      if (value < 0) {
        return 'MRP cannot be negative'
      }
      return null

    case 'description':
      if (!value || value.trim() === '') {
        return 'Product description is required'
      }
      return null

    default:
      return null
  }
}

const validateProductForm = (values: any, additionalData: any = {}) => {
  const errors: Record<string, string> = {}

  // Field validation first
  Object.keys(values).forEach(field => {
    const error = validateProductField(field, values[field])
    if (error) {
      errors[field] = error
    }
  })

  // Business logic validation (only if field validation passed)
  if (!errors.compare_price && values.compare_price && values.base_price && values.compare_price < values.base_price) {
    errors.compare_price = 'MRP should be greater than or equal to selling price'
  }

  // Required additional fields
  if (!additionalData.simpleFields || additionalData.simpleFields.length === 0) {
    errors.simpleFields = 'Product details are required'
  }

  return errors
}

describe('Product Form Validation', () => {
  describe('Field Validation', () => {
    describe('Title Validation', () => {
      it('should require title', () => {
        expect(validateProductField('title', '')).toBe('Product title is required')
        expect(validateProductField('title', '   ')).toBe('Product title is required')
        expect(validateProductField('title', null)).toBe('Product title is required')
        expect(validateProductField('title', undefined)).toBe('Product title is required')
      })

      it('should validate title length', () => {
        const validTitle = 'A'.repeat(200)
        const longTitle = 'A'.repeat(201)

        expect(validateProductField('title', validTitle)).toBeNull()
        expect(validateProductField('title', longTitle)).toBe('Title must be less than 200 characters')
      })

      it('should prevent HTML tags in title', () => {
        expect(validateProductField('title', 'Valid Title')).toBeNull()
        expect(validateProductField('title', 'Title with <script>alert()</script>')).toBe('Title cannot contain HTML tags')
        expect(validateProductField('title', 'Title with <b>bold</b>')).toBe('Title cannot contain HTML tags')
        expect(validateProductField('title', 'Title with <div>content</div>')).toBe('Title cannot contain HTML tags')
      })

      it('should accept valid titles', () => {
        expect(validateProductField('title', 'Premium Wireless Headphones')).toBeNull()
        expect(validateProductField('title', 'Product with numbers 123 and symbols -_')).toBeNull()
        expect(validateProductField('title', 'A')).toBeNull()
        expect(validateProductField('title', 'Test & Product')).toBeNull() // & is allowed
      })
    })

    describe('SKU Validation', () => {
      it('should accept valid SKU formats', () => {
        expect(validateProductField('sku', 'WH-1000XM5')).toBeNull()
        expect(validateProductField('sku', 'TEST_123_ABC')).toBeNull()
        expect(validateProductField('sku', 'SKU123')).toBeNull()
        expect(validateProductField('sku', 'test-sku')).toBeNull()
        expect(validateProductField('sku', '')).toBeNull() // SKU is optional
        expect(validateProductField('sku', null)).toBeNull()
        expect(validateProductField('sku', undefined)).toBeNull()
      })

      it('should reject invalid SKU characters', () => {
        expect(validateProductField('sku', 'TEST@123')).toBe('SKU can only contain letters, numbers, hyphens, and underscores')
        expect(validateProductField('sku', 'TEST#123')).toBe('SKU can only contain letters, numbers, hyphens, and underscores')
        expect(validateProductField('sku', 'TEST 123')).toBe('SKU can only contain letters, numbers, hyphens, and underscores')
        expect(validateProductField('sku', 'TEST/123')).toBe('SKU can only contain letters, numbers, hyphens, and underscores')
        expect(validateProductField('sku', 'TEST\\123')).toBe('SKU can only contain letters, numbers, hyphens, and underscores')
      })

      it('should validate SKU length', () => {
        const validSKU = 'A'.repeat(50)
        const longSKU = 'A'.repeat(51)

        expect(validateProductField('sku', validSKU)).toBeNull()
        expect(validateProductField('sku', longSKU)).toBe('SKU must be less than 50 characters')
      })
    })

    describe('Price Validation', () => {
      it('should validate cost price', () => {
        expect(validateProductField('cost_price', 0)).toBeNull()
        expect(validateProductField('cost_price', 100)).toBeNull()
        expect(validateProductField('cost_price', 100.50)).toBeNull()
        expect(validateProductField('cost_price', -1)).toBe('Cost price cannot be negative')
        expect(validateProductField('cost_price', -100)).toBe('Cost price cannot be negative')
        expect(validateProductField('cost_price', null)).toBeNull()
        expect(validateProductField('cost_price', undefined)).toBeNull()
      })

      it('should validate selling price', () => {
        expect(validateProductField('base_price', 0)).toBe('Selling price must be greater than 0')
        expect(validateProductField('base_price', -1)).toBe('Selling price must be greater than 0')
        expect(validateProductField('base_price', null)).toBe('Selling price must be greater than 0')
        expect(validateProductField('base_price', undefined)).toBe('Selling price must be greater than 0')
        expect(validateProductField('base_price', 1)).toBeNull()
        expect(validateProductField('base_price', 100)).toBeNull()
        expect(validateProductField('base_price', 100.50)).toBeNull()
      })

      it('should validate MRP', () => {
        expect(validateProductField('compare_price', 0)).toBeNull()
        expect(validateProductField('compare_price', 100)).toBeNull()
        expect(validateProductField('compare_price', 100.50)).toBeNull()
        expect(validateProductField('compare_price', -1)).toBe('MRP cannot be negative')
        expect(validateProductField('compare_price', -100)).toBe('MRP cannot be negative')
        expect(validateProductField('compare_price', null)).toBeNull()
        expect(validateProductField('compare_price', undefined)).toBeNull()
      })
    })

    describe('Required Field Validation', () => {
      it('should validate category', () => {
        expect(validateProductField('category_id', '')).toBe('Category is required')
        expect(validateProductField('category_id', null)).toBe('Category is required')
        expect(validateProductField('category_id', undefined)).toBe('Category is required')
        expect(validateProductField('category_id', 'electronics')).toBeNull()
        expect(validateProductField('category_id', 'clothing')).toBeNull()
        expect(validateProductField('category_id', 'books')).toBeNull()
      })

      it('should validate description', () => {
        expect(validateProductField('description', '')).toBe('Product description is required')
        expect(validateProductField('description', '   ')).toBe('Product description is required')
        expect(validateProductField('description', null)).toBe('Product description is required')
        expect(validateProductField('description', undefined)).toBe('Product description is required')
        expect(validateProductField('description', 'Valid description')).toBeNull()
        expect(validateProductField('description', 'A')).toBeNull()
        expect(validateProductField('description', 'Description with numbers 123 and symbols!')).toBeNull()
      })
    })
  })

  describe('Form Validation', () => {
    it('should validate complete form with all errors', () => {
      const formData = {
        title: '',
        sku: 'INVALID@SKU',
        category_id: '',
        base_price: -10,
        cost_price: -5,
        compare_price: -20,
        description: ''
      }

      const additionalData = {
        simpleFields: []
      }

      const errors = validateProductForm(formData, additionalData)

      expect(errors).toEqual({
        title: 'Product title is required',
        sku: 'SKU can only contain letters, numbers, hyphens, and underscores',
        category_id: 'Category is required',
        base_price: 'Selling price must be greater than 0',
        cost_price: 'Cost price cannot be negative',
        compare_price: 'MRP cannot be negative',
        description: 'Product description is required',
        simpleFields: 'Product details are required'
      })
    })

    it('should validate form with price relationship error', () => {
      const formData = {
        title: 'Valid Product Title',
        sku: 'VALID-SKU',
        category_id: 'electronics',
        base_price: 100,
        cost_price: 50,
        compare_price: 80, // Less than selling price
        description: 'Valid description'
      }

      const additionalData = {
        simpleFields: ['field1']
      }

      const errors = validateProductForm(formData, additionalData)

      expect(errors).toEqual({
        compare_price: 'MRP should be greater than or equal to selling price'
      })
    })

    it('should pass validation with valid data', () => {
      const formData = {
        title: 'Premium Wireless Headphones',
        sku: 'WH-1000XM5',
        category_id: 'electronics',
        base_price: 350,
        cost_price: 200,
        compare_price: 400,
        description: 'Premium noise-cancelling wireless headphones with exceptional sound quality'
      }

      const additionalData = {
        simpleFields: ['weight', 'dimensions', 'warranty']
      }

      const errors = validateProductForm(formData, additionalData)

      expect(errors).toEqual({})
    })

    it('should pass validation with minimal valid data', () => {
      const formData = {
        title: 'Test Product',
        category_id: 'electronics',
        base_price: 100,
        description: 'Test description'
      }

      const additionalData = {
        simpleFields: ['field1']
      }

      const errors = validateProductForm(formData, additionalData)

      expect(errors).toEqual({})
    })

    it('should allow MRP equal to selling price', () => {
      const formData = {
        title: 'Test Product',
        category_id: 'electronics',
        base_price: 100,
        cost_price: 50,
        compare_price: 100, // Equal to selling price
        description: 'Test description'
      }

      const additionalData = {
        simpleFields: ['field1']
      }

      const errors = validateProductForm(formData, additionalData)

      expect(errors).toEqual({})
    })

    it('should allow zero or empty optional fields', () => {
      const formData = {
        title: 'Test Product',
        sku: '',
        category_id: 'electronics',
        base_price: 100,
        cost_price: 0,
        compare_price: 0,
        description: 'Test description'
      }

      const additionalData = {
        simpleFields: ['field1']
      }

      const errors = validateProductForm(formData, additionalData)

      expect(errors).toEqual({})
    })
  })

  describe('Edge Cases', () => {
    it('should handle numeric strings', () => {
      expect(validateProductField('base_price', '100')).toBeNull()
      expect(validateProductField('base_price', '0')).toBe('Selling price must be greater than 0')
      expect(validateProductField('base_price', '-50')).toBe('Selling price must be greater than 0')
      expect(validateProductField('cost_price', '50')).toBeNull()
      expect(validateProductField('cost_price', '-10')).toBe('Cost price cannot be negative')
    })

    it('should handle special characters in allowed fields', () => {
      expect(validateProductField('title', 'Product & Co.')).toBeNull()
      expect(validateProductField('title', 'Product™ - Special Edition')).toBeNull()
      expect(validateProductField('title', 'Product © 2024')).toBeNull()
      expect(validateProductField('description', 'Description with émojis 🎉')).toBeNull()
      expect(validateProductField('description', 'Description with quotes "single" and \'double\'')).toBeNull()
    })

    it('should handle boundary values', () => {
      // Title boundary
      expect(validateProductField('title', 'A'.repeat(200))).toBeNull()
      expect(validateProductField('title', 'A'.repeat(201))).toBe('Title must be less than 200 characters')

      // SKU boundary
      expect(validateProductField('sku', 'A'.repeat(50))).toBeNull()
      expect(validateProductField('sku', 'A'.repeat(51))).toBe('SKU must be less than 50 characters')

      // Price boundaries
      expect(validateProductField('base_price', 0.01)).toBeNull()
      expect(validateProductField('base_price', 0)).toBe('Selling price must be greater than 0')
      expect(validateProductField('cost_price', 0)).toBeNull()
      expect(validateProductField('cost_price', -0.01)).toBe('Cost price cannot be negative')
    })
  })
})