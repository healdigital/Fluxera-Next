import { z } from 'zod';

/**
 * Account status filter enum schema
 * Used for filtering team accounts in the admin dashboard
 */
export const AccountStatusFilterSchema = z.enum([
  'all',
  'active',
  'inactive',
  'suspended',
]);

export type AccountStatusFilter = z.infer<typeof AccountStatusFilterSchema>;

/**
 * Subscription tier filter enum schema
 * Used for filtering accounts by subscription level
 */
export const SubscriptionTierFilterSchema = z.enum([
  'all',
  'free',
  'starter',
  'professional',
  'enterprise',
]);

export type SubscriptionTierFilter = z.infer<
  typeof SubscriptionTierFilterSchema
>;

/**
 * System health metric type enum schema
 * Represents the different system health metrics that can be monitored
 */
export const SystemHealthMetricTypeSchema = z.enum([
  'database_performance',
  'api_response_time',
  'storage_utilization',
  'active_connections',
  'error_rate',
]);

export type SystemHealthMetricType = z.infer<
  typeof SystemHealthMetricTypeSchema
>;

/**
 * Schema for fetching account activity list
 * Used to query team accounts with pagination and filtering
 */
export const GetAccountActivityListSchema = z.object({
  limit: z
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(50),
  offset: z
    .number()
    .int('Offset must be an integer')
    .nonnegative('Offset must be non-negative')
    .default(0),
  status_filter: AccountStatusFilterSchema.default('all'),
  subscription_filter: SubscriptionTierFilterSchema.default('all'),
  start_date: z.string().date('Invalid start date').optional(),
  end_date: z.string().date('Invalid end date').optional(),
});

export type GetAccountActivityListData = z.infer<
  typeof GetAccountActivityListSchema
>;

/**
 * Schema for fetching platform usage statistics
 * Used to query feature usage data with time range filtering
 */
export const GetUsageStatisticsSchema = z.object({
  start_date: z.string().date('Invalid start date'),
  end_date: z.string().date('Invalid end date'),
  feature_type: z
    .enum([
      'all',
      'asset_management',
      'user_management',
      'license_tracking',
      'maintenance_scheduling',
    ])
    .default('all'),
});

export type GetUsageStatisticsData = z.infer<typeof GetUsageStatisticsSchema>;

/**
 * Schema for system health threshold configuration
 * Used to define warning and critical thresholds for monitoring
 */
export const SystemHealthThresholdSchema = z.object({
  metric_type: SystemHealthMetricTypeSchema,
  warning_threshold: z.number().positive('Warning threshold must be positive'),
  critical_threshold: z
    .number()
    .positive('Critical threshold must be positive'),
});

export type SystemHealthThresholdData = z.infer<
  typeof SystemHealthThresholdSchema
>;

/**
 * Schema for account management actions
 * Used for admin operations on team accounts
 */
export const AccountManagementActionSchema = z.object({
  account_id: z.string().uuid('Invalid account ID'),
  action: z.enum(['upgrade', 'downgrade', 'suspend', 'activate', 'delete']),
  reason: z
    .string()
    .max(1000, 'Reason must be 1000 characters or less')
    .optional(),
  new_subscription_tier: z
    .enum(['free', 'starter', 'professional', 'enterprise'])
    .optional(),
});

export type AccountManagementActionData = z.infer<
  typeof AccountManagementActionSchema
>;

/**
 * Schema for refreshing platform metrics
 * Used to trigger manual refresh of the materialized view
 */
export const RefreshPlatformMetricsSchema = z.object({
  force: z.boolean().default(false),
});

export type RefreshPlatformMetricsData = z.infer<
  typeof RefreshPlatformMetricsSchema
>;
