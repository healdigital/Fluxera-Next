import { Page, expect } from '@playwright/test';

/**
 * License management test helpers
 * Provides reusable functions for E2E tests involving software licenses
 */

export interface CreateLicenseData {
  name: string;
  vendor: string;
  licenseKey: string;
  licenseType?: string;
  purchaseDate?: string;
  expirationDate?: string;
  cost?: string;
  seats?: string;
  notes?: string;
}

export interface AssignLicenseToUserData {
  userId: string;
  notes?: string;
}

export interface AssignLicenseToAssetData {
  assetId: string;
  notes?: string;
}

export interface FilterLicensesData {
  search?: string;
  vendor?: string;
  licenseType?: string;
  expirationStatus?: string;
}

/**
 * Creates a new license with the provided data
 */
export async function createLicense(
  page: Page,
  data: CreateLicenseData,
): Promise<void> {
  // Click the new license button
  await page.click('[data-test="new-license-button"]');
  await page.waitForURL('**/licenses/new');

  // Fill required fields
  await page.fill('[data-test="license-name-input"]', data.name);
  await page.fill('[data-test="license-vendor-input"]', data.vendor);
  await page.fill('[data-test="license-key-input"]', data.licenseKey);

  // Fill optional fields
  if (data.licenseType) {
    await page.click('[data-test="license-type-select"]');
    await page.click(`[data-test="license-type-option-${data.licenseType}"]`);
  }

  if (data.purchaseDate) {
    await page.fill('[data-test="license-purchase-date-input"]', data.purchaseDate);
  }

  if (data.expirationDate) {
    await page.fill('[data-test="license-expiration-date-input"]', data.expirationDate);
  }

  if (data.cost) {
    await page.fill('[data-test="license-cost-input"]', data.cost);
  }

  if (data.seats) {
    await page.fill('[data-test="license-seats-input"]', data.seats);
  }

  if (data.notes) {
    await page.fill('[data-test="license-notes-input"]', data.notes);
  }

  // Submit the form
  await page.click('[data-test="submit-create-license-button"]');
  
  // Wait for navigation back to licenses list
  await page.waitForURL('**/licenses', { timeout: 10000 });
  
  // Wait for success toast
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Assigns a license to a user
 */
export async function assignLicenseToUser(
  page: Page,
  licenseName: string,
  data: AssignLicenseToUserData,
): Promise<void> {
  // Find and click the license
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  // Click assign to user button
  await page.click('[data-test="assign-to-user-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="assign-license-to-user-dialog"]'),
  ).toBeVisible();

  // Select user
  await page.click('[data-test="assign-user-select"]');
  await page.click(`[data-test="user-option-${data.userId}"]`);

  // Add notes if provided
  if (data.notes) {
    await page.fill('[data-test="assignment-notes-input"]', data.notes);
  }

  // Confirm assignment
  await page.click('[data-test="confirm-assign-to-user-button"]');

  // Wait for dialog to close and page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Assigns a license to an asset
 */
export async function assignLicenseToAsset(
  page: Page,
  licenseName: string,
  data: AssignLicenseToAssetData,
): Promise<void> {
  // Find and click the license
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  // Click assign to asset button
  await page.click('[data-test="assign-to-asset-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="assign-license-to-asset-dialog"]'),
  ).toBeVisible();

  // Select asset
  await page.click('[data-test="assign-asset-select"]');
  await page.click(`[data-test="asset-option-${data.assetId}"]`);

  // Add notes if provided
  if (data.notes) {
    await page.fill('[data-test="assignment-notes-input"]', data.notes);
  }

  // Confirm assignment
  await page.click('[data-test="confirm-assign-to-asset-button"]');

  // Wait for dialog to close and page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Unassigns a license from a user or asset
 */
export async function unassignLicense(
  page: Page,
  licenseName: string,
  assignmentId: string,
): Promise<void> {
  // Find and click the license
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  // Click unassign button for specific assignment
  await page.click(`[data-test="unassign-button-${assignmentId}"]`);
  
  // Confirm unassignment
  await page.click('[data-test="confirm-unassign-button"]');

  // Wait for page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Applies filters to the licenses list
 */
export async function filterLicenses(
  page: Page,
  filters: FilterLicensesData,
): Promise<void> {
  // Apply search filter
  if (filters.search) {
    await page.fill('[data-test="license-search-input"]', filters.search);
    await page.waitForTimeout(500);
  }

  // Apply vendor filter
  if (filters.vendor) {
    await page.click('[data-test="vendor-filter-trigger"]');
    await page.click(`[data-test="vendor-filter-${filters.vendor}"]`);
    await page.waitForTimeout(500);
  }

  // Apply license type filter
  if (filters.licenseType) {
    await page.click('[data-test="license-type-filter-trigger"]');
    await page.click(`[data-test="license-type-filter-${filters.licenseType}"]`);
    await page.waitForTimeout(500);
  }

  // Apply expiration status filter
  if (filters.expirationStatus) {
    await page.click('[data-test="expiration-status-filter-trigger"]');
    await page.click(`[data-test="expiration-status-filter-${filters.expirationStatus}"]`);
    await page.waitForTimeout(500);
  }
}

/**
 * Clears all applied filters
 */
export async function clearLicenseFilters(page: Page): Promise<void> {
  await page.click('[data-test="clear-filters-button"]');
  await page.waitForTimeout(500);
}

/**
 * Gets the count of visible licenses in the list
 */
export async function getLicenseCount(page: Page): Promise<number> {
  const cards = page.locator('[data-test^="license-card-"]');
  return cards.count();
}

/**
 * Verifies that a license exists in the list
 */
export async function verifyLicenseExists(
  page: Page,
  licenseName: string,
): Promise<void> {
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await expect(licenseCell).toBeVisible();
}

/**
 * Verifies that a license has a specific expiration status badge
 */
export async function verifyLicenseExpirationStatus(
  page: Page,
  licenseName: string,
  expectedStatus: string,
): Promise<void> {
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  const expirationBadge = page.locator('[data-test="expiration-badge"]');
  await expect(expirationBadge).toContainText(expectedStatus, { ignoreCase: true });
}

/**
 * Deletes a license
 */
export async function deleteLicense(
  page: Page,
  licenseName: string,
): Promise<void> {
  // Find and click the license
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  // Click delete button
  await page.click('[data-test="delete-license-button"]');
  
  // Wait for confirmation dialog
  await expect(
    page.locator('[data-test="delete-license-dialog"]'),
  ).toBeVisible();

  // Confirm deletion
  await page.click('[data-test="confirm-delete-license-button"]');

  // Wait for navigation back to licenses list
  await page.waitForURL('**/licenses', { timeout: 10000 });
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Edits an existing license
 */
export async function editLicense(
  page: Page,
  licenseName: string,
  updates: Partial<CreateLicenseData>,
): Promise<void> {
  // Find and click the license
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  // Click edit button
  await page.click('[data-test="edit-license-button"]');
  await page.waitForURL('**/edit');

  // Update fields
  if (updates.name) {
    await page.fill('[data-test="license-name-input"]', updates.name);
  }

  if (updates.vendor) {
    await page.fill('[data-test="license-vendor-input"]', updates.vendor);
  }

  if (updates.licenseKey) {
    await page.fill('[data-test="license-key-input"]', updates.licenseKey);
  }

  if (updates.licenseType) {
    await page.click('[data-test="license-type-select"]');
    await page.click(`[data-test="license-type-option-${updates.licenseType}"]`);
  }

  if (updates.expirationDate) {
    await page.fill('[data-test="license-expiration-date-input"]', updates.expirationDate);
  }

  if (updates.cost) {
    await page.fill('[data-test="license-cost-input"]', updates.cost);
  }

  if (updates.notes) {
    await page.fill('[data-test="license-notes-input"]', updates.notes);
  }

  // Submit the form
  await page.click('[data-test="submit-edit-license-button"]');
  
  // Wait for navigation back to license detail
  await page.waitForURL('**/licenses/*', { timeout: 10000 });
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Verifies license assignment count
 */
export async function verifyLicenseAssignmentCount(
  page: Page,
  licenseName: string,
  expectedCount: number,
): Promise<void> {
  // Find and click the license
  const licenseCell = page.locator('[data-test="license-name-cell"]', {
    hasText: licenseName,
  });
  await licenseCell.click();
  await page.waitForURL('**/licenses/*', { timeout: 10000 });

  // Get assignment rows
  const assignmentRows = page.locator('[data-test^="assignment-row-"]');
  await expect(assignmentRows).toHaveCount(expectedCount);
}

/**
 * Exports licenses to CSV
 */
export async function exportLicenses(page: Page): Promise<void> {
  await page.click('[data-test="export-licenses-button"]');
  await page.waitForTimeout(1000);
}

/**
 * Verifies that a license key is not duplicated
 */
export async function verifyUniqueLicenseKey(
  page: Page,
  licenseKey: string,
): Promise<void> {
  // Try to create a license with duplicate key
  await page.click('[data-test="new-license-button"]');
  await page.waitForURL('**/licenses/new');

  await page.fill('[data-test="license-name-input"]', 'Duplicate Test');
  await page.fill('[data-test="license-vendor-input"]', 'Test Vendor');
  await page.fill('[data-test="license-key-input"]', licenseKey);

  await page.click('[data-test="submit-create-license-button"]');

  // Verify error message appears
  await expect(page.locator('[role="alert"]')).toContainText('already exists', {
    ignoreCase: true,
    timeout: 5000,
  });
}
