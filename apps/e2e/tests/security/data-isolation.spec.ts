import { expect, test } from '@playwright/test';

import { InvitationsPageObject } from '../invitations/invitations.po';
import { LicensesPageObject } from '../licenses/licenses.po';
import { AssetsPageObject } from '../assets/assets.po';
import { UsersPageObject } from '../users/users.po';

/**
 * Security Tests - Data Isolation
 * 
 * These tests verify that:
 * 1. Users can only see data from their own account
 * 2. Users cannot access data from other accounts
 * 3. RLS policies prevent cross-account data leaks
 * 4. Direct URL access to other accounts' resources is blocked
 */

test.describe('Security - License Data Isolation', () => {
  test('user cannot see licenses from other accounts', async ({ page }) => {
    // Setup: Create first account with a license
    const licenses1 = new LicensesPageObject(page);
    const { slug: slug1, email: owner1Email } = await licenses1.setup();

    // Create a license in first account
    await licenses1.clickNewLicense();
    const license1Name = `Account1 License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses1.createLicense({
      name: license1Name,
      vendor: 'Vendor 1',
      licenseKey: `KEY-ACC1-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const licenses2 = new LicensesPageObject(page);
    const { slug: slug2, email: owner2Email } = await licenses2.setup();

    // Create a license in second account
    await licenses2.clickNewLicense();
    const license2Name = `Account2 License ${Date.now()}`;
    await licenses2.createLicense({
      name: license2Name,
      vendor: 'Vendor 2',
      licenseKey: `KEY-ACC2-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Verify second account can only see its own license
    await licenses2.navigateToLicenses(slug2);
    await expect(await licenses2.getLicenseByName(license2Name)).toBeVisible();

    // Verify first account's license is NOT visible
    const license1Cell = page.locator('[data-test="license-name-cell"]', {
      hasText: license1Name,
    });
    await expect(license1Cell).not.toBeVisible();

    // Try to access first account's licenses page (should be blocked or empty)
    await page.goto(`/home/${slug1}/licenses`);
    await page.waitForTimeout(2000);

    // Should either be redirected or see no licenses
    const currentUrl = page.url();
    if (currentUrl.includes(`/home/${slug1}/licenses`)) {
      // If we can access the page, it should be empty
      const licenseRows = page.locator('[data-test^="license-row-"]');
      const count = await licenseRows.count();
      expect(count).toBe(0);
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/home/${slug1}/licenses`);
    }
  });

  test('user cannot access license details from other accounts via direct URL', async ({
    page,
  }) => {
    // Setup: Create first account with a license
    const licenses1 = new LicensesPageObject(page);
    const { slug: slug1, email: owner1Email } = await licenses1.setup();

    // Create a license in first account
    await licenses1.clickNewLicense();
    const license1Name = `Protected License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses1.createLicense({
      name: license1Name,
      vendor: 'Protected Vendor',
      licenseKey: `KEY-PROTECTED-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Get the license ID from the URL
    await licenses1.clickLicenseByName(license1Name);
    const url1 = page.url();
    const licenseId = url1.split('/licenses/')[1]?.split('/')[0] || '';

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const licenses2 = new LicensesPageObject(page);
    const { slug: slug2, email: owner2Email } = await licenses2.setup();

    // Try to access first account's license detail page directly
    await page.goto(`/home/${slug1}/licenses/${licenseId}`);
    await page.waitForTimeout(2000);

    // Should be blocked - either redirected or see error
    const currentUrl = page.url();
    if (currentUrl.includes(`/licenses/${licenseId}`)) {
      // If we can access the page, should see error message
      await expect(page.locator('[role="alert"]')).toContainText(
        'not found|permission|access denied',
        { ignoreCase: true, timeout: 5000 }
      );
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/licenses/${licenseId}`);
    }
  });

  test('license assignments are isolated between accounts', async ({ page }) => {
    // Setup: Create first account with license and member
    const invitations1 = new InvitationsPageObject(page);
    const { slug: slug1, email: owner1Email } = await invitations1.setup();

    // Create a member in first account
    await invitations1.navigateToMembers();
    const member1Email = invitations1.auth.createRandomEmail();
    await invitations1.openInviteForm();
    await invitations1.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Accept invitation
    await page.context().clearCookies();
    await invitations1.auth.visitConfirmEmailLink(member1Email);
    await invitations1.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations1.auth.loginAsUser({
      email: owner1Email,
      next: '/home',
    });

    // Create and assign a license in first account
    const licenses1 = new LicensesPageObject(page);
    await licenses1.navigateToLicenses(slug1);
    await licenses1.clickNewLicense();

    const license1Name = `Assigned License ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    await licenses1.createLicense({
      name: license1Name,
      vendor: 'Test Vendor',
      licenseKey: `KEY-ASSIGNED-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    await licenses1.clickLicenseByName(license1Name);
    await licenses1.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page.locator('[data-test^="user-option-"]').first();
    await firstMemberOption.click();
    await licenses1.confirmAssignToUser();
    await page.waitForTimeout(2000);

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const licenses2 = new LicensesPageObject(page);
    const { slug: slug2, email: owner2Email } = await licenses2.setup();

    // Verify second account cannot see first account's assignments
    await licenses2.navigateToLicenses(slug2);

    // Create a license in second account
    await licenses2.clickNewLicense();
    const license2Name = `Account2 License ${Date.now()}`;
    await licenses2.createLicense({
      name: license2Name,
      vendor: 'Vendor 2',
      licenseKey: `KEY-ACC2-${Date.now()}`,
      licenseType: 'subscription',
      purchaseDate: today,
      expirationDate: futureDate,
    });

    // Open assignment dialog - should only see second account's members
    await licenses2.clickLicenseByName(license2Name);
    await licenses2.openAssignToUserDialog();
    await page.click('[data-test="assign-user-select"]');

    // Verify first account's member is NOT in the list
    const memberOptions = page.locator('[data-test^="user-option-"]');
    const count = await memberOptions.count();

    // Should only see owner of second account (no members from first account)
    expect(count).toBeLessThanOrEqual(1);
  });
});

test.describe('Security - Asset Data Isolation', () => {
  test('user cannot see assets from other accounts', async ({ page }) => {
    // Setup: Create first account with an asset
    const assets1 = new AssetsPageObject(page);
    const { slug: slug1, email: owner1Email } = await assets1.setup();

    // Create an asset in first account
    await assets1.clickNewAsset();
    const asset1Name = `Account1 Asset ${Date.now()}`;
    await assets1.createAsset({
      name: asset1Name,
      category: 'laptop',
      status: 'available',
      description: 'Asset in first account',
    });

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const assets2 = new AssetsPageObject(page);
    const { slug: slug2, email: owner2Email } = await assets2.setup();

    // Create an asset in second account
    await assets2.clickNewAsset();
    const asset2Name = `Account2 Asset ${Date.now()}`;
    await assets2.createAsset({
      name: asset2Name,
      category: 'monitor',
      status: 'available',
      description: 'Asset in second account',
    });

    // Verify second account can only see its own asset
    await assets2.navigateToAssets(slug2);
    await expect(await assets2.getAssetByName(asset2Name)).toBeVisible();

    // Verify first account's asset is NOT visible
    const asset1Cell = page.locator('[data-test="asset-name-cell"]', {
      hasText: asset1Name,
    });
    await expect(asset1Cell).not.toBeVisible();

    // Try to access first account's assets page
    await page.goto(`/home/${slug1}/assets`);
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes(`/home/${slug1}/assets`)) {
      // If we can access the page, it should be empty
      const assetRows = page.locator('[data-test^="asset-row-"]');
      const count = await assetRows.count();
      expect(count).toBe(0);
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/home/${slug1}/assets`);
    }
  });

  test('user cannot access asset details from other accounts via direct URL', async ({
    page,
  }) => {
    // Setup: Create first account with an asset
    const assets1 = new AssetsPageObject(page);
    const { slug: slug1, email: owner1Email } = await assets1.setup();

    // Create an asset in first account
    await assets1.clickNewAsset();
    const asset1Name = `Protected Asset ${Date.now()}`;
    await assets1.createAsset({
      name: asset1Name,
      category: 'desktop',
      status: 'available',
    });

    // Get the asset ID from the URL
    await assets1.clickAssetByName(asset1Name);
    const url1 = page.url();
    const assetId = url1.split('/assets/')[1]?.split('/')[0] || '';

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const assets2 = new AssetsPageObject(page);
    const { slug: slug2, email: owner2Email } = await assets2.setup();

    // Try to access first account's asset detail page directly
    await page.goto(`/home/${slug1}/assets/${assetId}`);
    await page.waitForTimeout(2000);

    // Should be blocked
    const currentUrl = page.url();
    if (currentUrl.includes(`/assets/${assetId}`)) {
      // If we can access the page, should see error message
      await expect(page.locator('[role="alert"]')).toContainText(
        'not found|permission|access denied',
        { ignoreCase: true, timeout: 5000 }
      );
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/assets/${assetId}`);
    }
  });

  test('asset assignments are isolated between accounts', async ({ page }) => {
    // Setup: Create first account with asset and member
    const invitations1 = new InvitationsPageObject(page);
    const { slug: slug1, email: owner1Email } = await invitations1.setup();

    // Create a member in first account
    await invitations1.navigateToMembers();
    const member1Email = invitations1.auth.createRandomEmail();
    await invitations1.openInviteForm();
    await invitations1.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Accept invitation
    await page.context().clearCookies();
    await invitations1.auth.visitConfirmEmailLink(member1Email);
    await invitations1.acceptInvitation();

    // Sign back in as owner
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');
    await invitations1.auth.loginAsUser({
      email: owner1Email,
      next: '/home',
    });

    // Create and assign an asset in first account
    const assets1 = new AssetsPageObject(page);
    await assets1.navigateToAssets(slug1);
    await assets1.clickNewAsset();

    const asset1Name = `Assigned Asset ${Date.now()}`;
    await assets1.createAsset({
      name: asset1Name,
      category: 'laptop',
      status: 'available',
    });

    await assets1.clickAssetByName(asset1Name);
    await page.click('[data-test="assign-asset-button"]');
    await page.click('[data-test="assign-user-select"]');
    const firstMemberOption = page.locator('[data-test^="member-option-"]').first();
    await firstMemberOption.click();
    await page.click('[data-test="confirm-assign-button"]');
    await page.waitForTimeout(2000);

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const assets2 = new AssetsPageObject(page);
    const { slug: slug2, email: owner2Email } = await assets2.setup();

    // Create an asset in second account
    await assets2.clickNewAsset();
    const asset2Name = `Account2 Asset ${Date.now()}`;
    await assets2.createAsset({
      name: asset2Name,
      category: 'monitor',
      status: 'available',
    });

    // Open assignment dialog - should only see second account's members
    await assets2.clickAssetByName(asset2Name);
    await page.click('[data-test="assign-asset-button"]');
    await page.click('[data-test="assign-user-select"]');

    // Verify first account's member is NOT in the list
    const memberOptions = page.locator('[data-test^="member-option-"]');
    const count = await memberOptions.count();

    // Should only see owner of second account
    expect(count).toBeLessThanOrEqual(1);
  });
});

test.describe('Security - User Data Isolation', () => {
  test('user cannot see members from other accounts', async ({ page }) => {
    // Setup: Create first account with members
    const invitations1 = new InvitationsPageObject(page);
    const { slug: slug1, email: owner1Email } = await invitations1.setup();

    // Create a member in first account
    await invitations1.navigateToMembers();
    const member1Email = invitations1.auth.createRandomEmail();
    await invitations1.openInviteForm();
    await invitations1.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const invitations2 = new InvitationsPageObject(page);
    const { slug: slug2, email: owner2Email } = await invitations2.setup();

    // Create a member in second account
    await invitations2.navigateToMembers();
    const member2Email = invitations2.auth.createRandomEmail();
    await invitations2.openInviteForm();
    await invitations2.inviteMembers([
      {
        email: member2Email,
        role: 'member',
      },
    ]);

    // Verify second account can only see its own members
    const users2 = new UsersPageObject(page);
    await users2.navigateToUsers(slug2);

    // Should see owner and member2
    await expect(await users2.getUserByEmail(owner2Email)).toBeVisible();
    await expect(await users2.getUserByEmail(member2Email)).toBeVisible();

    // Should NOT see member1 from first account
    const member1Row = page.locator('[data-test^="user-row-"]', {
      has: page.locator('text=' + member1Email),
    });
    await expect(member1Row).not.toBeVisible();

    // Try to access first account's users page
    await page.goto(`/home/${slug1}/users`);
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes(`/home/${slug1}/users`)) {
      // If we can access the page, should only see owner1 (no member1)
      const userRows = page.locator('[data-test^="user-row-"]');
      const count = await userRows.count();
      expect(count).toBeLessThanOrEqual(1); // Only owner
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/home/${slug1}/users`);
    }
  });

  test('user cannot access user details from other accounts via direct URL', async ({
    page,
  }) => {
    // Setup: Create first account with a member
    const invitations1 = new InvitationsPageObject(page);
    const { slug: slug1, email: owner1Email } = await invitations1.setup();

    // Create a member in first account
    await invitations1.navigateToMembers();
    const member1Email = invitations1.auth.createRandomEmail();
    await invitations1.openInviteForm();
    await invitations1.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Get the member's user ID
    const users1 = new UsersPageObject(page);
    await users1.navigateToUsers(slug1);
    await users1.clickUserByEmail(member1Email);
    const url1 = page.url();
    const userId = url1.split('/users/')[1]?.split('/')[0] || '';

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const invitations2 = new InvitationsPageObject(page);
    const { slug: slug2, email: owner2Email } = await invitations2.setup();

    // Try to access first account's user detail page directly
    await page.goto(`/home/${slug1}/users/${userId}`);
    await page.waitForTimeout(2000);

    // Should be blocked
    const currentUrl = page.url();
    if (currentUrl.includes(`/users/${userId}`)) {
      // If we can access the page, should see error message
      await expect(page.locator('[role="alert"]')).toContainText(
        'not found|permission|access denied',
        { ignoreCase: true, timeout: 5000 }
      );
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/users/${userId}`);
    }
  });

  test('user activity logs are isolated between accounts', async ({ page }) => {
    // Setup: Create first account with member and activity
    const invitations1 = new InvitationsPageObject(page);
    const { slug: slug1, email: owner1Email } = await invitations1.setup();

    // Create a member in first account
    await invitations1.navigateToMembers();
    const member1Email = invitations1.auth.createRandomEmail();
    await invitations1.openInviteForm();
    await invitations1.inviteMembers([
      {
        email: member1Email,
        role: 'member',
      },
    ]);

    // Generate some activity by changing role
    const users1 = new UsersPageObject(page);
    await users1.navigateToUsers(slug1);
    await users1.clickUserByEmail(member1Email);
    await users1.changeUserRole('owner');

    // Get user ID and activity count
    const url1 = page.url();
    const userId1 = url1.split('/users/')[1]?.split('/')[0] || '';
    await users1.navigateToUserActivity(userId1, slug1);
    const activity1Count = await users1.getActivityRowCount();
    expect(activity1Count).toBeGreaterThan(0);

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const invitations2 = new InvitationsPageObject(page);
    const { slug: slug2, email: owner2Email } = await invitations2.setup();

    // Try to access first account's activity page
    await page.goto(`/home/${slug1}/users/${userId1}/activity`);
    await page.waitForTimeout(2000);

    // Should be blocked or show no activity
    const currentUrl = page.url();
    if (currentUrl.includes(`/users/${userId1}/activity`)) {
      // If we can access the page, should see no activity
      const activityRows = page.locator('[data-test^="activity-row-"]');
      const count = await activityRows.count();
      expect(count).toBe(0);
    } else {
      // Or we should be redirected away
      expect(currentUrl).not.toContain(`/users/${userId1}/activity`);
    }
  });
});

test.describe('Security - Dashboard Data Isolation', () => {
  test('dashboard metrics are isolated between accounts', async ({ page }) => {
    // Setup: Create first account with data
    const licenses1 = new LicensesPageObject(page);
    const { slug: slug1, email: owner1Email } = await licenses1.setup();

    // Create multiple licenses in first account
    const today = new Date().toISOString().split('T')[0] || '';
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] || '';

    for (let i = 0; i < 3; i++) {
      await licenses1.clickNewLicense();
      await licenses1.createLicense({
        name: `License ${i} ${Date.now()}`,
        vendor: `Vendor ${i}`,
        licenseKey: `KEY-${i}-${Date.now()}`,
        licenseType: 'subscription',
        purchaseDate: today,
        expirationDate: futureDate,
      });
    }

    // Navigate to dashboard and verify metrics
    await page.goto(`/home/${slug1}/dashboard`);
    await page.waitForTimeout(2000);

    // Get license count from dashboard
    const licenseMetric1 = page.locator('[data-test="dashboard-licenses-count"]');
    const count1Text = await licenseMetric1.textContent();
    const count1 = parseInt(count1Text || '0');
    expect(count1).toBeGreaterThanOrEqual(3);

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const licenses2 = new LicensesPageObject(page);
    const { slug: slug2, email: owner2Email } = await licenses2.setup();

    // Navigate to second account's dashboard
    await page.goto(`/home/${slug2}/dashboard`);
    await page.waitForTimeout(2000);

    // Verify second account shows zero or different metrics
    const licenseMetric2 = page.locator('[data-test="dashboard-licenses-count"]');
    const count2Text = await licenseMetric2.textContent();
    const count2 = parseInt(count2Text || '0');

    // Second account should have 0 licenses (or at least not 3+)
    expect(count2).toBeLessThan(count1);
  });

  test('dashboard alerts are isolated between accounts', async ({ page }) => {
    // Setup: Create first account
    const licenses1 = new LicensesPageObject(page);
    const { slug: slug1, email: owner1Email } = await licenses1.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug1}/dashboard`);
    await page.waitForTimeout(2000);

    // Check if there are any alerts
    const alerts1 = page.locator('[data-test^="dashboard-alert-"]');
    const alerts1Count = await alerts1.count();

    // Sign out and create second account
    await page.context().clearCookies();
    await page.goto('/auth/sign-in');

    const licenses2 = new LicensesPageObject(page);
    const { slug: slug2, email: owner2Email } = await licenses2.setup();

    // Navigate to second account's dashboard
    await page.goto(`/home/${slug2}/dashboard`);
    await page.waitForTimeout(2000);

    // Verify second account has different alerts (or none)
    const alerts2 = page.locator('[data-test^="dashboard-alert-"]');
    const alerts2Count = await alerts2.count();

    // Alerts should be different between accounts
    // (This is a basic check - in reality, alerts are account-specific)
    expect(alerts2Count).not.toBe(alerts1Count);
  });
});
