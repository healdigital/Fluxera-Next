import type { SystemHealthMetricType } from '../schemas/admin-dashboard.schema';

/**
 * Platform Metrics
 * Aggregated metrics across all team accounts on the platform
 */
export interface PlatformMetrics {
  total_accounts: number;
  total_users: number;
  total_assets: number;
  total_licenses: number;
  new_accounts_30d: number;
  new_users_30d: number;
  new_assets_30d: number;
  last_updated: string;
}

/**
 * Account Activity
 * Activity summary for a team account
 */
export interface AccountActivity {
  account_id: string;
  account_name: string;
  account_slug: string;
  user_count: number;
  asset_count: number;
  last_activity_at: string;
  created_at: string;
}

/**
 * System Health Metric
 * Real-time health metric for system monitoring
 */
export interface SystemHealthMetric {
  metric_type: SystemHealthMetricType;
  current_value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  warning_threshold: number;
  critical_threshold: number;
  last_updated: string;
}

/**
 * System Health Status
 * Overall system health with individual metrics
 */
export interface SystemHealthStatus {
  overall_status: 'healthy' | 'degraded' | 'critical';
  metrics: SystemHealthMetric[];
  last_checked: string;
}

/**
 * Subscription Overview
 * Summary of accounts by subscription tier
 */
export interface SubscriptionOverview {
  tier: string;
  account_count: number;
  total_revenue: number;
  expiring_soon_count: number;
  over_limit_count: number;
}

/**
 * Account Subscription Details
 * Detailed subscription information for a team account
 */
export interface AccountSubscriptionDetails {
  account_id: string;
  account_name: string;
  subscription_tier: string;
  billing_status: string;
  renewal_date: string;
  usage_limits: {
    max_users: number;
    current_users: number;
    max_assets: number;
    current_assets: number;
    max_storage_gb: number;
    current_storage_gb: number;
  };
  is_over_limit: boolean;
  is_expiring_soon: boolean;
}

/**
 * Feature Usage Statistics
 * Usage metrics for platform features
 */
export interface FeatureUsageStatistics {
  feature_name: string;
  total_usage_count: number;
  active_accounts_count: number;
  adoption_rate: number;
  trend_direction: 'up' | 'down' | 'stable';
  previous_period_usage: number;
}

/**
 * Most Active Account
 * Account with highest feature usage
 */
export interface MostActiveAccount {
  account_id: string;
  account_name: string;
  account_slug: string;
  total_activity_score: number;
  assets_created: number;
  users_added: number;
  licenses_registered: number;
  maintenance_scheduled: number;
}

/**
 * Platform Usage Summary
 * Aggregated usage statistics across all features
 */
export interface PlatformUsageSummary {
  time_period: {
    start_date: string;
    end_date: string;
  };
  features: FeatureUsageStatistics[];
  most_active_accounts: {
    account_id: string;
    account_name: string;
    total_actions: number;
  }[];
}

/**
 * Platform Growth Metrics
 * Growth trends for key platform metrics
 */
export interface PlatformGrowthMetrics {
  accounts_growth_rate: number;
  users_growth_rate: number;
  assets_growth_rate: number;
  revenue_growth_rate: number;
  period: string;
}

/**
 * Admin Dashboard Data
 * Complete data structure for rendering the admin dashboard
 */
export interface AdminDashboardData {
  platform_metrics: PlatformMetrics;
  account_activity: AccountActivity[];
  system_health: SystemHealthStatus;
  subscription_overview: SubscriptionOverview[];
  usage_summary: PlatformUsageSummary;
  growth_metrics: PlatformGrowthMetrics;
}

/**
 * Account Activity Filter
 * Filter criteria for account activity list
 */
export interface AccountActivityFilter {
  status?: string;
  subscription_tier?: string;
  start_date?: string;
  end_date?: string;
  search_query?: string;
}

/**
 * System Health Trend Point
 * Historical data point for system health metrics
 */
export interface SystemHealthTrendPoint {
  timestamp: string;
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

/**
 * System Health Trend
 * Historical trend data for a system health metric
 */
export interface SystemHealthTrend {
  metric_type: SystemHealthMetricType;
  data_points: SystemHealthTrendPoint[];
  time_range: string;
}

/**
 * Metrics Refresh Statistics
 * Statistics about the automated metrics refresh job
 */
export interface MetricsRefreshStats {
  total_refreshes: number;
  successful_refreshes: number;
  failed_refreshes: number;
  success_rate: number;
  avg_duration_ms: number;
  max_duration_ms: number;
  last_refresh_at: string | null;
  last_error: string | null;
}
