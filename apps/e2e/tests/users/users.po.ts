import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

export class UsersPageObject {
  private readonly page: Page;
  public auth: AuthPageObject;
  public teamAccounts: TeamAccountsPageObject;

  constructor(page: Page) {
    this.page = page;
    this.auth = new AuthPageObject(page);
    this.teamAccounts = new TeamAccountsPageObject(page);
  }

  async setup(params = this.teamAccounts.createTeamName()) {
    const { email, teamName, slug } = await this.teamAccounts.setup(params);

    // Navigate to users page
    await this.page.goto(`/home/${slug}/users`);

    return {
      email,
      teamName,
      slug,
    };
  }

  async navigateToUsers(slug: string) {
    await this.page.goto(`/home/${slug}/users`);
    await this.page.waitForURL(`**/home/${slug}/users`);
  }

  async clickInviteUser() {
    await this.page.click('[data-test="invite-user-button"]');
    await this.page.waitForURL('**/users/new');
  }

  async fillInviteUserForm(data: {
    email: string;
    role?: string;
    sendInvitation?: boolean;
  }) {
    await this.page.fill('[data-test="user-email-input"]', data.email);

    if (data.role) {
      await this.page.click('[data-test="user-role-select"]');
      await this.page.click(`[data-test="role-option-${data.role}"]`);
    }

    if (data.sendInvitation !== undefined) {
      const checkbox = this.page.locator('[data-test="send-invitation-checkbox"]');
      const isChecked = await checkbox.isChecked();
      
      if (isChecked !== data.sendInvitation) {
        await checkbox.click();
      }
    }
  }

  async submitInviteUserForm() {
    const submitButton = this.page.locator('[data-test="submit-invite-user-button"]');
    await submitButton.click();
  }

  async inviteUser(data: {
    email: string;
    role?: string;
    sendInvitation?: boolean;
  }) {
    await this.fillInviteUserForm(data);
    await this.submitInviteUserForm();
    await this.page.waitForURL('**/users', { timeout: 10000 });
  }

  async getUserByName(name: string) {
    return this.page.locator('[data-test="user-name-cell"]', {
      hasText: name,
    });
  }

  async getUserByEmail(email: string) {
    return this.page.locator(`[data-test^="user-row-"]`, {
      hasText: email,
    });
  }

  async clickUserByEmail(email: string) {
    const userRow = await this.getUserByEmail(email);
    await userRow.click();
    await this.page.waitForURL('**/users/*', { timeout: 10000 });
  }

  async openAssignRoleDialog() {
    await this.page.click('[data-test="assign-role-button"]');
    await expect(
      this.page.locator('[data-test="assign-role-dialog"]'),
    ).toBeVisible();
  }

  async selectNewRole(role: string) {
    await this.page.click('[data-test="new-role-select"]');
    await this.page.click(`[data-test="role-option-${role}"]`);
  }

  async confirmRoleChange() {
    await this.page.click('[data-test="confirm-assign-role-button"]');
    // Wait for the dialog to close
    await this.page.waitForTimeout(1000);
  }

  async changeUserRole(role: string) {
    await this.openAssignRoleDialog();
    await this.selectNewRole(role);
    await this.confirmRoleChange();
  }

  async openChangeStatusDialog() {
    await this.page.click('[data-test="change-status-button"]');
    await expect(
      this.page.locator('[data-test="change-status-dialog"]'),
    ).toBeVisible();
  }

  async selectNewStatus(status: string) {
    await this.page.click('[data-test="new-status-select"]');
    await this.page.click(`[data-test="status-option-${status}"]`);
  }

  async fillStatusChangeReason(reason: string) {
    await this.page.fill('[data-test="status-change-reason"]', reason);
  }

  async confirmStatusChange() {
    await this.page.click('[data-test="confirm-change-status-button"]');
    // Wait for the dialog to close
    await this.page.waitForTimeout(1000);
  }

  async changeUserStatus(status: string, reason?: string) {
    await this.openChangeStatusDialog();
    await this.selectNewStatus(status);
    
    if (reason) {
      await this.fillStatusChangeReason(reason);
    }
    
    await this.confirmStatusChange();
  }

  async navigateToUserActivity(userId: string, slug: string) {
    await this.page.goto(`/home/${slug}/users/${userId}/activity`);
    await this.page.waitForURL(`**/users/${userId}/activity`);
  }

  async applyActivityActionTypeFilter(actionType: string) {
    await this.page.click('[data-test="activity-action-type-filter"]');
    await this.page.click(`[data-test="action-type-${actionType}"]`);
  }

  async applyActivityDateRangeFilter(startDate: string, endDate: string) {
    await this.page.fill('[data-test="activity-start-date-input"]', startDate);
    await this.page.fill('[data-test="activity-end-date-input"]', endDate);
  }

  async applyActivityFilters() {
    await this.page.click('[data-test="apply-activity-filters-button"]');
    // Wait for the filter to apply
    await this.page.waitForTimeout(500);
  }

  async clearActivityFilters() {
    await this.page.click('[data-test="clear-activity-filters-button"]');
    await this.page.waitForTimeout(500);
  }

  getActivityRows() {
    return this.page.locator('[data-test^="activity-row-"]');
  }

  async getActivityRowCount() {
    const rows = this.getActivityRows();
    return rows.count();
  }

  getActivityRowByActionType(actionType: string) {
    return this.page.locator('[data-test^="activity-row-"]', {
      has: this.page.locator('[data-test="activity-action-type"]', {
        hasText: actionType,
      }),
    });
  }

  async getUserRows() {
    return this.page.locator('[data-test^="user-row-"]');
  }

  async getUserRowCount() {
    const rows = await this.getUserRows();
    return rows.count();
  }
}
