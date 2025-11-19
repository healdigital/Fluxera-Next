import type {
  AlertSeverity,
  AlertType,
  TrendMetricType,
  TrendTimeRange,
  WidgetType,
} from '../schemas/dashboard.schema';

/**
 * Dashboard Widget Entity
 * Represents a user-configurable widget on the dashboard
 */
export interface DashboardWidget {
  id: string;
  account_id: string;
  user_id: string | null;
  widget_type: WidgetType;
  widget_config: Record<string, unknown>;
  position_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Dashboard Alert Entity
 * Represents an alert or notification displayed on the dashboard
 */
export interface DashboardAlert {
  id: string;
  account_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  action_url: string | null;
  action_label: string | null;
  metadata: Record<string, unknown>;
  is_dismissed: boolean;
  dismissed_by: string | null;
  dismissed_at: string | null;
  created_at: string;
  expires_at: string | null;
}

/**
 * Team Dashboard Metrics
 * Aggregated metrics for a team's dashboard overview
 */
export interface TeamDashboardMetrics {
  total_assets: number;
  available_assets: number;
  assigned_assets: number;
  maintenance_assets: number;
  total_users: number;
  active_users: number;
  total_licenses: number;
  active_licenses: number;
  expiring_licenses_30d: number;
  pending_maintenance: number;
  assets_growth_30d: number;
  users_growth_30d: number;
}

/**
 * Asset Status Distribution
 * Breakdown of assets by status with percentages
 */
export interface AssetStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Trend Data Point
 * Single data point in a trend chart
 */
export interface TrendDataPoint {
  date: string;
  value: number;
}

/**
 * Dashboard Data
 * Complete data structure for rendering the team dashboard
 */
export interface DashboardData {
  metrics: TeamDashboardMetrics;
  widgets: DashboardWidget[];
  alerts: DashboardAlert[];
  assetStatusDistribution: AssetStatusDistribution[];
}

/**
 * Widget Layout Configuration
 * Defines the layout and visibility of dashboard widgets
 */
export interface WidgetLayoutConfig {
  widget_type: WidgetType;
  position_order: number;
  is_visible: boolean;
  config: Record<string, unknown>;
}

/**
 * Metric Comparison
 * Represents a metric with comparison to previous period
 */
export interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Quick Action
 * Represents a quick action button on the dashboard
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  permission?: string;
  description?: string;
}

/**
 * Re-export types from schema for convenience
 */
export type { TrendMetricType, TrendTimeRange };
