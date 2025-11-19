# E2E Test Utilities and Fixtures

This directory contains reusable test utilities, helpers, and fixtures for end-to-end testing with Playwright.

## Structure

```
tests/
├── fixtures/           # Test data fixtures
│   ├── asset-fixtures.ts
│   ├── license-fixtures.ts
│   ├── user-fixtures.ts
│   └── index.ts
└── utils/             # Test helper functions
    ├── asset-helpers.ts
    ├── license-helpers.ts
    ├── user-helpers.ts
    ├── auth-helpers.ts
    ├── cleanup-helpers.ts
    └── index.ts
```

## Test Helpers

### Asset Helpers (`asset-helpers.ts`)

Provides functions for asset management operations:

- `createAsset(page, data)` - Creates a new asset
- `assignAsset(page, assetName, data)` - Assigns an asset to a user
- `unassignAsset(page, assetName)` - Unassigns an asset
- `filterAssets(page, filters)` - Applies filters to asset list
- `deleteAsset(page, assetName)` - Deletes an asset
- `editAsset(page, assetName, updates)` - Edits an existing asset
- `verifyAssetExists(page, assetName)` - Verifies asset exists
- `verifyAssetStatus(page, assetName, status)` - Verifies asset status
- `verifyAssetHistory(page, assetName, eventType)` - Verifies history entry

### License Helpers (`license-helpers.ts`)

Provides functions for license management operations:

- `createLicense(page, data)` - Creates a new license
- `assignLicenseToUser(page, licenseName, data)` - Assigns license to user
- `assignLicenseToAsset(page, licenseName, data)` - Assigns license to asset
- `unassignLicense(page, licenseName, assignmentId)` - Unassigns a license
- `filterLicenses(page, filters)` - Applies filters to license list
- `deleteLicense(page, licenseName)` - Deletes a license
- `editLicense(page, licenseName, updates)` - Edits an existing license
- `verifyLicenseExists(page, licenseName)` - Verifies license exists
- `verifyLicenseExpirationStatus(page, licenseName, status)` - Verifies expiration status
- `verifyLicenseAssignmentCount(page, licenseName, count)` - Verifies assignment count

### User Helpers (`user-helpers.ts`)

Provides functions for user management operations:

- `inviteUser(page, data)` - Invites a new user
- `changeUserRole(page, userEmail, data)` - Changes user role
- `changeUserStatus(page, userEmail, data)` - Changes user status
- `filterUsers(page, filters)` - Applies filters to user list
- `verifyUserExists(page, userEmail)` - Verifies user exists
- `verifyUserRole(page, userEmail, role)` - Verifies user role
- `verifyUserStatus(page, userEmail, status)` - Verifies user status
- `navigateToUserActivity(page, userEmail)` - Navigates to activity log
- `filterActivity(page, filters)` - Filters activity log
- `editUserProfile(page, userEmail, updates)` - Edits user profile
- `assignAssetsToUser(page, userEmail, assetIds)` - Assigns assets to user

### Auth Helpers (`auth-helpers.ts`)

Provides functions for authentication and session management:

- `loginUser(page, credentials)` - Logs in a user
- `createTeamAccount(page, data)` - Creates a team account
- `navigateToTeam(page, slug)` - Navigates to a team
- `logout(page)` - Logs out current user
- `switchTeam(page, slug)` - Switches to different team
- `setupTestEnvironment(page, options)` - Sets up complete test environment
- `clearSession(page)` - Clears cookies and storage
- `waitForAuth(page)` - Waits for authentication
- `getCurrentTeamSlug(page)` - Gets current team slug

### Cleanup Helpers (`cleanup-helpers.ts`)

Provides functions for cleaning up test data:

- `cleanupAssets(page, assetNames)` - Deletes test assets
- `cleanupLicenses(page, licenseNames)` - Deletes test licenses
- `cleanupUsers(page, userEmails)` - Removes test users
- `cleanupAllTestData(page, data)` - Cleans up all test data
- `cleanupTeamAccount(page, slug)` - Deletes team account
- `clearAllFilters(page)` - Clears all filters
- `resetPageState(page)` - Resets page to initial state
- `TestDataTracker` - Class for tracking and cleaning up test data

## Test Fixtures

### Asset Fixtures (`asset-fixtures.ts`)

Predefined asset data for testing:

- `laptopAsset` - Basic laptop
- `desktopAsset` - Desktop computer
- `monitorAsset` - Monitor
- `keyboardAsset` - Keyboard
- `mouseAsset` - Mouse
- `headsetAsset` - Headset
- `smartphoneAsset` - Smartphone
- `tabletAsset` - Tablet
- `printerAsset` - Printer
- `serverAsset` - Server
- `assignedAsset` - Already assigned asset
- `maintenanceAsset` - Asset under maintenance
- `retiredAsset` - Retired asset

Collections:
- `allAssetFixtures` - All assets
- `availableAssetFixtures` - Available assets only
- `laptopFixtures` - Laptop assets only

Generators:
- `generateUniqueAsset(base)` - Generates unique asset
- `generateMultipleAssets(count, base)` - Generates multiple assets

### License Fixtures (`license-fixtures.ts`)

Predefined license data for testing:

- `office365License` - Microsoft Office 365
- `adobeCCLicense` - Adobe Creative Cloud
- `intellijLicense` - JetBrains IntelliJ
- `slackLicense` - Slack Business+
- `zoomLicense` - Zoom Business
- `githubLicense` - GitHub Enterprise
- `figmaLicense` - Figma Professional
- `windowsServerLicense` - Windows Server (perpetual)
- `autocadLicense` - AutoCAD (perpetual)
- `trialLicense` - Trial license
- `expiringSoonLicense` - Expiring in 20 days
- `expiredLicense` - Already expired
- `highSeatLicense` - License with many seats

Collections:
- `allLicenseFixtures` - All licenses
- `subscriptionLicenseFixtures` - Subscription licenses only
- `perpetualLicenseFixtures` - Perpetual licenses only
- `activeLicenseFixtures` - Active licenses only
- `microsoftLicenseFixtures` - Microsoft licenses only

Generators:
- `generateUniqueLicense(base)` - Generates unique license
- `generateMultipleLicenses(count, base)` - Generates multiple licenses
- `generateLicenseExpiringInDays(days, base)` - Generates license expiring in N days

### User Fixtures (`user-fixtures.ts`)

Predefined user data for testing:

- `adminUser` - Admin user
- `memberUser` - Member user
- `ownerUser` - Owner user
- `developerUser` - Developer
- `designerUser` - Designer
- `managerUser` - Manager
- `userWithoutInvitation` - User without invitation email

Profile fixtures:
- `developerProfile` - Developer profile data
- `designerProfile` - Designer profile data
- `managerProfile` - Manager profile data
- `adminProfile` - Admin profile data

Constants:
- `activityActionTypes` - Activity log action types
- `userStatuses` - User status options
- `userRoles` - User role options

Collections:
- `allUserFixtures` - All users
- `adminUserFixtures` - Admin users only
- `memberUserFixtures` - Member users only
- `allProfileFixtures` - All profiles

Generators:
- `generateUniqueUser(base)` - Generates unique user
- `generateMultipleUsers(count, base)` - Generates multiple users
- `generateUserWithRole(role, base)` - Generates user with specific role
- `generateActivityEntriesForDateRange(start, end, count)` - Generates activity entries

## Usage Examples

### Basic Test with Helpers

```typescript
import { test, expect } from '@playwright/test';
import { createAsset, verifyAssetExists } from '../utils/asset-helpers';
import { laptopAsset } from '../fixtures/asset-fixtures';

test('create and verify asset', async ({ page }) => {
  // Setup
  await page.goto('/home/test-team/assets');
  
  // Create asset using helper
  await createAsset(page, laptopAsset);
  
  // Verify using helper
  await verifyAssetExists(page, laptopAsset.name);
});
```

### Test with Cleanup

```typescript
import { test } from '@playwright/test';
import { createAsset, deleteAsset } from '../utils/asset-helpers';
import { laptopAsset } from '../fixtures/asset-fixtures';

test('asset lifecycle', async ({ page }) => {
  await page.goto('/home/test-team/assets');
  
  // Create
  await createAsset(page, laptopAsset);
  
  // ... test operations ...
  
  // Cleanup
  await deleteAsset(page, laptopAsset.name);
});
```

### Test with Data Tracker

```typescript
import { test } from '@playwright/test';
import { createAsset } from '../utils/asset-helpers';
import { createTestDataTracker } from '../utils/cleanup-helpers';
import { laptopAsset, desktopAsset } from '../fixtures/asset-fixtures';

test('multiple assets with auto cleanup', async ({ page }) => {
  const tracker = createTestDataTracker();
  
  await page.goto('/home/test-team/assets');
  
  // Create assets and track them
  await createAsset(page, laptopAsset);
  tracker.trackAsset(laptopAsset.name);
  
  await createAsset(page, desktopAsset);
  tracker.trackAsset(desktopAsset.name);
  
  // ... test operations ...
  
  // Cleanup all tracked data
  await tracker.cleanup(page);
});
```

### Test with Unique Fixtures

```typescript
import { test } from '@playwright/test';
import { createAsset } from '../utils/asset-helpers';
import { generateUniqueAsset, laptopAsset } from '../fixtures/asset-fixtures';

test('create unique assets', async ({ page }) => {
  await page.goto('/home/test-team/assets');
  
  // Generate unique asset to avoid conflicts
  const uniqueLaptop = generateUniqueAsset(laptopAsset);
  await createAsset(page, uniqueLaptop);
});
```

### Complete Test Environment Setup

```typescript
import { test } from '@playwright/test';
import { setupTestEnvironment } from '../utils/auth-helpers';
import { createAsset } from '../utils/asset-helpers';
import { laptopAsset } from '../fixtures/asset-fixtures';

test('full environment setup', async ({ page }) => {
  // Setup authenticated user and team
  const { email, teamName, slug } = await setupTestEnvironment(page);
  
  // Navigate to assets
  await page.goto(`/home/${slug}/assets`);
  
  // Create asset
  await createAsset(page, laptopAsset);
});
```

## Best Practices

1. **Use Fixtures**: Always use predefined fixtures instead of hardcoding test data
2. **Generate Unique Data**: Use generator functions to avoid conflicts between tests
3. **Track Test Data**: Use `TestDataTracker` for automatic cleanup
4. **Clean Up**: Always clean up test data in `afterEach` or `afterAll` hooks
5. **Reuse Helpers**: Use helper functions instead of duplicating page interactions
6. **Verify Operations**: Use verification helpers to ensure operations succeeded
7. **Handle Errors**: Wrap cleanup operations in try-catch to prevent test failures

## Adding New Helpers

When adding new helpers:

1. Create the helper function in the appropriate file
2. Add JSDoc comments explaining parameters and behavior
3. Export the function
4. Update this README with usage examples
5. Add corresponding fixtures if needed

## Adding New Fixtures

When adding new fixtures:

1. Define the fixture data with proper types
2. Add to appropriate collection arrays
3. Create generator functions if needed
4. Export the fixture
5. Update this README with documentation
