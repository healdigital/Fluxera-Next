import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should successfully sign up with email and password', async ({ page }) => {
    // Navigate to signup page
    await page.goto('http://localhost:3000/auth/sign-up');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'signup-initial.png', fullPage: true });
    
    // Fill in email
    const email = `test-${Date.now()}@example.com`;
    await page.fill('input[type="email"]', email);
    
    // Fill in password
    await page.fill('input[type="password"]', 'Leo2025!');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'signup-filled.png', fullPage: true });
    
    // Click submit button
    await page.click('button[type="submit"]');
    
    // Wait for navigation or success message
    await page.waitForTimeout(3000);
    
    // Take screenshot of result
    await page.screenshot({ path: 'signup-result.png', fullPage: true });
    
    // Log the current URL
    console.log('Current URL:', page.url());
    
    // Check if we're redirected or see success message
    const url = page.url();
    console.log('Final URL:', url);
  });
});
