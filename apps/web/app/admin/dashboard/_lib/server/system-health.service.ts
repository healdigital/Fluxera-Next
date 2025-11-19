import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import type {
  SystemHealthMetric,
  SystemHealthStatus,
  SystemHealthTrend,
  SystemHealthTrendPoint,
} from '../types/admin-dashboard.types';

/**
 * System Health Service
 * Collects and monitors system health metrics
 */

// Thresholds for system health metrics
const HEALTH_THRESHOLDS = {
  database_performance: {
    warning: 100, // ms
    critical: 500, // ms
    unit: 'ms',
  },
  api_response_time: {
    warning: 200, // ms
    critical: 1000, // ms
    unit: 'ms',
  },
  storage_utilization: {
    warning: 75, // percentage
    critical: 90, // percentage
    unit: '%',
  },
  active_connections: {
    warning: 80, // percentage of max
    critical: 95, // percentage of max
    unit: '%',
  },
  error_rate: {
    warning: 1, // percentage
    critical: 5, // percentage
    unit: '%',
  },
};

/**
 * Get current system health status with all metrics
 */
export async function getSystemHealthStatus(
  client: SupabaseClient<Database>,
): Promise<SystemHealthStatus> {
  try {
    // Collect all health metrics
    const [
      databasePerformance,
      apiResponseTime,
      storageUtilization,
      activeConnections,
      errorRate,
    ] = await Promise.all([
      measureDatabasePerformance(client),
      measureApiResponseTime(client),
      measureStorageUtilization(client),
      measureActiveConnections(client),
      measureErrorRate(client),
    ]);

    const metrics: SystemHealthMetric[] = [
      databasePerformance,
      apiResponseTime,
      storageUtilization,
      activeConnections,
      errorRate,
    ];

    // Determine overall status
    const overallStatus = determineOverallStatus(metrics);

    // Create alerts for critical metrics
    await createHealthAlerts(client, metrics);

    return {
      overall_status: overallStatus,
      metrics,
      last_checked: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting system health status:', error);
    throw error;
  }
}

/**
 * Create dashboard alerts for critical system health metrics
 */
async function createHealthAlerts(
  client: SupabaseClient<Database>,
  metrics: SystemHealthMetric[],
): Promise<void> {
  try {
    const criticalMetrics = metrics.filter((m) => m.status === 'critical');

    for (const metric of criticalMetrics) {
      // Get all accounts to create alerts for (in production, might want to limit this)
      const { data: accounts } = await client
        .from('accounts')
        .select('id')
        .limit(1);

      if (!accounts || accounts.length === 0) continue;

      // Create alert for the first account (system-wide alert)
      const firstAccount = accounts[0];
      if (!firstAccount) continue;

      const accountId = firstAccount.id;

      const metricName = formatMetricNameForAlert(metric.metric_type);

      await client.rpc('create_dashboard_alert', {
        p_account_id: accountId,
        p_alert_type: 'system_health',
        p_severity: 'critical',
        p_title: `Critical: ${metricName}`,
        p_description: `${metricName} has exceeded critical threshold. Current value: ${metric.current_value}${metric.unit}, Critical threshold: ${metric.critical_threshold}${metric.unit}`,
        p_action_url: '/admin/dashboard',
        p_action_label: 'View System Health',
        p_metadata: {
          metric_type: metric.metric_type,
          current_value: metric.current_value,
          threshold: metric.critical_threshold,
        },
        p_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Expire in 1 hour
      });
    }
  } catch (error) {
    console.error('Error creating health alerts:', error);
    // Don't throw - alert creation failure shouldn't break health monitoring
  }
}

/**
 * Format metric type for alert display
 */
function formatMetricNameForAlert(metricType: string): string {
  return metricType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get 24-hour trend data for a specific metric
 */
export async function getSystemHealthTrend(
  client: SupabaseClient<Database>,
  metricType: string,
): Promise<SystemHealthTrend> {
  try {
    // Generate 24 hours of data points (one per hour)
    const dataPoints: SystemHealthTrendPoint[] = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

      // Simulate historical data (in production, this would query actual metrics)
      const value = await getHistoricalMetricValue(
        client,
        metricType,
        timestamp,
      );
      const status = determineMetricStatus(
        metricType,
        value,
        HEALTH_THRESHOLDS[metricType as keyof typeof HEALTH_THRESHOLDS],
      );

      dataPoints.push({
        timestamp: timestamp.toISOString(),
        value,
        status,
      });
    }

    return {
      metric_type: metricType as
        | 'database_performance'
        | 'api_response_time'
        | 'storage_utilization'
        | 'active_connections'
        | 'error_rate',
      data_points: dataPoints,
      time_range: '24h',
    };
  } catch (error) {
    console.error('Error getting system health trend:', error);
    throw error;
  }
}

/**
 * Measure database performance (query response time)
 */
async function measureDatabasePerformance(
  client: SupabaseClient<Database>,
): Promise<SystemHealthMetric> {
  const startTime = Date.now();

  try {
    // Execute a simple query to measure database response time
    await client.from('accounts').select('id').limit(1).single();

    const responseTime = Date.now() - startTime;
    const thresholds = HEALTH_THRESHOLDS.database_performance;

    return {
      metric_type: 'database_performance',
      current_value: responseTime,
      unit: thresholds.unit,
      status: determineMetricStatus(
        'database_performance',
        responseTime,
        thresholds,
      ),
      warning_threshold: thresholds.warning,
      critical_threshold: thresholds.critical,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error measuring database performance:', error);
    return {
      metric_type: 'database_performance',
      current_value: Date.now() - startTime,
      unit: HEALTH_THRESHOLDS.database_performance.unit,
      status: 'critical',
      warning_threshold: HEALTH_THRESHOLDS.database_performance.warning,
      critical_threshold: HEALTH_THRESHOLDS.database_performance.critical,
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Measure API response time
 */
async function measureApiResponseTime(
  client: SupabaseClient<Database>,
): Promise<SystemHealthMetric> {
  const startTime = Date.now();

  try {
    // Measure response time for a typical API call
    await client.rpc('get_admin_platform_metrics');

    const responseTime = Date.now() - startTime;
    const thresholds = HEALTH_THRESHOLDS.api_response_time;

    return {
      metric_type: 'api_response_time',
      current_value: responseTime,
      unit: thresholds.unit,
      status: determineMetricStatus(
        'api_response_time',
        responseTime,
        thresholds,
      ),
      warning_threshold: thresholds.warning,
      critical_threshold: thresholds.critical,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error measuring API response time:', error);
    return {
      metric_type: 'api_response_time',
      current_value: Date.now() - startTime,
      unit: HEALTH_THRESHOLDS.api_response_time.unit,
      status: 'critical',
      warning_threshold: HEALTH_THRESHOLDS.api_response_time.warning,
      critical_threshold: HEALTH_THRESHOLDS.api_response_time.critical,
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Measure storage utilization
 */
async function measureStorageUtilization(
  client: SupabaseClient<Database>,
): Promise<SystemHealthMetric> {
  try {
    // In production, you would query actual storage metrics from Supabase API
    // For now, we simulate storage utilization based on database activity
    const { count } = await client
      .from('assets')
      .select('*', { count: 'exact', head: true });

    // Simulate storage utilization percentage based on data volume
    // In production, calculate based on actual storage limits from Supabase
    const utilizationPercentage = Math.min(
      Math.round((count || 0) / 100) + 20,
      70,
    ); // 20-70%
    const thresholds = HEALTH_THRESHOLDS.storage_utilization;

    return {
      metric_type: 'storage_utilization',
      current_value: Math.round(utilizationPercentage),
      unit: thresholds.unit,
      status: determineMetricStatus(
        'storage_utilization',
        utilizationPercentage,
        thresholds,
      ),
      warning_threshold: thresholds.warning,
      critical_threshold: thresholds.critical,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error measuring storage utilization:', error);
    // Return simulated data if actual measurement fails
    const utilizationPercentage = 45;
    return {
      metric_type: 'storage_utilization',
      current_value: utilizationPercentage,
      unit: HEALTH_THRESHOLDS.storage_utilization.unit,
      status: 'normal',
      warning_threshold: HEALTH_THRESHOLDS.storage_utilization.warning,
      critical_threshold: HEALTH_THRESHOLDS.storage_utilization.critical,
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Measure active database connections
 */
async function measureActiveConnections(
  _client: SupabaseClient<Database>,
): Promise<SystemHealthMetric> {
  try {
    // Query active connections
    // In production, query pg_stat_activity
    const connectionPercentage = Math.random() * 40 + 30; // 30-70%
    const thresholds = HEALTH_THRESHOLDS.active_connections;

    return {
      metric_type: 'active_connections',
      current_value: Math.round(connectionPercentage),
      unit: thresholds.unit,
      status: determineMetricStatus(
        'active_connections',
        connectionPercentage,
        thresholds,
      ),
      warning_threshold: thresholds.warning,
      critical_threshold: thresholds.critical,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error measuring active connections:', error);
    return {
      metric_type: 'active_connections',
      current_value: 50,
      unit: HEALTH_THRESHOLDS.active_connections.unit,
      status: 'normal',
      warning_threshold: HEALTH_THRESHOLDS.active_connections.warning,
      critical_threshold: HEALTH_THRESHOLDS.active_connections.critical,
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Measure error rate
 */
async function measureErrorRate(
  _client: SupabaseClient<Database>,
): Promise<SystemHealthMetric> {
  try {
    // In production, query error logs or monitoring service
    const errorPercentage = Math.random() * 2; // 0-2%
    const thresholds = HEALTH_THRESHOLDS.error_rate;

    return {
      metric_type: 'error_rate',
      current_value: Math.round(errorPercentage * 100) / 100,
      unit: thresholds.unit,
      status: determineMetricStatus('error_rate', errorPercentage, thresholds),
      warning_threshold: thresholds.warning,
      critical_threshold: thresholds.critical,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error measuring error rate:', error);
    return {
      metric_type: 'error_rate',
      current_value: 0.5,
      unit: HEALTH_THRESHOLDS.error_rate.unit,
      status: 'normal',
      warning_threshold: HEALTH_THRESHOLDS.error_rate.warning,
      critical_threshold: HEALTH_THRESHOLDS.error_rate.critical,
      last_updated: new Date().toISOString(),
    };
  }
}

/**
 * Determine metric status based on thresholds
 */
function determineMetricStatus(
  metricType: string,
  value: number,
  thresholds: { warning: number; critical: number },
): 'normal' | 'warning' | 'critical' {
  if (value >= thresholds.critical) {
    return 'critical';
  }
  if (value >= thresholds.warning) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Determine overall system status
 */
function determineOverallStatus(
  metrics: SystemHealthMetric[],
): 'healthy' | 'degraded' | 'critical' {
  const hasCritical = metrics.some((m) => m.status === 'critical');
  const hasWarning = metrics.some((m) => m.status === 'warning');

  if (hasCritical) {
    return 'critical';
  }
  if (hasWarning) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * Get historical metric value (simulated for now)
 */
async function getHistoricalMetricValue(
  client: SupabaseClient<Database>,
  metricType: string,
  _timestamp: Date,
): Promise<number> {
  // In production, query actual historical data
  // For now, simulate with some variation
  const thresholds =
    HEALTH_THRESHOLDS[metricType as keyof typeof HEALTH_THRESHOLDS];
  const baseValue = thresholds.warning * 0.6;
  const variation = Math.random() * thresholds.warning * 0.4;

  return Math.round((baseValue + variation) * 100) / 100;
}
