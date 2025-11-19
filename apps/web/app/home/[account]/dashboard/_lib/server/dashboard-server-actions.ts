'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  DismissAlertSchema,
  UpdateWidgetLayoutSchema,
} from '../schemas/dashboard.schema';
import type { TeamDashboardMetrics } from '../types/dashboard.types';

/**
 * Dismiss a dashboard alert
 * Updates the alert to mark it as dismissed with timestamp and user info
 */
export const dismissAlert = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'dashboard.dismissAlert',
          alertId: data.alert_id,
        },
        'Dismissing dashboard alert...',
      );

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        logger.error(
          {
            error: userError,
            name: 'dashboard.dismissAlert',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Update the alert to mark it as dismissed
      const { data: alert, error: updateError } = await client
        .from('dashboard_alerts')
        .update({
          is_dismissed: true,
          dismissed_by: user.id,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', data.alert_id)
        .select('account_id')
        .single();

      if (updateError) {
        logger.error(
          {
            error: updateError,
            name: 'dashboard.dismissAlert',
            alertId: data.alert_id,
          },
          'Failed to dismiss alert',
        );

        return {
          success: false,
          error: 'Failed to dismiss alert',
        };
      }

      if (!alert) {
        logger.error(
          {
            name: 'dashboard.dismissAlert',
            alertId: data.alert_id,
          },
          'Alert not found or access denied',
        );

        return {
          success: false,
          error: 'Alert not found or access denied',
        };
      }

      logger.info(
        {
          name: 'dashboard.dismissAlert',
          alertId: data.alert_id,
        },
        'Alert dismissed successfully',
      );

      // Get account slug for revalidation
      const { data: account } = await client
        .from('accounts')
        .select('slug')
        .eq('id', alert.account_id)
        .single();

      // Revalidate cache and dashboard page
      if (account?.slug) {
        // Revalidate path to clear all caches for this dashboard
        revalidatePath(`/home/${account.slug}/dashboard`);
      }

      return {
        success: true,
        data: {
          alert_id: data.alert_id,
        },
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'dashboard.dismissAlert',
          alertId: data.alert_id,
        },
        'Unexpected error dismissing alert',
      );

      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  },
  {
    schema: DismissAlertSchema,
  },
);

/**
 * Update widget layout configuration
 * Saves user's widget visibility and ordering preferences
 */
export const updateWidgetLayout = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'dashboard.updateWidgetLayout',
          accountSlug: data.accountSlug,
          widgetCount: data.widgets.length,
        },
        'Updating widget layout...',
      );

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        logger.error(
          {
            error: userError,
            name: 'dashboard.updateWidgetLayout',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Get account ID from slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'dashboard.updateWidgetLayout',
            accountSlug: data.accountSlug,
          },
          'Failed to get account',
        );

        return {
          success: false,
          error: 'Account not found',
        };
      }

      // Delete existing widget configurations for this user and account
      const { error: deleteError } = await client
        .from('dashboard_widgets')
        .delete()
        .eq('account_id', account.id)
        .eq('user_id', user.id);

      if (deleteError) {
        logger.error(
          {
            error: deleteError,
            name: 'dashboard.updateWidgetLayout',
          },
          'Failed to delete existing widget configurations',
        );

        return {
          success: false,
          error: 'Failed to update widget layout',
        };
      }

      // Insert new widget configurations
      const widgetConfigs = data.widgets.map((widget) => ({
        account_id: account.id,
        user_id: user.id,
        widget_type: widget.widget_type,
        widget_config: {},
        position_order: widget.position_order,
        is_visible: widget.is_visible,
      }));

      const { error: insertError } = await client
        .from('dashboard_widgets')
        .insert(widgetConfigs);

      if (insertError) {
        logger.error(
          {
            error: insertError,
            name: 'dashboard.updateWidgetLayout',
          },
          'Failed to insert widget configurations',
        );

        return {
          success: false,
          error: 'Failed to save widget layout',
        };
      }

      logger.info(
        {
          name: 'dashboard.updateWidgetLayout',
          accountSlug: data.accountSlug,
          widgetCount: data.widgets.length,
        },
        'Widget layout updated successfully',
      );

      // Revalidate dashboard page to clear all caches
      revalidatePath(`/home/${data.accountSlug}/dashboard`);

      return {
        success: true,
        data: {
          widgets_updated: data.widgets.length,
        },
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'dashboard.updateWidgetLayout',
          accountSlug: data.accountSlug,
        },
        'Unexpected error updating widget layout',
      );

      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  },
  {
    schema: UpdateWidgetLayoutSchema,
  },
);

/**
 * Refresh dashboard metrics
 * Fetches the latest metrics for real-time updates
 */
export async function refreshDashboardMetrics(
  accountSlug: string,
): Promise<TeamDashboardMetrics> {
  'use server';

  const logger = await getLogger();
  const client = getSupabaseServerClient();

  try {
    logger.info(
      {
        name: 'dashboard.refreshMetrics',
        accountSlug,
      },
      'Refreshing dashboard metrics...',
    );

    // Call the database function to get metrics
    const { data, error } = await client.rpc('get_team_dashboard_metrics', {
      p_account_slug: accountSlug,
    });

    if (error) {
      logger.error(
        {
          error,
          name: 'dashboard.refreshMetrics',
          accountSlug,
        },
        'Failed to fetch dashboard metrics',
      );

      throw new Error('Failed to fetch metrics');
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
      };
    }

    // Type assertion for JSONB data from database function
    const metrics = data as unknown as TeamDashboardMetrics;

    // Normalize the metrics to ensure all values are numbers
    const normalizedMetrics: TeamDashboardMetrics = {
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
    };

    logger.info(
      {
        name: 'dashboard.refreshMetrics',
        accountSlug,
      },
      'Dashboard metrics refreshed successfully',
    );

    // Note: Cache will be automatically revalidated based on TTL
    // For immediate updates, the client-side real-time subscriptions handle it

    return normalizedMetrics;
  } catch (error) {
    logger.error(
      {
        error,
        name: 'dashboard.refreshMetrics',
        accountSlug,
      },
      'Unexpected error refreshing dashboard metrics',
    );

    throw error;
  }
}
