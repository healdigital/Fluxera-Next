import { Page } from '@playwright/test';

/**
 * Authentication helpers for E2E test setup
 * Provides reusable functions for authentication and session management
 */

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface TeamSetupData {
  teamName?: string;
  slug?: string;
}

/**
 * Logs in a user with the provided credentials
 * Uses the existing auth page object pattern
 */
export async function loginUser(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
  await page.goto('/auth/sign-in');
  
  // Fill email
  await page.fill('[data-test="email-input"]', credentials.email);
  
  // Fill password if provided, otherwise use default
  const password = credentials.password || 'testpassword123';
  await page.fill('[data-test="password-input"]', password);
  
  // Submit login form
  await page.click('[data-test="sign-in-submit-button"]');
  
  // Wait for redirect to home page
  await page.waitForURL('**/home/**', { timeout: 10000 });
}

/**
 * Creates a new team account for testing
 */
export async function createTeamAccount(
  page: Page,
  data: TeamSetupData = {},
): Promise<{ teamName: string; slug: string }> {
  const timestamp = Date.now();
  const teamName = data.teamName || `Test Team ${timestamp}`;
  const slug = data.slug || `test-team-${timestamp}`;

  // Navigate to create team page
  await page.goto('/home/new');
  
  // Fill team name
  await page.fill('[data-test="team-name-input"]', teamName);
  
  // Fill slug
  await page.fill('[data-test="team-slug-input"]', slug);
  
  // Submit form
  await page.click('[data-test="create-team-button"]');
  
  // Wait for redirect to team page
  await page.waitForURL(`**/home/${slug}/**`, { timeout: 10000 });

  return { teamName, slug };
}

/**
 * Navigates to a specific team account
 */
export async function navigateToTeam(
  page: Page,
  slug: string,
): Promise<void> {
  await page.goto(`/home/${slug}`);
  await page.waitForURL(`**/home/${slug}/**`);
}

/**
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-test="user-menu-trigger"]');
  
  // Click sign out
  await page.click('[data-test="sign-out-button"]');
  
  // Wait for redirect to sign in page
  await page.waitForURL('**/auth/sign-in', { timeout: 10000 });
}

/**
 * Switches to a different team account
 */
export async function switchTeam(
  page: Page,
  slug: string,
): Promise<void> {
  // Click team switcher
  await page.click('[data-test="team-switcher-trigger"]');
  
  // Select team
  await page.click(`[data-test="team-option-${slug}"]`);
  
  // Wait for navigation
  await page.waitForURL(`**/home/${slug}/**`, { timeout: 10000 });
}

/**
 * Sets up a complete test environment with authenticated user and team
 */
export async function setupTestEnvironment(
  page: Page,
  options: {
    email?: string;
    password?: string;
    teamName?: string;
    slug?: string;
  } = {},
): Promise<{
  email: string;
  teamName: string;
  slug: string;
}> {
  const email = options.email || 'test@makerkit.dev';
  
  // Login
  await loginUser(page, { email, password: options.password });
  
  // Create team if needed
  let teamName: string;
  let slug: string;
  
  if (options.teamName || options.slug) {
    const team = await createTeamAccount(page, {
      teamName: options.teamName,
      slug: options.slug,
    });
    teamName = team.teamName;
    slug = team.slug;
  } else {
    // Use existing team or create new one
    const team = await createTeamAccount(page);
    teamName = team.teamName;
    slug = team.slug;
  }

  return { email, teamName, slug };
}

/**
 * Clears all cookies and local storage
 */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Waits for authentication to complete
 */
export async function waitForAuth(page: Page): Promise<void> {
  await page.waitForURL('**/home/**', { timeout: 10000 });
}

/**
 * Verifies that the user is authenticated
 */
export async function verifyAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/home/');
}

/**
 * Verifies that the user is not authenticated
 */
export async function verifyNotAuthenticated(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/auth/');
}

/**
 * Gets the current team slug from the URL
 */
export async function getCurrentTeamSlug(page: Page): Promise<string | null> {
  const url = page.url();
  const match = url.match(/\/home\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Invites a team member for testing
 */
export async function inviteTeamMember(
  page: Page,
  email: string,
  role: string = 'member',
): Promise<void> {
  // Navigate to team settings
  await page.click('[data-test="team-settings-link"]');
  
  // Click invite member
  await page.click('[data-test="invite-member-button"]');
  
  // Fill email
  await page.fill('[data-test="member-email-input"]', email);
  
  // Select role
  await page.click('[data-test="member-role-select"]');
  await page.click(`[data-test="role-option-${role}"]`);
  
  // Submit
  await page.click('[data-test="send-invitation-button"]');
  
  // Wait for success
  await page.waitForTimeout(1000);
}

/**
 * Accepts a team invitation (requires separate session)
 */
export async function acceptTeamInvitation(
  page: Page,
  invitationToken: string,
): Promise<void> {
  await page.goto(`/invite/${invitationToken}`);
  
  // Click accept button
  await page.click('[data-test="accept-invitation-button"]');
  
  // Wait for redirect
  await page.waitForURL('**/home/**', { timeout: 10000 });
}

/**
 * Creates a test user account
 */
export async function createTestUser(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/auth/sign-up');
  
  // Fill email
  await page.fill('[data-test="email-input"]', email);
  
  // Fill password
  await page.fill('[data-test="password-input"]', password);
  
  // Fill confirm password
  await page.fill('[data-test="confirm-password-input"]', password);
  
  // Submit
  await page.click('[data-test="sign-up-submit-button"]');
  
  // Wait for redirect or confirmation
  await page.waitForTimeout(2000);
}
