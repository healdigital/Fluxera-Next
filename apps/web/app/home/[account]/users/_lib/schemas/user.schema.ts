import { z } from 'zod';

/**
 * User status enum schema
 * Represents the possible states of a user account within a team
 */
export const UserStatusSchema = z.enum([
  'active',
  'inactive',
  'suspended',
  'pending_invitation',
]);

export type UserStatus = z.infer<typeof UserStatusSchema>;

/**
 * Schema for inviting a new user to a team account
 * Used when administrators create new user invitations
 */
export const InviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  send_invitation: z.boolean(),
});

export type InviteUserData = z.infer<typeof InviteUserSchema>;

/**
 * Schema for updating user profile information
 * All fields are optional to support partial updates
 */
export const UpdateUserProfileSchema = z.object({
  display_name: z
    .string()
    .max(255, 'Display name must be 255 characters or less')
    .optional(),
  phone_number: z
    .string()
    .max(50, 'Phone number must be 50 characters or less')
    .optional(),
  job_title: z
    .string()
    .max(255, 'Job title must be 255 characters or less')
    .optional(),
  department: z
    .string()
    .max(255, 'Department must be 255 characters or less')
    .optional(),
  location: z
    .string()
    .max(255, 'Location must be 255 characters or less')
    .optional(),
  bio: z.string().max(5000, 'Bio must be 5000 characters or less').optional(),
});

export type UpdateUserProfileData = z.infer<typeof UpdateUserProfileSchema>;

/**
 * Schema for updating a user's role within a team account
 * Requires user ID, account ID, and the new role
 */
export const UpdateUserRoleSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  account_id: z.string().uuid('Invalid account ID'),
  role: z.string().min(1, 'Role is required'),
});

export type UpdateUserRoleData = z.infer<typeof UpdateUserRoleSchema>;

/**
 * Schema for updating a user's status within a team account
 * Includes optional reason field for audit trail
 */
export const UpdateUserStatusSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  account_id: z.string().uuid('Invalid account ID'),
  status: UserStatusSchema,
  reason: z
    .string()
    .max(1000, 'Reason must be 1000 characters or less')
    .optional(),
});

export type UpdateUserStatusData = z.infer<typeof UpdateUserStatusSchema>;

/**
 * Schema for assigning assets to a user
 * Requires at least one asset to be selected
 */
export const AssignAssetsSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  asset_ids: z
    .array(z.string().uuid('Invalid asset ID'))
    .min(1, 'At least one asset must be selected'),
});

export type AssignAssetsData = z.infer<typeof AssignAssetsSchema>;

/**
 * Schema for filtering user activity logs
 * All fields are optional to support flexible filtering
 */
export const UserActivityFilterSchema = z.object({
  user_id: z.string().uuid('Invalid user ID').optional(),
  action_type: z.string().optional(),
  start_date: z.string().date('Invalid start date').optional(),
  end_date: z.string().date('Invalid end date').optional(),
  limit: z
    .number()
    .int()
    .positive('Limit must be a positive integer')
    .default(50),
  offset: z
    .number()
    .int()
    .nonnegative('Offset must be non-negative')
    .default(0),
});

export type UserActivityFilterData = z.infer<typeof UserActivityFilterSchema>;

/**
 * Schema for exporting user activity logs
 * Supports CSV and JSON formats with optional filtering
 */
export const ExportUserActivitySchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  format: z.enum(['csv', 'json'], {
    errorMap: () => ({ message: 'Format must be either csv or json' }),
  }),
  action_type: z.string().optional(),
  start_date: z.string().date('Invalid start date').optional(),
  end_date: z.string().date('Invalid end date').optional(),
});

export type ExportUserActivityData = z.infer<typeof ExportUserActivitySchema>;
