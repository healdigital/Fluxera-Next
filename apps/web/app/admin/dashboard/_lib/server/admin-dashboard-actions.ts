'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { AccountActivity } from '../types/admin-dashboard.types';

/**
 * Load paginated account activity list
 * Server action to support pagination in the account activity widget
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 */
export async function loadAccountActivityPage(
  page: number = 1,
  pageSize: number = 50,
): Promise<{
  accounts: AccountActivity[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}> {
  const client = getSupabaseServerClient();

  // Calculate offset
  const offset = (page - 1) * pageSize;

  try {
    // Fetch paginated data
    const { data, error } = await client.rpc('get_account_activity_list', {
      p_limit: pageSize,
      p_offset: offset,
    });

    if (error) {
      console.error('Error loading account activity page:', error);
      throw new Error(`Failed to load account activity: ${error.message}`);
    }

    // Get total count for pagination
    const { count, error: countError } = await client
      .from('accounts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting accounts:', countError);
    }

    const accounts: AccountActivity[] = (data ?? []).map((item) => ({
      account_id: item.account_id,
      account_name: item.account_name,
      account_slug: item.account_slug,
      user_count: Number(item.user_count ?? 0),
      asset_count: Number(item.asset_count ?? 0),
      last_activity_at: item.last_activity_at,
      created_at: item.created_at,
    }));

    return {
      accounts,
      totalCount: count ?? accounts.length,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error('Unexpected error loading account activity page:', error);
    throw error;
  }
}

/**
 * Refresh admin dashboard data
 * Revalidates the admin dashboard page to fetch fresh data
 */
export async function refreshAdminDashboard() {
  revalidatePath('/admin/dashboard');
}

/**
 * Get metrics refresh statistics
 * Returns statistics about the metrics refresh process
 */
export async function getMetricsRefreshStatsAction(_params?: {
  hours?: number;
}) {
  const client = getSupabaseServerClient();

  try {
    // Get aggregated statistics
    const { data, error } = await client
      .from('metrics_refresh_log')
      .select('status, duration_ms, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading metrics refresh stats:', error);
      throw new Error(`Failed to load metrics refresh stats: ${error.message}`);
    }

    const logs = data ?? [];
    const totalRefreshes = logs.length;
    const successfulRefreshes = logs.filter(
      (l) => l.status === 'success',
    ).length;
    const failedRefreshes = logs.filter((l) => l.status === 'error').length;
    const avgDuration =
      logs.length > 0
        ? logs.reduce((sum, l) => sum + (Number(l.duration_ms) || 0), 0) /
          logs.length
        : 0;
    const lastRefresh = logs.length > 0 && logs[0] ? logs[0].created_at : null;

    const maxDuration =
      logs.length > 0
        ? Math.max(...logs.map((l) => Number(l.duration_ms) || 0))
        : 0;

    return {
      success: true,
      data: {
        total_refreshes: totalRefreshes,
        successful_refreshes: successfulRefreshes,
        failed_refreshes: failedRefreshes,
        success_rate:
          totalRefreshes > 0 ? (successfulRefreshes / totalRefreshes) * 100 : 0,
        avg_duration_ms: avgDuration,
        max_duration_ms: maxDuration,
        last_refresh_at: lastRefresh,
        last_error: null, // Could be enhanced to get the last error message
      },
    };
  } catch (error) {
    console.error('Unexpected error loading metrics refresh stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger metrics refresh
 * Manually triggers a refresh of platform metrics
 */
export async function triggerMetricsRefreshAction(
  _params?: Record<string, unknown>,
) {
  const client = getSupabaseServerClient();

  try {
    const { data, error } = await client.rpc('refresh_platform_metrics');

    if (error) {
      console.error('Error triggering metrics refresh:', error);
      throw new Error(`Failed to trigger metrics refresh: ${error.message}`);
    }

    // Revalidate the admin dashboard to show updated data
    revalidatePath('/admin/dashboard');

    const result = data as unknown as {
      success: boolean;
      duration_ms: number;
      started_at: string;
      completed_at: string;
      message: string;
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Unexpected error triggering metrics refresh:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
