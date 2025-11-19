import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

export class DashboardPageObject {
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

    // Navigate to dashboard page
    await this.page.goto(`/home/${slug}/dashboard`);
    await this.page.waitForURL(`**/home/${slug}/dashboard`);
    
    // Wait for the page to load
    await this.page.waitForTimeout(2000);

    return {
      email,
      teamName,
      slug,
    };
  }

  async navigateToDashboard(slug: string) {
    await this.page.goto(`/home/${slug}/dashboard`);
    await this.page.waitForURL(`**/home/${slug}/dashboard`);
  }

  // Metric getters
  getTotalAssetsMetric() {
    return this.page.locator('[data-test="metric-total-assets"]');
  }

  getAvailableAssetsMetric() {
    return this.page.locator('[data-test="metric-available-assets"]');
  }

  getAssignedAssetsMetric() {
    return this.page.locator('[data-test="metric-assigned-assets"]');
  }

  getTotalUsersMetric() {
    return this.page.locator('[data-test="metric-total-users"]');
  }

  getActiveUsersMetric() {
    return this.page.locator('[data-test="metric-active-users"]');
  }

  getTotalLicensesMetric() {
    return this.page.locator('[data-test="metric-total-licenses"]');
  }

  getExpiringLicensesMetric() {
    return this.page.locator('[data-test="metric-expiring-licenses"]');
  }

  // Widget getters
  getMetricsSummaryWidget() {
    return this.page.locator('[data-test="widget-metrics-summary"]');
  }

  getAssetStatusWidget() {
    return this.page.locator('[data-test="widget-asset-status"]');
  }

  getTrendChartWidget() {
    return this.page.locator('[data-test="widget-trend-chart"]');
  }

  getAlertsWidget() {
    return this.page.locator('[data-test="widget-alerts"]');
  }

  getQuickActionsWidget() {
    return this.page.locator('[data-test="widget-quick-actions"]');
  }

  // Live update indicator
  getLiveUpdateIndicator() {
    return this.page.locator('[data-test="live-update-indicator"]');
  }

  async waitForLiveUpdate() {
    // Wait for the "Updating..." text to appear
    await expect(this.getLiveUpdateIndicator()).toContainText('Updating...', {
      timeout: 5000,
    });
    
    // Wait for it to disappear (update complete)
    await expect(this.getLiveUpdateIndicator()).not.toContainText('Updating...', {
      timeout: 5000,
    });
  }

  // Filter actions
  async applyDateRangeFilter(range: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom') {
    await this.page.click('[data-test="date-range-filter-trigger"]');
    await this.page.click(`[data-test="date-range-option-${range}"]`);
    await this.page.waitForTimeout(500);
  }

  async applyCategoryFilter(category: string) {
    await this.page.click('[data-test="category-filter-trigger"]');
    await this.page.click(`[data-test="category-filter-${category}"]`);
    await this.page.waitForTimeout(500);
  }

  async clearFilters() {
    await this.page.click('[data-test="clear-dashboard-filters-button"]');
    await this.page.waitForTimeout(500);
  }

  // Chart interactions
  getChartContainer() {
    return this.page.locator('[data-test="trend-chart-container"]');
  }

  async getChartDataPoints() {
    // Wait for chart to render
    await this.page.waitForTimeout(1000);
    return this.page.locator('[data-test^="chart-data-point-"]');
  }

  // Alert interactions
  getAlertCards() {
    return this.page.locator('[data-test^="alert-card-"]');
  }

  async dismissAlert(alertId: string) {
    await this.page.click(`[data-test="dismiss-alert-${alertId}"]`);
    await this.page.waitForTimeout(500);
  }

  // Quick actions
  async clickQuickAction(action: 'create-asset' | 'invite-user' | 'add-license') {
    await this.page.click(`[data-test="quick-action-${action}"]`);
  }

  // Widget configuration
  async openWidgetConfiguration() {
    await this.page.click('[data-test="configure-widgets-button"]');
    await expect(
      this.page.locator('[data-test="configure-widgets-dialog"]'),
    ).toBeVisible();
  }

  async toggleWidgetVisibility(widgetType: string) {
    await this.page.click(`[data-test="toggle-widget-${widgetType}"]`);
  }

  async saveWidgetConfiguration() {
    await this.page.click('[data-test="save-widget-config-button"]');
    await this.page.waitForTimeout(500);
  }

  // Metric value extraction
  async getMetricValue(metricLocator: ReturnType<typeof this.getTotalAssetsMetric>): Promise<number> {
    const text = await metricLocator.textContent();
    if (!text) return 0;
    
    // Extract number from text (handles commas and other formatting)
    const match = text.match(/[\d,]+/);
    if (!match) return 0;
    
    return parseInt(match[0].replace(/,/g, ''), 10);
  }

  // Navigation helpers
  async navigateToAssets(slug: string) {
    await this.page.goto(`/home/${slug}/assets`);
    await this.page.waitForURL(`**/home/${slug}/assets`);
  }

  async navigateToUsers(slug: string) {
    await this.page.goto(`/home/${slug}/users`);
    await this.page.waitForURL(`**/home/${slug}/users`);
  }

  async navigateToLicenses(slug: string) {
    await this.page.goto(`/home/${slug}/licenses`);
    await this.page.waitForURL(`**/home/${slug}/licenses`);
  }
}
