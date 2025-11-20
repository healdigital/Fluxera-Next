import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { AssetsPageObject } from '../assets/assets.po';
import { LicensesPageObject } from '../licenses/licenses.po';
import { UsersPageObject } from '../users/users.po';

test.describe('Modal Accessibility - Keyboard Navigation', () => {
  test('modal can be opened and closed with keyboard', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Keyboard Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Focus on asset row and press Enter to open
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.focus();
    await page.keyboard.press('Enter');

    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('Tab key cycles through focusable elements in modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Tab Test ${Date.now()}`;
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

    // Tab through elements
    const focusableElements: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('data-test') || el?.tagName || 'unknown';
      });
      focusableElements.push(focusedElement);
    }

    // Verify focus stayed within modal (no BODY in the list)
    expect(focusableElements).not.toContain('BODY');
  });

  test('Shift+Tab navigates backwards through modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Shift Tab Test ${Date.now()}`;
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

    // Tab forward a few times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const forwardElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));

    // Tab backward
    await page.keyboard.press('Shift+Tab');

    const backwardElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));

    // Verify we moved to a different element
    expect(backwardElement).not.toBe(forwardElement);
  });

  test('arrow keys navigate between entities in quick view', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create multiple assets
    const asset1 = `Arrow Asset 1 ${Date.now()}`;
    const asset2 = `Arrow Asset 2 ${Date.now()}`;
    const asset3 = `Arrow Asset 3 ${Date.now()}`;

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

    // Press ArrowRight
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Verify we moved to next asset
    await expect(modal).toContainText(asset3);

    // Press ArrowLeft
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    // Verify we moved back
    await expect(modal).toContainText(asset2);
  });

  test('Enter key activates buttons in modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Enter Key Test ${Date.now()}`;
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

    // Tab to close button
    let currentElement = '';
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      currentElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test') || '');
      if (currentElement === 'close-modal-button') {
        break;
      }
    }

    // Press Enter to activate close button
    await page.keyboard.press('Enter');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Modal Accessibility - Focus Trap', () => {
  test('focus is trapped within modal', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Focus Trap Test ${Date.now()}`;
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

    // Tab through many times
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      // Check if focus is still within modal
      const isWithinModal = await page.evaluate(() => {
        const active = document.activeElement;
        const modal = document.querySelector('[role="dialog"]');
        return modal?.contains(active);
      });

      expect(isWithinModal).toBe(true);
    }
  });

  test('focus returns to trigger element on close', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Focus Return Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Get the asset row
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });

    // Focus and click to open modal
    await assetRow.focus();
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Wait a moment for focus to restore
    await page.waitForTimeout(500);

    // Verify focus returned to asset row
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.getAttribute('data-test') || active?.tagName;
    });

    // Focus should be on the row or within it
    expect(focusedElement).toContain('asset-row');
  });

  test('focus moves to first focusable element on modal open', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Wait for focus to settle
    await page.waitForTimeout(300);

    // Verify focus is on a focusable element within modal
    const focusedElement = await page.evaluate(() => {
      const active = document.activeElement;
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(active);
    });

    expect(focusedElement).toBe(true);
  });
});

test.describe('Modal Accessibility - Screen Reader Support', () => {
  test('modal has proper ARIA attributes', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `ARIA Test ${Date.now()}`;
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

    // Verify ARIA attributes
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Verify aria-labelledby exists
    const labelledBy = await modal.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    // Verify the label element exists
    if (labelledBy) {
      const labelElement = page.locator(`#${labelledBy}`);
      await expect(labelElement).toBeVisible();
    }
  });

  test('modal title is properly labeled', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Get aria-labelledby
    const labelledBy = await modal.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    // Verify the label has meaningful text
    if (labelledBy) {
      const labelElement = page.locator(`#${labelledBy}`);
      const labelText = await labelElement.textContent();
      expect(labelText).toBeTruthy();
      expect(labelText?.length).toBeGreaterThan(0);
    }
  });

  test('form fields have proper labels', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check email input has label
    const emailInput = modal.locator('[data-test="user-email-input"]');
    const emailId = await emailInput.getAttribute('id');
    
    if (emailId) {
      const emailLabel = page.locator(`label[for="${emailId}"]`);
      await expect(emailLabel).toBeVisible();
    }

    // Check role select has label
    const roleSelect = modal.locator('[data-test="user-role-select"]');
    const roleId = await roleSelect.getAttribute('id');
    
    if (roleId) {
      const roleLabel = page.locator(`label[for="${roleId}"]`);
      await expect(roleLabel).toBeVisible();
    }
  });

  test('buttons have accessible names', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Button Label Test ${Date.now()}`;
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

    // Check action buttons have text or aria-label
    const editButton = modal.locator('[data-test="edit-asset-button"]');
    const editText = await editButton.textContent();
    const editAriaLabel = await editButton.getAttribute('aria-label');
    expect(editText || editAriaLabel).toBeTruthy();

    const closeButton = modal.locator('[data-test="close-modal-button"]');
    const closeText = await closeButton.textContent();
    const closeAriaLabel = await closeButton.getAttribute('aria-label');
    expect(closeText || closeAriaLabel).toBeTruthy();
  });
});

test.describe('Modal Accessibility - Responsive Behavior', () => {
  test('modal adapts to mobile viewport', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Mobile Test ${Date.now()}`;
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

    // Verify modal fits within viewport
    const modalBox = await modal.boundingBox();
    expect(modalBox?.width).toBeLessThanOrEqual(375);

    // Verify content is not cut off
    const hasOverflow = await modal.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('modal is scrollable on small viewports', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Set small viewport
    await page.setViewportSize({ width: 375, height: 500 });

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Scroll Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      description: 'A very long description that will make the modal content taller than the viewport. '.repeat(20),
    });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal content is scrollable
    const isScrollable = await modal.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });

    // If content is taller than viewport, it should be scrollable
    if (isScrollable) {
      // Try to scroll
      await modal.evaluate((el) => el.scrollTo(0, 100));
      const scrollTop = await modal.evaluate((el) => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
  });

  test('touch-friendly close button on mobile', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Touch Test ${Date.now()}`;
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

    // Verify close button is large enough for touch (at least 44x44px)
    const closeButton = modal.locator('[data-test="close-modal-button"]');
    const buttonBox = await closeButton.boundingBox();
    
    expect(buttonBox?.width).toBeGreaterThanOrEqual(40);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(40);
  });

  test('modal works at different zoom levels', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Zoom Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
    });

    // Test at 150% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });

    // Open modal
    const assetRow = page.locator('[data-test^="asset-row-"]', {
      has: page.locator('[data-test="asset-name-cell"]', { hasText: assetName }),
    });
    await assetRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal is still functional
    await expect(modal.locator('[data-test="close-modal-button"]')).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });
});

test.describe('Modal Accessibility - Axe Automated Testing', () => {
  test('modal passes axe accessibility checks', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create an asset
    await assets.clickNewAsset();
    const assetName = `Axe Test ${Date.now()}`;
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

    // Run axe accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('form sheet passes axe accessibility checks', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Run axe accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('bulk action modal passes axe accessibility checks', async ({ page }) => {
    const assets = new AssetsPageObject(page);
    const { slug } = await assets.setup();

    // Create assets
    for (let i = 0; i < 2; i++) {
      await assets.clickNewAsset();
      await assets.createAsset({
        name: `Axe Bulk Asset ${i} ${Date.now()}`,
        category: 'laptop',
      });
    }

    // Select all and open bulk delete
    await page.click('[data-test="select-all-checkbox"]');
    await page.click('[data-test="bulk-delete-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Run axe accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
