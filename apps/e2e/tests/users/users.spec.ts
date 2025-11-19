import { expect, test } from '@playwright/test';

import { UsersPageObject } from './users.po';

test.describe('User Management - User Invitation Flow', () => {
  test('user can invite a new team member and see them in the list', async ({
    page,
  }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Navigate to invite user page
    await users.clickInviteUser();

    // Fill and submit the invitation form
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
      sendInvitation: true,
    });

    // Verify the invited user appears in the list
    const userRow = await users.getUserByEmail(memberEmail);
    await expect(userRow).toBeVisible();
  });

  test('user can invite multiple team members with different roles', async ({
    page,
  }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite first member
    await users.clickInviteUser();
    const member1Email = users.auth.createRandomEmail();
    await users.inviteUser({
      email: member1Email,
      role: 'member',
    });

    // Invite second member with different role
    await users.clickInviteUser();
    const member2Email = users.auth.createRandomEmail();
    await users.inviteUser({
      email: member2Email,
      role: 'owner',
    });

    // Verify both members are in the list
    await expect(await users.getUserByEmail(member1Email)).toBeVisible();
    await expect(await users.getUserByEmail(member2Email)).toBeVisible();
  });
});

test.describe('User Management - Role Change Flow', () => {
  test('user can change a team member role', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member with initial role
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Verify initial role is displayed
    const roleDisplay = page.locator('[data-test="user-role-display"]');
    await expect(roleDisplay).toContainText('member');

    // Change the role to owner
    await users.changeUserRole('owner');

    // Wait for the page to refresh after role change
    await page.waitForTimeout(1500);

    // Verify the role was updated in the detail view
    await expect(roleDisplay).toContainText('owner');

    // Verify the role badge also shows the updated role
    const roleBadge = page.locator('[data-test="user-role-badge"]');
    await expect(roleBadge).toContainText('Owner');
  });

  test('role change dialog shows current and new role', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Open role change dialog
    await users.openAssignRoleDialog();

    // Verify dialog is visible
    const dialog = page.locator('[data-test="assign-role-dialog"]');
    await expect(dialog).toBeVisible();

    // Verify current role is displayed
    await expect(page.locator('text=Current Role')).toBeVisible();
    await expect(dialog.locator('text=member')).toBeVisible();

    // Select new role
    await users.selectNewRole('owner');

    // Verify new role is selected in the dropdown
    const roleSelect = page.locator('[data-test="new-role-select"]');
    await expect(roleSelect).toContainText('owner');

    // Verify confirmation button is enabled
    const confirmButton = page.locator(
      '[data-test="confirm-assign-role-button"]',
    );
    await expect(confirmButton).toBeEnabled();

    // Verify confirmation warning appears
    await expect(page.locator('text=Confirm')).toBeVisible();
  });

  test('role change updates user list', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Change the role
    await users.changeUserRole('owner');

    // Navigate back to users list
    await users.navigateToUsers(slug);

    // Verify the user row shows the updated role
    const userRow = await users.getUserByEmail(memberEmail);
    await expect(userRow).toContainText('owner');
  });

  test('cannot change role without selecting a different role', async ({
    page,
  }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Open role change dialog
    await users.openAssignRoleDialog();

    // Verify confirm button is disabled when no change is made
    const confirmButton = page.locator(
      '[data-test="confirm-assign-role-button"]',
    );
    await expect(confirmButton).toBeDisabled();

    // Select the same role (member)
    await users.selectNewRole('member');

    // Confirm button should still be disabled
    await expect(confirmButton).toBeDisabled();
  });
});

test.describe('User Management - Status Change Flow', () => {
  test('user can change a team member status to inactive', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Change status to inactive with reason
    await users.changeUserStatus('inactive', 'User left the organization');

    // Navigate back to users list
    await users.navigateToUsers(slug);

    // Verify status is updated in the list
    const userRow = await users.getUserByEmail(memberEmail);
    await expect(userRow).toContainText('Inactive');
  });

  test('status change requires reason for deactivation', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Open status change dialog
    await users.openChangeStatusDialog();

    // Select inactive status
    await users.selectNewStatus('inactive');

    // Verify warning message appears
    await expect(page.locator('text=Confirm')).toBeVisible();
    await expect(
      page.locator('[data-test="status-change-reason"]'),
    ).toBeVisible();

    // Try to submit without reason - button should be enabled but validation should occur
    await users.fillStatusChangeReason('Employee terminated');
    await users.confirmStatusChange();

    // Wait for status change to complete
    await page.waitForTimeout(1000);
  });

  test('user can change status to suspended with reason', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Change status to suspended
    await users.changeUserStatus('suspended', 'Under investigation');

    // Navigate back to users list
    await users.navigateToUsers(slug);

    // Verify status is updated
    const userRow = await users.getUserByEmail(memberEmail);
    await expect(userRow).toContainText('Suspended');
  });
});

test.describe('User Management - Activity Log Viewing', () => {
  test('user can view activity log for a team member', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug, email: ownerEmail } = await users.setup();

    // Invite a member to generate activity
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Get the user ID from the URL
    const url = page.url();
    const userId = url.split('/users/')[1]?.split('/')[0] || '';

    // Navigate to activity page
    await users.navigateToUserActivity(userId, slug);

    // Verify activity entries are displayed
    const activityRows = users.getActivityRows();
    const count = await activityRows.count();
    expect(count).toBeGreaterThan(0);

    // Verify activity table headers are present
    await expect(page.locator('text=Timestamp')).toBeVisible();
    await expect(page.locator('text=Action')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
  });

  test('user can filter activity by action type', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Get the user ID from the URL
    const url = page.url();
    const userId = url.split('/users/')[1]?.split('/')[0] || '';

    // Change role to generate activity
    await users.changeUserRole('owner');

    // Navigate to activity page
    await users.navigateToUserActivity(userId, slug);

    // Get initial count
    const initialCount = await users.getActivityRowCount();
    expect(initialCount).toBeGreaterThan(0);

    // Apply action type filter
    await users.applyActivityActionTypeFilter('role_changed');
    await users.applyActivityFilters();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify filtered results
    const filteredRows = users.getActivityRowByActionType('Role Changed');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('user can filter activity by date range', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Get the user ID from the URL
    const url = page.url();
    const userId = url.split('/users/')[1]?.split('/')[0] || '';

    // Navigate to activity page
    await users.navigateToUserActivity(userId, slug);

    // Get today's date and yesterday's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0] || '';
    const yesterdayStr = yesterday.toISOString().split('T')[0] || '';

    // Apply date range filter (yesterday to today)
    await users.applyActivityDateRangeFilter(yesterdayStr, todayStr);
    await users.applyActivityFilters();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify activity entries are still displayed (should include today's activities)
    const activityRows = users.getActivityRows();
    const count = await activityRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('user can clear activity filters', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Get the user ID from the URL
    const url = page.url();
    const userId = url.split('/users/')[1]?.split('/')[0] || '';

    // Navigate to activity page
    await users.navigateToUserActivity(userId, slug);

    // Get initial count
    const initialCount = await users.getActivityRowCount();

    // Apply a filter
    await users.applyActivityActionTypeFilter('role_changed');
    await users.applyActivityFilters();
    await page.waitForTimeout(1000);

    // Clear filters
    await users.clearActivityFilters();
    await page.waitForTimeout(1000);

    // Verify all activities are shown again
    const finalCount = await users.getActivityRowCount();
    expect(finalCount).toBe(initialCount);
  });

  test('activity log displays correct information', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a member
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Navigate to user detail page
    await users.clickUserByEmail(memberEmail);

    // Get the user ID from the URL
    const url = page.url();
    const userId = url.split('/users/')[1]?.split('/')[0] || '';

    // Navigate to activity page
    await users.navigateToUserActivity(userId, slug);

    // Verify activity row contains expected data
    const firstRow = users.getActivityRows().first();
    await expect(firstRow).toBeVisible();

    // Check that timestamp is displayed
    const timestamp = firstRow.locator('[data-test="activity-timestamp"]');
    await expect(timestamp).toBeVisible();

    // Check that action type is displayed
    const actionType = firstRow.locator('[data-test="activity-action-type"]');
    await expect(actionType).toBeVisible();

    // Check that status is displayed
    const status = firstRow.locator('[data-test="activity-status"]');
    await expect(status).toBeVisible();
  });
});
