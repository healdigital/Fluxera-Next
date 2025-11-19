import 'server-only';

import { unstable_cache } from 'next/cache';

import { SupabaseClient } from '@supabase/supabase-js';

import { PERFORMANCE_THRESHOLDS, measureAsync } from '@kit/shared/performance';

import { Database } from '~/lib/database.types';

import type {
  DashboardAlert,
  DashboardWidget,
  TeamDashboardMetrics,
} from '../types/dashboard.types';

/**
 * Load all data required for the team dashboard page
 * @param client - Supabase client
 * @param slug - Account slug
 * @param userId - Current user ID for widget configuration
 */
export async function loadDashboardPageData(
  client: SupabaseClient<Database>,
  slug: string,
  userId: string,
) {
  return measureAsync(
    'load-dashboard-page',
    async () => {
      return Promise.all([
        measureAsync(
          'load-dashboard-metrics',
          () => loadTeamDashboardMetrics(client, slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-widget-configuration',
          () => loadUserWidgetConfiguration(client, slug, userId),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-active-alerts',
          () => loadActiveAlerts(client, slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
      ]);
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD,
  );
}

/**
 * Load team dashboard metrics using the database function
 * Implements server-side caching with Next.js unstable_cache
 * @param client - Supabase client
 * @param accountSlug - Account slug
 */
async function loadTeamDashboardMetrics(
  client: SupabaseClient<Database>,
  accountSlug: string,
): Promise<TeamDashboardMetrics> {
  // Use Next.js unstable_cache for server-side caching
  const getCachedMetrics = unstable_cache(
    async (slug: string) => {
      try {
        const { data, error } = await client.rpc('get_team_dashboard_metrics', {
          p_account_slug: slug,
        });

        if (error) {
          console.error('Error loading dashboard metrics:', error);
          throw new Error(`Failed to load dashboard metrics: ${error.message}`);
        }

        if (!data) {
          // Return default metrics if no data
          return {
            total_assets: 0,
            available_assets: 0,
            assigned_assets: 0,
            maintenance_assets: 0,
            total_users: 0,
            active_users: 0,
            total_licenses: 0,
            active_licenses: 0,
            expiring_licenses_30d: 0,
            pending_maintenance: 0,
            assets_growth_30d: 0,
            users_growth_30d: 0,
          } as TeamDashboardMetrics;
        }

        // Type assertion for JSONB data from database function
        const metrics = data as unknown as TeamDashboardMetrics;

        return {
          total_assets: Number(metrics.total_assets ?? 0),
          available_assets: Number(metrics.available_assets ?? 0),
          assigned_assets: Number(metrics.assigned_assets ?? 0),
          maintenance_assets: Number(metrics.maintenance_assets ?? 0),
          total_users: Number(metrics.total_users ?? 0),
          active_users: Number(metrics.active_users ?? 0),
          total_licenses: Number(metrics.total_licenses ?? 0),
          active_licenses: Number(metrics.active_licenses ?? 0),
          expiring_licenses_30d: Number(metrics.expiring_licenses_30d ?? 0),
          pending_maintenance: Number(metrics.pending_maintenance ?? 0),
          assets_growth_30d: Number(metrics.assets_growth_30d ?? 0),
          users_growth_30d: Number(metrics.users_growth_30d ?? 0),
        } as TeamDashboardMetrics;
      } catch (error) {
        console.error('Unexpected error loading dashboard metrics:', error);
        throw error;
      }
    },
    [`dashboard-metrics-${accountSlug}`],
    {
      revalidate: 30, // Cache for 30 seconds
      tags: [`dashboard-metrics-${accountSlug}`],
    },
  );

  return getCachedMetrics(accountSlug);
}

/**
 * Load user's widget configuration for the dashboard
 * Implements server-side caching with Next.js unstable_cache
 * @param client - Supabase client
 * @param accountSlug - Account slug
 * @param userId - Current user ID
 */
async function loadUserWidgetConfiguration(
  client: SupabaseClient<Database>,
  accountSlug: string,
  userId: string,
): Promise<DashboardWidget[]> {
  // Use Next.js unstable_cache for server-side caching
  const getCachedWidgets = unstable_cache(
    async (slug: string, uid: string) => {
      try {
        // First, get the account_id from the slug
        const { data: account, error: accountError } = await client
          .from('accounts')
          .select('id')
          .eq('slug', slug)
          .single();

        if (accountError) {
          console.error('Error loading account:', accountError);
          throw new Error(`Failed to load account: ${accountError.message}`);
        }

        if (!account) {
          throw new Error('Account not found');
        }

        // Fetch user's widget configuration
        const { data, error } = await client
          .from('dashboard_widgets')
          .select('*')
          .eq('account_id', account.id)
          .eq('user_id', uid)
          .eq('is_visible', true)
          .order('position_order', { ascending: true });

        if (error) {
          console.error('Error loading widget configuration:', error);
          throw new Error(
            `Failed to load widget configuration: ${error.message}`,
          );
        }

        return (data ?? []) as DashboardWidget[];
      } catch (error) {
        console.error('Unexpected error loading widget configuration:', error);
        // Return empty array on error to allow dashboard to render with defaults
        return [];
      }
    },
    [`dashboard-widgets-${accountSlug}-${userId}`],
    {
      revalidate: 60, // Cache for 60 seconds (widget config changes less frequently)
      tags: [`dashboard-widgets-${accountSlug}-${userId}`],
    },
  );

  return getCachedWidgets(accountSlug, userId);
}

/**
 * Load active alerts for the team
 * Implements server-side caching with shorter TTL for timely alerts
 * @param client - Supabase client
 * @param accountSlug - Account slug
 */
async function loadActiveAlerts(
  client: SupabaseClient<Database>,
  accountSlug: string,
): Promise<DashboardAlert[]> {
  // Use Next.js unstable_cache for server-side caching
  const getCachedAlerts = unstable_cache(
    async (slug: string) => {
      try {
        // First, get the account_id from the slug
        const { data: account, error: accountError } = await client
          .from('accounts')
          .select('id')
          .eq('slug', slug)
          .single();

        if (accountError) {
          console.error('Error loading account:', accountError);
          throw new Error(`Failed to load account: ${accountError.message}`);
        }

        if (!account) {
          throw new Error('Account not found');
        }

        // Fetch active alerts (not dismissed and not expired)
        const { data, error } = await client
          .from('dashboard_alerts')
          .select('*')
          .eq('account_id', account.id)
          .eq('is_dismissed', false)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order('severity', { ascending: false }) // Critical first
          .order('created_at', { ascending: false }); // Most recent first

        if (error) {
          console.error('Error loading alerts:', error);
          throw new Error(`Failed to load alerts: ${error.message}`);
        }

        return (data ?? []) as DashboardAlert[];
      } catch (error) {
        console.error('Unexpected error loading alerts:', error);
        // Return empty array on error to allow dashboard to render without alerts
        return [];
      }
    },
    [`dashboard-alerts-${accountSlug}`],
    {
      revalidate: 15, // Cache for 15 seconds (alerts need to be timely)
      tags: [`dashboard-alerts-${accountSlug}`],
    },
  );

  return getCachedAlerts(accountSlug);
}
