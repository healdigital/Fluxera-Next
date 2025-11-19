/**
 * License test data fixtures
 * Provides predefined test data for license management E2E tests
 */

import type { CreateLicenseData } from '../utils/license-helpers';

/**
 * Microsoft Office 365 license fixture
 */
export const office365License: CreateLicenseData = {
  name: 'Microsoft Office 365 Business Premium',
  vendor: 'Microsoft',
  licenseKey: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-01-01',
  expirationDate: '2025-01-01',
  cost: '12.50',
  seats: '10',
  notes: 'Annual subscription for team productivity suite',
};

/**
 * Adobe Creative Cloud license fixture
 */
export const adobeCCLicense: CreateLicenseData = {
  name: 'Adobe Creative Cloud All Apps',
  vendor: 'Adobe',
  licenseKey: 'ADOBE-CC-2024-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-01-15',
  expirationDate: '2025-01-15',
  cost: '54.99',
  seats: '5',
  notes: 'Creative suite for design team',
};

/**
 * JetBrains IntelliJ IDEA license fixture
 */
export const intellijLicense: CreateLicenseData = {
  name: 'JetBrains IntelliJ IDEA Ultimate',
  vendor: 'JetBrains',
  licenseKey: 'JETBRAINS-IDEA-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-02-01',
  expirationDate: '2025-02-01',
  cost: '149.00',
  seats: '20',
  notes: 'IDE licenses for development team',
};

/**
 * Slack Business+ license fixture
 */
export const slackLicense: CreateLicenseData = {
  name: 'Slack Business+',
  vendor: 'Slack Technologies',
  licenseKey: 'SLACK-BIZ-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-01-01',
  expirationDate: '2025-01-01',
  cost: '12.50',
  seats: '50',
  notes: 'Team communication platform',
};

/**
 * Zoom Business license fixture
 */
export const zoomLicense: CreateLicenseData = {
  name: 'Zoom Business',
  vendor: 'Zoom Video Communications',
  licenseKey: 'ZOOM-BIZ-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-01-10',
  expirationDate: '2025-01-10',
  cost: '19.99',
  seats: '30',
  notes: 'Video conferencing for remote meetings',
};

/**
 * GitHub Enterprise license fixture
 */
export const githubLicense: CreateLicenseData = {
  name: 'GitHub Enterprise Cloud',
  vendor: 'GitHub',
  licenseKey: 'GITHUB-ENT-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-01-01',
  expirationDate: '2025-01-01',
  cost: '21.00',
  seats: '25',
  notes: 'Source code management and collaboration',
};

/**
 * Figma Professional license fixture
 */
export const figmaLicense: CreateLicenseData = {
  name: 'Figma Professional',
  vendor: 'Figma',
  licenseKey: 'FIGMA-PRO-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-02-01',
  expirationDate: '2025-02-01',
  cost: '12.00',
  seats: '8',
  notes: 'Design and prototyping tool',
};

/**
 * Perpetual license fixture (Windows Server)
 */
export const windowsServerLicense: CreateLicenseData = {
  name: 'Windows Server 2022 Standard',
  vendor: 'Microsoft',
  licenseKey: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
  licenseType: 'perpetual',
  purchaseDate: '2024-01-05',
  cost: '999.00',
  seats: '1',
  notes: 'Server operating system license',
};

/**
 * Perpetual license fixture (AutoCAD)
 */
export const autocadLicense: CreateLicenseData = {
  name: 'AutoCAD 2024',
  vendor: 'Autodesk',
  licenseKey: 'AUTOCAD-2024-XXXXX',
  licenseType: 'perpetual',
  purchaseDate: '2024-01-20',
  cost: '1690.00',
  seats: '3',
  notes: 'CAD software for engineering team',
};

/**
 * Trial license fixture
 */
export const trialLicense: CreateLicenseData = {
  name: 'Salesforce Enterprise Trial',
  vendor: 'Salesforce',
  licenseKey: 'SFDC-TRIAL-XXXXX',
  licenseType: 'trial',
  purchaseDate: '2024-03-01',
  expirationDate: '2024-04-01',
  cost: '0.00',
  seats: '5',
  notes: 'Trial period for CRM evaluation',
};

/**
 * Expiring soon license fixture (expires in 20 days)
 */
export const expiringSoonLicense: CreateLicenseData = {
  name: 'Expiring License',
  vendor: 'Test Vendor',
  licenseKey: 'EXPIRING-SOON-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2023-12-01',
  expirationDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
  cost: '99.99',
  seats: '5',
  notes: 'License expiring soon - needs renewal',
};

/**
 * Expired license fixture
 */
export const expiredLicense: CreateLicenseData = {
  name: 'Expired License',
  vendor: 'Test Vendor',
  licenseKey: 'EXPIRED-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2023-01-01',
  expirationDate: '2024-01-01',
  cost: '149.99',
  seats: '10',
  notes: 'License has expired - requires renewal',
};

/**
 * License with many seats
 */
export const highSeatLicense: CreateLicenseData = {
  name: 'Enterprise License',
  vendor: 'Enterprise Vendor',
  licenseKey: 'ENTERPRISE-XXXXX',
  licenseType: 'subscription',
  purchaseDate: '2024-01-01',
  expirationDate: '2025-01-01',
  cost: '5000.00',
  seats: '100',
  notes: 'Enterprise-wide license with many seats',
};

/**
 * Collection of all license fixtures
 */
export const allLicenseFixtures = [
  office365License,
  adobeCCLicense,
  intellijLicense,
  slackLicense,
  zoomLicense,
  githubLicense,
  figmaLicense,
  windowsServerLicense,
  autocadLicense,
  trialLicense,
  expiringSoonLicense,
  expiredLicense,
  highSeatLicense,
];

/**
 * Collection of subscription licenses only
 */
export const subscriptionLicenseFixtures = [
  office365License,
  adobeCCLicense,
  intellijLicense,
  slackLicense,
  zoomLicense,
  githubLicense,
  figmaLicense,
];

/**
 * Collection of perpetual licenses only
 */
export const perpetualLicenseFixtures = [
  windowsServerLicense,
  autocadLicense,
];

/**
 * Collection of active licenses (not expired)
 */
export const activeLicenseFixtures = [
  office365License,
  adobeCCLicense,
  intellijLicense,
  slackLicense,
  zoomLicense,
  githubLicense,
  figmaLicense,
  windowsServerLicense,
  autocadLicense,
  trialLicense,
  expiringSoonLicense,
  highSeatLicense,
];

/**
 * Collection of Microsoft licenses
 */
export const microsoftLicenseFixtures = [
  office365License,
  windowsServerLicense,
];

/**
 * Generates a unique license with timestamp
 */
export function generateUniqueLicense(
  base: CreateLicenseData = office365License,
): CreateLicenseData {
  const timestamp = Date.now();
  return {
    ...base,
    name: `${base.name} ${timestamp}`,
    licenseKey: `${base.licenseKey}-${timestamp}`,
  };
}

/**
 * Generates multiple unique licenses
 */
export function generateMultipleLicenses(
  count: number,
  base: CreateLicenseData = office365License,
): CreateLicenseData[] {
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    name: `${base.name} ${Date.now()}-${i}`,
    licenseKey: `${base.licenseKey}-${Date.now()}-${i}`,
  }));
}

/**
 * Generates a license expiring in N days
 */
export function generateLicenseExpiringInDays(
  days: number,
  base: CreateLicenseData = office365License,
): CreateLicenseData {
  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    ...base,
    name: `${base.name} (Expires in ${days} days)`,
    licenseKey: `${base.licenseKey}-EXP${days}`,
    expirationDate,
  };
}
