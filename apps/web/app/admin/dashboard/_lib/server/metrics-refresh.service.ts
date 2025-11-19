import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

/**
 * Service for managing platform metrics refresh operations
 */

export interface MetricsRefreshStats {
  total_refreshes: number;
  successful_refreshes: number;
  failed_refreshes: number;
  success_rate: number;
  avg_duration_ms: number;
  max_duration_ms: number;
  min_duration_ms: number;
  last_refresh_at: string | null;
  last_error: string | null;
}

export interface MetricsRefreshLog {
  id: string;
  refresh_type: string;
  status: 'success' | 'error';
  duration_ms: number;
  error_message: string | null;
  started_at: string;
  completed_at: string;
  created_at: string | null;
}

export interface TriggerRefreshResult {
  success: boolean;
  duration_ms: number;
  started_at: string;
  completed_at: string;
  message: string;
}

/**
 * Get statistics about platform metrics refresh operations
 * @param client - Supabase client
 * @param hours - Number of hours to look back (default: 24)
 * @returns Refresh statistics
 */
export async function getMetricsRefreshStats(
  client: SupabaseClient<Database>,
  hours: number = 24,
): Promise<MetricsRefreshStats> {
  const { data, error } = await client.rpc('get_metrics_refresh_stats', {
    p_hours: hours,
  });

  if (error) {
    console.error('Error fetching metrics refresh stats:', error);
    throw new Error('Failed to fetch metrics refresh statistics');
  }

  // The RPC returns an array with a single row
  const stats = data?.[0];

  if (!stats) {
    // Return default values if no data
    return {
      total_refreshes: 0,
      successful_refreshes: 0,
      failed_refreshes: 0,
      success_rate: 0,
      avg_duration_ms: 0,
      max_duration_ms: 0,
      min_duration_ms: 0,
      last_refresh_at: null,
      last_error: null,
    };
  }

  return {
    total_refreshes: Number(stats.total_refreshes),
    successful_refreshes: Number(stats.successful_refreshes),
    failed_refreshes: Number(stats.failed_refreshes),
    success_rate: Number(stats.success_rate),
    avg_duration_ms: Number(stats.avg_duration_ms),
    max_duration_ms: Number(stats.max_duration_ms),
    min_duration_ms: Number(stats.min_duration_ms),
    last_refresh_at: stats.last_refresh_at,
    last_error: stats.last_error,
  };
}

/**
 * Get recent metrics refresh logs
 * @param client - Supabase client
 * @param limit - Number of logs to retrieve (default: 50)
 * @returns Array of refresh logs
 */
export async function getMetricsRefreshLogs(
  client: SupabaseClient<Database>,
  limit: number = 50,
): Promise<MetricsRefreshLog[]> {
  const { data, error } = await client
    .from('metrics_refresh_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching metrics refresh logs:', error);
    throw new Error('Failed to fetch metrics refresh logs');
  }

  return (data || []).map(
    (log): MetricsRefreshLog => ({
      id: log.id as string,
      refresh_type: log.refresh_type as string,
      status: log.status as 'success' | 'error',
      duration_ms: Number(log.duration_ms),
      error_message: log.error_message as string | null,
      started_at: log.started_at as string,
      completed_at: log.completed_at as string,
      created_at: log.created_at as string | null,
    }),
  );
}

/**
 * Manually trigger a platform metrics refresh
 * @param client - Supabase client
 * @returns Result of the refresh operation
 */
export async function triggerPlatformMetricsRefresh(
  client: SupabaseClient<Database>,
): Promise<TriggerRefreshResult> {
  const { data, error } = await client.rpc('trigger_platform_metrics_refresh');

  if (error) {
    console.error('Error triggering metrics refresh:', error);
    throw new Error('Failed to trigger metrics refresh');
  }

  if (!data) {
    throw new Error('No data returned from refresh trigger');
  }

  const result = data as unknown as {
    success: boolean;
    duration_ms: number;
    started_at: string;
    completed_at: string;
    message: string;
  };

  return {
    success: result.success,
    duration_ms: Number(result.duration_ms),
    started_at: result.started_at,
    completed_at: result.completed_at,
    message: result.message,
  };
}

/**
 * Check if metrics refresh is healthy based on recent statistics
 * @param stats - Metrics refresh statistics
 * @returns Health status and message
 */
export function checkMetricsRefreshHealth(stats: MetricsRefreshStats): {
  isHealthy: boolean;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
} {
  // No refreshes in the time period
  if (stats.total_refreshes === 0) {
    return {
      isHealthy: false,
      status: 'critical',
      message: 'No metrics refreshes detected in the monitoring period',
    };
  }

  // Success rate below 80% is critical
  if (stats.success_rate < 80) {
    return {
      isHealthy: false,
      status: 'critical',
      message: `Low success rate: ${stats.success_rate.toFixed(1)}%`,
    };
  }

  // Success rate below 95% is warning
  if (stats.success_rate < 95) {
    return {
      isHealthy: true,
      status: 'warning',
      message: `Success rate below optimal: ${stats.success_rate.toFixed(1)}%`,
    };
  }

  // Average duration over 5 seconds is warning
  if (stats.avg_duration_ms > 5000) {
    return {
      isHealthy: true,
      status: 'warning',
      message: `High average refresh duration: ${(stats.avg_duration_ms / 1000).toFixed(2)}s`,
    };
  }

  // Check if last refresh was recent (within 10 minutes)
  if (stats.last_refresh_at) {
    const lastRefreshTime = new Date(stats.last_refresh_at).getTime();
    const now = Date.now();
    const minutesSinceLastRefresh = (now - lastRefreshTime) / 1000 / 60;

    if (minutesSinceLastRefresh > 10) {
      return {
        isHealthy: false,
        status: 'warning',
        message: `Last refresh was ${Math.floor(minutesSinceLastRefresh)} minutes ago`,
      };
    }
  }

  return {
    isHealthy: true,
    status: 'healthy',
    message: 'Metrics refresh is operating normally',
  };
}
