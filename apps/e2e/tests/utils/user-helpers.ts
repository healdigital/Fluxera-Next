import { Page, expect } from '@playwright/test';

/**
 * User management test helpers
 * Provides reusable functions for E2E tests involving user management
 */

export interface InviteUserData {
  email: string;
  role?: string;
  sendInvitation?: boolean;
}

export interface ChangeUserRoleData {
  newRole: string;
}

export interface ChangeUserStatusData {
  newStatus: string;
  reason?: string;
}

export interface FilterUsersData {
  search?: string;
  role?: string;
  status?: string;
}

export interface FilterActivityData {
  actionType?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Invites a new user to the team
 */
export async function inviteUser(
  page: Page,
  data: InviteUserData,
): Promise<void> {
  // Click the invite user button
  await page.click('[data-test="invite-user-button"]');
  await page.waitForURL('**/users/new');

  // Fill required fields
  await page.fill('[data-test="user-email-input"]', data.email);

  // Fill optional fields
  if (data.role) {
    await page.click('[data-test="user-role-select"]');
    await page.click(`[data-test="role-option-${data.role}"]`);
  }

  if (data.sendInvitation !== undefined) {
    const checkbox = page.locator('[data-test="send-invitation-checkbox"]');
    const isChecked = await checkbox.isChecked();
    
    if (isChecked !== data.sendInvitation) {
      await checkbox.click();
    }
  }

  // Submit the form
  await page.click('[data-test="submit-invite-user-button"]');
  
  // Wait for navigation back to users list
  await page.waitForURL('**/users', { timeout: 10000 });
  
  // Wait for success toast
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Changes a user's role
 */
export async function changeUserRole(
  page: Page,
  userEmail: string,
  data: ChangeUserRoleData,
): Promise<void> {
  // Find and click the user
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  // Click assign role button
  await page.click('[data-test="assign-role-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="assign-role-dialog"]'),
  ).toBeVisible();

  // Select new role
  await page.click('[data-test="new-role-select"]');
  await page.click(`[data-test="role-option-${data.newRole}"]`);

  // Confirm role change
  await page.click('[data-test="confirm-assign-role-button"]');

  // Wait for dialog to close and page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Changes a user's status
 */
export async function changeUserStatus(
  page: Page,
  userEmail: string,
  data: ChangeUserStatusData,
): Promise<void> {
  // Find and click the user
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  // Click change status button
  await page.click('[data-test="change-status-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="change-status-dialog"]'),
  ).toBeVisible();

  // Select new status
  await page.click('[data-test="new-status-select"]');
  await page.click(`[data-test="status-option-${data.newStatus}"]`);

  // Add reason if provided
  if (data.reason) {
    await page.fill('[data-test="status-change-reason"]', data.reason);
  }

  // Confirm status change
  await page.click('[data-test="confirm-change-status-button"]');

  // Wait for dialog to close and page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Applies filters to the users list
 */
export async function filterUsers(
  page: Page,
  filters: FilterUsersData,
): Promise<void> {
  // Apply search filter
  if (filters.search) {
    await page.fill('[data-test="user-search-input"]', filters.search);
    await page.waitForTimeout(500);
  }

  // Apply role filter
  if (filters.role) {
    await page.click('[data-test="role-filter-trigger"]');
    await page.click(`[data-test="role-filter-${filters.role}"]`);
    await page.waitForTimeout(500);
  }

  // Apply status filter
  if (filters.status) {
    await page.click('[data-test="status-filter-trigger"]');
    await page.click(`[data-test="status-filter-${filters.status}"]`);
    await page.waitForTimeout(500);
  }
}

/**
 * Clears all applied filters
 */
export async function clearUserFilters(page: Page): Promise<void> {
  await page.click('[data-test="clear-filters-button"]');
  await page.waitForTimeout(500);
}

/**
 * Gets the count of visible users in the list
 */
export async function getUserCount(page: Page): Promise<number> {
  const rows = page.locator('[data-test^="user-row-"]');
  return rows.count();
}

/**
 * Verifies that a user exists in the list
 */
export async function verifyUserExists(
  page: Page,
  userEmail: string,
): Promise<void> {
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await expect(userRow).toBeVisible();
}

/**
 * Verifies that a user has a specific role
 */
export async function verifyUserRole(
  page: Page,
  userEmail: string,
  expectedRole: string,
): Promise<void> {
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  const roleBadge = page.locator('[data-test="user-role-badge"]');
  await expect(roleBadge).toContainText(expectedRole, { ignoreCase: true });
}

/**
 * Verifies that a user has a specific status
 */
export async function verifyUserStatus(
  page: Page,
  userEmail: string,
  expectedStatus: string,
): Promise<void> {
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  const statusBadge = page.locator('[data-test="user-status-badge"]');
  await expect(statusBadge).toContainText(expectedStatus, { ignoreCase: true });
}

/**
 * Navigates to a user's activity log
 */
export async function navigateToUserActivity(
  page: Page,
  userEmail: string,
): Promise<void> {
  // Find and click the user
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  // Click activity tab
  await page.click('[data-test="activity-tab"]');
  await page.waitForTimeout(500);
}

/**
 * Applies filters to the activity log
 */
export async function filterActivity(
  page: Page,
  filters: FilterActivityData,
): Promise<void> {
  // Apply action type filter
  if (filters.actionType) {
    await page.click('[data-test="activity-action-type-filter"]');
    await page.click(`[data-test="action-type-${filters.actionType}"]`);
  }

  // Apply date range filter
  if (filters.startDate) {
    await page.fill('[data-test="activity-start-date-input"]', filters.startDate);
  }

  if (filters.endDate) {
    await page.fill('[data-test="activity-end-date-input"]', filters.endDate);
  }

  // Apply filters
  if (filters.actionType || filters.startDate || filters.endDate) {
    await page.click('[data-test="apply-activity-filters-button"]');
    await page.waitForTimeout(500);
  }
}

/**
 * Clears activity filters
 */
export async function clearActivityFilters(page: Page): Promise<void> {
  await page.click('[data-test="clear-activity-filters-button"]');
  await page.waitForTimeout(500);
}

/**
 * Gets the count of activity entries
 */
export async function getActivityCount(page: Page): Promise<number> {
  const rows = page.locator('[data-test^="activity-row-"]');
  return rows.count();
}

/**
 * Verifies that an activity entry exists with a specific action type
 */
export async function verifyActivityExists(
  page: Page,
  actionType: string,
): Promise<void> {
  const activityRow = page.locator('[data-test^="activity-row-"]', {
    has: page.locator('[data-test="activity-action-type"]', {
      hasText: actionType,
    }),
  });
  await expect(activityRow).toBeVisible();
}

/**
 * Exports user activity to CSV
 */
export async function exportActivity(page: Page): Promise<void> {
  await page.click('[data-test="export-activity-button"]');
  await page.waitForTimeout(1000);
}

/**
 * Edits a user's profile
 */
export async function editUserProfile(
  page: Page,
  userEmail: string,
  updates: {
    displayName?: string;
    phoneNumber?: string;
    department?: string;
    jobTitle?: string;
  },
): Promise<void> {
  // Find and click the user
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  // Click edit profile button
  await page.click('[data-test="edit-profile-button"]');
  
  // Wait for form to be visible
  await expect(
    page.locator('[data-test="edit-profile-form"]'),
  ).toBeVisible();

  // Update fields
  if (updates.displayName) {
    await page.fill('[data-test="display-name-input"]', updates.displayName);
  }

  if (updates.phoneNumber) {
    await page.fill('[data-test="phone-number-input"]', updates.phoneNumber);
  }

  if (updates.department) {
    await page.fill('[data-test="department-input"]', updates.department);
  }

  if (updates.jobTitle) {
    await page.fill('[data-test="job-title-input"]', updates.jobTitle);
  }

  // Submit the form
  await page.click('[data-test="submit-edit-profile-button"]');

  // Wait for page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Assigns assets to a user
 */
export async function assignAssetsToUser(
  page: Page,
  userEmail: string,
  assetIds: string[],
): Promise<void> {
  // Find and click the user
  const userRow = page.locator('[data-test^="user-row-"]', {
    hasText: userEmail,
  });
  await userRow.click();
  await page.waitForURL('**/users/*', { timeout: 10000 });

  // Click assign assets button
  await page.click('[data-test="assign-assets-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="assign-assets-dialog"]'),
  ).toBeVisible();

  // Select assets
  for (const assetId of assetIds) {
    await page.click(`[data-test="asset-checkbox-${assetId}"]`);
  }

  // Confirm assignment
  await page.click('[data-test="confirm-assign-assets-button"]');

  // Wait for dialog to close and page to update
  await page.waitForTimeout(1000);
  
  // Verify success
  await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Verifies that a user cannot deactivate themselves
 */
export async function verifySelfDeactivationPrevented(
  page: Page,
): Promise<void> {
  // Try to change own status to inactive
  await page.click('[data-test="change-status-button"]');
  
  // Wait for dialog to open
  await expect(
    page.locator('[data-test="change-status-dialog"]'),
  ).toBeVisible();

  // Try to select inactive status
  await page.click('[data-test="new-status-select"]');
  
  // Verify inactive option is disabled or shows warning
  const inactiveOption = page.locator('[data-test="status-option-inactive"]');
  const isDisabled = await inactiveOption.isDisabled();
  
  if (!isDisabled) {
    await inactiveOption.click();
    await page.click('[data-test="confirm-change-status-button"]');
    
    // Verify error message appears
    await expect(page.locator('[role="alert"]')).toContainText('cannot deactivate', {
      ignoreCase: true,
      timeout: 5000,
    });
  }
}
