import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import type {
  AccountActivity,
  FeatureUsageStatistics,
  MostActiveAccount,
  PlatformMetrics,
  SubscriptionOverview,
  SystemHealthStatus,
} from '../types/admin-dashboard.types';
import { getMetricsRefreshStats } from './metrics-refresh.service';
import { getSystemHealthStatus } from './system-health.service';

/**
 * Load all data required for the admin dashboard page
 * @param client - Supabase client
 */
export async function loadAdminDashboardPageData(
  client: SupabaseClient<Database>,
) {
  return Promise.all([
    loadPlatformMetrics(client),
    loadAccountActivityList(client),
    loadSystemHealth(client),
    loadSubscriptionOverview(client),
    loadUsageStatistics(client),
    loadMostActiveAccounts(client),
    loadMetricsRefreshStats(client),
  ]);
}

/**
 * Load metrics refresh statistics
 * @param client - Supabase client
 */
async function loadMetricsRefreshStats(client: SupabaseClient<Database>) {
  try {
    return await getMetricsRefreshStats(client, 24);
  } catch (error) {
    console.error('Error loading metrics refresh stats:', error);
    // Return default stats on error
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
}

/**
 * Load system health status
 * @param client - Supabase client
 */
async function loadSystemHealth(
  client: SupabaseClient<Database>,
): Promise<SystemHealthStatus> {
  try {
    return await getSystemHealthStatus(client);
  } catch (error) {
    console.error('Error loading system health:', error);
    // Return default healthy status on error
    return {
      overall_status: 'healthy',
      metrics: [],
      last_checked: new Date().toISOString(),
    };
  }
}

/**
 * Load platform-wide metrics using the database function
 * @param client - Supabase client
 */
async function loadPlatformMetrics(
  client: SupabaseClient<Database>,
): Promise<PlatformMetrics> {
  try {
    const { data, error } = await client.rpc('get_admin_platform_metrics');

    if (error) {
      console.error('Error loading platform metrics:', error);
      throw new Error(`Failed to load platform metrics: ${error.message}`);
    }

    if (!data) {
      // Return default metrics if no data
      return {
        total_accounts: 0,
        total_users: 0,
        total_assets: 0,
        total_licenses: 0,
        new_accounts_30d: 0,
        new_users_30d: 0,
        new_assets_30d: 0,
        last_updated: new Date().toISOString(),
      };
    }

    // Type assertion for JSONB data from database function
    const metrics = data as unknown as PlatformMetrics;

    return {
      total_accounts: Number(metrics.total_accounts ?? 0),
      total_users: Number(metrics.total_users ?? 0),
      total_assets: Number(metrics.total_assets ?? 0),
      total_licenses: Number(metrics.total_licenses ?? 0),
      new_accounts_30d: Number(metrics.new_accounts_30d ?? 0),
      new_users_30d: Number(metrics.new_users_30d ?? 0),
      new_assets_30d: Number(metrics.new_assets_30d ?? 0),
      last_updated:
        typeof metrics.last_updated === 'string'
          ? metrics.last_updated
          : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Unexpected error loading platform metrics:', error);
    throw error;
  }
}

/**
 * Load account activity list for admin dashboard
 * @param client - Supabase client
 * @param limit - Number of accounts to fetch
 * @param offset - Offset for pagination
 */
async function loadAccountActivityList(
  client: SupabaseClient<Database>,
  limit: number = 50,
  offset: number = 0,
): Promise<AccountActivity[]> {
  try {
    const { data, error } = await client.rpc('get_account_activity_list', {
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error('Error loading account activity list:', error);
      throw new Error(`Failed to load account activity list: ${error.message}`);
    }

    return (data ?? []).map((item) => ({
      account_id: item.account_id,
      account_name: item.account_name,
      account_slug: item.account_slug,
      user_count: Number(item.user_count ?? 0),
      asset_count: Number(item.asset_count ?? 0),
      last_activity_at: item.last_activity_at,
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('Unexpected error loading account activity list:', error);
    throw error;
  }
}

/**
 * Load subscription overview for admin dashboard
 * @param client - Supabase client
 */
async function loadSubscriptionOverview(
  client: SupabaseClient<Database>,
): Promise<SubscriptionOverview[]> {
  try {
    // Call the database function using raw query since types may not be updated yet
    const { data, error } = await client.rpc(
      'get_subscription_overview' as const,
    );

    if (error) {
      console.error('Error loading subscription overview:', error);
      throw new Error(`Failed to load subscription overview: ${error.message}`);
    }

    // Type assertion for the returned data
    const subscriptions = data as unknown as Array<{
      tier: string;
      account_count: number;
      total_revenue: number;
      expiring_soon_count: number;
      over_limit_count: number;
    }>;

    return (subscriptions ?? []).map((item) => ({
      tier: item.tier,
      account_count: Number(item.account_count ?? 0),
      total_revenue: Number(item.total_revenue ?? 0),
      expiring_soon_count: Number(item.expiring_soon_count ?? 0),
      over_limit_count: Number(item.over_limit_count ?? 0),
    }));
  } catch (error) {
    console.error('Unexpected error loading subscription overview:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Load platform usage statistics
 * @param client - Supabase client
 * @param days - Number of days to analyze (default: 30)
 */
async function loadUsageStatistics(
  client: SupabaseClient<Database>,
  days: number = 30,
): Promise<FeatureUsageStatistics[]> {
  try {
    const { data, error } = await client.rpc(
      'get_platform_usage_statistics' as const,
      { p_days: days },
    );

    if (error) {
      console.error('Error loading usage statistics:', error);
      throw new Error(`Failed to load usage statistics: ${error.message}`);
    }

    // Type assertion for the returned data
    const statistics = data as unknown as Array<{
      feature_name: string;
      total_usage_count: number;
      active_accounts_count: number;
      adoption_rate: number;
      trend_direction: 'up' | 'down' | 'stable';
      previous_period_usage: number;
    }>;

    return (statistics ?? []).map((item) => ({
      feature_name: item.feature_name,
      total_usage_count: Number(item.total_usage_count ?? 0),
      active_accounts_count: Number(item.active_accounts_count ?? 0),
      adoption_rate: Number(item.adoption_rate ?? 0),
      trend_direction: item.trend_direction,
      previous_period_usage: Number(item.previous_period_usage ?? 0),
    }));
  } catch (error) {
    console.error('Unexpected error loading usage statistics:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Load most active accounts by feature usage
 * @param client - Supabase client
 * @param days - Number of days to analyze (default: 30)
 * @param limit - Number of accounts to return (default: 10)
 */
async function loadMostActiveAccounts(
  client: SupabaseClient<Database>,
  days: number = 30,
  limit: number = 10,
): Promise<MostActiveAccount[]> {
  try {
    const { data, error } = await client.rpc(
      'get_most_active_accounts' as const,
      { p_days: days, p_limit: limit },
    );

    if (error) {
      console.error('Error loading most active accounts:', error);
      throw new Error(`Failed to load most active accounts: ${error.message}`);
    }

    // Type assertion for the returned data
    const accounts = data as unknown as Array<{
      account_id: string;
      account_name: string;
      account_slug: string;
      total_activity_score: number;
      assets_created: number;
      users_added: number;
      licenses_registered: number;
      maintenance_scheduled: number;
    }>;

    return (accounts ?? []).map((item) => ({
      account_id: item.account_id,
      account_name: item.account_name,
      account_slug: item.account_slug,
      total_activity_score: Number(item.total_activity_score ?? 0),
      assets_created: Number(item.assets_created ?? 0),
      users_added: Number(item.users_added ?? 0),
      licenses_registered: Number(item.licenses_registered ?? 0),
      maintenance_scheduled: Number(item.maintenance_scheduled ?? 0),
    }));
  } catch (error) {
    console.error('Unexpected error loading most active accounts:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}
