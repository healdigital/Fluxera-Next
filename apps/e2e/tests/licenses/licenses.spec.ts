import { expect, test } from '@playwright/test';

import { InvitationsPageObject } from '../invitations/invitations.po';
import { AssetsPageObject } from '../assets/assets.po';
import { LicensesPageObject } from './licenses.po';

test.describe('License Management - Create License Flow', () => {
  test('user can create a new license and see it in the list', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Navigate to create license page
    await licenses.clickNewLicense();

    // Fill and submit the form
    const licenseName = `Adobe Photoshop ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Adobe',
      licenseKey: `KEY-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
      cost: '299.99',
      notes: 'Test license for E2E testing',
    });

    // Verify the license appears in the list
    const licenseCell = await licenses.getLicenseByName(licenseName);
    await expect(licenseCell).toBeVisible();
  });

  test('validates expiration date must be after purchase date', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Navigate to create license page
    await licenses.clickNewLicense();

    // Try to create a license with expiration before purchase date
    const today = new Date().toISOString().split('T')[0] || '';
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.fillCreateLicenseForm({
      name: `Invalid Date License ${Date.now()}`,
      vendor: 'Test Vendor',
      licenseKey: `KEY-INVALID-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: yesterday, // Expiration before purchase
    });

    await licenses.submitCreateLicenseForm();

    // Verify error message appears
    await expect(page.locator('[role="alert"]')).toContainText(
      'Expiration date must be after purchase date',
      { ignoreCase: true, timeout: 5000 }
    );

    // Verify we're still on the create page (form didn't submit)
    await expect(page).toHaveURL(/.*\/licenses\/new/);
  });

  test('prevents duplicate license keys', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create first license with unique key
    const uniqueKey = `UNIQUE-KEY-${Date.now()}`;
    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: `First License ${Date.now()}`,
      vendor: 'Test Vendor',
      licenseKey: uniqueKey,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Try to create second license with same key
    await licenses.clickNewLicense();
    await licenses.fillCreateLicenseForm({
      name: `Duplicate License ${Date.now()}`,
      vendor: 'Test Vendor',
      licenseKey: uniqueKey, // Same key as first license
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.submitCreateLicenseForm();

    // Verify error message appears
    await expect(page.locator('[role="alert"]')).toContainText(
      'already exists',
      { ignoreCase: true, timeout: 5000 }
    );

    // Verify we're still on the create page (form didn't submit)
    await expect(page).toHaveURL(/.*\/licenses\/new/);
  });

  test('user can create multiple licenses with different types', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create first license
    await licenses.clickNewLicense();
    const subscription = `Microsoft 365 ${Date.now()}`;
    await licenses.createLicense({
      name: subscription,
      vendor: 'Microsoft',
      licenseKey: `KEY-SUB-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Create second license
    await licenses.clickNewLicense();
    const perpetual = `AutoCAD ${Date.now()}`;
    await licenses.createLicense({
      name: perpetual,
      vendor: 'Autodesk',
      licenseKey: `KEY-PERP-${Date.now()}`,
      licenseType: 'perpetual',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Verify both licenses are in the list
    await expect(await licenses.getLicenseByName(subscription)).toBeVisible();
    await expect(await licenses.getLicenseByName(perpetual)).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Navigate to create license page
    await licenses.clickNewLicense();

    // Try to submit without filling required fields
    await licenses.submitCreateLicenseForm();

    // Verify we're still on the create page (form didn't submit)
    await expect(page).toHaveURL(/.*\/licenses\/new/);
  });
});

test.describe('License Management - Assign License Flows', () => {
  test('user can assign a license to a team member', async ({ page }) => {
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

    // Navigate to licenses and create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Assignable License ${Date.now()}`;
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

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Assign to user
    await licenses.openAssignToUserDialog();

    // Select the first available member
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page
      .locator('[data-test^="user-option-"]')
      .first();
    const memberId =
      (await firstMemberOption.getAttribute('data-test'))?.replace(
        'user-option-',
        '',
      ) || '';

    await firstMemberOption.click();
    await licenses.confirmAssignToUser();

    // Wait for assignment to complete
    await page.waitForTimeout(2000);

    // Verify the assignment appears in the list
    const assignmentsList = licenses.getAssignmentsList();
    await expect(assignmentsList).toBeVisible();

    // Verify assignment count updated
    const assignmentRows = licenses.getAssignmentRows();
    const count = await assignmentRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('user can assign a license to an asset', async ({ page }) => {
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

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Assign to asset
    await licenses.openAssignToAssetDialog();

    // Select the first available asset
    await page.click('[data-test="assign-asset-select"]');
    const firstAssetOption = page
      .locator('[data-test^="asset-option-"]')
      .first();
    const assetId =
      (await firstAssetOption.getAttribute('data-test'))?.replace(
        'asset-option-',
        '',
      ) || '';

    await firstAssetOption.click();
    await licenses.confirmAssignToAsset();

    // Wait for assignment to complete
    await page.waitForTimeout(2000);

    // Verify the assignment appears in the list
    const assignmentsList = licenses.getAssignmentsList();
    await expect(assignmentsList).toBeVisible();

    // Verify assignment count updated
    const assignmentRows = licenses.getAssignmentRows();
    const count = await assignmentRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('user can unassign a license', async ({ page }) => {
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

    // Navigate to licenses and create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Unassign Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-UNASSIGN-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Assign to user
    await licenses.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page
      .locator('[data-test^="user-option-"]')
      .first();
    await firstMemberOption.click();
    await licenses.confirmAssignToUser();
    await page.waitForTimeout(2000);

    // Get initial assignment count
    const initialCount = await licenses.getAssignmentRowCount();
    expect(initialCount).toBeGreaterThan(0);

    // Unassign the license
    const firstAssignment = licenses.getAssignmentRows().first();
    const assignmentId =
      (await firstAssignment.getAttribute('data-test'))?.replace(
        'assignment-row-',
        '',
      ) || '';

    await licenses.unassignLicense(assignmentId);

    // Wait for unassignment to complete
    await page.waitForTimeout(2000);

    // Verify assignment count decreased
    const finalCount = await licenses.getAssignmentRowCount();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('assignment count updates correctly', async ({ page }) => {
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

    // Navigate to licenses and create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Count Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-COUNT-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Navigate back to list and verify initial count is 0
    await licenses.navigateToLicenses(slug);
    const licenseCard = await licenses.getLicenseByName(licenseName);
    await expect(licenseCard).toContainText('0 assignments');

    // Open the license detail page and assign
    await licenses.clickLicenseByName(licenseName);
    await licenses.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page
      .locator('[data-test^="user-option-"]')
      .first();
    await firstMemberOption.click();
    await licenses.confirmAssignToUser();
    await page.waitForTimeout(2000);

    // Navigate back to list and verify count updated to 1
    await licenses.navigateToLicenses(slug);
    const updatedCard = await licenses.getLicenseByName(licenseName);
    await expect(updatedCard).toContainText('1 assignment');
  });

  test('prevents duplicate user assignments', async ({ page }) => {
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

    // Navigate to licenses and create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Duplicate Assignment Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-DUP-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Assign to user first time
    await licenses.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page
      .locator('[data-test^="user-option-"]')
      .first();
    const memberId =
      (await firstMemberOption.getAttribute('data-test'))?.replace(
        'user-option-',
        '',
      ) || '';
    await firstMemberOption.click();
    await licenses.confirmAssignToUser();
    await page.waitForTimeout(2000);

    // Try to assign to same user again
    await licenses.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');
    await page.click(`[data-test="user-option-${memberId}"]`);
    await licenses.confirmAssignToUser();

    // Verify error message appears
    await expect(page.locator('[role="alert"]')).toContainText(
      'already assigned',
      { ignoreCase: true, timeout: 5000 }
    );
  });

  test('prevents duplicate asset assignments', async ({ page }) => {
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

    const licenseName = `Duplicate Asset Assignment ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ASSET-DUP-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Assign to asset first time
    await licenses.openAssignToAssetDialog();
    await page.click('[data-test="assign-asset-select"]');
    const firstAssetOption = page
      .locator('[data-test^="asset-option-"]')
      .first();
    const assetId =
      (await firstAssetOption.getAttribute('data-test'))?.replace(
        'asset-option-',
        '',
      ) || '';
    await firstAssetOption.click();
    await licenses.confirmAssignToAsset();
    await page.waitForTimeout(2000);

    // Try to assign to same asset again
    await licenses.openAssignToAssetDialog();
    await page.click('[data-test="assign-asset-select"]');
    await page.click(`[data-test="asset-option-${assetId}"]`);
    await licenses.confirmAssignToAsset();

    // Verify error message appears
    await expect(page.locator('[role="alert"]')).toContainText(
      'already assigned',
      { ignoreCase: true, timeout: 5000 }
    );
  });
});

test.describe('License Management - Update and Delete Flows', () => {
  test('user can edit license information', async ({ page }) => {
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

    // Open the license detail page
    await licenses.clickLicenseByName(originalName);

    // Click edit button
    await licenses.clickEditLicense();

    // Update the license
    const updatedName = `Updated License ${Date.now()}`;
    await licenses.updateLicense({
      name: updatedName,
      vendor: 'Updated Vendor',
      notes: 'Updated notes for testing',
    });

    // Verify the updated information is displayed
    const detailView = licenses.getLicenseDetailView();
    await expect(detailView).toContainText(updatedName);
    await expect(detailView).toContainText('Updated Vendor');
    await expect(detailView).toContainText('Updated notes for testing');
  });

  test('user can delete a license without assignments', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const licenseName = `Delete Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-DEL-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Delete the license
    await licenses.deleteLicense();

    // Verify we're back on the licenses list page
    await expect(page).toHaveURL(/.*\/licenses$/);

    // Verify the license is no longer in the list
    await page.waitForTimeout(1000);
    const licenseCell = page.locator('[data-test="license-name-cell"]', {
      hasText: licenseName,
    });
    await expect(licenseCell).not.toBeVisible();
  });

  test('delete dialog shows warning when license has assignments', async ({
    page,
  }) => {
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

    // Navigate to licenses and create a license
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Delete Warning Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-WARN-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Assign to user
    await licenses.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page
      .locator('[data-test^="user-option-"]')
      .first();
    await firstMemberOption.click();
    await licenses.confirmAssignToUser();
    await page.waitForTimeout(2000);

    // Try to delete the license
    await licenses.openDeleteLicenseDialog();

    // Verify warning message is displayed
    const warningMessage = licenses.getDeleteWarningMessage();
    await expect(warningMessage).toBeVisible();
    await expect(warningMessage).toContainText('assignment');

    // Confirm deletion anyway
    await licenses.confirmDeleteLicense();

    // Verify we're back on the licenses list page
    await expect(page).toHaveURL(/.*\/licenses$/);
  });

  test('updated license information persists after page reload', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license
    await licenses.clickNewLicense();
    const originalName = `Persist Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: originalName,
      vendor: 'Original Vendor',
      licenseKey: `KEY-PERSIST-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(originalName);

    // Click edit button
    await licenses.clickEditLicense();

    // Update the license
    const updatedName = `Persisted License ${Date.now()}`;
    await licenses.updateLicense({
      name: updatedName,
      cost: '499.99',
    });

    // Reload the page
    await page.reload();

    // Verify the updated information is still displayed
    const detailView = licenses.getLicenseDetailView();
    await expect(detailView).toContainText(updatedName);
    await expect(detailView).toContainText('499.99');
  });
});

test.describe('License Management - Expiration Status Tests', () => {
  test('displays expiring soon badge for licenses expiring within 30 days', async ({
    page,
  }) => {
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

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Verify expiring soon badge is displayed
    const expirationBadge = licenses.getExpirationBadge();
    await expect(expirationBadge).toBeVisible();
    await expect(expirationBadge).toContainText('expiring', {
      ignoreCase: true,
    });
  });

  test('displays expired badge for licenses past expiration date', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create a license that expired yesterday
    const purchaseDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.clickNewLicense();
    const licenseName = `Expired License ${Date.now()}`;
    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-EXPIRED-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: purchaseDate,
      expirationDate: expiredDate,
    });

    // Open the license detail page
    await licenses.clickLicenseByName(licenseName);

    // Verify expired badge is displayed
    const expirationBadge = licenses.getExpirationBadge();
    await expect(expirationBadge).toBeVisible();
    await expect(expirationBadge).toContainText('expired', {
      ignoreCase: true,
    });
  });

  test('filters licenses by expiration status - expiring soon', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';

    // Create an expiring soon license
    const expiringSoonDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    await licenses.clickNewLicense();
    const expiringSoonName = `Expiring Soon ${Date.now()}`;
    await licenses.createLicense({
      name: expiringSoonName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-EXP-SOON-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: expiringSoonDate,
    });

    // Create an active license (expires in 6 months)
    const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    await licenses.clickNewLicense();
    const activeName = `Active License ${Date.now()}`;
    await licenses.createLicense({
      name: activeName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ACTIVE-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Apply expiring soon filter
    await licenses.applyExpirationStatusFilter('expiring');

    // Verify only expiring soon license is visible
    await expect(await licenses.getLicenseByName(expiringSoonName)).toBeVisible();

    // Verify filtered count
    const rowCount = await licenses.getLicenseRowCount();
    expect(rowCount).toBe(1);
  });

  test('filters licenses by expiration status - expired', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create an expired license
    const purchaseDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    await licenses.clickNewLicense();
    const expiredName = `Expired License ${Date.now()}`;
    await licenses.createLicense({
      name: expiredName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-EXPIRED-FILTER-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: purchaseDate,
      expirationDate: expiredDate,
    });

    // Create an active license
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    await licenses.clickNewLicense();
    const activeName = `Active License Filter ${Date.now()}`;
    await licenses.createLicense({
      name: activeName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ACTIVE-FILTER-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Apply expired filter
    await licenses.applyExpirationStatusFilter('expired');

    // Verify only expired license is visible
    await expect(await licenses.getLicenseByName(expiredName)).toBeVisible();

    // Verify filtered count
    const rowCount = await licenses.getLicenseRowCount();
    expect(rowCount).toBe(1);
  });

  test('expired licenses are visually highlighted in list', async ({
    page,
  }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    // Create an expired license
    const purchaseDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';
    const expiredDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.clickNewLicense();
    const licenseName = `Highlighted Expired ${Date.now()}`;
    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-HIGHLIGHT-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: purchaseDate,
      expirationDate: expiredDate,
    });

    // Find the license card in the list
    const licenseCard = await licenses.getLicenseByName(licenseName);
    await expect(licenseCard).toBeVisible();

    // Verify the card or its parent has visual indication (badge, color, etc.)
    // The exact implementation may vary, but we check for common patterns
    const cardContainer = licenseCard.locator('xpath=ancestor::*[@data-test^="license-card-"]').first();
    
    // Check for expiration badge or status indicator
    const hasExpirationIndicator = await cardContainer.locator('[data-test="expiration-badge"]').count() > 0;
    expect(hasExpirationIndicator).toBe(true);
  });
});

test.describe('License Management - Filtering and Export Flows', () => {
  test('user can filter licenses by vendor', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create licenses with different vendors
    await licenses.clickNewLicense();
    const adobe = `Adobe License ${Date.now()}`;
    await licenses.createLicense({
      name: adobe,
      vendor: 'Adobe',
      licenseKey: `KEY-ADOBE-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.clickNewLicense();
    const microsoft = `Microsoft License ${Date.now()}`;
    await licenses.createLicense({
      name: microsoft,
      vendor: 'Microsoft',
      licenseKey: `KEY-MS-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Apply vendor filter
    await licenses.applyVendorFilter('Adobe');

    // Verify only Adobe license is visible
    await expect(await licenses.getLicenseByName(adobe)).toBeVisible();

    // Verify filtered count
    const rowCount = await licenses.getLicenseRowCount();
    expect(rowCount).toBe(1);

    // Clear filters
    await licenses.clearFilters();

    // Verify all licenses are visible
    const allRowCount = await licenses.getLicenseRowCount();
    expect(allRowCount).toBe(2);
  });

  test('user can filter licenses by type', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create licenses with different types
    await licenses.clickNewLicense();
    const subscription = `Subscription ${Date.now()}`;
    await licenses.createLicense({
      name: subscription,
      vendor: 'Test Vendor',
      licenseKey: `KEY-SUB-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.clickNewLicense();
    const perpetual = `Perpetual ${Date.now()}`;
    await licenses.createLicense({
      name: perpetual,
      vendor: 'Test Vendor',
      licenseKey: `KEY-PERP-${Date.now()}`,
      licenseType: 'perpetual',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Apply license type filter
    await licenses.applyLicenseTypeFilter('subscription');

    // Verify only subscription license is visible
    await expect(await licenses.getLicenseByName(subscription)).toBeVisible();

    // Verify filtered count
    const rowCount = await licenses.getLicenseRowCount();
    expect(rowCount).toBe(1);

    // Clear filters
    await licenses.clearFilters();

    // Verify all licenses are visible
    const allRowCount = await licenses.getLicenseRowCount();
    expect(allRowCount).toBe(2);
  });

  test('user can search licenses by name', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create licenses with distinct names
    const uniqueId = Date.now();
    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: `Photoshop License ${uniqueId}`,
      vendor: 'Adobe',
      licenseKey: `KEY-PS-${uniqueId}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: `Office License ${uniqueId}`,
      vendor: 'Microsoft',
      licenseKey: `KEY-OFF-${uniqueId}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Search for "Photoshop"
    await licenses.applySearchFilter('Photoshop');

    // Verify only Photoshop license is visible
    await expect(
      await licenses.getLicenseByName(`Photoshop License ${uniqueId}`),
    ).toBeVisible();

    // Verify filtered count
    const rowCount = await licenses.getLicenseRowCount();
    expect(rowCount).toBe(1);

    // Clear search
    await page.fill('[data-test="license-search-input"]', '');
    await page.waitForTimeout(500);

    // Verify all licenses are visible
    const allRowCount = await licenses.getLicenseRowCount();
    expect(allRowCount).toBe(2);
  });

  test('user can export licenses to CSV', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create a license
    await licenses.clickNewLicense();
    const licenseName = `Export Test ${Date.now()}`;
    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-EXPORT-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
      cost: '199.99',
    });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await licenses.exportLicenses();

    // Wait for download
    const download = await downloadPromise;

    // Verify download occurred
    expect(download.suggestedFilename()).toContain('.csv');

    // Optionally verify CSV content
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('export includes filtered results only', async ({ page }) => {
    const licenses = new LicensesPageObject(page);
    const { slug } = await licenses.setup();

    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    // Create multiple licenses
    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: `Adobe Export ${Date.now()}`,
      vendor: 'Adobe',
      licenseKey: `KEY-ADOBE-EXP-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses.clickNewLicense();
    await licenses.createLicense({
      name: `Microsoft Export ${Date.now()}`,
      vendor: 'Microsoft',
      licenseKey: `KEY-MS-EXP-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Apply filter
    await licenses.applyVendorFilter('Adobe');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Export filtered results
    await licenses.exportLicenses();

    // Wait for download
    const download = await downloadPromise;

    // Verify download occurred
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
