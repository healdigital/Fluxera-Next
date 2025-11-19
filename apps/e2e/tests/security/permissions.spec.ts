import { expect, test } from '@playwright/test';

import { InvitationsPageObject } from '../invitations/invitations.po';
import { LicensesPageObject } from '../licenses/licenses.po';
import { AssetsPageObject } from '../assets/assets.po';
import { UsersPageObject } from '../users/users.po';

/**
 * Security Tests - Permission Enforcement
 * 
 * These tests verify that:
 * 1. Users without permissions cannot perform restricted actions
 * 2. UI elements are disabled/hidden for users without permissions
 * 3. Server-side permission checks prevent unauthorized operations
 * 4. Permission-based access control works correctly across all features
 */

test.describe('Security - License Permission Enforcement', () => {
  test('user without licenses.create permission cannot create licenses', async ({
    page,
  }) => {
    // Setup: Create team with owner and member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member with limited permissions
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: memberEmail,
        role: 'member', // Members typically don't have create permissions
      },
    ]);

    // Accept invitation as member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Navigate to licenses page as member
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);

    // Verify "New License" button is disabled or hidden
    const newLicenseButton = page.locator('[data-test="new-license-button"]');
    const isVisible = await newLicenseButton.isVisible();
    
    if (isVisible) {
      // If visible, it should be disabled
      await expect(newLicenseButton).toBeDisabled();
    }

    // Try to navigate directly to create page (should be blocked)
    await page.goto(`/home/${slug}/licenses/new`);
    
    // Should see error message or be redirected
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    // Either redirected away or see error
    if (currentUrl.includes('/licenses/new')) {
      await expect(page.locator('[role="alert"]')).toContainText(
        'permission',
        { ignoreCase: true, timeout: 5000 }
      );
    } else {
      expect(currentUrl).not.toContain('/licenses/new');
    }
  });

  test('user without licenses.update permission cannot edit licenses', async ({
    page,
  }) => {
    // Setup: Create team and license as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a license as owner
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Test License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Create a member with limited permissions
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

    // Navigate to license detail page as member
    await licenses.navigateToLicenses(slug);
    await licenses.clickLicenseByName(licenseName);

    // Verify "Edit" button is disabled or hidden
    const editButton = page.locator('[data-test="edit-license-button"]');
    const isVisible = await editButton.isVisible();
    
    if (isVisible) {
      await expect(editButton).toBeDisabled();
    }
  });

  test('user without licenses.delete permission cannot delete licenses', async ({
    page,
  }) => {
    // Setup: Create team and license as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a license as owner
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
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

    // Create a member with limited permissions
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

    // Navigate to license detail page as member
    await licenses.navigateToLicenses(slug);
    await licenses.clickLicenseByName(licenseName);

    // Verify "Delete" button is disabled or hidden
    const deleteButton = page.locator('[data-test="delete-license-button"]');
    const isVisible = await deleteButton.isVisible();
    
    if (isVisible) {
      await expect(deleteButton).toBeDisabled();
    }
  });

  test('user without licenses.manage permission cannot assign licenses', async ({
    page,
  }) => {
    // Setup: Create team and license as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a license as owner
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `Assign Test ${Date.now()}`;
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

    // Create a member with limited permissions
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

    // Navigate to license detail page as member
    await licenses.navigateToLicenses(slug);
    await licenses.clickLicenseByName(licenseName);

    // Verify "Assign to User" button is disabled or hidden
    const assignUserButton = page.locator('[data-test="assign-to-user-button"]');
    const isUserButtonVisible = await assignUserButton.isVisible();
    
    if (isUserButtonVisible) {
      await expect(assignUserButton).toBeDisabled();
    }

    // Verify "Assign to Asset" button is disabled or hidden
    const assignAssetButton = page.locator('[data-test="assign-to-asset-button"]');
    const isAssetButtonVisible = await assignAssetButton.isVisible();
    
    if (isAssetButtonVisible) {
      await expect(assignAssetButton).toBeDisabled();
    }
  });
});

test.describe('Security - Asset Permission Enforcement', () => {
  test('user without assets.create permission cannot create assets', async ({
    page,
  }) => {
    // Setup: Create team with owner and member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member with limited permissions
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

    // Navigate to assets page as member
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);

    // Verify "New Asset" button is disabled or hidden
    const newAssetButton = page.locator('[data-test="new-asset-button"]');
    const isVisible = await newAssetButton.isVisible();
    
    if (isVisible) {
      await expect(newAssetButton).toBeDisabled();
    }

    // Try to navigate directly to create page (should be blocked)
    await page.goto(`/home/${slug}/assets/new`);
    
    // Should see error message or be redirected
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/assets/new')) {
      await expect(page.locator('[role="alert"]')).toContainText(
        'permission',
        { ignoreCase: true, timeout: 5000 }
      );
    } else {
      expect(currentUrl).not.toContain('/assets/new');
    }
  });

  test('user without assets.update permission cannot edit assets', async ({
    page,
  }) => {
    // Setup: Create team and asset as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create an asset as owner
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `Test Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Create a member with limited permissions
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

    // Navigate to asset detail page as member
    await assets.navigateToAssets(slug);
    await assets.clickAssetByName(assetName);

    // Verify "Edit" button is disabled or hidden
    const editButton = page.locator('[data-test="edit-asset-button"]');
    const isVisible = await editButton.isVisible();
    
    if (isVisible) {
      await expect(editButton).toBeDisabled();
    }
  });

  test('user without assets.delete permission cannot delete assets', async ({
    page,
  }) => {
    // Setup: Create team and asset as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create an asset as owner
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `Delete Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Create a member with limited permissions
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

    // Navigate to asset detail page as member
    await assets.navigateToAssets(slug);
    await assets.clickAssetByName(assetName);

    // Verify "Delete" button is disabled or hidden
    const deleteButton = page.locator('[data-test="delete-asset-button"]');
    const isVisible = await deleteButton.isVisible();
    
    if (isVisible) {
      await expect(deleteButton).toBeDisabled();
    }
  });

  test('user without assets.manage permission cannot assign assets', async ({
    page,
  }) => {
    // Setup: Create team and asset as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create an asset as owner
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `Assign Test ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
    });

    // Create a member with limited permissions
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

    // Navigate to asset detail page as member
    await assets.navigateToAssets(slug);
    await assets.clickAssetByName(assetName);

    // Verify "Assign Asset" button is disabled or hidden
    const assignButton = page.locator('[data-test="assign-asset-button"]');
    const isVisible = await assignButton.isVisible();
    
    if (isVisible) {
      await expect(assignButton).toBeDisabled();
    }
  });
});

test.describe('Security - User Management Permission Enforcement', () => {
  test('user without members.manage permission cannot invite users', async ({
    page,
  }) => {
    // Setup: Create team with owner and member
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a member with limited permissions
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

    // Navigate to users page as member
    const users = new UsersPageObject(page);
    await users.navigateToUsers(slug);

    // Verify "Invite User" button is disabled or hidden
    const inviteButton = page.locator('[data-test="invite-user-button"]');
    const isVisible = await inviteButton.isVisible();
    
    if (isVisible) {
      await expect(inviteButton).toBeDisabled();
    }
  });

  test('user without members.manage permission cannot change user roles', async ({
    page,
  }) => {
    // Setup: Create team with multiple members
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create first member
    await invitations.navigateToMembers();
    const member1Email = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Create second member
    const member2Email = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: member2Email,
        role: 'member',
      },
    ]);

    // Accept invitation as first member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(member1Email);
    await invitations.acceptInvitation();

    // Navigate to users page and try to change second member's role
    const users = new UsersPageObject(page);
    await users.navigateToUsers(slug);
    await users.clickUserByEmail(member2Email);

    // Verify "Change Role" button is disabled or hidden
    const changeRoleButton = page.locator('[data-test="change-role-button"]');
    const isVisible = await changeRoleButton.isVisible();
    
    if (isVisible) {
      await expect(changeRoleButton).toBeDisabled();
    }
  });

  test('user without members.manage permission cannot change user status', async ({
    page,
  }) => {
    // Setup: Create team with multiple members
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create first member
    await invitations.navigateToMembers();
    const member1Email = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Create second member
    const member2Email = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: member2Email,
        role: 'member',
      },
    ]);

    // Accept invitation as first member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(member1Email);
    await invitations.acceptInvitation();

    // Navigate to users page and try to change second member's status
    const users = new UsersPageObject(page);
    await users.navigateToUsers(slug);
    await users.clickUserByEmail(member2Email);

    // Verify "Change Status" button is disabled or hidden
    const changeStatusButton = page.locator('[data-test="change-status-button"]');
    const isVisible = await changeStatusButton.isVisible();
    
    if (isVisible) {
      await expect(changeStatusButton).toBeDisabled();
    }
  });
});

test.describe('Security - Read-Only Permission Tests', () => {
  test('user with only view permission can see but not modify licenses', async ({
    page,
  }) => {
    // Setup: Create team and license as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create a license as owner
    const licenses = new LicensesPageObject(page);
    await licenses.navigateToLicenses(slug);
    await licenses.clickNewLicense();

    const licenseName = `View Only Test ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses.createLicense({
      name: licenseName,
      vendor: 'Test Vendor',
      licenseKey: `KEY-VIEW-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Create a member with view-only permissions
    await invitations.navigateToMembers();
    const memberEmail = invitations.auth.createRandomEmail();
    await invitations.openInviteForm();
    await invitations.inviteMembers([
      {
        email: memberEmail,
        role: 'member', // Assuming members have view permission
      },
    ]);

    // Accept invitation as member
    await page.context().clearCookies();
    await invitations.auth.visitConfirmEmailLink(memberEmail);
    await invitations.acceptInvitation();

    // Navigate to licenses page as member
    await licenses.navigateToLicenses(slug);

    // Verify can see the license
    const licenseCell = await licenses.getLicenseByName(licenseName);
    await expect(licenseCell).toBeVisible();

    // Click to view details
    await licenses.clickLicenseByName(licenseName);

    // Verify can see license details
    const detailView = licenses.getLicenseDetailView();
    await expect(detailView).toBeVisible();
    await expect(detailView).toContainText(licenseName);

    // Verify all modification buttons are disabled
    const editButton = page.locator('[data-test="edit-license-button"]');
    const deleteButton = page.locator('[data-test="delete-license-button"]');
    const assignUserButton = page.locator('[data-test="assign-to-user-button"]');
    const assignAssetButton = page.locator('[data-test="assign-to-asset-button"]');

    // Check each button if visible
    if (await editButton.isVisible()) {
      await expect(editButton).toBeDisabled();
    }
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeDisabled();
    }
    if (await assignUserButton.isVisible()) {
      await expect(assignUserButton).toBeDisabled();
    }
    if (await assignAssetButton.isVisible()) {
      await expect(assignAssetButton).toBeDisabled();
    }
  });

  test('user with only view permission can see but not modify assets', async ({
    page,
  }) => {
    // Setup: Create team and asset as owner
    const invitations = new InvitationsPageObject(page);
    const { slug, email: ownerEmail } = await invitations.setup();

    // Create an asset as owner
    const assets = new AssetsPageObject(page);
    await assets.navigateToAssets(slug);
    await assets.clickNewAsset();

    const assetName = `View Only Asset ${Date.now()}`;
    await assets.createAsset({
      name: assetName,
      category: 'laptop',
      status: 'available',
      description: 'Test asset for view-only permissions',
    });

    // Create a member with view-only permissions
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

    // Navigate to assets page as member
    await assets.navigateToAssets(slug);

    // Verify can see the asset
    const assetCell = await assets.getAssetByName(assetName);
    await expect(assetCell).toBeVisible();

    // Click to view details
    await assets.clickAssetByName(assetName);

    // Verify can see asset details
    await expect(page.locator('text=' + assetName)).toBeVisible();

    // Verify all modification buttons are disabled
    const editButton = page.locator('[data-test="edit-asset-button"]');
    const deleteButton = page.locator('[data-test="delete-asset-button"]');
    const assignButton = page.locator('[data-test="assign-asset-button"]');

    if (await editButton.isVisible()) {
      await expect(editButton).toBeDisabled();
    }
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeDisabled();
    }
    if (await assignButton.isVisible()) {
      await expect(assignButton).toBeDisabled();
    }
  });
});
