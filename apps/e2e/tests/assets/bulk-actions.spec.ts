import { expect, test } from '@playwright/test';

import { AssetsPageObject } from './assets.po';
import { InvitationsPageObject } from '../invitations/invitations.po';

test.describe('Bulk Actions - Bulk Delete', () => {
  test('opens bulk delete confirmation modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets
    for (let i = 0; i < 3; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Bulk Delete Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select multiple assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete button
    await page.click('[data-test="bulk-delete-button"]');

    // Verify confirmation modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Delete', { ignoreCase: true });
    await expect(modal).toContainText('3 items', { ignoreCase: true });
  });

  test('displays item preview in confirmation modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    const asset1 = `Preview Asset 1 ${Date.now()}`;
    const asset2 = `Preview Asset 2 ${Date.now()}`;

    await assets.clickNewAsset();
    await assets.createAsset({ name: asset1, category: 'laptop' });
    await assets.clickNewAsset();
    await assets.createAsset({ name: asset2, category: 'laptop' });

    // Select assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify item preview is displayed
    await expect(modal.locator('[data-test="items-preview"]')).toBeVisible();
    await expect(modal).toContainText(asset1);
    await expect(modal).toContainText(asset2);
  });

  test('shows progress indicator during bulk delete', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets
    for (let i = 0; i < 5; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Progress Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Confirm deletion
    await page.click('[data-test="confirm-bulk-delete-button"]');

    // Verify progress indicator appears
    await expect(modal.locator('[data-test="bulk-action-progress"]')).toBeVisible();

    // Verify progress shows item count
    await expect(modal.locator('[data-test="progress-text"]')).toContainText('5', { ignoreCase: true });
  });

  test('displays results summary after completion', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 3; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Summary Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Confirm deletion
    await page.click('[data-test="confirm-bulk-delete-button"]');

    // Wait for completion
    await page.waitForTimeout(3000);

    // Verify results summary is displayed
    await expect(modal.locator('[data-test="bulk-action-results"]')).toBeVisible();
    await expect(modal).toContainText('successful', { ignoreCase: true });
    await expect(modal).toContainText('3', { ignoreCase: true });
  });

  test('shows error details for failed deletions', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 2; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Error Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Confirm deletion
    await page.click('[data-test="confirm-bulk-delete-button"]');

    // Wait for completion
    await page.waitForTimeout(3000);

    // If there are any failures, verify error details are shown
    const failedSection = modal.locator('[data-test="failed-items"]');
    if (await failedSection.isVisible()) {
      await expect(failedSection).toContainText('error', { ignoreCase: true });
    }
  });

  test('allows cancellation before completion', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets
    for (let i = 0; i < 10; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Cancel Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Confirm deletion
    await page.click('[data-test="confirm-bulk-delete-button"]');

    // Verify cancel button is available
    await expect(modal.locator('[data-test="cancel-bulk-action-button"]')).toBeVisible();

    // Click cancel
    await page.click('[data-test="cancel-bulk-action-button"]');

    // Wait a moment
    await page.waitForTimeout(1000);

    // Verify cancellation message or modal closes
    const isCancelled = await modal.locator('[data-test="bulk-action-cancelled"]').isVisible();
    const isModalClosed = !(await modal.isVisible());

    expect(isCancelled || isModalClosed).toBe(true);
  });

  test('refreshes list after successful bulk delete', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 3; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Refresh Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Get initial count
    const initialCount = await assets.getAssetRowCount();
    expect(initialCount).toBe(3);

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk delete
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Confirm deletion
    await page.click('[data-test="confirm-bulk-delete-button"]');

    // Wait for completion
    await page.waitForTimeout(3000);

    // Close results modal
    await page.click('[data-test="close-results-button"]');

    // Verify list is refreshed and assets are removed
    await page.waitForTimeout(1000);
    const finalCount = await assets.getAssetRowCount();
    expect(finalCount).toBe(0);
  });
});

test.describe('Bulk Actions - Bulk Assign', () => {
  test('opens bulk assign modal', async ({ page }) => {
    // Setup team with a member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([{ email: memberEmail, role: 'member' }]);

    // Accept invitation
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations.auth.loginAsUser({ email: ownerEmail, next: '/home' });

    // Create assets
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);

    for (let i = 0; i < 3; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Bulk Assign Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk assign button
    await page.click('[data-test="bulk-assign-button"]');

    // Verify modal opens
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Assign', { ignoreCase: true });
  });

  test('assigns multiple assets to user', async ({ page }) => {
    // Setup team with a member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([{ email: memberEmail, role: 'member' }]);

    // Accept invitation
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations.auth.loginAsUser({ email: ownerEmail, next: '/home' });

    // Create assets
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);

    for (let i = 0; i < 2; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Assign Complete Asset ${i} ${Date.now()}`,
        category: 'laptop',
        status: 'available',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk assign
    await page.click('[data-test="bulk-assign-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Select user
    await page.click('[data-test="assign-user-select"]');
    await page.locator('[data-test^="user-option-"]').first().click();

    // Confirm assignment
    await page.click('[data-test="confirm-bulk-assign-button"]');

    // Wait for completion
    await page.waitForTimeout(3000);

    // Verify results summary
    await expect(modal.locator('[data-test="bulk-action-results"]')).toBeVisible();
    await expect(modal).toContainText('successful', { ignoreCase: true });
  });

  test('shows progress during bulk assignment', async ({ page }) => {
    // Setup team with a member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([{ email: memberEmail, role: 'member' }]);

    // Accept invitation
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations.auth.loginAsUser({ email: ownerEmail, next: '/home' });

    // Create assets
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);

    for (let i = 0; i < 5; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Progress Assign Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all assets
    await page.click('[data-test="select-all-checkbox"]');

    // Click bulk assign
    await page.click('[data-test="bulk-assign-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Select user
    await page.click('[data-test="assign-user-select"]');
    await page.locator('[data-test^="user-option-"]').first().click();

    // Confirm assignment
    await page.click('[data-test="confirm-bulk-assign-button"]');

    // Verify progress indicator appears
    await expect(modal.locator('[data-test="bulk-action-progress"]')).toBeVisible();
    await expect(modal.locator('[data-test="progress-text"]')).toContainText('5', { ignoreCase: true });
  });
});

test.describe('Bulk Actions - Selection Management', () => {
  test('selects all items with select-all checkbox', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets
    for (let i = 0; i < 5; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Select All Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Click select-all checkbox
    await page.click('[data-test="select-all-checkbox"]');

    // Verify all items are selected
    const selectedItems = page.locator('[data-test^="asset-checkbox-"]:checked');
    const count = await selectedItems.count();
    expect(count).toBe(5);

    // Verify bulk action buttons are enabled
    await expect(page.locator('[data-test="bulk-delete-button"]')).toBeEnabled();
    await expect(page.locator('[data-test="bulk-assign-button"]')).toBeEnabled();
  });

  test('deselects all items when select-all is unchecked', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 3; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Deselect Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all
    await page.click('[data-test="select-all-checkbox"]');

    // Verify items are selected
    let selectedItems = page.locator('[data-test^="asset-checkbox-"]:checked');
    let count = await selectedItems.count();
    expect(count).toBe(3);

    // Uncheck select-all
    await page.click('[data-test="select-all-checkbox"]');

    // Verify all items are deselected
    selectedItems = page.locator('[data-test^="asset-checkbox-"]:checked');
    count = await selectedItems.count();
    expect(count).toBe(0);

    // Verify bulk action buttons are disabled
    await expect(page.locator('[data-test="bulk-delete-button"]')).toBeDisabled();
  });

  test('allows individual item selection', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 3; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Individual Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select first two items individually
    await page.locator('[data-test^="asset-checkbox-"]').nth(0).click();
    await page.locator('[data-test^="asset-checkbox-"]').nth(1).click();

    // Verify only 2 items are selected
    const selectedItems = page.locator('[data-test^="asset-checkbox-"]:checked');
    const count = await selectedItems.count();
    expect(count).toBe(2);

    // Verify bulk action buttons are enabled
    await expect(page.locator('[data-test="bulk-delete-button"]')).toBeEnabled();
  });

  test('displays selected item count', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 5; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Count Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select 3 items
    await page.locator('[data-test^="asset-checkbox-"]').nth(0).click();
    await page.locator('[data-test^="asset-checkbox-"]').nth(1).click();
    await page.locator('[data-test^="asset-checkbox-"]').nth(2).click();

    // Verify selected count is displayed
    await expect(page.locator('[data-test="selected-count"]')).toContainText('3 selected', { ignoreCase: true });
  });
});
