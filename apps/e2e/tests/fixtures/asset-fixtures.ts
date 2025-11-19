/**
 * Asset test data fixtures
 * Provides predefined test data for asset management E2E tests
 */

import type { CreateAssetData } from '../utils/asset-helpers';

/**
 * Basic laptop asset fixture
 */
export const laptopAsset: CreateAssetData = {
  name: 'MacBook Pro 16"',
  category: 'laptop',
  status: 'available',
  description: 'High-performance laptop for development work',
  serialNumber: 'MBP-2024-001',
  purchaseDate: '2024-01-15',
  purchaseCost: '2499.99',
  location: 'Office - Floor 3',
  manufacturer: 'Apple',
  model: 'MacBook Pro 16-inch M3 Max',
};

/**
 * Desktop computer asset fixture
 */
export const desktopAsset: CreateAssetData = {
  name: 'Dell Precision Workstation',
  category: 'desktop',
  status: 'available',
  description: 'Workstation for design and video editing',
  serialNumber: 'DELL-WS-2024-001',
  purchaseDate: '2024-02-01',
  purchaseCost: '1899.99',
  location: 'Office - Floor 2',
  manufacturer: 'Dell',
  model: 'Precision 5820 Tower',
};

/**
 * Monitor asset fixture
 */
export const monitorAsset: CreateAssetData = {
  name: 'LG UltraWide Monitor',
  category: 'monitor',
  status: 'available',
  description: '34-inch curved ultrawide monitor',
  serialNumber: 'LG-MON-2024-001',
  purchaseDate: '2024-01-20',
  purchaseCost: '799.99',
  location: 'Office - Floor 3',
  manufacturer: 'LG',
  model: '34WK95U-W',
};

/**
 * Keyboard asset fixture
 */
export const keyboardAsset: CreateAssetData = {
  name: 'Mechanical Keyboard',
  category: 'keyboard',
  status: 'available',
  description: 'Mechanical keyboard with RGB lighting',
  serialNumber: 'KB-2024-001',
  purchaseDate: '2024-01-10',
  purchaseCost: '149.99',
  location: 'Office - Floor 3',
  manufacturer: 'Keychron',
  model: 'K8 Pro',
};

/**
 * Mouse asset fixture
 */
export const mouseAsset: CreateAssetData = {
  name: 'Wireless Mouse',
  category: 'mouse',
  status: 'available',
  description: 'Ergonomic wireless mouse',
  serialNumber: 'MS-2024-001',
  purchaseDate: '2024-01-10',
  purchaseCost: '79.99',
  location: 'Office - Floor 3',
  manufacturer: 'Logitech',
  model: 'MX Master 3S',
};

/**
 * Headset asset fixture
 */
export const headsetAsset: CreateAssetData = {
  name: 'Noise-Cancelling Headset',
  category: 'headset',
  status: 'available',
  description: 'Wireless headset with active noise cancellation',
  serialNumber: 'HS-2024-001',
  purchaseDate: '2024-01-25',
  purchaseCost: '299.99',
  location: 'Office - Floor 3',
  manufacturer: 'Sony',
  model: 'WH-1000XM5',
};

/**
 * Smartphone asset fixture
 */
export const smartphoneAsset: CreateAssetData = {
  name: 'iPhone 15 Pro',
  category: 'phone',
  status: 'available',
  description: 'Company smartphone for mobile testing',
  serialNumber: 'IP15-2024-001',
  purchaseDate: '2024-02-10',
  purchaseCost: '1199.99',
  location: 'Office - Floor 1',
  manufacturer: 'Apple',
  model: 'iPhone 15 Pro 256GB',
};

/**
 * Tablet asset fixture
 */
export const tabletAsset: CreateAssetData = {
  name: 'iPad Pro',
  category: 'tablet',
  status: 'available',
  description: 'Tablet for presentations and mobile work',
  serialNumber: 'IPAD-2024-001',
  purchaseDate: '2024-02-15',
  purchaseCost: '899.99',
  location: 'Office - Floor 1',
  manufacturer: 'Apple',
  model: 'iPad Pro 12.9" M2',
};

/**
 * Printer asset fixture
 */
export const printerAsset: CreateAssetData = {
  name: 'Color Laser Printer',
  category: 'printer',
  status: 'available',
  description: 'High-speed color laser printer',
  serialNumber: 'PRT-2024-001',
  purchaseDate: '2024-01-05',
  purchaseCost: '599.99',
  location: 'Office - Floor 2',
  manufacturer: 'HP',
  model: 'LaserJet Pro M454dw',
};

/**
 * Server asset fixture
 */
export const serverAsset: CreateAssetData = {
  name: 'Development Server',
  category: 'server',
  status: 'in_use',
  description: 'On-premise development server',
  serialNumber: 'SRV-2024-001',
  purchaseDate: '2023-12-01',
  purchaseCost: '4999.99',
  location: 'Server Room',
  manufacturer: 'Dell',
  model: 'PowerEdge R750',
};

/**
 * Asset already assigned to a user
 */
export const assignedAsset: CreateAssetData = {
  name: 'Assigned Laptop',
  category: 'laptop',
  status: 'assigned',
  description: 'Laptop currently assigned to a team member',
  serialNumber: 'ASG-LAP-001',
  purchaseDate: '2024-01-01',
  purchaseCost: '1999.99',
  location: 'Remote - Employee Home',
  manufacturer: 'Lenovo',
  model: 'ThinkPad X1 Carbon',
};

/**
 * Asset under maintenance
 */
export const maintenanceAsset: CreateAssetData = {
  name: 'Maintenance Laptop',
  category: 'laptop',
  status: 'maintenance',
  description: 'Laptop currently under repair',
  serialNumber: 'MNT-LAP-001',
  purchaseDate: '2023-11-15',
  purchaseCost: '1799.99',
  location: 'Repair Shop',
  manufacturer: 'HP',
  model: 'EliteBook 840',
};

/**
 * Retired asset
 */
export const retiredAsset: CreateAssetData = {
  name: 'Retired Desktop',
  category: 'desktop',
  status: 'retired',
  description: 'Old desktop computer no longer in use',
  serialNumber: 'RET-DSK-001',
  purchaseDate: '2020-01-01',
  purchaseCost: '999.99',
  location: 'Storage',
  manufacturer: 'Dell',
  model: 'OptiPlex 7070',
};

/**
 * Collection of all asset fixtures
 */
export const allAssetFixtures = [
  laptopAsset,
  desktopAsset,
  monitorAsset,
  keyboardAsset,
  mouseAsset,
  headsetAsset,
  smartphoneAsset,
  tabletAsset,
  printerAsset,
  serverAsset,
  assignedAsset,
  maintenanceAsset,
  retiredAsset,
];

/**
 * Collection of available assets only
 */
export const availableAssetFixtures = [
  laptopAsset,
  desktopAsset,
  monitorAsset,
  keyboardAsset,
  mouseAsset,
  headsetAsset,
  smartphoneAsset,
  tabletAsset,
  printerAsset,
];

/**
 * Collection of laptop assets
 */
export const laptopFixtures = [
  laptopAsset,
  assignedAsset,
  maintenanceAsset,
];

/**
 * Generates a unique asset with timestamp
 */
export function generateUniqueAsset(
  base: CreateAssetData = laptopAsset,
): CreateAssetData {
  const timestamp = Date.now();
  return {
    ...base,
    name: `${base.name} ${timestamp}`,
    serialNumber: `${base.serialNumber}-${timestamp}`,
  };
}

/**
 * Generates multiple unique assets
 */
export function generateMultipleAssets(
  count: number,
  base: CreateAssetData = laptopAsset,
): CreateAssetData[] {
  return Array.from({ length: count }, (_, i) => ({
    ...base,
    name: `${base.name} ${Date.now()}-${i}`,
    serialNumber: `${base.serialNumber}-${Date.now()}-${i}`,
  }));
}
