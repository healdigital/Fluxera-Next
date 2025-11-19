import { Page } from '@playwright/test';

/**
 * Cleanup utilities for E2E tests
 * Provides functions to clean up test data after test execution
 */

/**
 * Deletes all test assets created during a test
 */
export async function cleanupAssets(
  page: Page,
  assetNames: string[],
): Promise<void> {
  for (const assetName of assetNames) {
    try {
      // Find the asset
      const assetCell = page.locator('[data-test="asset-name-cell"]', {
        hasText: assetName,
      });

      // Check if asset exists
      const count = await assetCell.count();
      if (count === 0) {
        continue;
      }

      // Click the asset
      await assetCell.click();
      await page.waitForURL('**/assets/*', { timeout: 5000 });

      // Click delete button
      await page.click('[data-test="delete-asset-button"]');

      // Confirm deletion
      await page.click('[data-test="confirm-delete-asset-button"]');

      // Wait for navigation
      await page.waitForURL('**/assets', { timeout: 5000 });
    } catch (error) {
      console.warn(`Failed to cleanup asset: ${assetName}`, error);
    }
  }
}

/**
 * Deletes all test licenses created during a test
 */
export async function cleanupLicenses(
  page: Page,
  licenseNames: string[],
): Promise<void> {
  for (const licenseName of licenseNames) {
    try {
      // Find the license
      const licenseCell = page.locator('[data-test="license-name-cell"]', {
        hasText: licenseName,
      });

      // Check if license exists
      const count = await licenseCell.count();
      if (count === 0) {
        continue;
      }

      // Click the license
      await licenseCell.click();
      await page.waitForURL('**/licenses/*', { timeout: 5000 });

      // Click delete button
      await page.click('[data-test="delete-license-button"]');

      // Confirm deletion
      await page.click('[data-test="confirm-delete-license-button"]');

      // Wait for navigation
      await page.waitForURL('**/licenses', { timeout: 5000 });
    } catch (error) {
      console.warn(`Failed to cleanup license: ${licenseName}`, error);
    }
  }
}

/**
 * Removes all test users invited during a test
 */
export async function cleanupUsers(
  page: Page,
  userEmails: string[],
): Promise<void> {
  for (const userEmail of userEmails) {
    try {
      // Find the user
      const userRow = page.locator('[data-test^="user-row-"]', {
        hasText: userEmail,
      });

      // Check if user exists
      const count = await userRow.count();
      if (count === 0) {
        continue;
      }

      // Click the user
      await userRow.click();
      await page.waitForURL('**/users/*', { timeout: 5000 });

      // Click remove user button (if available)
      const removeButton = page.locator('[data-test="remove-user-button"]');
      if (await removeButton.isVisible()) {
        await removeButton.click();

        // Confirm removal
        await page.click('[data-test="confirm-remove-user-button"]');

        // Wait for navigation
        await page.waitForURL('**/users', { timeout: 5000 });
      }
    } catch (error) {
      console.warn(`Failed to cleanup user: ${userEmail}`, error);
    }
  }
}

/**
 * Cleans up all test data (assets, licenses, users)
 */
export async function cleanupAllTestData(
  page: Page,
  data: {
    assets?: string[];
    licenses?: string[];
    users?: string[];
  },
): Promise<void> {
  const { assets = [], licenses = [], users = [] } = data;

  // Navigate to assets page and cleanup
  if (assets.length > 0) {
    const slug = await getCurrentTeamSlug(page);
    if (slug) {
      await page.goto(`/home/${slug}/assets`);
      await cleanupAssets(page, assets);
    }
  }

  // Navigate to licenses page and cleanup
  if (licenses.length > 0) {
    const slug = await getCurrentTeamSlug(page);
    if (slug) {
      await page.goto(`/home/${slug}/licenses`);
      await cleanupLicenses(page, licenses);
    }
  }

  // Navigate to users page and cleanup
  if (users.length > 0) {
    const slug = await getCurrentTeamSlug(page);
    if (slug) {
      await page.goto(`/home/${slug}/users`);
      await cleanupUsers(page, users);
    }
  }
}

/**
 * Gets the current team slug from the URL
 */
async function getCurrentTeamSlug(page: Page): Promise<string | null> {
  const url = page.url();
  const match = url.match(/\/home\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Deletes a team account (use with caution)
 */
export async function cleanupTeamAccount(
  page: Page,
  slug: string,
): Promise<void> {
  try {
    // Navigate to team settings
    await page.goto(`/home/${slug}/settings`);

    // Click delete team button
    await page.click('[data-test="delete-team-button"]');

    // Confirm deletion
    await page.fill('[data-test="confirm-team-name-input"]', slug);
    await page.click('[data-test="confirm-delete-team-button"]');

    // Wait for redirect
    await page.waitForURL('**/home', { timeout: 10000 });
  } catch (error) {
    console.warn(`Failed to cleanup team: ${slug}`, error);
  }
}

/**
 * Clears all filters on a page
 */
export async function clearAllFilters(page: Page): Promise<void> {
  try {
    const clearButton = page.locator('[data-test="clear-filters-button"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.warn('Failed to clear filters', error);
  }
}

/**
 * Resets page to initial state
 */
export async function resetPageState(page: Page): Promise<void> {
  await clearAllFilters(page);
  
  // Clear search input if present
  try {
    const searchInput = page.locator('[data-test*="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.warn('Failed to clear search', error);
  }
}

/**
 * Cleanup helper that tracks created resources
 */
export class TestDataTracker {
  private assets: string[] = [];
  private licenses: string[] = [];
  private users: string[] = [];
  private teams: string[] = [];

  trackAsset(name: string): void {
    this.assets.push(name);
  }

  trackLicense(name: string): void {
    this.licenses.push(name);
  }

  trackUser(email: string): void {
    this.users.push(email);
  }

  trackTeam(slug: string): void {
    this.teams.push(slug);
  }

  async cleanup(page: Page): Promise<void> {
    await cleanupAllTestData(page, {
      assets: this.assets,
      licenses: this.licenses,
      users: this.users,
    });

    // Cleanup teams
    for (const team of this.teams) {
      await cleanupTeamAccount(page, team);
    }

    // Reset tracking
    this.assets = [];
    this.licenses = [];
    this.users = [];
    this.teams = [];
  }

  getTrackedData(): {
    assets: string[];
    licenses: string[];
    users: string[];
    teams: string[];
  } {
    return {
      assets: [...this.assets],
      licenses: [...this.licenses],
      users: [...this.users],
      teams: [...this.teams],
    };
  }
}

/**
 * Creates a new test data tracker instance
 */
export function createTestDataTracker(): TestDataTracker {
  return new TestDataTracker();
}

/**
 * Waits for all pending operations to complete
 */
export async function waitForOperationsToComplete(page: Page): Promise<void> {
  // Wait for any loading indicators to disappear
  try {
    await page.waitForSelector('[data-test="loading-spinner"]', {
      state: 'hidden',
      timeout: 5000,
    });
  } catch {
    // Loading spinner might not be present
  }

  // Wait for network to be idle
  await page.waitForLoadState('networkidle', { timeout: 5000 });
}

/**
 * Batch cleanup for multiple resources
 */
export async function batchCleanup(
  page: Page,
  operations: Array<() => Promise<void>>,
): Promise<void> {
  for (const operation of operations) {
    try {
      await operation();
    } catch (error) {
      console.warn('Batch cleanup operation failed', error);
    }
  }
}
