import { expect, test } from '@playwright/test';

import { InvitationsPageObject } from '../invitations/invitations.po';
import { AssetsPageObject } from './assets.po';

test.describe('Asset Management - Create Asset Flow', () => {
  test('user can create a new asset and see it in the list', async ({
    page,
  }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Navigate to create asset page
    await assets.clickNewAsset();

    // Fill and submit the form
    const assetName = `Test Laptop ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
      description: 'A test laptop for E2E testing',
    });

    // Verify the asset appears in the list
    const assetCell = await assets.getAssetByName(assetName);
    await expect(assetCell).toBeVisible();
  });

  test('user can create multiple assets with different categories', async ({
    page,
  }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create first asset
    await assets.clickNewAsset();
    const laptop = `Laptop ${Date.now()}`;
    await assets.createAsset({
      name: laptop,
      category: 'laptop',
    });

    // Create second asset
    await assets.clickNewAsset();
    const monitor = `Monitor ${Date.now()}`;
    await assets.createAsset({
      name: monitor,
      category: 'monitor',
    });

    // Verify both assets are in the list
    await expect(await assets.getAssetByName(laptop)).toBeVisible();
    await expect(await assets.getAssetByName(monitor)).toBeVisible();
  });
});

test.describe('Asset Management - Assign Asset Flow', () => {
  test('user can assign an asset to a team member', async ({ page }) => {
    // Setup team with a member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: memberEmail,
        role: 'member',
      },
    ]);

    // Accept invitation as member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations.auth.loginAsUser({
      email: ownerEmail,
      next: '/home',
    });

    // Navigate to assets and create an asset
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `Assignable Laptop ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Open the asset detail page
    await assets.clickAssetByName(assetName);

    // Get the member user ID from the page
    // We need to query the database or use a known pattern
    // For now, we'll use a workaround by checking the assign dialog
    await page.click('[data-test="assign-asset-button"]');
    await expect(
      page.locator('[data-test="assign-asset-dialog"]'),
    ).toBeVisible();

    // Select the first available member
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page.locator('[data-test^="member-option-"]').first();
    const memberId = await firstMemberOption.getAttribute('data-test');
    const userId = memberId?.replace('member-option-', '') || '';

    await firstMemberOption.click();
    await page.click('[data-test="confirm-assign-button"]');

    // Wait for assignment to complete
    await page.waitForTimeout(2000);

    // Verify the asset is now assigned
    const assignedUserInfo = assets.getAssignedUserInfo();
    await expect(assignedUserInfo).toBeVisible();

    // Verify status changed to "assigned"
    const badges = assets.getAssetBadges();
    await expect(badges).toContainText('Assigned');
  });

  test('status changes to "assigned" after assignment', async ({ page }) => {
    // Setup team with a member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: memberEmail,
        role: 'member',
      },
    ]);

    // Accept invitation as member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations.auth.loginAsUser({
      email: ownerEmail,
      next: '/home',
    });

    // Navigate to assets and create an asset with "available" status
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `Status Test Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Verify initial status is "available"
    await assets.clickAssetByName(assetName);
    const initialStatusBadge = assets.getAssetStatusBadge();
    await expect(initialStatusBadge).toContainText('Available', {
      ignoreCase: true,
    });

    // Assign the asset
    await page.click('[data-test="assign-asset-button"]');
    await expect(
      page.locator('[data-test="assign-asset-dialog"]'),
    ).toBeVisible();

    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page.locator('[data-test^="member-option-"]').first();
    await firstMemberOption.click();
    await page.click('[data-test="confirm-assign-button"]');

    // Wait for assignment to complete
    await page.waitForTimeout(2000);

    // Verify status changed to "assigned"
    const updatedStatusBadge = assets.getAssetStatusBadge();
    await expect(updatedStatusBadge).toContainText('Assigned', {
      ignoreCase: true,
    });

    // Verify in the list view as well
    await page.goto(`/home/${slug}/assets`);
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await expect(assetRow.locator('[data-test="asset-status-badge"]')).toContainText(
      'Assigned',
      { ignoreCase: true },
    );
  });

  test('user can unassign an asset', async ({ page }) => {
    // Setup team with a member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: memberEmail,
        role: 'member',
      },
    ]);

    // Accept invitation as member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations.auth.loginAsUser({
      email: ownerEmail,
      next: '/home',
    });

    // Navigate to assets and create an asset
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `Unassign Test Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Assign the asset first
    await assets.clickAssetByName(assetName);
    await page.click('[data-test="assign-asset-button"]');
    await expect(
      page.locator('[data-test="assign-asset-dialog"]'),
    ).toBeVisible();

    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page.locator('[data-test^="member-option-"]').first();
    await firstMemberOption.click();
    await page.click('[data-test="confirm-assign-button"]');
    await page.waitForTimeout(2000);

    // Verify asset is assigned
    const assignedUserInfo = assets.getAssignedUserInfo();
    await expect(assignedUserInfo).toBeVisible();

    // Now unassign the asset
    await page.click('[data-test="unassign-asset-button"]');
    await expect(
      page.locator('[data-test="unassign-asset-dialog"]'),
    ).toBeVisible();
    await page.click('[data-test="confirm-unassign-button"]');

    // Wait for unassignment to complete
    await page.waitForTimeout(2000);

    // Verify asset is no longer assigned
    await expect(assignedUserInfo).not.toBeVisible();

    // Verify status changed back to "available"
    const statusBadge = assets.getAssetStatusBadge();
    await expect(statusBadge).toContainText('Available', {
      ignoreCase: true,
    });

    // Verify in the list view
    await page.goto(`/home/${slug}/assets`);
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await expect(assetRow.locator('[data-test="asset-status-badge"]')).toContainText(
      'Available',
      { ignoreCase: true },
    );
  });
});

test.describe('Asset Management - View History Flow', () => {
  test('user can view asset history on detail page', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `History Test Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'desktop',
      status: 'available',
      description: 'Testing history tracking',
    });

    // Open the asset detail page
    await assets.clickAssetByName(assetName);

    // Verify history card is visible
    const historyCard = assets.getHistoryCard();
    await expect(historyCard).toBeVisible();

    // Verify at least one history entry exists (creation event)
    const historyEntries = assets.getHistoryEntries();
    await expect(historyEntries).toHaveCount(1);

    // Verify the creation event is present
    const createdEntry = assets.getHistoryEntryByType('created');
    await expect(createdEntry).toBeVisible();

    // Verify the entry has a timestamp
    const timestamp = createdEntry.locator('[data-test="history-timestamp"]');
    await expect(timestamp).toBeVisible();

    // Verify the entry has a description
    const description = createdEntry.locator('[data-test="history-description"]');
    await expect(description).toContainText('Asset was created');
  });

  test('history shows multiple events in chronological order', async ({
    page,
  }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Multi-Event Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'tablet',
      status: 'available',
    });

    // Open the asset detail page
    await assets.clickAssetByName(assetName);

    // Edit the asset to create an update event
    await page.click('[data-test="edit-asset-button"]');
    await page.waitForURL('**/edit');

    // Update the description
    await page.fill(
      '[data-test="asset-description-input"]',
      'Updated description for history test',
    );
    await page.click('[data-test="submit-edit-asset-button"]');
    await page.waitForURL('**/assets/*', { timeout: 10000 });

    // Verify history now has multiple entries
    const historyEntries = assets.getHistoryEntries();
    const count = await historyEntries.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify both created and updated events exist
    await expect(assets.getHistoryEntryByType('created')).toBeVisible();
    await expect(assets.getHistoryEntryByType('updated')).toBeVisible();
  });
});

test.describe('Asset Management - Filter Assets Flow', () => {
  test('user can filter assets by category', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets with different categories
    await assets.clickNewAsset();
    const laptop = `Laptop ${Date.now()}`;
    await assets.createAsset({
      name: laptop,
      category: 'laptop',
    });

    await assets.clickNewAsset();
    const monitor = `Monitor ${Date.now()}`;
    await assets.createAsset({
      name: monitor,
      category: 'monitor',
    });

    await assets.clickNewAsset();
    const printer = `Printer ${Date.now()}`;
    await assets.createAsset({
      name: printer,
      category: 'printer',
    });

    // Apply laptop category filter
    await assets.applyCategoryFilter('laptop');

    // Verify only laptop is visible
    await expect(await assets.getAssetByName(laptop)).toBeVisible();

    // The other assets should not be visible or the count should be 1
    const rowCount = await assets.getAssetRowCount();
    expect(rowCount).toBe(1);

    // Clear filters
    await assets.clearFilters();

    // Verify all assets are visible again
    const allRowCount = await assets.getAssetRowCount();
    expect(allRowCount).toBe(3);
  });

  test('user can filter assets by status', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets with different statuses
    await assets.clickNewAsset();
    const available = `Available Asset ${Date.now()}`;
    await assets.createAsset({
      name: available,
      status: 'available',
    });

    await assets.clickNewAsset();
    const maintenance = `Maintenance Asset ${Date.now()}`;
    await assets.createAsset({
      name: maintenance,
      status: 'in_maintenance',
    });

    // Apply available status filter
    await assets.applyStatusFilter('available');

    // Verify only available asset is visible
    await expect(await assets.getAssetByName(available)).toBeVisible();

    // Verify filtered count
    const rowCount = await assets.getAssetRowCount();
    expect(rowCount).toBe(1);

    // Clear filters
    await assets.clearFilters();

    // Verify all assets are visible
    const allRowCount = await assets.getAssetRowCount();
    expect(allRowCount).toBe(2);
  });

  test('user can search assets by name', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets with distinct names
    const uniqueId = Date.now();
    await assets.clickNewAsset();
    await assets.createAsset({
      name: `MacBook Pro ${uniqueId}`,
      category: 'laptop',
    });

    await assets.clickNewAsset();
    await assets.createAsset({
      name: `Dell Monitor ${uniqueId}`,
      category: 'monitor',
    });

    // Search for "MacBook"
    await assets.applySearchFilter('MacBook');

    // Verify only MacBook is visible
    await expect(
      await assets.getAssetByName(`MacBook Pro ${uniqueId}`),
    ).toBeVisible();

    // Verify filtered count
    const rowCount = await assets.getAssetRowCount();
    expect(rowCount).toBe(1);

    // Clear search
    await page.fill('[data-test="asset-search-input"]', '');
    await page.waitForTimeout(500);

    // Verify all assets are visible
    const allRowCount = await assets.getAssetRowCount();
    expect(allRowCount).toBe(2);
  });

  test('user can combine multiple filters', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create various assets
    const uniqueId = Date.now();
    await assets.clickNewAsset();
    await assets.createAsset({
      name: `Available Laptop ${uniqueId}`,
      category: 'laptop',
      status: 'available',
    });

    await assets.clickNewAsset();
    await assets.createAsset({
      name: `Maintenance Laptop ${uniqueId}`,
      category: 'laptop',
      status: 'in_maintenance',
    });

    await assets.clickNewAsset();
    await assets.createAsset({
      name: `Available Monitor ${uniqueId}`,
      category: 'monitor',
      status: 'available',
    });

    // Apply both category and status filters
    await assets.applyCategoryFilter('laptop');
    await assets.applyStatusFilter('available');

    // Verify only the available laptop is visible
    await expect(
      await assets.getAssetByName(`Available Laptop ${uniqueId}`),
    ).toBeVisible();

    const rowCount = await assets.getAssetRowCount();
    expect(rowCount).toBe(1);

    // Clear all filters
    await assets.clearFilters();

    // Verify all assets are visible
    const allRowCount = await assets.getAssetRowCount();
    expect(allRowCount).toBe(3);
  });
});
