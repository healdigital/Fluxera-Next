/**
 * User test data fixtures
 * Provides predefined test data for user management E2E tests
 */

import type { InviteUserData } from '../utils/user-helpers';

/**
 * Admin user fixture
 */
export const adminUser: InviteUserData = {
  email: 'admin.test@example.com',
  role: 'admin',
  sendInvitation: true,
};

/**
 * Member user fixture
 */
export const memberUser: InviteUserData = {
  email: 'member.test@example.com',
  role: 'member',
  sendInvitation: true,
};

/**
 * Owner user fixture
 */
export const ownerUser: InviteUserData = {
  email: 'owner.test@example.com',
  role: 'owner',
  sendInvitation: true,
};

/**
 * Developer user fixture
 */
export const developerUser: InviteUserData = {
  email: 'developer.test@example.com',
  role: 'member',
  sendInvitation: true,
};

/**
 * Designer user fixture
 */
export const designerUser: InviteUserData = {
  email: 'designer.test@example.com',
  role: 'member',
  sendInvitation: true,
};

/**
 * Manager user fixture
 */
export const managerUser: InviteUserData = {
  email: 'manager.test@example.com',
  role: 'admin',
  sendInvitation: true,
};

/**
 * User without invitation email
 */
export const userWithoutInvitation: InviteUserData = {
  email: 'noinvite.test@example.com',
  role: 'member',
  sendInvitation: false,
};

/**
 * User profile data for editing
 */
export interface UserProfileData {
  displayName: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
}

/**
 * Developer profile fixture
 */
export const developerProfile: UserProfileData = {
  displayName: 'John Developer',
  phoneNumber: '+1-555-0101',
  department: 'Engineering',
  jobTitle: 'Senior Software Engineer',
};

/**
 * Designer profile fixture
 */
export const designerProfile: UserProfileData = {
  displayName: 'Jane Designer',
  phoneNumber: '+1-555-0102',
  department: 'Design',
  jobTitle: 'UX/UI Designer',
};

/**
 * Manager profile fixture
 */
export const managerProfile: UserProfileData = {
  displayName: 'Bob Manager',
  phoneNumber: '+1-555-0103',
  department: 'Management',
  jobTitle: 'Engineering Manager',
};

/**
 * Admin profile fixture
 */
export const adminProfile: UserProfileData = {
  displayName: 'Alice Admin',
  phoneNumber: '+1-555-0104',
  department: 'IT',
  jobTitle: 'System Administrator',
};

/**
 * Activity log action types
 */
export const activityActionTypes = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ASSET_CREATED: 'asset_created',
  ASSET_UPDATED: 'asset_updated',
  ASSET_DELETED: 'asset_deleted',
  ASSET_ASSIGNED: 'asset_assigned',
  ASSET_UNASSIGNED: 'asset_unassigned',
  LICENSE_CREATED: 'license_created',
  LICENSE_UPDATED: 'license_updated',
  LICENSE_DELETED: 'license_deleted',
  LICENSE_ASSIGNED: 'license_assigned',
  LICENSE_UNASSIGNED: 'license_unassigned',
  USER_INVITED: 'user_invited',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_STATUS_CHANGED: 'user_status_changed',
  SETTINGS_UPDATED: 'settings_updated',
} as const;

/**
 * User status options
 */
export const userStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

/**
 * User role options
 */
export const userRoles = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

/**
 * Collection of all user fixtures
 */
export const allUserFixtures = [
  adminUser,
  memberUser,
  ownerUser,
  developerUser,
  designerUser,
  managerUser,
  userWithoutInvitation,
];

/**
 * Collection of admin users
 */
export const adminUserFixtures = [
  adminUser,
  ownerUser,
  managerUser,
];

/**
 * Collection of member users
 */
export const memberUserFixtures = [
  memberUser,
  developerUser,
  designerUser,
  userWithoutInvitation,
];

/**
 * Collection of all profile fixtures
 */
export const allProfileFixtures = [
  developerProfile,
  designerProfile,
  managerProfile,
  adminProfile,
];

/**
 * Generates a unique user with timestamp
 */
export function generateUniqueUser(
  base: InviteUserData = memberUser,
): InviteUserData {
  const timestamp = Date.now();
  const [localPart, domain] = base.email.split('@');
  return {
    ...base,
    email: `${localPart}.${timestamp}@${domain}`,
  };
}

/**
 * Generates multiple unique users
 */
export function generateMultipleUsers(
  count: number,
  base: InviteUserData = memberUser,
): InviteUserData[] {
  return Array.from({ length: count }, (_, i) => {
    const timestamp = Date.now();
    const [localPart, domain] = base.email.split('@');
    return {
      ...base,
      email: `${localPart}.${timestamp}.${i}@${domain}`,
    };
  });
}

/**
 * Generates a user with specific role
 */
export function generateUserWithRole(
  role: string,
  base: InviteUserData = memberUser,
): InviteUserData {
  const timestamp = Date.now();
  const [localPart, domain] = base.email.split('@');
  return {
    ...base,
    email: `${localPart}.${role}.${timestamp}@${domain}`,
    role,
  };
}

/**
 * Sample activity log entries for testing
 */
export const sampleActivityEntries = [
  {
    actionType: activityActionTypes.LOGIN,
    description: 'User logged in',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
  {
    actionType: activityActionTypes.ASSET_CREATED,
    description: 'Created asset: MacBook Pro',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    actionType: activityActionTypes.ASSET_ASSIGNED,
    description: 'Assigned asset to John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    actionType: activityActionTypes.LICENSE_CREATED,
    description: 'Created license: Office 365',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    actionType: activityActionTypes.USER_INVITED,
    description: 'Invited user: jane@example.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

/**
 * Generates activity entries for a date range
 */
export function generateActivityEntriesForDateRange(
  startDate: Date,
  endDate: Date,
  count: number,
): Array<{
  actionType: string;
  description: string;
  timestamp: string;
}> {
  const entries = [];
  const timeRange = endDate.getTime() - startDate.getTime();
  const actionTypeValues = Object.values(activityActionTypes);

  for (let i = 0; i < count; i++) {
    const randomTime = startDate.getTime() + Math.random() * timeRange;
    const randomActionType =
      actionTypeValues[Math.floor(Math.random() * actionTypeValues.length)];

    entries.push({
      actionType: randomActionType,
      description: `Test activity: ${randomActionType}`,
      timestamp: new Date(randomTime).toISOString(),
    });
  }

  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
