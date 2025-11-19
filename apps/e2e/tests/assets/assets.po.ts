import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

export class AssetsPageObject {
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

    // Navigate to assets page
    await this.page.goto(`/home/${slug}/assets`);

    return {
      email,
      teamName,
      slug,
    };
  }

  async navigateToAssets(slug: string) {
    await this.page.goto(`/home/${slug}/assets`);
    await this.page.waitForURL(`**/home/${slug}/assets`);
  }

  async clickNewAsset() {
    await this.page.click('[data-test="new-asset-button"]');
    await this.page.waitForURL('**/assets/new');
  }

  async fillCreateAssetForm(data: {
    name: string;
    category?: string;
    status?: string;
    description?: string;
  }) {
    await this.page.fill('[data-test="asset-name-input"]', data.name);

    if (data.category) {
      await this.page.click('[data-test="asset-category-select"]');
      await this.page.click(`[data-test="category-option-${data.category}"]`);
    }

    if (data.status) {
      await this.page.click('[data-test="asset-status-select"]');
      await this.page.click(`[data-test="status-option-${data.status}"]`);
    }

    if (data.description) {
      await this.page.fill(
        '[data-test="asset-description-input"]',
        data.description,
      );
    }
  }

  async submitCreateAssetForm() {
    const submitButton = this.page.locator(
      '[data-test="submit-create-asset-button"]',
    );
    await submitButton.click();
  }

  async createAsset(data: {
    name: string;
    category?: string;
    status?: string;
    description?: string;
  }) {
    await this.fillCreateAssetForm(data);
    await this.submitCreateAssetForm();
    await this.page.waitForURL('**/assets', { timeout: 10000 });
  }

  async getAssetByName(name: string) {
    return this.page.locator('[data-test="asset-name-cell"]', {
      hasText: name,
    });
  }

  async clickAssetByName(name: string) {
    const assetCell = await this.getAssetByName(name);
    await assetCell.click();
    await this.page.waitForURL('**/assets/*', { timeout: 10000 });
  }

  async applySearchFilter(searchTerm: string) {
    await this.page.fill('[data-test="asset-search-input"]', searchTerm);
    // Wait for the URL to update with search params
    await this.page.waitForTimeout(500);
  }

  async applyCategoryFilter(category: string) {
    await this.page.click('[data-test="category-filter-trigger"]');
    await this.page.click(`[data-test="category-filter-${category}"]`);
    // Wait for the filter to apply
    await this.page.waitForTimeout(500);
  }

  async applyStatusFilter(status: string) {
    await this.page.click('[data-test="status-filter-trigger"]');
    await this.page.click(`[data-test="status-filter-${status}"]`);
    // Wait for the filter to apply
    await this.page.waitForTimeout(500);
  }

  async clearFilters() {
    await this.page.click('[data-test="clear-filters-button"]');
    await this.page.waitForTimeout(500);
  }

  async assignAssetToUser(userId: string) {
    await this.page.click('[data-test="assign-asset-button"]');
    await expect(
      this.page.locator('[data-test="assign-asset-dialog"]'),
    ).toBeVisible();

    await this.page.click('[data-test="assign-user-select"]');
    await this.page.click(`[data-test="member-option-${userId}"]`);
    await this.page.click('[data-test="confirm-assign-button"]');

    // Wait for the dialog to close and page to reload
    await this.page.waitForTimeout(1000);
  }

  getHistoryCard() {
    return this.page.locator('[data-test="asset-history-card"]');
  }

  getHistoryEntries() {
    return this.page.locator('[data-test^="history-entry-"]');
  }

  getHistoryEntryByType(eventType: string) {
    return this.page.locator(`[data-test="history-entry-${eventType}"]`);
  }

  getAssetBadges() {
    return this.page.locator('[data-test="asset-badges"]');
  }

  getAssetStatusBadge() {
    return this.page.locator('[data-test="asset-status-badge"]');
  }

  getAssignedUserInfo() {
    return this.page.locator('[data-test="assigned-user-info"]');
  }

  getAssignedUserName() {
    return this.page.locator('[data-test="assigned-user-name"]');
  }

  async getAssetRows() {
    return this.page.locator('[data-test^="asset-row-"]');
  }

  async getAssetRowCount() {
    const rows = await this.getAssetRows();
    return rows.count();
  }
}
