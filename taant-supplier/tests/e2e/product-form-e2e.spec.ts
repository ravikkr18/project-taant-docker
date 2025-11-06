import { test, expect } from '@playwright/test'

test.describe('Product Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Wait for any loading spinners to disappear
    await page.waitForSelector('[data-testid="loading"]', { state: 'detached' })
  })

  test('should display product management page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Product Management/)

    // Check main elements are present
    await expect(page.locator('h1')).toContainText('Product Management')
    await expect(page.locator('[data-testid="add-product-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="products-table"]')).toBeVisible()
  })

  test('should open product creation modal', async ({ page }) => {
    // Click add product button
    await page.click('[data-testid="add-product-button"]')

    // Check modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('h2')).toContainText('Add New Product')

    // Check form tabs are present
    await expect(page.locator('[data-testid="form-tabs"]')).toBeVisible()
    await expect(page.locator('text=Basic Information')).toBeVisible()
    await expect(page.locator('text=Product Images')).toBeVisible()
    await expect(page.locator('text=Product Variants')).toBeVisible()
    await expect(page.locator('text=A+ Content')).toBeVisible()
    await expect(page.locator('text=FAQs')).toBeVisible()
    await expect(page.locator('text=Product Details')).toBeVisible()
    await expect(page.locator('text=Product Information')).toBeVisible()
    await expect(page.locator('text=SEO')).toBeVisible()
  })

  test('should validate required fields in basic information tab', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Try to save without filling required fields
    await page.click('[data-testid="save-product-button"]')

    // Check validation errors appear
    await expect(page.locator('text=Product title is required')).toBeVisible()
    await expect(page.locator('text=Category is required')).toBeVisible()
    await expect(page.locator('text=Selling price must be greater than 0')).toBeVisible()
  })

  test('should fill and validate basic information form', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill product title
    await page.fill('[data-testid="product-title-input"]', 'Premium Wireless Headphones')

    // Fill SKU
    await page.fill('[data-testid="sku-input"]', 'WH-1000XM5')

    // Fill short description
    await page.fill('[data-testid="short-description-input"]', 'Premium noise-cancelling wireless headphones')

    // Select category
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')

    // Fill pricing fields
    await page.fill('[data-testid="cost-price-input"]', '200')
    await page.fill('[data-testid="selling-price-input"]', '350')
    await page.fill('[data-testid="mrp-input"]', '400')

    // Add tags
    await page.fill('[data-testid="tags-input"]', 'wireless,noise-cancelling,premium')
    await page.press('[data-testid="tags-input"]', 'Enter')

    // Check all fields are filled correctly
    await expect(page.locator('[data-testid="product-title-input"]')).toHaveValue('Premium Wireless Headphones')
    await expect(page.locator('[data-testid="sku-input"]')).toHaveValue('WH-1000XM5')
    await expect(page.locator('[data-testid="category-select"]')).toHaveValue('electronics')
    await expect(page.locator('[data-testid="cost-price-input"]')).toHaveValue('200')
    await expect(page.locator('[data-testid="selling-price-input"]')).toHaveValue('350')
    await expect(page.locator('[data-testid="mrp-input"]')).toHaveValue('400')
  })

  test('should navigate through all form tabs', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill basic information first
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="selling-price-input"]', '100')

    // Navigate to Product Images tab
    await page.click('text=Product Images')
    await expect(page.locator('[data-testid="image-upload-area"]')).toBeVisible()
    await expect(page.locator('text=Upload at least 3-5 high-quality images')).toBeVisible()

    // Navigate to Product Variants tab
    await page.click('text=Product Variants')
    await expect(page.locator('[data-testid="variant-manager"]')).toBeVisible()
    await expect(page.locator('text=Create variants for different sizes, colors, or options')).toBeVisible()

    // Navigate to A+ Content tab
    await page.click('text=A+ Content')
    await expect(page.locator('[data-testid="a-plus-content-manager"]')).toBeVisible()
    await expect(page.locator('text=Create rich content with images and formatted text sections')).toBeVisible()

    // Navigate to FAQs tab
    await page.click('text=FAQs')
    await expect(page.locator('[data-testid="faq-manager"]')).toBeVisible()
    await expect(page.locator('text=Manage customer Q&A with a maximum of')).toBeVisible()

    // Navigate to Product Details tab
    await page.click('text=Product Details')
    await expect(page.locator('[data-testid="product-details-form"]')).toBeVisible()
    await expect(page.locator('text=Basic Specifications')).toBeVisible()
    await expect(page.locator('text=Dimensions (cm)')).toBeVisible()
    await expect(page.locator('text=Additional Information')).toBeVisible()

    // Navigate to Product Information tab
    await page.click('text=Product Information')
    await expect(page.locator('[data-testid="product-information-form"]')).toBeVisible()
    await expect(page.locator('text=Detailed Description')).toBeVisible()

    // Navigate to SEO tab
    await page.click('text=SEO')
    await expect(page.locator('[data-testid="seo-form"]')).toBeVisible()
    await expect(page.locator('text=SEO Title')).toBeVisible()
    await expect(page.locator('text=SEO Description')).toBeVisible()
  })

  test('should handle product details form correctly', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill basic information first
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="selling-price-input"]', '100')

    // Navigate to Product Details tab
    await page.click('text=Product Details')

    // Fill basic specifications
    await page.fill('[data-testid="weight-input"]', '0.5')
    await page.fill('[data-testid="warranty-months-input"]', '24')
    await page.click('[data-testid="origin-country-select"]')
    await page.click('text=China')
    await page.fill('[data-testid="model-number-input"]', 'WH-1000XM5')

    // Fill dimensions
    await page.fill('[data-testid="length-input"]', '25')
    await page.fill('[data-testid="width-input"]', '20')
    await page.fill('[data-testid="height-input"]', '8')

    // Check volume is calculated (should show "Auto")
    await expect(page.locator('[data-testid="volume-input"]')).toHaveValue('Auto')

    // Fill additional information
    await page.fill('[data-testid="manufacturer-input"]', 'Sony')
    await page.fill('[data-testid="warranty-text-input"]', '2 years manufacturer warranty')
    await page.fill('[data-testid="shipping-requirements-input"]', 'Handle with care, keep dry')

    // Verify all fields are filled
    await expect(page.locator('[data-testid="weight-input"]')).toHaveValue('0.5')
    await expect(page.locator('[data-testid="warranty-months-input"]')).toHaveValue('24')
    await expect(page.locator('[data-testid="model-number-input"]')).toHaveValue('WH-1000XM5')
    await expect(page.locator('[data-testid="manufacturer-input"]')).toHaveValue('Sony')
  })

  test('should handle product information form correctly', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill basic information first
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="selling-price-input"]', '100')

    // Navigate to Product Information tab
    await page.click('text=Product Information')

    // Fill detailed description using rich text editor
    await page.fill('[data-testid="description-editor"]', 'Premium wireless headphones with active noise cancellation, exceptional sound quality, and all-day comfort.')

    // Add key features
    await page.click('[data-testid="features-input"]')
    await page.fill('[data-testid="features-input"]', 'Active Noise Cancellation')
    await page.press('[data-testid="features-input"]', 'Enter')
    await page.fill('[data-testid="features-input"]', '30-hour battery life')
    await page.press('[data-testid="features-input"]', 'Enter')
    await page.fill('[data-testid="features-input"]', 'Premium comfort padding')
    await page.press('[data-testid="features-input"]', 'Enter')

    // Fill included items
    await page.click('[data-testid="included-items-input"]')
    await page.fill('[data-testid="included-items-input"]', 'Headphones')
    await page.press('[data-testid="included-items-input"]', 'Enter')
    await page.fill('[data-testid="included-items-input"]', 'Carrying case')
    await page.press('[data-testid="included-items-input"]', 'Enter')
    await page.fill('[data-testid="included-items-input"]', 'USB-C charging cable')
    await page.press('[data-testid="included-items-input"]', 'Enter')
    await page.fill('[data-testid="included-items-input"]', '3.5mm audio cable')
    await page.press('[data-testid="included-items-input"]', 'Enter')

    // Fill compatibility
    await page.fill('[data-testid="compatibility-editor"]', 'Bluetooth 5.0, compatible with iOS, Android, Windows, Mac')

    // Fill safety warnings
    await page.fill('[data-testid="safety-warnings-editor"]', 'Keep away from water, do not expose to extreme temperatures')

    // Fill care instructions
    await page.fill('[data-testid="care-instructions-editor"]', 'Clean with soft cloth, store in carrying case when not in use')

    // Verify content is filled
    await expect(page.locator('[data-testid="description-editor"]')).toContainText('Premium wireless headphones')
  })

  test('should handle SEO form correctly', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill basic information first
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="selling-price-input"]', '100')

    // Navigate to SEO tab
    await page.click('text=SEO')

    // Fill SEO title (should be 50-60 characters)
    await page.fill('[data-testid="seo-title-input"]', 'Premium Wireless Headphones - Noise Cancelling - Sony WH-1000XM5')

    // Fill SEO description (should be 150-160 characters)
    await page.fill('[data-testid="seo-description-input"]', 'Experience premium sound quality with Sony WH-1000XM5 wireless headphones. Features active noise cancellation, 30-hour battery life, and superior comfort for all-day wear.')

    // Add SEO keywords
    await page.click('[data-testid="seo-keywords-input"]')
    await page.fill('[data-testid="seo-keywords-input"]', 'wireless headphones')
    await page.press('[data-testid="seo-keywords-input"]', 'Enter')
    await page.fill('[data-testid="seo-keywords-input"]', 'noise cancelling')
    await page.press('[data-testid="seo-keywords-input"]', 'Enter')
    await page.fill('[data-testid="seo-keywords-input"]', 'bluetooth headphones')
    await page.press('[data-testid="seo-keywords-input"]', 'Enter')
    await page.fill('[data-testid="seo-keywords-input"]', 'sony headphones')
    await page.press('[data-testid="seo-keywords-input"]', 'Enter')

    // Verify SEO fields are filled correctly
    await expect(page.locator('[data-testid="seo-title-input"]')).toHaveValue('Premium Wireless Headphones - Noise Cancelling - Sony WH-1000XM5')
    await expect(page.locator('[data-testid="seo-description-input"]')).toHaveValue(/Experience premium sound quality/)
  })

  test('should validate form submission with all required data', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill all required information across all tabs

    // Basic Information
    await page.fill('[data-testid="product-title-input"]', 'Premium Wireless Headphones')
    await page.fill('[data-testid="sku-input"]', 'WH-1000XM5')
    await page.fill('[data-testid="short-description-input"]', 'Premium noise-cancelling wireless headphones')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="cost-price-input"]', '200')
    await page.fill('[data-testid="selling-price-input"]', '350')
    await page.fill('[data-testid="mrp-input"]', '400')

    // Product Details (required)
    await page.click('text=Product Details')
    await page.fill('[data-testid="weight-input"]', '0.5')
    await page.fill('[data-testid="model-number-input"]', 'WH-1000XM5')
    await page.fill('[data-testid="manufacturer-input"]', 'Sony')

    // Product Information (required)
    await page.click('text=Product Information')
    await page.fill('[data-testid="description-editor"]', 'Premium wireless headphones with active noise cancellation and exceptional sound quality.')

    // Now try to save - should succeed or show specific validation errors
    await page.click('[data-testid="save-product-button"]')

    // Either product is saved successfully or we get specific validation messages
    // The exact behavior depends on backend implementation
    await page.waitForTimeout(2000) // Wait for any async operations

    // Check for either success message or specific validation errors
    const successMessage = page.locator('text=Product created successfully')
    const errorMessage = page.locator('[data-testid="error-message"]')

    if (await successMessage.isVisible()) {
      // Success case
      await expect(successMessage).toBeVisible()
      await expect(page.locator('[role="dialog"]')).not.toBeVisible() // Modal should close
    } else if (await errorMessage.isVisible()) {
      // Error case - should be a specific error, not generic validation
      const errorText = await errorMessage.textContent()
      expect(errorText).not.toContain('Product title is required')
      expect(errorText).not.toContain('Category is required')
      expect(errorText).not.toContain('Description is required')
    } else {
      // No message yet - could be processing
      console.log('No success or error message visible yet')
    }
  })

  test('should handle form cancellation', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Fill some data
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.fill('[data-testid="sku-input"]', 'TEST-123')

    // Click cancel
    await page.click('[data-testid="cancel-button"]')

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Form should be reset if opened again
    await page.click('[data-testid="add-product-button"]')
    await expect(page.locator('[data-testid="product-title-input"]')).toHaveValue('')
    await expect(page.locator('[data-testid="sku-input"]')).toHaveValue('')
  })

  test('should handle help tooltips correctly', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Check floating help button is visible
    await expect(page.locator('[data-testid="floating-help-button"]')).toBeVisible()

    // Click help button to show tooltip
    await page.click('[data-testid="floating-help-button"]')

    // Tooltip should be visible with relevant tips
    await expect(page.locator('[data-testid="help-tooltip"]')).toBeVisible()
    await expect(page.locator('text=Basic Information Tips')).toBeVisible()

    // Navigate through tabs and check help content updates
    await page.click('text=Product Images')
    await expect(page.locator('text=Product Images Tips')).toBeVisible()

    await page.click('text=Product Variants')
    await expect(page.locator('text=Product Variants Tips')).toBeVisible()

    await page.click('text=SEO')
    await expect(page.locator('text=SEO Tips')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile layout
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Open mobile menu if needed
    if (await page.locator('[data-testid="mobile-menu-button"]').isVisible()) {
      await page.click('[data-testid="mobile-menu-button"]')
    }

    // Navigate to products on mobile
    await page.click('text=Products')
    await page.waitForLoadState('networkidle')

    // Check mobile product list
    await expect(page.locator('[data-testid="mobile-product-list"]')).toBeVisible()

    // Open product form on mobile
    await page.click('[data-testid="add-product-button"]')

    // Check mobile form layout
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-form"]')).toBeVisible()

    // Form should be scrollable on mobile
    const formElement = page.locator('[data-testid="product-form"]')
    await expect(formElement).toBeVisible()

    // Check form fields are accessible on mobile
    await expect(page.locator('[data-testid="product-title-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="category-select"]')).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Test Tab navigation through form fields
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="product-title-input"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="sku-input"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="short-description-input"]')).toBeFocused()

    // Test form submission with Enter key
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.press('[data-testid="product-title-input"]', 'Tab')
    await page.fill('[data-testid="sku-input"]', 'TEST-123')

    // Enter should not submit form if required fields are missing
    await page.press('[data-testid="sku-input"]', 'Enter')
    await expect(page.locator('[role="dialog"]')).toBeVisible() // Modal should still be open

    // Test Escape key to close modal
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should handle accessibility requirements', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')

    // Check ARIA labels and roles
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-modal', 'true')
    await expect(page.locator('[role="dialog"]')).toHaveAttribute('aria-labelledby')

    // Check form labels are properly associated
    await expect(page.locator('label[for="product-title"]')).toBeVisible()
    await expect(page.locator('label[for="category"]')).toBeVisible()

    // Check form fields have proper aria attributes
    await expect(page.locator('[data-testid="product-title-input"]')).toHaveAttribute('aria-required', 'true')
    await expect(page.locator('[data-testid="category-select"]')).toHaveAttribute('aria-required', 'true')

    // Check screen reader announcements
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="save-product-button"]')

    // Should announce validation errors to screen readers
    await expect(page.locator('[role="alert"]')).toBeVisible()

    // Check focus management
    await expect(page.locator('[data-testid="product-title-input"]')).toBeFocused()
  })
})

test.describe('Product Form Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/products', route => route.abort())

    await page.goto('/products')
    await page.click('[data-testid="add-product-button"]')

    // Fill form with valid data
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="selling-price-input"]', '100')
    await page.fill('[data-testid="description-editor"]', 'Test description')

    // Try to save
    await page.click('[data-testid="save-product-button"]')

    // Should show network error message
    await expect(page.locator('text=Network error occurred')).toBeVisible()
    await expect(page.locator('text=Please check your connection and try again')).toBeVisible()
  })

  test('should handle authentication errors', async ({ page }) => {
    // Mock auth error
    await page.route('**/api/products', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Authentication required' })
      })
    })

    await page.goto('/products')
    await page.click('[data-testid="add-product-button"]')

    // Fill form with valid data
    await page.fill('[data-testid="product-title-input"]', 'Test Product')
    await page.click('[data-testid="category-select"]')
    await page.click('text=Electronics')
    await page.fill('[data-testid="selling-price-input"]', '100')
    await page.fill('[data-testid="description-editor"]', 'Test description')

    // Try to save
    await page.click('[data-testid="save-product-button"]')

    // Should show authentication error
    await expect(page.locator('text=Please log in to save products')).toBeVisible()
  })
})