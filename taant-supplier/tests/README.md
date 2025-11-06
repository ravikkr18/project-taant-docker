# Product Form Testing Suite

This directory contains a comprehensive automated testing suite for the product management forms, designed to ensure reliability, functionality, and production readiness.

## Test Structure

```
tests/
├── unit/                           # Unit tests for individual components and functions
│   └── product-form-validation.test.tsx
├── integration/                    # Integration tests for component interactions
│   └── product-form-workflow.test.tsx
├── e2e/                           # End-to-end tests for complete user workflows
│   └── product-form-e2e.spec.ts
├── visual/                        # Visual regression tests (future)
└── performance/                   # Performance tests (future)
```

## Test Types

### 1. Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions, components, and validation logic in isolation
- **Coverage**: Form validation, field validation, business logic
- **Tools**: Jest, React Testing Library
- **Run Command**: `npm run test`

#### Key Test Cases:
- Required field validation (title, category, selling price, description)
- Price validation (cost price ≥ 0, MRP ≥ selling price)
- SKU format validation
- Title length validation
- Form submission with valid data

### 2. Integration Tests (`tests/integration/`)
- **Purpose**: Test how components work together
- **Coverage**: Complete form workflows, state management, API interactions
- **Tools**: Jest, React Testing Library, Mocked APIs
- **Run Command**: `npm run test -- --testPathPattern=integration`

#### Key Test Cases:
- Complete product creation workflow
- Progressive form filling with real-time validation
- Form state management
- Loading states and error handling
- Form cancellation and reset

### 3. End-to-End Tests (`tests/e2e/`)
- **Purpose**: Test complete user journeys in a real browser
- **Coverage**: UI interactions, accessibility, responsiveness, cross-browser compatibility
- **Tools**: Playwright
- **Run Command**: `npm run test:e2e`

#### Key Test Cases:
- Full product creation process
- Multi-tab form navigation
- Mobile responsiveness
- Keyboard navigation
- Accessibility compliance
- Error handling (network errors, authentication errors)
- Help tooltip functionality

## Running Tests

### Development Mode
```bash
# Run unit tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Continuous Integration
```bash
# Run all tests for CI
npm run test:ci

# Run complete test suite
npm run test:all
```

### Individual Test Categories
```bash
# Unit tests only
npm run test

# Integration tests only
npm run test -- --testPathPattern=integration

# E2E tests only
npm run test:e2e
```

## Test Coverage Requirements

Our testing suite maintains high coverage standards:

- **Branch Coverage**: ≥ 80%
- **Function Coverage**: ≥ 80%
- **Line Coverage**: ≥ 80%
- **Statement Coverage**: ≥ 80%

### Coverage Reports
Coverage reports are generated in:
- **Console**: Summary output
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

## Test Data and Mocking

### Mocked Services
- **Supabase**: Database operations are mocked for unit/integration tests
- **Next.js Router**: Navigation and routing are mocked
- **Ant Design**: Message and notification components are mocked

### Test Data
- **Valid Product Data**: Complete product information for successful submission tests
- **Invalid Data**: Various invalid inputs for validation testing
- **Edge Cases**: Boundary values and special characters

## Form Validation Testing

### Required Fields
- Product Title (required, max 200 characters, no HTML)
- Category (required)
- Selling Price (required, > 0)
- Description (required)

### Optional Fields
- SKU (format validation)
- Cost Price (≥ 0)
- MRP (≥ selling price if provided)
- Short Description (max 160 characters)

### Business Logic Validation
- Price relationships (Cost ≤ Selling ≤ MRP)
- Character limits and format requirements
- Special character handling

## Accessibility Testing

### ARIA Compliance
- Proper roles and labels
- Focus management
- Screen reader announcements
- Keyboard navigation

### WCAG Guidelines
- Color contrast
- Text alternatives
- Semantic HTML
- Keyboard accessibility

## Cross-Browser Testing

### Supported Browsers
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version

### Mobile Testing
- **iOS**: Safari on iPhone 12
- **Android**: Chrome on Pixel 5

## Performance Testing

### Metrics Tracked
- Page load time
- Form submission time
- Component render time
- Memory usage

### Performance Budgets
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- Form submission response: < 1s

## Error Handling Tests

### Network Errors
- Connection failures
- Timeout scenarios
- Server errors (5xx)
- Client errors (4xx)

### Authentication Errors
- Expired sessions
- Invalid credentials
- Permission denied

### Validation Errors
- Server-side validation failures
- Client-side validation errors
- Edge case handling

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
```

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No critical accessibility issues
- Performance budgets maintained

## Debugging Tests

### Unit Test Debugging
```bash
# Run specific test file
npm test -- product-form-validation.test.tsx

# Run with verbose output
npm test -- --verbose

# Run tests matching a pattern
npm test -- --testNamePattern="validation"
```

### E2E Test Debugging
```bash
# Run with Playwright Inspector
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- product-form-e2e

# Run with trace viewer
npx playwright test --trace on
```

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Keep tests isolated and independent

### Test Data Management
- Use factory functions for test data
- Avoid hardcoded test data
- Clean up after each test
- Use consistent naming conventions

### Mocking Strategy
- Mock external dependencies
- Use realistic mock data
- Keep mocks simple and focused
- Document mock behavior

### Assertion Strategy
- Use specific assertions
- Assert on outcomes, not implementation
- Include helpful error messages
- Test edge cases and boundaries

## Troubleshooting

### Common Issues

1. **Tests Time Out**
   - Increase timeout values
   - Check for async operations
   - Verify proper waiting

2. **Mock Failures**
   - Verify mock setup
   - Check mock implementation
   - Ensure proper cleanup

3. **E2E Test Flakiness**
   - Use proper selectors
   - Add explicit waits
   - Handle dynamic content

4. **Coverage Gaps**
   - Identify uncovered code
   - Add missing test cases
   - Review test effectiveness

### Debug Commands
```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Generate detailed coverage report
npm run test:coverage -- --verbose

# Run Playwright with trace
npx playwright test --trace on --headed
```

## Maintenance

### Regular Tasks
- Update test dependencies
- Review and optimize slow tests
- Update mocks for API changes
- Remove obsolete tests

### When to Add Tests
- New features are added
- Bugs are fixed
- Edge cases are identified
- Requirements change

### Test Review Checklist
- [ ] Tests cover all requirements
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Tests are maintainable
- [ ] Documentation is updated
- [ ] Coverage meets standards

## Future Enhancements

### Planned Improvements
- Visual regression testing
- Performance testing
- Security testing
- Internationalization testing

### Tools to Consider
- Storybook for component testing
- Percy for visual testing
- Lighthouse CI for performance
- OWASP ZAP for security

---

This testing suite ensures that our product forms are reliable, accessible, and production-ready. Regular execution of these tests helps maintain code quality and prevents regressions.