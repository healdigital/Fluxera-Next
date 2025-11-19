# E2E Testing Guide

**Project:** Fluxera Asset Management System  
**Testing Framework:** Playwright  
**Last Updated:** November 18, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing New Tests](#writing-new-tests)
5. [Test Utilities](#test-utilities)
6. [Test Fixtures](#test-fixtures)
7. [Page Object Model](#page-object-model)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Fluxera E2E test suite uses Playwright to validate critical user workflows across the application. The test suite is designed to:

- Validate complete user journeys from start to finish
- Catch regressions before they reach production
- Ensure accessibility compliance
- Verify cross-browser compatibility
- Provide confidence for deployments

### Test Coverage

| Feature Area | Test Files | Test Cases | Status |
|--------------|------------|------------|--------|
| Asset Management | 1 | 12 | ✅ Complete |
| License Management | 1 | 10 | ✅ Complete |
| User Management | 1 | 9 | ✅ Complete |
| Dashboard | 1 | 8 | ✅ Complete |
| Accessibility | 1 | 5 | ✅ Complete |
| **Total** | **5** | **44** | **100%** |

### Key Metrics

- **Total Test Duration:** ~8 minutes
- **Success Rate:** 95%+
- **CI Integration:** ✅ Configured
- **Browsers Tested:** Chromium, Firefox, WebKit

---

## Test Structure


### Directory Structure

```
apps/e2e/
├── playwright.config.ts          # Playwright configuration
├── tests/
│   ├── assets/                   # Asset management tests
│   │   ├── assets.spec.ts       # Test specifications
│   │   └── assets.po.ts         # Page object
│   ├── licenses/                 # License management tests
│   │   ├── licenses.spec.ts
│   │   └── licenses.po.ts
│   ├── users/                    # User management tests
│   │   ├── users.spec.ts
│   │   └── users.po.ts
│   ├── dashboard/                # Dashboard tests
│   │   ├── dashboard.spec.ts
│   │   └── dashboard.po.ts
│   ├── accessibility/            # Accessibility tests
│   │   └── accessibility.spec.ts
│   ├── fixtures/                 # Test data fixtures
│   │   ├── asset-fixtures.ts
│   │   ├── license-fixtures.ts
│   │   ├── user-fixtures.ts
│   │   └── index.ts
│   └── utils/                    # Test utilities
│       ├── asset-helpers.ts
│       ├── license-helpers.ts
│       ├── user-helpers.ts
│       ├── auth-helpers.ts
│       ├── cleanup-helpers.ts
│       └── index.ts
├── scripts/
│   └── generate-test-summary.ts  # Test reporting script
└── package.json
```

### Test File Naming Conventions

- **Spec Files:** `{feature}.spec.ts` - Contains test cases
- **Page Objects:** `{feature}.po.ts` - Contains page selectors and actions
- **Helpers:** `{feature}-helpers.ts` - Contains reusable test functions
- **Fixtures:** `{feature}-fixtures.ts` - Contains test data

---

## Running Tests

### Prerequisites

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Start Supabase:**
   ```bash
   pnpm supabase:web:start
   ```

3. **Start Development Server:**
   ```bash
   pnpm dev
   ```

### Running All Tests

```bash
# Run all tests
pnpm --filter web-e2e test

# Run tests in headed mode (see browser)
pnpm --filter web-e2e test --headed

# Run tests in debug mode
pnpm --filter web-e2e test --debug
```


### Running Specific Tests

```bash
# Run tests for a specific feature
pnpm --filter web-e2e test tests/assets/

# Run a single test file
pnpm --filter web-e2e test tests/assets/assets.spec.ts

# Run tests matching a pattern
pnpm --filter web-e2e test --grep "create asset"

# Run tests in a specific browser
pnpm --filter web-e2e test --project=chromium
pnpm --filter web-e2e test --project=firefox
pnpm --filter web-e2e test --project=webkit
```

### Viewing Test Reports

```bash
# Generate and open HTML report
pnpm --filter web-e2e test:report

# View last test results
pnpm --filter web-e2e playwright show-report
```

### Test Configuration

The Playwright configuration is located at `apps/e2e/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## Writing New Tests

### Step 1: Create Test File

Create a new test file in the appropriate directory:

```typescript
// apps/e2e/tests/my-feature/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { MyFeaturePage } from './my-feature.po';

test.describe('My Feature', () => {
  let page: MyFeaturePage;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new MyFeaturePage(playwrightPage);
    await page.goto();
  });

  test('should perform basic operation', async () => {
    // Test implementation
  });
});
```


### Step 2: Create Page Object

Create a page object to encapsulate page interactions:

```typescript
// apps/e2e/tests/my-feature/my-feature.po.ts
import { Page, Locator } from '@playwright/test';

export class MyFeaturePage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByTestId('create-button');
    this.nameInput = page.getByLabel('Name');
    this.submitButton = page.getByTestId('submit-button');
  }

  async goto() {
    await this.page.goto('/home/test-team/my-feature');
  }

  async createItem(name: string) {
    await this.createButton.click();
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }
}
```

### Step 3: Create Test Helpers (Optional)

For complex operations, create helper functions:

```typescript
// apps/e2e/tests/utils/my-feature-helpers.ts
import { Page, expect } from '@playwright/test';

export async function createMyFeatureItem(
  page: Page,
  data: { name: string; description?: string }
) {
  await page.getByTestId('create-button').click();
  await page.getByLabel('Name').fill(data.name);
  
  if (data.description) {
    await page.getByLabel('Description').fill(data.description);
  }
  
  await page.getByTestId('submit-button').click();
  
  // Wait for success message
  await expect(page.getByRole('alert')).toContainText('created successfully');
}

export async function verifyItemExists(page: Page, name: string) {
  await expect(page.getByText(name)).toBeVisible();
}
```

### Step 4: Create Test Fixtures (Optional)

Define reusable test data:

```typescript
// apps/e2e/tests/fixtures/my-feature-fixtures.ts
export const basicItem = {
  name: 'Test Item',
  description: 'Test description',
};

export const advancedItem = {
  name: 'Advanced Item',
  description: 'Advanced description',
  category: 'advanced',
};

export function generateUniqueItem(base = basicItem) {
  return {
    ...base,
    name: `${base.name} ${Date.now()}`,
  };
}
```

### Step 5: Write Test Cases

Write comprehensive test cases covering all scenarios:

```typescript
test.describe('My Feature', () => {
  test('should create new item', async ({ page }) => {
    const item = generateUniqueItem();
    await createMyFeatureItem(page, item);
    await verifyItemExists(page, item.name);
  });

  test('should edit existing item', async ({ page }) => {
    // Create item first
    const item = generateUniqueItem();
    await createMyFeatureItem(page, item);
    
    // Edit item
    await page.getByText(item.name).click();
    await page.getByTestId('edit-button').click();
    await page.getByLabel('Name').fill('Updated Name');
    await page.getByTestId('save-button').click();
    
    // Verify update
    await expect(page.getByText('Updated Name')).toBeVisible();
  });

  test('should delete item', async ({ page }) => {
    // Create and delete
    const item = generateUniqueItem();
    await createMyFeatureItem(page, item);
    await page.getByText(item.name).click();
    await page.getByTestId('delete-button').click();
    await page.getByTestId('confirm-delete').click();
    
    // Verify deletion
    await expect(page.getByText(item.name)).not.toBeVisible();
  });
});
```


---

## Test Utilities

### Available Helpers

The test suite includes comprehensive helper functions for common operations. See `apps/e2e/tests/utils/README.md` for complete documentation.

#### Asset Helpers

```typescript
import { createAsset, assignAsset, verifyAssetExists } from '../utils/asset-helpers';

// Create asset
await createAsset(page, {
  name: 'Test Laptop',
  category: 'laptop',
  status: 'available',
});

// Assign asset
await assignAsset(page, 'Test Laptop', {
  userId: 'user-id',
  assignedBy: 'admin-id',
});

// Verify asset
await verifyAssetExists(page, 'Test Laptop');
```

#### License Helpers

```typescript
import { createLicense, assignLicenseToUser } from '../utils/license-helpers';

// Create license
await createLicense(page, {
  name: 'Office 365',
  vendor: 'Microsoft',
  licenseKey: 'XXXXX-XXXXX',
  licenseType: 'subscription',
});

// Assign to user
await assignLicenseToUser(page, 'Office 365', {
  userId: 'user-id',
});
```

#### User Helpers

```typescript
import { inviteUser, changeUserRole } from '../utils/user-helpers';

// Invite user
await inviteUser(page, {
  email: 'newuser@example.com',
  role: 'member',
});

// Change role
await changeUserRole(page, 'user@example.com', {
  role: 'admin',
});
```

#### Auth Helpers

```typescript
import { setupTestEnvironment, loginUser } from '../utils/auth-helpers';

// Setup complete test environment
const { email, teamName, slug } = await setupTestEnvironment(page);

// Login existing user
await loginUser(page, {
  email: 'test@example.com',
  password: 'password123',
});
```

#### Cleanup Helpers

```typescript
import { TestDataTracker, cleanupAllTestData } from '../utils/cleanup-helpers';

// Track test data for automatic cleanup
const tracker = new TestDataTracker();
tracker.trackAsset('Test Laptop');
tracker.trackLicense('Office 365');
await tracker.cleanup(page);

// Manual cleanup
await cleanupAllTestData(page, {
  assets: ['Test Laptop'],
  licenses: ['Office 365'],
  users: ['test@example.com'],
});
```

---

## Test Fixtures

### Available Fixtures

The test suite includes predefined fixtures for consistent test data. See `apps/e2e/tests/fixtures/` for complete documentation.

#### Asset Fixtures

```typescript
import { 
  laptopAsset, 
  desktopAsset,
  generateUniqueAsset 
} from '../fixtures/asset-fixtures';

// Use predefined fixture
await createAsset(page, laptopAsset);

// Generate unique fixture
const uniqueLaptop = generateUniqueAsset(laptopAsset);
await createAsset(page, uniqueLaptop);
```

#### License Fixtures

```typescript
import { 
  office365License,
  adobeCCLicense,
  generateUniqueLicense 
} from '../fixtures/license-fixtures';

// Use predefined fixture
await createLicense(page, office365License);

// Generate unique fixture
const uniqueLicense = generateUniqueLicense(office365License);
await createLicense(page, uniqueLicense);
```

#### User Fixtures

```typescript
import { 
  adminUser,
  memberUser,
  generateUniqueUser 
} from '../fixtures/user-fixtures';

// Use predefined fixture
await inviteUser(page, memberUser);

// Generate unique fixture
const uniqueUser = generateUniqueUser(memberUser);
await inviteUser(page, uniqueUser);
```


---

## Page Object Model

### Pattern Overview

The Page Object Model (POM) pattern encapsulates page interactions and selectors, making tests more maintainable and readable.

### Creating a Page Object

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class MyFeaturePage {
  // Page reference
  readonly page: Page;
  
  // Locators
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly itemList: Locator;
  
  // Constructor
  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'My Feature' });
    this.createButton = page.getByTestId('create-button');
    this.searchInput = page.getByPlaceholder('Search...');
    this.itemList = page.getByTestId('item-list');
  }
  
  // Navigation
  async goto() {
    await this.page.goto('/home/test-team/my-feature');
    await expect(this.heading).toBeVisible();
  }
  
  // Actions
  async createItem(data: { name: string }) {
    await this.createButton.click();
    await this.page.getByLabel('Name').fill(data.name);
    await this.page.getByTestId('submit-button').click();
    await expect(this.page.getByRole('alert')).toContainText('created');
  }
  
  async searchItems(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }
  
  // Assertions
  async expectItemVisible(name: string) {
    await expect(this.itemList.getByText(name)).toBeVisible();
  }
  
  async expectItemCount(count: number) {
    await expect(this.itemList.locator('[data-test="item-card"]')).toHaveCount(count);
  }
}
```

### Using Page Objects in Tests

```typescript
import { test } from '@playwright/test';
import { MyFeaturePage } from './my-feature.po';

test.describe('My Feature', () => {
  let featurePage: MyFeaturePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new MyFeaturePage(page);
    await featurePage.goto();
  });

  test('should create and find item', async () => {
    await featurePage.createItem({ name: 'Test Item' });
    await featurePage.searchItems('Test');
    await featurePage.expectItemVisible('Test Item');
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

The E2E tests run automatically on every pull request and push to main. Configuration is in `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start Supabase
        run: pnpm supabase:web:start
      
      - name: Start dev server
        run: pnpm dev &
      
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: pnpm --filter web-e2e test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/e2e/playwright-report/
      
      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-videos
          path: apps/e2e/test-results/
```


### Test Reporting Workflow

Automated test reports are generated and posted to PRs via `.github/workflows/e2e-test-report.yml`:

```yaml
name: E2E Test Report

on:
  workflow_run:
    workflows: ['E2E Tests']
    types: [completed]

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download test results
        uses: actions/download-artifact@v4
        with:
          name: playwright-report
      
      - name: Generate summary
        run: node apps/e2e/scripts/generate-test-summary.ts
      
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const summary = fs.readFileSync('test-summary.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });
```

### Viewing CI Test Results

1. **In Pull Requests:**
   - Check the "Checks" tab for test status
   - View automated test summary comment
   - Download artifacts for detailed reports

2. **In GitHub Actions:**
   - Navigate to Actions tab
   - Select the workflow run
   - View logs and download artifacts

3. **Test Artifacts:**
   - HTML report: Full test results with screenshots
   - Videos: Recordings of failed tests
   - Traces: Detailed execution traces

---

## Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests:

```typescript
// ❌ Bad: Tests depend on each other
test('create item', async ({ page }) => {
  await createItem(page, 'Test Item');
});

test('edit item', async ({ page }) => {
  // Assumes 'Test Item' exists from previous test
  await editItem(page, 'Test Item');
});

// ✅ Good: Each test is independent
test('edit item', async ({ page }) => {
  // Create item in this test
  await createItem(page, 'Test Item');
  await editItem(page, 'Test Item');
  // Clean up
  await deleteItem(page, 'Test Item');
});
```

### 2. Use Data-Test Attributes

Use `data-test` or `data-testid` attributes for reliable selectors:

```typescript
// ❌ Bad: Fragile selectors
await page.locator('.btn-primary.mt-4').click();

// ✅ Good: Stable selectors
await page.getByTestId('create-button').click();
```

### 3. Wait for Elements Properly

Use Playwright's auto-waiting and explicit waits:

```typescript
// ❌ Bad: Arbitrary timeouts
await page.waitForTimeout(2000);

// ✅ Good: Wait for specific conditions
await page.waitForLoadState('networkidle');
await expect(page.getByText('Success')).toBeVisible();
```

### 4. Clean Up Test Data

Always clean up test data to avoid conflicts:

```typescript
test('my test', async ({ page }) => {
  const tracker = new TestDataTracker();
  
  try {
    // Create test data
    await createAsset(page, laptopAsset);
    tracker.trackAsset(laptopAsset.name);
    
    // Run test
    // ...
  } finally {
    // Always clean up
    await tracker.cleanup(page);
  }
});
```

### 5. Use Fixtures for Test Data

Use fixtures instead of hardcoding data:

```typescript
// ❌ Bad: Hardcoded data
await createAsset(page, {
  name: 'Laptop',
  category: 'laptop',
  status: 'available',
});

// ✅ Good: Use fixtures
import { laptopAsset } from '../fixtures/asset-fixtures';
await createAsset(page, laptopAsset);
```

### 6. Group Related Tests

Use `test.describe` to group related tests:

```typescript
test.describe('Asset Management', () => {
  test.describe('Creation', () => {
    test('should create basic asset', async ({ page }) => {});
    test('should validate required fields', async ({ page }) => {});
  });
  
  test.describe('Assignment', () => {
    test('should assign to user', async ({ page }) => {});
    test('should prevent duplicate assignment', async ({ page }) => {});
  });
});
```

### 7. Use Page Objects

Encapsulate page interactions in page objects:

```typescript
// ❌ Bad: Direct page interactions in tests
test('create asset', async ({ page }) => {
  await page.getByTestId('create-button').click();
  await page.getByLabel('Name').fill('Test');
  await page.getByTestId('submit').click();
});

// ✅ Good: Use page object
test('create asset', async ({ page }) => {
  const assetsPage = new AssetsPage(page);
  await assetsPage.createAsset({ name: 'Test' });
});
```

### 8. Test Error States

Don't just test happy paths:

```typescript
test.describe('Error Handling', () => {
  test('should show error for invalid data', async ({ page }) => {
    await page.getByTestId('create-button').click();
    await page.getByTestId('submit').click(); // Submit without required fields
    await expect(page.getByText('Name is required')).toBeVisible();
  });
  
  test('should handle network errors', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.getByTestId('create-button').click();
    await expect(page.getByText('Network error')).toBeVisible();
  });
});
```


---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

**Problem:** Tests fail with timeout errors.

**Solutions:**
```typescript
// Increase timeout for specific test
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('[data-test="result"]', { timeout: 10000 });
```

#### 2. Flaky Tests

**Problem:** Tests pass sometimes and fail other times.

**Solutions:**
```typescript
// Use auto-waiting assertions
await expect(page.getByText('Success')).toBeVisible();

// Wait for animations to complete
await page.waitForTimeout(300); // Only if necessary

// Retry flaky operations
await test.step('retry operation', async () => {
  for (let i = 0; i < 3; i++) {
    try {
      await page.getByTestId('button').click();
      break;
    } catch (e) {
      if (i === 2) throw e;
      await page.waitForTimeout(1000);
    }
  }
});
```

#### 3. Element Not Found

**Problem:** Selector doesn't find the element.

**Solutions:**
```typescript
// Check if element exists
const exists = await page.getByTestId('element').count() > 0;

// Wait for element to appear
await page.waitForSelector('[data-test="element"]');

// Use more specific selectors
await page.getByRole('button', { name: 'Submit' });
await page.getByLabel('Email');
await page.getByText('Exact text');
```

#### 4. Authentication Issues

**Problem:** Tests fail due to authentication.

**Solutions:**
```typescript
// Use setupTestEnvironment helper
const { email, slug } = await setupTestEnvironment(page);

// Check authentication state
await page.goto('/home/test-team/assets');
await expect(page).toHaveURL(/\/home\/.+\/assets/);

// Clear and re-authenticate
await clearSession(page);
await loginUser(page, credentials);
```

#### 5. Database State Issues

**Problem:** Tests fail due to existing data.

**Solutions:**
```typescript
// Use unique data for each test
const uniqueAsset = generateUniqueAsset(laptopAsset);

// Clean up before test
test.beforeEach(async ({ page }) => {
  await cleanupAllTestData(page, { assets: ['Test Asset'] });
});

// Use test data tracker
const tracker = new TestDataTracker();
// ... create data and track it
await tracker.cleanup(page);
```

### Debugging Tests

#### Run in Headed Mode

See the browser while tests run:
```bash
pnpm --filter web-e2e test --headed
```

#### Use Debug Mode

Step through tests interactively:
```bash
pnpm --filter web-e2e test --debug
```

#### Add Debug Statements

```typescript
// Pause execution
await page.pause();

// Take screenshot
await page.screenshot({ path: 'debug.png' });

// Log page content
console.log(await page.content());

// Log element text
console.log(await page.getByTestId('element').textContent());
```

#### View Traces

Traces provide detailed execution information:
```bash
# Generate trace on failure (configured by default)
pnpm --filter web-e2e test

# View trace
pnpm --filter web-e2e playwright show-trace test-results/trace.zip
```

### Getting Help

1. **Check Documentation:**
   - [Playwright Documentation](https://playwright.dev)
   - [Test Utilities README](../apps/e2e/tests/utils/README.md)
   - This guide

2. **Review Existing Tests:**
   - Look at similar tests in the codebase
   - Check how others solved similar problems

3. **Ask the Team:**
   - Post in team chat
   - Create a GitHub issue
   - Request code review

---

## Maintenance

### Updating Tests

When application code changes:

1. **Update Selectors:** If UI changes, update page objects
2. **Update Fixtures:** If data models change, update fixtures
3. **Update Helpers:** If workflows change, update helpers
4. **Run Tests:** Verify all tests still pass
5. **Update Documentation:** Keep this guide current

### Adding New Test Coverage

When adding new features:

1. **Create Test File:** Follow naming conventions
2. **Create Page Object:** Encapsulate page interactions
3. **Create Helpers:** For complex operations
4. **Create Fixtures:** For test data
5. **Write Tests:** Cover happy paths and error cases
6. **Update CI:** Ensure tests run in CI
7. **Document:** Update this guide

### Performance Optimization

Keep tests fast:

1. **Parallel Execution:** Tests run in parallel by default
2. **Minimize Waits:** Use auto-waiting instead of arbitrary timeouts
3. **Reuse Sessions:** Use authentication helpers
4. **Clean Up Efficiently:** Use batch operations
5. **Profile Tests:** Identify slow tests and optimize

---

## Summary

This guide covers the essential aspects of E2E testing in the Fluxera application:

✅ **Test Structure:** Organized by feature with clear conventions  
✅ **Running Tests:** Multiple ways to execute and debug tests  
✅ **Writing Tests:** Step-by-step guide with examples  
✅ **Utilities:** Comprehensive helpers and fixtures  
✅ **Page Objects:** Maintainable test code  
✅ **CI/CD:** Automated testing on every PR  
✅ **Best Practices:** Proven patterns for reliable tests  
✅ **Troubleshooting:** Solutions to common problems  

For more information, see:
- [Test Utilities README](../apps/e2e/tests/utils/README.md)
- [CI Setup Guide](../apps/e2e/CI_SETUP.md)
- [Playwright Documentation](https://playwright.dev)

---

**Last Updated:** November 18, 2025  
**Maintained By:** Development Team  
**Questions?** Contact the team or create an issue
