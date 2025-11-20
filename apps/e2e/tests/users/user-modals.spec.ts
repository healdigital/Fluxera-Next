import { expect, test } from '@playwright/test';

import { UsersPageObject } from './users.po';

test.describe('User Modals - Invite User Modal', () => {
  test('opens invite user modal without navigation', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Get current URL before opening modal
    const listUrl = page.url();

    // Click invite user button
    await page.click('[data-test="invite-user-button"]');

    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal title
    await expect(modal).toContainText('Invite User', { ignoreCase: true });

    // Verify URL hasn't changed (no navigation)
    expect(page.url()).toBe(listUrl);

    // Verify background is dimmed
    const overlay = page.locator('[data-radix-dialog-overlay]');
    await expect(overlay).toBeVisible();
  });

  test('invites user and closes modal on success', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Fill form
    const memberEmail = users.auth.createRandomEmail();
    await page.fill('[data-test="user-email-input"]', memberEmail);
    await page.click('[data-test="user-role-select"]');
    await page.click('[data-test="role-option-member"]');

    // Submit
    await page.click('[data-test="submit-invite-user-button"]');

    // Verify modal closes
    await expect(modal).not.toBeVisible();

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('invited', { ignoreCase: true });

    // Verify user appears in list
    await expect(page.locator('[data-test^="user-row-"]', { hasText: memberEmail })).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Enter invalid email
    await page.fill('[data-test="user-email-input"]', 'invalid-email');

    // Try to submit
    await page.click('[data-test="submit-invite-user-button"]');

    // Verify validation error appears
    await expect(modal.locator('[data-test="user-email-error"]')).toBeVisible();
    await expect(modal.locator('[data-test="user-email-error"]')).toContainText('valid email', { ignoreCase: true });
  });

  test('checks for existing users', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug, email: ownerEmail } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Try to invite the owner (existing user)
    await page.fill('[data-test="user-email-input"]', ownerEmail);
    await page.click('[data-test="user-role-select"]');
    await page.click('[data-test="role-option-member"]');

    // Submit
    await page.click('[data-test="submit-invite-user-button"]');

    // Verify error message appears
    await expect(page.locator('[role="alert"]')).toContainText('already', { ignoreCase: true });
  });

  test('closes modal with Escape key', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('shows unsaved changes warning', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Make changes
    await page.fill('[data-test="user-email-input"]', 'test@example.com');

    // Try to close with Escape
    await page.keyboard.press('Escape');

    // Verify warning dialog appears
    const warningDialog = page.locator('[role="alertdialog"]');
    await expect(warningDialog).toBeVisible();
    await expect(warningDialog).toContainText('unsaved changes', { ignoreCase: true });

    // Cancel closing
    await page.click('[data-test="cancel-close-button"]');

    // Verify modal is still open
    await expect(modal).toBeVisible();
  });
});

test.describe('User Modals - Edit User Modal', () => {
  test('opens edit user modal from list', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user first
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Get current URL
    const listUrl = page.url();

    // Click on user row to open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal contains user details
    await expect(modal).toContainText(memberEmail);

    // Verify URL hasn't changed
    expect(page.url()).toBe(listUrl);
  });

  test('displays role change confirmation dialog', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click change role button
    await modal.locator('[data-test="change-role-button"]').click();

    // Verify role change dialog opens
    const roleDialog = page.locator('[role="dialog"]').last();
    await expect(roleDialog).toBeVisible();
    await expect(roleDialog).toContainText('Change Role', { ignoreCase: true });

    // Select new role
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');

    // Verify confirmation message appears
    await expect(roleDialog).toContainText('permission', { ignoreCase: true });
  });

  test('changes user role and updates display', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify initial role
    await expect(modal.locator('[data-test="user-role-display"]')).toContainText('member', { ignoreCase: true });

    // Change role
    await modal.locator('[data-test="change-role-button"]').click();
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');
    await page.click('[data-test="confirm-role-change-button"]');

    // Wait for update
    await page.waitForTimeout(1500);

    // Verify success toast
    await expect(page.locator('[role="status"]')).toContainText('role', { ignoreCase: true });

    // Verify role is updated in modal
    await expect(modal.locator('[data-test="user-role-display"]')).toContainText('owner', { ignoreCase: true });
  });

  test('explains permission changes on role change', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    // Open role change dialog
    await page.locator('[data-test="change-role-button"]').click();

    const roleDialog = page.locator('[role="dialog"]').last();
    await expect(roleDialog).toBeVisible();

    // Select new role
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');

    // Verify permission explanation is displayed
    const permissionExplanation = roleDialog.locator('[data-test="permission-explanation"]');
    await expect(permissionExplanation).toBeVisible();
    await expect(permissionExplanation).toContainText('permission', { ignoreCase: true });
  });

  test('updates user list after role change', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    // Change role
    await page.locator('[data-test="change-role-button"]').click();
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');
    await page.click('[data-test="confirm-role-change-button"]');

    // Wait for update
    await page.waitForTimeout(1500);

    // Close modal
    await page.keyboard.press('Escape');

    // Verify role is updated in list
    const updatedUserRow = await users.getUserByEmail(memberEmail);
    await expect(updatedUserRow).toContainText('owner', { ignoreCase: true });
  });
});

test.describe('User Modals - Role Change Confirmation', () => {
  test('requires confirmation for role changes', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    // Open role change dialog
    await page.locator('[data-test="change-role-button"]').click();

    const roleDialog = page.locator('[role="dialog"]').last();
    await expect(roleDialog).toBeVisible();

    // Select new role
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');

    // Verify confirm button is present
    const confirmButton = roleDialog.locator('[data-test="confirm-role-change-button"]');
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toBeEnabled();

    // Verify cancel button is present
    const cancelButton = roleDialog.locator('[data-test="cancel-role-change-button"]');
    await expect(cancelButton).toBeVisible();
  });

  test('cancels role change without updating', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    const modal = page.locator('[role="dialog"]');

    // Verify initial role
    await expect(modal.locator('[data-test="user-role-display"]')).toContainText('member', { ignoreCase: true });

    // Open role change dialog
    await page.locator('[data-test="change-role-button"]').click();

    // Select new role
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');

    // Cancel
    await page.click('[data-test="cancel-role-change-button"]');

    // Verify role dialog is closed
    await page.waitForTimeout(500);

    // Verify role hasn't changed
    await expect(modal.locator('[data-test="user-role-display"]')).toContainText('member', { ignoreCase: true });
  });

  test('shows different permissions for different roles', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Invite a user
    await users.clickInviteUser();
    const memberEmail = users.auth.createRandomEmail();
    await users.inviteUser({
      email: memberEmail,
      role: 'member',
    });

    // Open edit modal
    const userRow = await users.getUserByEmail(memberEmail);
    await userRow.click();

    // Open role change dialog
    await page.locator('[data-test="change-role-button"]').click();

    const roleDialog = page.locator('[role="dialog"]').last();

    // Select owner role
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-owner"]');

    // Get permission explanation for owner
    const ownerPermissions = await roleDialog.locator('[data-test="permission-explanation"]').textContent();

    // Change to admin role
    await page.click('[data-test="new-role-select"]');
    await page.click('[data-test="role-option-admin"]');

    // Get permission explanation for admin
    const adminPermissions = await roleDialog.locator('[data-test="permission-explanation"]').textContent();

    // Verify permissions are different
    expect(ownerPermissions).not.toBe(adminPermissions);
  });
});

test.describe('User Modals - Email Validation', () => {
  test('validates email format in real-time', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Enter invalid email
    await page.fill('[data-test="user-email-input"]', 'invalid');

    // Blur the field to trigger validation
    await page.click('[data-test="user-role-select"]');

    // Verify validation error appears
    await expect(modal.locator('[data-test="user-email-error"]')).toBeVisible();
  });

  test('clears validation error when valid email is entered', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Enter invalid email
    await page.fill('[data-test="user-email-input"]', 'invalid');
    await page.click('[data-test="user-role-select"]');

    // Verify error appears
    await expect(modal.locator('[data-test="user-email-error"]')).toBeVisible();

    // Enter valid email
    await page.fill('[data-test="user-email-input"]', 'valid@example.com');

    // Verify error is cleared
    await expect(modal.locator('[data-test="user-email-error"]')).not.toBeVisible();
  });

  test('prevents submission with invalid email', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Enter invalid email
    await page.fill('[data-test="user-email-input"]', 'not-an-email');
    await page.click('[data-test="user-role-select"]');
    await page.click('[data-test="role-option-member"]');

    // Try to submit
    await page.click('[data-test="submit-invite-user-button"]');

    // Verify modal is still open (submission prevented)
    await expect(modal).toBeVisible();

    // Verify error is displayed
    await expect(modal.locator('[data-test="user-email-error"]')).toBeVisible();
  });
});

test.describe('User Modals - Keyboard Accessibility', () => {
  test('focus trap keeps focus within modal', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Open invite modal
    await page.click('[data-test="invite-user-button"]');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Tab through focusable elements
    await page.keyboard.press('Tab');

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

  test('restores focus to trigger on close', async ({ page }) => {
    const users = new UsersPageObject(page);
    const { slug } = await users.setup();

    // Focus on invite button
    const inviteButton = page.locator('[data-test="invite-user-button"]');
    await inviteButton.focus();

    // Open modal
    await inviteButton.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Verify focus is restored to invite button
    await page.waitForTimeout(500);
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-test'));
    expect(focusedElement).toBe('invite-user-button');
  });
});
