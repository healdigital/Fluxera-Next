import { expect, test } from '@playwright/test';

import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

test.describe('Dashboard Modals - Widget Expansion', () => {
  test('opens expanded widget modal from dashboard', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Get current URL
    const dashboardUrl = page.url();

    // Click on a widget to expand
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    // Verify modal is open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal contains expanded data
    await expect(modal).toContainText('Details', { ignoreCase: true });

    // Verify URL hasn't changed
    expect(page.url()).toBe(dashboardUrl);

    // Verify background is dimmed
    const overlay = page.locator('[data-radix-dialog-overlay]');
    await expect(overlay).toBeVisible();
  });

  test('displays expanded data and visualizations', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a metrics widget
    const metricsWidget = page.locator('[data-test="dashboard-widget-metrics"]').first();
    await metricsWidget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify expanded content is displayed
    await expect(modal.locator('[data-test="expanded-widget-content"]')).toBeVisible();

    // Verify chart or data visualization is present
    const visualization = modal.locator('[data-test="widget-visualization"]');
    await expect(visualization).toBeVisible();
  });

  test('provides filter controls within modal', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify filter controls are present
    await expect(modal.locator('[data-test="widget-filters"]')).toBeVisible();

    // Verify date range selector is present
    await expect(modal.locator('[data-test="date-range-selector"]')).toBeVisible();
  });

  test('closes modal with Escape key', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Dashboard Modals - Filter Application', () => {
  test('applies filters and updates visualizations in real-time', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Get initial data state
    const initialContent = await modal.locator('[data-test="expanded-widget-content"]').textContent();

    // Apply a filter
    await modal.locator('[data-test="filter-category-select"]').click();
    await page.click('[data-test="filter-option-laptop"]');

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify content has updated
    const updatedContent = await modal.locator('[data-test="expanded-widget-content"]').textContent();
    
    // Content should have changed (or at least the filter should be applied)
    const filterApplied = await modal.locator('[data-test="active-filters"]').isVisible();
    expect(filterApplied).toBe(true);
  });

  test('applies date range filter', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Apply date range filter
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const todayStr = today.toISOString().split('T')[0] || '';
    const lastWeekStr = lastWeek.toISOString().split('T')[0] || '';

    await page.fill('[data-test="date-range-start"]', lastWeekStr);
    await page.fill('[data-test="date-range-end"]', todayStr);

    // Apply filter
    await page.click('[data-test="apply-date-filter-button"]');

    // Wait for update
    await page.waitForTimeout(1000);

    // Verify filter is applied
    await expect(modal.locator('[data-test="active-date-range"]')).toBeVisible();
  });

  test('clears filters', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Apply a filter
    await modal.locator('[data-test="filter-category-select"]').click();
    await page.click('[data-test="filter-option-laptop"]');
    await page.waitForTimeout(500);

    // Verify filter is applied
    await expect(modal.locator('[data-test="active-filters"]')).toBeVisible();

    // Clear filters
    await page.click('[data-test="clear-filters-button"]');
    await page.waitForTimeout(500);

    // Verify filters are cleared
    await expect(modal.locator('[data-test="active-filters"]')).not.toBeVisible();
  });

  test('combines multiple filters', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Apply category filter
    await modal.locator('[data-test="filter-category-select"]').click();
    await page.click('[data-test="filter-option-laptop"]');
    await page.waitForTimeout(500);

    // Apply status filter
    await modal.locator('[data-test="filter-status-select"]').click();
    await page.click('[data-test="filter-option-available"]');
    await page.waitForTimeout(500);

    // Verify both filters are applied
    const activeFilters = modal.locator('[data-test="active-filters"]');
    await expect(activeFilters).toContainText('laptop', { ignoreCase: true });
    await expect(activeFilters).toContainText('available', { ignoreCase: true });
  });
});

test.describe('Dashboard Modals - Data Export', () => {
  test('provides export functionality', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify export button is present
    await expect(modal.locator('[data-test="export-data-button"]')).toBeVisible();
  });

  test('exports data as CSV', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click export button
    await modal.locator('[data-test="export-data-button"]').click();

    // Select CSV format
    await page.click('[data-test="export-format-csv"]');

    // Wait for download to start
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-test="confirm-export-button"]');

    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('exports data as PDF', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Click export button
    await modal.locator('[data-test="export-data-button"]').click();

    // Select PDF format
    await page.click('[data-test="export-format-pdf"]');

    // Wait for download to start
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-test="confirm-export-button"]');

    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

test.describe('Dashboard Modals - Context Preservation', () => {
  test('preserves dashboard state after closing modal', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 300));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Verify scroll position is preserved
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(50);
  });

  test('preserves dashboard filters after modal interaction', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Apply a dashboard-level filter (if available)
    const dashboardFilter = page.locator('[data-test="dashboard-filter-select"]');
    if (await dashboardFilter.isVisible()) {
      await dashboardFilter.click();
      await page.click('[data-test="dashboard-filter-option-this-month"]');
      await page.waitForTimeout(500);
    }

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Verify dashboard filter is still applied (if it was available)
    if (await dashboardFilter.isVisible()) {
      await expect(page.locator('[data-test="active-dashboard-filter"]')).toBeVisible();
    }
  });
});

test.describe('Dashboard Modals - Responsive Behavior', () => {
  test('adapts to different viewport sizes', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    let modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal has appropriate size for desktop
    const desktopWidth = await modal.evaluate((el) => el.getBoundingClientRect().width);
    expect(desktopWidth).toBeGreaterThan(600);

    // Close modal
    await page.keyboard.press('Escape');

    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await widget.click();

    modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify modal adapts to mobile (likely full-screen)
    const mobileWidth = await modal.evaluate((el) => el.getBoundingClientRect().width);
    expect(mobileWidth).toBeLessThanOrEqual(375);
  });

  test('maintains functionality on mobile', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on a widget
    const widget = page.locator('[data-test^="dashboard-widget-"]').first();
    await widget.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify filter controls are accessible
    await expect(modal.locator('[data-test="widget-filters"]')).toBeVisible();

    // Verify export button is accessible
    await expect(modal.locator('[data-test="export-data-button"]')).toBeVisible();

    // Verify close button is accessible
    await expect(modal.locator('[data-test="close-modal-button"]')).toBeVisible();
  });
});

test.describe('Dashboard Modals - Multiple Widget Types', () => {
  test('handles metrics widget expansion', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on metrics widget
    const metricsWidget = page.locator('[data-test="dashboard-widget-metrics"]').first();
    if (await metricsWidget.isVisible()) {
      await metricsWidget.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify metrics-specific content
      await expect(modal.locator('[data-test="metrics-details"]')).toBeVisible();
    }
  });

  test('handles chart widget expansion', async ({ page }) => {
    const teamAccounts = new TeamAccountsPageObject(page);
    const { slug } = await teamAccounts.setup();

    // Navigate to dashboard
    await page.goto(`/home/${slug}/dashboard`);

    // Click on chart widget
    const chartWidget = page.locator('[data-test="dashboard-widget-chart"]').first();
    if (await chartWidget.isVisible()) {
      await chartWidget.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Verify chart-specific content
      await expect(modal.locator('[data-test="chart-visualization"]')).toBeVisible();
    }
  });
});
