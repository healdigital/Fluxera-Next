import { expect, test } from '@playwright/test';

import { LicensesPageObject } from './licenses.po';
import { InvitationsPageObject } from '../invitations/invitations.po';
import { AssetsPageObject } from '../assets/assets.po';

test.describe('License Modals - Quick View Modal', () => {
  test('opens license detail modal from list without navigation', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const licenseName = `Modal Test License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-MODAL-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Get current URL before opening modal
    const listUrl = page.url();

    // Click on license to open modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal contains license details
    await expect(modal).toContainText(licenseName);
    await expect(modal).toContainText('Test Vendor');

    // Verify URL hasn't changed (no navigation)
    expect(page.url()).toBe(listUrl);

    // Verify background is dimmed
    const overlay = page.locator('[data-radix-dialog-overlay]');
    await expect(overlay).toBeVisible();
  });

  test('modal displays all license information', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license with all fields
    await licenses.clickNewLicense();
    const licenseName = `Complete License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Adobe',
      licenseKey: `KEY-COMPLETE-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
      cost: '299.99',
      notes: 'Full license details test',
    });

    // Open modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify all fields are displayed
    await expect(modal.locator('[data-test="license-name"]')).toContainText(licenseName);
    await expect(modal.locator('[data-test="license-vendor"]')).toContainText('Adobe');
    await expect(modal.locator('[data-test="license-type"]')).toContainText('subscription');
    await expect(modal.locator('[data-test="license-cost"]')).toContainText('299.99');
    await expect(modal.locator('[data-test="license-notes"]')).toContainText('Full license details test');
  });

  test('modal provides quick action buttons', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const licenseName = `Quick Actions License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ACTIONS-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify quick action buttons are present
    await expect(modal.locator('[data-test="edit-license-button"]')).toBeVisible();
    await expect(modal.locator('[data-test="assign-license-button"]')).toBeVisible();
    await expect(modal.locator('[data-test="delete-license-button"]')).toBeVisible();
  });

  test('highlights expiring licenses within 30 days', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license expiring in 20 days
    const today = new Date().toISOString().split('T')[0] || '';
    const expiringSoonDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.clickNewLicense();
    const licenseName = `Expiring Soon ${Date.now()}`;
    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-EXPIRING-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: expiringSoonDate,
    });

    // Open modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify expiring soon badge is displayed
    const expirationBadge = modal.locator('[data-test="expiration-badge"]');
    await expect(expirationBadge).toBeVisible();
    await expect(expirationBadge).toContainText('expiring', { ignoreCase: true });
  });

  test('closes modal with Escape key', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const licenseName = `Escape Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ESC-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });
});

test.describe('License Modals - Create with FormSheet', () => {
  test('opens create form in slide-in sheet', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Get current URL
    const listUrl = page.url();

    // Click create button
    await page.click('[data-test="new-license-button"]');

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

  test('creates license and closes sheet on success', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Open create sheet
    await page.click('[data-test="new-license-button"]');

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Fill form
    const licenseName = `Sheet Created License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await page.fill('[data-test="license-name-input"]', licenseName);
    await page.fill('[data-test="license-vendor-input"]', 'Test Vendor');
    await page.fill('[data-test="license-key-input"]', `KEY-SHEET-${Date.now()}`);
    await page.click('[data-test="license-type-select"]');
    await page.click('[data-test="license-type-option-subscription"]');
    await page.fill('[data-test="license-purchase-date-input"]', today);
    await page.fill('[data-test="license-expiration-date-input"]', futureDate);

    // Submit
    await page.click('[data-test="submit-create-license-button"]');

    // Verify sheet closes
    await expect(sheet).not.toBeVisible();

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('created', { ignoreCase: true });

    // Verify license appears in list
    await expect(page.locator('[data-test="license-name-cell"]', { hasText: licenseName })).toBeVisible();
  });

  test('shows unsaved changes warning on close', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Open create sheet
    await page.click('[data-test="new-license-button"]');

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Make changes
    await page.fill('[data-test="license-name-input"]', 'Test License');

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
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Open create sheet
    await page.click('[data-test="new-license-button"]');

    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Try to submit without required fields
    await page.click('[data-test="submit-create-license-button"]');

    // Verify validation errors appear
    await expect(sheet.locator('[data-test="license-name-error"]')).toBeVisible();
  });
});

test.describe('License Modals - Edit License', () => {
  test('opens edit sheet from quick view modal', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const licenseName = `Edit Test License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-EDIT-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open quick view modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Click edit button
    await modal.locator('[data-test="edit-license-button"]').click();

    // Verify edit sheet opens
    const editSheet = page.locator('[role="dialog"]').last();
    await expect(editSheet).toBeVisible();
    await expect(editSheet.locator('[data-test="license-name-input"]')).toHaveValue(licenseName);
  });

  test('updates license and refreshes list', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const originalName = `Original License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: originalName,
      vendor: 'Original Vendor',
      licenseKey: `KEY-ORIG-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open quick view modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: originalName }),
    });
    await licenseCard.click();

    // Click edit
    await page.locator('[data-test="edit-license-button"]').click();

    // Update name
    const updatedName = `Updated License ${Date.now()}`;
    await page.fill('[data-test="license-name-input"]', updatedName);

    // Submit
    await page.click('[data-test="submit-edit-license-button"]');

    // Verify sheet closes
    await page.waitForTimeout(1000);

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('updated', { ignoreCase: true });

    // Verify updated name in list
    await expect(page.locator('[data-test="license-name-cell"]', { hasText: updatedName })).toBeVisible();
  });
});

test.describe('License Modals - Assignment', () => {
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

    // Create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();
    const licenseName = `Assignment Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ASSIGN-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open quick view modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    // Click assign button
    await page.locator('[data-test="assign-license-button"]').click();

    // Verify assignment modal opens
    const assignModal = page.locator('[role="dialog"]').last();
    await expect(assignModal).toBeVisible();
    await expect(assignModal).toContainText('Assign License', { ignoreCase: true });
  });

  test('assigns license to user and updates display', async ({ page }) => {
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

    // Create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();
    const licenseName = `Assign Complete Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-COMPLETE-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open quick view modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    // Assign license
    await page.locator('[data-test="assign-license-button"]').click();
    await page.click('[data-test="assign-user-select"]');
    await page.locator('[data-test^="user-option-"]').first().click();
    await page.click('[data-test="confirm-assign-button"]');

    // Wait for assignment
    await page.waitForTimeout(1500);

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('assigned', { ignoreCase: true });

    // Verify assignment is displayed in modal
    await expect(page.locator('[data-test="license-assignments-list"]')).toBeVisible();
  });

  test('assigns license to asset', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create an asset first
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();
    const assetName = `Test Laptop ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Create a license
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();
    const licenseName = `Asset License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ASSET-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open quick view modal
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: licenseName }),
    });
    await licenseCard.click();

    // Assign to asset
    await page.locator('[data-test="assign-to-asset-button"]').click();
    await page.click('[data-test="assign-asset-select"]');
    await page.locator('[data-test^="asset-option-"]').first().click();
    await page.click('[data-test="confirm-assign-to-asset-button"]');

    // Wait for assignment
    await page.waitForTimeout(1500);

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('assigned', { ignoreCase: true });

    // Verify assignment is displayed
    await expect(page.locator('[data-test="license-assignments-list"]')).toBeVisible();
  });
});

test.describe('License Modals - Keyboard Navigation', () => {
  test('navigates between licenses with arrow keys', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create multiple licenses
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    const license1 = `License 1 ${Date.now()}`;
    const license2 = `License 2 ${Date.now()}`;
    const license3 = `License 3 ${Date.now()}`;

    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: license1,
      vendor: 'Vendor 1',
      licenseKey: `KEY-1-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: license2,
      vendor: 'Vendor 2',
      licenseKey: `KEY-2-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: license3,
      vendor: 'Vendor 3',
      licenseKey: `KEY-3-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open modal for second license
    const licenseCard = page.locator('[data-test^="license-card-"]', {
      has: page.locator('[data-test="license-name-cell"]', { hasText: license2 }),
    });
    await licenseCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(license2);

    // Press ArrowRight to go to next license
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await expect(modal).toContainText(license3);

    // Press ArrowLeft to go to previous license
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    await expect(modal).toContainText(license2);
  });
});
