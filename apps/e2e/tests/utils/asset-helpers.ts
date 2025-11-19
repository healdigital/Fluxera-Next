import { Page, expect } from '@playwright/test';

/**
 * Asset management test helpers
 * Provides reusable functions for E2E tests involving assets
 */

export interface CreateAssetData {
  name: string;
  category?: string;
  status?: string;
  description?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: string;
  location?: string;
  manufacturer?: string;
  model?: string;
}

export interface AssignAssetData {
  userId: string;
  notes?: string;
}

export interface FilterAssetsData {
  search?: string;
  category?: string;
  status?: string;
  assignedTo?: string;
}

/**
 * Creates a new asset with the provided data
 */
export async function createAsset(
  page: Page,
  data: CreateAssetData,
): Promise<void> {
  // Click the new asset button
  await page.click('[data-test="new-asset-button"]');
  await page.waitForURL('**/assets/new');

  // Fill required fields
  await page.fill('[data-test="asset-name-input"]', data.name);

  // Fill optional fields
  if (data.category) {
    await page.click('[data-test="asset-category-select"]');
    await page.click(`[data-test="category-option-${data.category}"]`);
  }

  if (data.status) {
    await page.click('[data-test="asset-status-select"]');
    await page.click(`[data-test="status-option-${data.status}"]`);
  }

  if (data.description) {
    await page.fill('[data-test="asset-description-input"]', data.description);
  }

  if (data.serialNumber) {
    await page.fill('[data-test="asset-serial-number-input"]', data.serialNumber);
  }

  if (data.purchaseDate) {
    await page.fill('[data-test="asset-purchase-date-input"]', data.purchaseDate);
  }

  if (data.purchaseCost) {
    await page.fill('[data-test="asset-purchase-cost-input"]', data.purchaseCost);
  }

  if (data.location) {
    await page.fill('[data-test="asset-location-input"]', data.location);
  }

  if (data.manufacturer) {
    await page.fill('[data-test="asset-manufacturer-input"]', data.manufacturer);
  }

  if (data.model) {
    await page.fill('[data-test="asset-model-input"]', data.model);
  }

  // Submit the form
  await page.click('[data-test="submit-create-asset-button"]');
  
  // Wait for navigation back to assets list
  await page.waitForURL('**/assets', { timeout: 10000 });
  
  // Wait for success toast
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Assigns an asset to a user
 */
export async function assignAsset(
  page: Page,
  assetName: string,
  data: AssignAssetData,
): Promise<void> {
  // Find and click the asset
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await assetCell.click();
  await page.waitForURL('**/assets/*', { timeout: 10000 });

  // Click assign button
  await page.click('[data-test="assign-asset-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="assign-asset-dialog"]'),
  ).toBeVisible();

  // Select user
  await page.click('[data-test="assign-user-select"]');
  await page.click(`[data-test="member-option-${data.userId}"]`);

  // Add notes if provided
  if (data.notes) {
    await page.fill('[data-test="assignment-notes-input"]', data.notes);
  }

  // Confirm assignment
  await page.click('[data-test="confirm-assign-button"]');

  // Wait for dialog to close and page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Unassigns an asset from its current user
 */
export async function unassignAsset(
  page: Page,
  assetName: string,
): Promise<void> {
  // Find and click the asset
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await assetCell.click();
  await page.waitForURL('**/assets/*', { timeout: 10000 });

  // Click unassign button
  await page.click('[data-test="unassign-asset-button"]');
  
  // Confirm unassignment
  await page.click('[data-test="confirm-unassign-button"]');

  // Wait for page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Applies filters to the assets list
 */
export async function filterAssets(
  page: Page,
  filters: FilterAssetsData,
): Promise<void> {
  // Apply search filter
  if (filters.search) {
    await page.fill('[data-test="asset-search-input"]', filters.search);
    await page.waitForTimeout(500);
  }

  // Apply category filter
  if (filters.category) {
    await page.click('[data-test="category-filter-trigger"]');
    await page.click(`[data-test="category-filter-${filters.category}"]`);
    await page.waitForTimeout(500);
  }

  // Apply status filter
  if (filters.status) {
    await page.click('[data-test="status-filter-trigger"]');
    await page.click(`[data-test="status-filter-${filters.status}"]`);
    await page.waitForTimeout(500);
  }

  // Apply assigned to filter
  if (filters.assignedTo) {
    await page.click('[data-test="assigned-to-filter-trigger"]');
    await page.click(`[data-test="assigned-to-filter-${filters.assignedTo}"]`);
    await page.waitForTimeout(500);
  }
}

/**
 * Clears all applied filters
 */
export async function clearAssetFilters(page: Page): Promise<void> {
  await page.click('[data-test="clear-filters-button"]');
  await page.waitForTimeout(500);
}

/**
 * Gets the count of visible assets in the list
 */
export async function getAssetCount(page: Page): Promise<number> {
  const rows = page.locator('[data-test^="asset-row-"]');
  return rows.count();
}

/**
 * Verifies that an asset exists in the list
 */
export async function verifyAssetExists(
  page: Page,
  assetName: string,
): Promise<void> {
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await expect(assetCell).toBeVisible();
}

/**
 * Verifies that an asset has a specific status
 */
export async function verifyAssetStatus(
  page: Page,
  assetName: string,
  expectedStatus: string,
): Promise<void> {
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await assetCell.click();
  await page.waitForURL('**/assets/*', { timeout: 10000 });

  const statusBadge = page.locator('[data-test="asset-status-badge"]');
  await expect(statusBadge).toContainText(expectedStatus, { ignoreCase: true });
}

/**
 * Deletes an asset
 */
export async function deleteAsset(
  page: Page,
  assetName: string,
): Promise<void> {
  // Find and click the asset
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await assetCell.click();
  await page.waitForURL('**/assets/*', { timeout: 10000 });

  // Click delete button
  await page.click('[data-test="delete-asset-button"]');
  
  // Wait for confirmation dialog
  await expect(
    page.locator('[data-test="delete-asset-dialog"]'),
  ).toBeVisible();

  // Confirm deletion
  await page.click('[data-test="confirm-delete-asset-button"]');

  // Wait for navigation back to assets list
  await page.waitForURL('**/assets', { timeout: 10000 });
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Edits an existing asset
 */
export async function editAsset(
  page: Page,
  assetName: string,
  updates: Partial<CreateAssetData>,
): Promise<void> {
  // Find and click the asset
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await assetCell.click();
  await page.waitForURL('**/assets/*', { timeout: 10000 });

  // Click edit button
  await page.click('[data-test="edit-asset-button"]');
  await page.waitForURL('**/edit');

  // Update fields
  if (updates.name) {
    await page.fill('[data-test="asset-name-input"]', updates.name);
  }

  if (updates.category) {
    await page.click('[data-test="asset-category-select"]');
    await page.click(`[data-test="category-option-${updates.category}"]`);
  }

  if (updates.status) {
    await page.click('[data-test="asset-status-select"]');
    await page.click(`[data-test="status-option-${updates.status}"]`);
  }

  if (updates.description) {
    await page.fill('[data-test="asset-description-input"]', updates.description);
  }

  if (updates.serialNumber) {
    await page.fill('[data-test="asset-serial-number-input"]', updates.serialNumber);
  }

  if (updates.location) {
    await page.fill('[data-test="asset-location-input"]', updates.location);
  }

  // Submit the form
  await page.click('[data-test="submit-edit-asset-button"]');
  
  // Wait for navigation back to asset detail
  await page.waitForURL('**/assets/*', { timeout: 10000 });
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Verifies asset history contains a specific event
 */
export async function verifyAssetHistory(
  page: Page,
  assetName: string,
  eventType: string,
): Promise<void> {
  // Find and click the asset
  const assetCell = page.locator('[data-test="asset-name-cell"]', {
    hasText: assetName,
  });
  await assetCell.click();
  await page.waitForURL('**/assets/*', { timeout: 10000 });

  // Verify history entry exists
  const historyEntry = page.locator(`[data-test="history-entry-${eventType}"]`);
  await expect(historyEntry).toBeVisible();
}
