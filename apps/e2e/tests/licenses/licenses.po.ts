import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';
import { TeamAccountsPageObject } from '../team-accounts/team-accounts.po';

export class LicensesPageObject {
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

    // Navigate to licenses page
    await this.page.goto(`/home/${slug}/licenses`);

    return {
      email,
      teamName,
      slug,
    };
  }

  async navigateToLicenses(slug: string) {
    await this.page.goto(`/home/${slug}/licenses`);
    await this.page.waitForURL(`**/home/${slug}/licenses`);
  }

  async clickNewLicense() {
    await this.page.click('[data-test="new-license-button"]');
    await this.page.waitForURL('**/licenses/new');
  }

  async fillCreateLicenseForm(data: {
    name: string;
    vendor: string;
    licenseKey: string;
    licenseType?: string;
    purchaseDate?: string;
    expirationDate?: string;
    cost?: string;
    notes?: string;
  }) {
    await this.page.fill('[data-test="license-name-input"]', data.name);
    await this.page.fill('[data-test="license-vendor-input"]', data.vendor);
    await this.page.fill('[data-test="license-key-input"]', data.licenseKey);

    if (data.licenseType) {
      await this.page.click('[data-test="license-type-select"]');
      await this.page.click(`[data-test="license-type-option-${data.licenseType}"]`);
    }

    if (data.purchaseDate) {
      await this.page.fill('[data-test="license-purchase-date-input"]', data.purchaseDate);
    }

    if (data.expirationDate) {
      await this.page.fill('[data-test="license-expiration-date-input"]', data.expirationDate);
    }

    if (data.cost) {
      await this.page.fill('[data-test="license-cost-input"]', data.cost);
    }

    if (data.notes) {
      await this.page.fill('[data-test="license-notes-input"]', data.notes);
    }
  }

  async submitCreateLicenseForm() {
    const submitButton = this.page.locator('[data-test="submit-create-license-button"]');
    await submitButton.click();
  }

  async createLicense(data: {
    name: string;
    vendor: string;
    licenseKey: string;
    licenseType?: string;
    purchaseDate?: string;
    expirationDate?: string;
    cost?: string;
    notes?: string;
  }) {
    await this.fillCreateLicenseForm(data);
    await this.submitCreateLicenseForm();
    await this.page.waitForURL('**/licenses', { timeout: 10000 });
  }

  async getLicenseByName(name: string) {
    return this.page.locator('[data-test="license-name-cell"]', {
      hasText: name,
    });
  }

  async clickLicenseByName(name: string) {
    const licenseCell = await this.getLicenseByName(name);
    await licenseCell.click();
    await this.page.waitForURL('**/licenses/*', { timeout: 10000 });
  }

  async clickEditLicense() {
    await this.page.click('[data-test="edit-license-button"]');
    await this.page.waitForURL('**/edit');
  }

  async fillEditLicenseForm(data: {
    name?: string;
    vendor?: string;
    licenseKey?: string;
    licenseType?: string;
    purchaseDate?: string;
    expirationDate?: string;
    cost?: string;
    notes?: string;
  }) {
    if (data.name) {
      await this.page.fill('[data-test="license-name-input"]', data.name);
    }

    if (data.vendor) {
      await this.page.fill('[data-test="license-vendor-input"]', data.vendor);
    }

    if (data.licenseKey) {
      await this.page.fill('[data-test="license-key-input"]', data.licenseKey);
    }

    if (data.licenseType) {
      await this.page.click('[data-test="license-type-select"]');
      await this.page.click(`[data-test="license-type-option-${data.licenseType}"]`);
    }

    if (data.purchaseDate) {
      await this.page.fill('[data-test="license-purchase-date-input"]', data.purchaseDate);
    }

    if (data.expirationDate) {
      await this.page.fill('[data-test="license-expiration-date-input"]', data.expirationDate);
    }

    if (data.cost) {
      await this.page.fill('[data-test="license-cost-input"]', data.cost);
    }

    if (data.notes) {
      await this.page.fill('[data-test="license-notes-input"]', data.notes);
    }
  }

  async submitEditLicenseForm() {
    const submitButton = this.page.locator('[data-test="submit-edit-license-button"]');
    await submitButton.click();
  }

  async updateLicense(data: {
    name?: string;
    vendor?: string;
    licenseKey?: string;
    licenseType?: string;
    purchaseDate?: string;
    expirationDate?: string;
    cost?: string;
    notes?: string;
  }) {
    await this.fillEditLicenseForm(data);
    await this.submitEditLicenseForm();
    await this.page.waitForURL('**/licenses/*', { timeout: 10000 });
  }

  async openDeleteLicenseDialog() {
    await this.page.click('[data-test="delete-license-button"]');
    await expect(this.page.locator('[data-test="delete-license-dialog"]')).toBeVisible();
  }

  async confirmDeleteLicense() {
    await this.page.click('[data-test="confirm-delete-license-button"]');
    await this.page.waitForURL('**/licenses', { timeout: 10000 });
  }

  async deleteLicense() {
    await this.openDeleteLicenseDialog();
    await this.confirmDeleteLicense();
  }

  async openAssignToUserDialog() {
    await this.page.click('[data-test="assign-to-user-button"]');
    await expect(this.page.locator('[data-test="assign-license-to-user-dialog"]')).toBeVisible();
  }

  async selectUserForAssignment(userId: string) {
    await this.page.click('[data-test="assign-user-select"]');
    await this.page.click(`[data-test="user-option-${userId}"]`);
  }

  async fillAssignmentNotes(notes: string) {
    await this.page.fill('[data-test="assignment-notes-input"]', notes);
  }

  async confirmAssignToUser() {
    await this.page.click('[data-test="confirm-assign-to-user-button"]');
    await this.page.waitForTimeout(1000);
  }

  async assignLicenseToUser(userId: string, notes?: string) {
    await this.openAssignToUserDialog();
    await this.selectUserForAssignment(userId);
    
    if (notes) {
      await this.fillAssignmentNotes(notes);
    }
    
    await this.confirmAssignToUser();
  }

  async openAssignToAssetDialog() {
    await this.page.click('[data-test="assign-to-asset-button"]');
    await expect(this.page.locator('[data-test="assign-license-to-asset-dialog"]')).toBeVisible();
  }

  async selectAssetForAssignment(assetId: string) {
    await this.page.click('[data-test="assign-asset-select"]');
    await this.page.click(`[data-test="asset-option-${assetId}"]`);
  }

  async confirmAssignToAsset() {
    await this.page.click('[data-test="confirm-assign-to-asset-button"]');
    await this.page.waitForTimeout(1000);
  }

  async assignLicenseToAsset(assetId: string, notes?: string) {
    await this.openAssignToAssetDialog();
    await this.selectAssetForAssignment(assetId);
    
    if (notes) {
      await this.fillAssignmentNotes(notes);
    }
    
    await this.confirmAssignToAsset();
  }

  async unassignLicense(assignmentId: string) {
    await this.page.click(`[data-test="unassign-button-${assignmentId}"]`);
    await this.page.click('[data-test="confirm-unassign-button"]');
    await this.page.waitForTimeout(1000);
  }

  async applySearchFilter(searchTerm: string) {
    await this.page.fill('[data-test="license-search-input"]', searchTerm);
    await this.page.waitForTimeout(500);
  }

  async applyVendorFilter(vendor: string) {
    await this.page.click('[data-test="vendor-filter-trigger"]');
    await this.page.click(`[data-test="vendor-filter-${vendor}"]`);
    await this.page.waitForTimeout(500);
  }

  async applyLicenseTypeFilter(licenseType: string) {
    await this.page.click('[data-test="license-type-filter-trigger"]');
    await this.page.click(`[data-test="license-type-filter-${licenseType}"]`);
    await this.page.waitForTimeout(500);
  }

  async applyExpirationStatusFilter(status: string) {
    await this.page.click('[data-test="expiration-status-filter-trigger"]');
    await this.page.click(`[data-test="expiration-status-filter-${status}"]`);
    await this.page.waitForTimeout(500);
  }

  async clearFilters() {
    await this.page.click('[data-test="clear-filters-button"]');
    await this.page.waitForTimeout(500);
  }

  async exportLicenses() {
    await this.page.click('[data-test="export-licenses-button"]');
    await this.page.waitForTimeout(1000);
  }

  getAssignmentsList() {
    return this.page.locator('[data-test="license-assignments-list"]');
  }

  getAssignmentRows() {
    return this.page.locator('[data-test^="assignment-row-"]');
  }

  async getAssignmentRowCount() {
    const rows = this.getAssignmentRows();
    return rows.count();
  }

  getExpirationBadge() {
    return this.page.locator('[data-test="expiration-badge"]');
  }

  getLicenseDetailView() {
    return this.page.locator('[data-test="license-detail-view"]');
  }

  async getLicenseRows() {
    return this.page.locator('[data-test^="license-card-"]');
  }

  async getLicenseRowCount() {
    const rows = await this.getLicenseRows();
    return rows.count();
  }

  getDeleteWarningMessage() {
    return this.page.locator('[data-test="delete-warning-message"]');
  }

  getAssignmentCountBadge() {
    return this.page.locator('[data-test="assignment-count-badge"]');
  }
}
