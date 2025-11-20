import { expect, test } from '@playwright/test';

import { AssetsPageObject } from './assets.po';
import { InvitationsPageObject } from '../invitations/invitations.po';

test.describe('Asset Modals - Quick View Modal', () => {
  test('opens asset detail modal from list without navigation', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Modal Test Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
      description: 'Testing modal functionality',
    });

    // Get current URL before opening modal
    const listUrl = page.url();

    // Click on asset to open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal contains asset details
    await expect(modal).toContainText(assetName);
    await expect(modal).toContainText('laptop');
    await expect(modal).toContainText('Testing modal functionality');

    // Verify URL hasn't changed (no navigation)
    expect(page.url()).toBe(listUrl);

    // Verify background is dimmed
    const overlay = page.locator('[data-radix-dialog-overlay]');
    await expect(overlay).toBeVisible();
  });

  test('modal displays all asset information', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset with all fields
    await assets.clickNewAsset();
    const assetName = `Complete Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'desktop',
      status: 'in_maintenance',
      description: 'Full asset details test',
    });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify all fields are displayed
    await expect(modal.locator('[data-test="asset-name"]')).toContainText(assetName);
    await expect(modal.locator('[data-test="asset-category"]')).toContainText('desktop');
    await expect(modal.locator('[data-test="asset-status"]')).toContainText('in_maintenance');
    await expect(modal.locator('[data-test="asset-description"]')).toContainText('Full asset details test');
  });

  test('modal provides quick action buttons', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Quick Actions Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify quick action buttons are present
    await expect(modal.locator('[data-test="edit-asset-button"]')).toBeVisible();
    await expect(modal.locator('[data-test="assign-asset-button"]')).toBeVisible();
    await expect(modal.locator('[data-test="delete-asset-button"]')).toBeVisible();
  });

  test('closes modal with Escape key', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Escape Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('closes modal with close button', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Close Button Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click close button
    await modal.locator('[data-test="close-modal-button"]').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Asset Modals - Create with FormSheet', () => {
  test('opens create form in slide-in sheet', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Get current URL
    const listUrl = page.url();

    // Click create button
    await page.click('[data-test="new-asset-button"]');

    // Verify sheet is open
    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Verify it's a sheet (has slide animation class)
    await expect(sheet).toHaveAttribute('data-state', 'open');

    // Verify URL hasn't changed
    expect(page.url()).toBe(listUrl);

    // Verify background is dimmed
    const overlay = page.locator('[data-radix-dialog-overlay]');
    await expect(overlay).toBeVisible();
  });

  test('creates asset and closes sheet on success', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Open create sheet
    await page.click('[data-test="new-asset-button"]');

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Fill form
    const assetName = `Sheet Created Asset ${Date.now()}`;
    await page.fill('[data-test="asset-name-input"]', assetName);
    await page.click('[data-test="asset-category-select"]');
    await page.click('[data-test="category-option-laptop"]');

    // Submit
    await page.click('[data-test="submit-create-asset-button"]');

    // Verify sheet closes
    await expect(sheet).not.toBeVisible();

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('created', { ignoreCase: true });

    // Verify asset appears in list
    await expect(page.locator('[data-test="asset-name-cell"]', { hasText: assetName })).toBeVisible();
  });

  test('shows unsaved changes warning on close', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Open create sheet
    await page.click('[data-test="new-asset-button"]');

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Make changes
    await page.fill('[data-test="asset-name-input"]', 'Test Asset');

    // Try to close with Escape
    await page.keyboard.press('Escape');

    // Verify warning dialog appears
    const warningDialog = page.locator('[role="alertdialog"]');
    await expect(warningDialog).toBeVisible();
    await expect(warningDialog).toContainText('unsaved changes', { ignoreCase: true });

    // Cancel closing
    await page.click('[data-test="cancel-close-button"]');

    // Verify sheet is still open
    await expect(sheet).toBeVisible();
  });

  test('validates form fields in real-time', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Open create sheet
    await page.click('[data-test="new-asset-button"]');

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Try to submit without required fields
    await page.click('[data-test="submit-create-asset-button"]');

    // Verify validation errors appear
    await expect(sheet.locator('[data-test="asset-name-error"]')).toBeVisible();
  });
});

test.describe('Asset Modals - Edit Asset', () => {
  test('opens edit sheet from quick view modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Edit Test Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Open quick view modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Click edit button
    await modal.locator('[data-test="edit-asset-button"]').click();

    // Verify edit sheet opens
    const editSheet = page.locator('[role="dialog"]').last();
    await expect(editSheet).toBeVisible();
    await expect(editSheet.locator('[data-test="asset-name-input"]')).toHaveValue(assetName);
  });

  test('updates asset and refreshes list', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const originalName = `Original Name ${Date.now()}`;
    await assets.createAsset({
      name: originalName,
      category: 'laptop',
    });

    // Open quick view modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: originalName }),
    });
    await assetRow.click();

    // Click edit
    await page.locator('[data-test="edit-asset-button"]').click();

    // Update name
    const updatedName = `Updated Name ${Date.now()}`;
    await page.fill('[data-test="asset-name-input"]', updatedName);

    // Submit
    await page.click('[data-test="submit-edit-asset-button"]');

    // Verify sheet closes
    await page.waitForTimeout(1000);

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('updated', { ignoreCase: true });

    // Verify updated name in list
    await expect(page.locator('[data-test="asset-name-cell"]', { hasText: updatedName })).toBeVisible();
  });
});

test.describe('Asset Modals - Assignment', () => {
  test('opens assignment modal from quick view', async ({ page }) => {
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

    // Create an asset
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();
    const assetName = `Assignment Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Open quick view modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    // Click assign button
    await page.locator('[data-test="assign-asset-button"]').click();

    // Verify assignment modal opens
    const assignModal = page.locator('[role="dialog"]').last();
    await expect(assignModal).toBeVisible();
    await expect(assignModal).toContainText('Assign Asset', { ignoreCase: true });
  });

  test('assigns asset and updates display', async ({ page }) => {
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

    // Create an asset
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();
    const assetName = `Assign Complete Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Open quick view modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    // Assign asset
    await page.locator('[data-test="assign-asset-button"]').click();
    await page.click('[data-test="assign-user-select"]');
    await page.locator('[data-test^="user-option-"]').first().click();
    await page.click('[data-test="confirm-assign-button"]');

    // Wait for assignment
    await page.waitForTimeout(1500);

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('assigned', { ignoreCase: true });

    // Verify assigned user is displayed in modal
    await expect(page.locator('[data-test="assigned-user-info"]')).toBeVisible();
  });
});

test.describe('Asset Modals - Context Preservation', () => {
  test('preserves scroll position after closing modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets to enable scrolling
    for (let i = 0; i < 15; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]').nth(10);
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Verify scroll position is preserved
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50);
  });

  test('preserves filters after modal interaction', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets with different categories
    await assets.clickNewAsset();
    await assets.createAsset({ name: `Laptop ${Date.now()}`, category: 'laptop' });
    await assets.clickNewAsset();
    await assets.createAsset({ name: `Monitor ${Date.now()}`, category: 'monitor' });

    // Apply filter
    await assets.applyCategoryFilter('laptop');
    await page.waitForTimeout(500);

    // Verify filter is applied
    const rowCount = await assets.getAssetRowCount();
    expect(rowCount).toBe(1);

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]').first();
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Verify filter is still applied
    await page.waitForTimeout(500);
    const rowCountAfter = await assets.getAssetRowCount();
    expect(rowCountAfter).toBe(1);
  });
});

test.describe('Asset Modals - Keyboard Navigation', () => {
  test('navigates between assets with arrow keys', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets
    const asset1 = `Asset 1 ${Date.now()}`;
    const asset2 = `Asset 2 ${Date.now()}`;
    const asset3 = `Asset 3 ${Date.now()}`;

    await assets.clickNewAsset();
    await assets.createAsset({ name: asset1, category: 'laptop' });
    await assets.clickNewAsset();
    await assets.createAsset({ name: asset2, category: 'laptop' });
    await assets.clickNewAsset();
    await assets.createAsset({ name: asset3, category: 'laptop' });

    // Open modal for second asset
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: asset2 }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(asset2);

    // Press ArrowRight to go to next asset
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await expect(modal).toContainText(asset3);

    // Press ArrowLeft to go to previous asset
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    await expect(modal).toContainText(asset2);
  });

  test('focus trap keeps focus within modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Focus Test ${Date.now()}`;
    await assets.createAsset({ name: assetName, category: 'laptop' });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));

    // Tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Verify focus is still within modal
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(active);
    });

    expect(focusedElement).toBe(true);
  });
});
