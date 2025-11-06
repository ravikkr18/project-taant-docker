#!/usr/bin/env node

/**
 * Test Validation Script
 *
 * This script validates that our test infrastructure is properly set up
 * and provides a quick health check of the testing suite.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Validating Test Infrastructure...\n')

// Check if test files exist
const testFiles = [
  'tests/unit/form-validation.test.tsx',
  'tests/integration/product-workflow.test.tsx',
  'tests/e2e/product-form-e2e.spec.ts',
  'jest.config.js',
  'jest.setup.js',
  'playwright.config.ts',
  'tests/README.md'
]

console.log('📁 Checking test files...')
let allFilesExist = true

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - Missing`)
    allFilesExist = false
  }
})

// Check package.json test scripts
console.log('\n📦 Checking package.json test scripts...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const testScripts = [
  'test',
  'test:watch',
  'test:coverage',
  'test:ci',
  'test:e2e',
  'test:e2e:ui',
  'test:e2e:headed',
  'test:all'
]

let allScriptsExist = true
testScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script}`)
  } else {
    console.log(`❌ ${script} - Missing`)
    allScriptsExist = false
  }
})

// Check dependencies
console.log('\n📚 Checking test dependencies...')
const devDeps = packageJson.devDependencies || {}
const requiredDeps = [
  'jest',
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@testing-library/user-event',
  '@types/jest',
  'ts-jest',
  'jest-environment-jsdom',
  '@playwright/test'
]

let allDepsExist = true
requiredDeps.forEach(dep => {
  if (devDeps[dep]) {
    console.log(`✅ ${dep}@${devDeps[dep]}`)
  } else {
    console.log(`❌ ${dep} - Missing`)
    allDepsExist = false
  }
})

// Try to run a quick syntax check
console.log('\n🔍 Running syntax validation...')
try {
  execSync('npm test -- --passWithNoTests --detectOpenHandles', {
    stdio: 'pipe',
    timeout: 10000
  })
  console.log('✅ Jest configuration is valid')
} catch (error) {
  console.log('❌ Jest configuration has issues')
  console.log('   Error:', error.message.split('\n')[0])
}

try {
  execSync('npx playwright test --list', {
    stdio: 'pipe',
    timeout: 10000
  })
  console.log('✅ Playwright configuration is valid')
} catch (error) {
  console.log('❌ Playwright configuration has issues')
  console.log('   Error:', error.message.split('\n')[0])
}

// Summary
console.log('\n📊 Test Infrastructure Summary:')
console.log('================================')

const summary = {
  'Test Files': allFilesExist,
  'Test Scripts': allScriptsExist,
  'Dependencies': allDepsExist
}

Object.entries(summary).forEach(([category, status]) => {
  console.log(`${status ? '✅' : '❌'} ${category}: ${status ? 'OK' : 'Needs attention'}`)
})

const overallStatus = Object.values(summary).every(Boolean)
console.log(`\n${overallStatus ? '🎉' : '⚠️'} Overall Status: ${overallStatus ? 'READY' : 'NEEDS SETUP'}`)

if (overallStatus) {
  console.log('\n🚀 Your test suite is ready to use!')
  console.log('\nAvailable commands:')
  console.log('  npm run test              # Run unit tests')
  console.log('  npm run test:watch       # Run tests in watch mode')
  console.log('  npm run test:coverage    # Run with coverage report')
  console.log('  npm run test:e2e         # Run E2E tests')
  console.log('  npm run test:e2e:ui      # Run E2E with UI')
  console.log('  npm run test:all         # Run all tests')
} else {
  console.log('\n🔧 Some setup is needed. Please review the issues above.')
  process.exit(1)
}