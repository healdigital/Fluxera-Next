import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite
 * 
 * This test suite runs automated accessibility checks using axe-core
 * to ensure WCAG 2.1 Level AA compliance across all main pages.
 * 
 * Requirements: 6.1 - WCAG 2.1 Level AA accessibility standards
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(process.env.USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.USER_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/home\/.+/);
  });

  test('Dashboard page should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Assets list page should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account/assets');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Asset detail page should not have accessibility violations', async ({ page }) => {
    // Navigate to assets list
    await page.goto('/home/test-account/assets');
    await page.waitForLoadState('networkidle');

    // Click on first asset if available
    const firstAsset = page.getByTestId('asset-card').first();
    if (await firstAsset.isVisible()) {
      await firstAsset.click();
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('Licenses list page should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account/licenses');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('License detail page should not have accessibility violations', async ({ page }) => {
    // Navigate to licenses list
    await page.goto('/home/test-account/licenses');
    await page.waitForLoadState('networkidle');

    // Click on first license if available
    const firstLicense = page.getByTestId('license-card').first();
    if (await firstLicense.isVisible()) {
      await firstLicense.click();
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('Users list page should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account/users');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('User detail page should not have accessibility violations', async ({ page }) => {
    // Navigate to users list
    await page.goto('/home/test-account/users');
    await page.waitForLoadState('networkidle');

    // Click on first user if available
    const firstUser = page.getByTestId('user-card').first();
    if (await firstUser.isVisible()) {
      await firstUser.click();
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('Create asset form should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account/assets');
    await page.waitForLoadState('networkidle');

    // Open create asset dialog
    await page.getByTestId('create-asset-button').click();
    await page.waitForTimeout(500); // Wait for dialog animation

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Create license form should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account/licenses');
    await page.waitForLoadState('networkidle');

    // Open create license dialog
    await page.getByTestId('create-license-button').click();
    await page.waitForTimeout(500); // Wait for dialog animation

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Invite user form should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account/users');
    await page.waitForLoadState('networkidle');

    // Open invite user dialog
    await page.getByTestId('invite-user-button').click();
    await page.waitForTimeout(500); // Wait for dialog animation

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Navigation and header should not have accessibility violations', async ({ page }) => {
    await page.goto('/home/test-account');
    await page.waitForLoadState('networkidle');

    // Test only the navigation and header areas
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('nav')
      .include('header')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Forms should have proper labels and error messages', async ({ page }) => {
    await page.goto('/home/test-account/assets');
    await page.waitForLoadState('networkidle');

    // Open create asset dialog
    await page.getByTestId('create-asset-button').click();
    await page.waitForTimeout(500);

    // Check for form accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Verify no violations related to forms
    const formViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('label') || v.id.includes('form')
    );
    expect(formViolations).toEqual([]);
  });

  test('Color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/home/test-account');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('color-contrast')
    );
    expect(contrastViolations).toEqual([]);
  });

  test('Interactive elements should have accessible names', async ({ page }) => {
    await page.goto('/home/test-account/assets');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Filter for button/link name violations
    const nameViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('button-name') || v.id.includes('link-name')
    );
    expect(nameViolations).toEqual([]);
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('/home/test-account');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    // Filter for image alt violations
    const imageViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('image-alt')
    );
    expect(imageViolations).toEqual([]);
  });

  test('Page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/home/test-account');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    // Filter for heading violations
    const headingViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('heading')
    );
    expect(headingViolations).toEqual([]);
  });

  test('Landmark regions should be properly defined', async ({ page }) => {
    await page.goto('/home/test-account');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    // Filter for landmark violations
    const landmarkViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('landmark') || v.id.includes('region')
    );
    expect(landmarkViolations).toEqual([]);
  });
});
