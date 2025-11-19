import { z } from 'zod';

/**
 * Widget type enum schema
 * Represents the different types of dashboard widgets available
 */
export const WidgetTypeSchema = z.enum([
  'metrics_summary',
  'asset_status',
  'trend_chart',
  'alerts',
  'quick_actions',
  'recent_activity',
  'license_expiry',
  'maintenance_schedule',
]);

export type WidgetType = z.infer<typeof WidgetTypeSchema>;

/**
 * Alert severity enum schema
 * Represents the severity levels for dashboard alerts
 */
export const AlertSeveritySchema = z.enum(['info', 'warning', 'critical']);

export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

/**
 * Alert type enum schema
 * Represents the different types of alerts that can be displayed
 */
export const AlertTypeSchema = z.enum([
  'low_asset_availability',
  'expiring_licenses',
  'pending_maintenance',
  'unusual_activity',
  'system_health',
  'subscription_expiring',
  'usage_limit_approaching',
]);

export type AlertType = z.infer<typeof AlertTypeSchema>;

/**
 * Trend time range enum schema
 * Represents the available time ranges for trend charts
 */
export const TrendTimeRangeSchema = z.enum(['7d', '30d', '90d', '1y']);

export type TrendTimeRange = z.infer<typeof TrendTimeRangeSchema>;

/**
 * Trend metric type enum schema
 * Represents the types of metrics that can be displayed in trend charts
 */
export const TrendMetricTypeSchema = z.enum(['assets', 'users', 'licenses']);

export type TrendMetricType = z.infer<typeof TrendMetricTypeSchema>;

/**
 * Schema for updating widget configuration
 * Used when users customize their dashboard widget settings
 */
export const UpdateWidgetConfigSchema = z.object({
  widget_id: z.string().uuid('Invalid widget ID'),
  widget_config: z.record(z.unknown()).optional(),
  position_order: z
    .number()
    .int('Position must be an integer')
    .nonnegative('Position must be non-negative')
    .optional(),
  is_visible: z.boolean().optional(),
});

export type UpdateWidgetConfigData = z.infer<typeof UpdateWidgetConfigSchema>;

/**
 * Schema for dismissing a dashboard alert
 * Used when users dismiss alerts from the alerts widget
 */
export const DismissAlertSchema = z.object({
  alert_id: z.string().uuid('Invalid alert ID'),
  accountSlug: z.string().min(1, 'Account slug is required'),
});

export type DismissAlertData = z.infer<typeof DismissAlertSchema>;

/**
 * Schema for fetching trend data
 * Used to query historical metrics with specific time ranges
 */
export const GetTrendsSchema = z.object({
  metric_type: TrendMetricTypeSchema,
  time_range: TrendTimeRangeSchema.default('30d'),
});

export type GetTrendsData = z.infer<typeof GetTrendsSchema>;

/**
 * Schema for creating a dashboard alert
 * Used by the system to generate new alerts
 */
export const CreateAlertSchema = z.object({
  account_id: z.string().uuid('Invalid account ID'),
  alert_type: AlertTypeSchema,
  severity: AlertSeveritySchema,
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  action_url: z.string().max(1000).optional(),
  action_label: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).default({}),
  expires_at: z.string().datetime().optional(),
});

export type CreateAlertData = z.infer<typeof CreateAlertSchema>;

/**
 * Schema for widget configuration data
 * Represents the structure of widget-specific configuration
 */
export const WidgetConfigSchema = z.record(z.unknown());

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

/**
 * Schema for batch updating widget configurations
 * Used when users save their dashboard layout preferences
 */
export const UpdateWidgetLayoutSchema = z.object({
  accountSlug: z.string().min(1, 'Account slug is required'),
  widgets: z.array(
    z.object({
      widget_type: WidgetTypeSchema,
      position_order: z.number().int().nonnegative(),
      is_visible: z.boolean(),
    }),
  ),
});

export type UpdateWidgetLayoutData = z.infer<typeof UpdateWidgetLayoutSchema>;
