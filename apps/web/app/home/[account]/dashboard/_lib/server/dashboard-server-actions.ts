'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { NotFoundError } from '@kit/shared/app-errors';
import { getLogger } from '@kit/shared/logger';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  DismissAlertSchema,
  UpdateWidgetLayoutSchema,
} from '../schemas/dashboard.schema';
import type { TeamDashboardMetrics } from '../types/dashboard.types';

/**
 * Dismisses a dashboard alert.
 * 
 * Updates the alert to mark it as dismissed with timestamp and user info.
 * Requires `dashboard.manage` permission for the account.
 * 
 * @param data - Alert dismissal data including alert ID and account slug
 * @returns Success status with dismissed alert ID
 * @throws {NotFoundError} If account or alert doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks dashboard.manage permission
 * 
 * @permission dashboard.manage - Required to dismiss alerts
 */
export const dismissAlert = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        name: 'dashboard.dismissAlert',
        alertId: data.alert_id,
      },
      'Dismissing dashboard alert...',
    );

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        {
          error: accountError,
          name: 'dashboard.dismissAlert',
          accountSlug: data.accountSlug,
        },
        'Failed to find account',
      );

      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user },
        } = await client.auth.getUser();

        // Update the alert to mark it as dismissed
        const { data: alert, error: updateError } = await client
          .from('dashboard_alerts')
          .update({
            is_dismissed: true,
            dismissed_by: user!.id,
            dismissed_at: new Date().toISOString(),
          })
          .eq('id', data.alert_id)
          .eq('account_id', account.id) // Ensure alert belongs to this account
          .select('id, account_id')
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

          throw updateError;
        }

        if (!alert) {
          logger.error(
            {
              name: 'dashboard.dismissAlert',
              alertId: data.alert_id,
            },
            'Alert not found or access denied',
          );

          throw new NotFoundError('Alert', data.alert_id);
        }

        logger.info(
          {
            name: 'dashboard.dismissAlert',
            alertId: data.alert_id,
          },
          'Alert dismissed successfully',
        );

        // Revalidate dashboard page to clear all caches
        revalidatePath(`/home/${data.accountSlug}/dashboard`);

        return {
          success: true,
          data: {
            alert_id: data.alert_id,
          },
        };
      },
      {
        accountId: account.id,
        permission: 'dashboard.manage',
        client,
        resourceName: 'alert',
      },
    );
  },
  {
    schema: DismissAlertSchema,
  },
);

/**
 * Updates widget layout configuration.
 * 
 * Saves user's widget visibility and ordering preferences.
 * Requires `dashboard.manage` permission for the account.
 * 
 * @param data - Widget layout data including account slug and widget configurations
 * @returns Success status with number of widgets updated
 * @throws {NotFoundError} If account doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks dashboard.manage permission
 * 
 * @permission dashboard.manage - Required to update widget layout
 */
export const updateWidgetLayout = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        name: 'dashboard.updateWidgetLayout',
        accountSlug: data.accountSlug,
        widgetCount: data.widgets.length,
      },
      'Updating widget layout...',
    );

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        {
          error: accountError,
          name: 'dashboard.updateWidgetLayout',
          accountSlug: data.accountSlug,
        },
        'Failed to find account',
      );

      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user
        const {
          data: { user },
        } = await client.auth.getUser();

        // Delete existing widget configurations for this user and account
        const { error: deleteError } = await client
          .from('dashboard_widgets')
          .delete()
          .eq('account_id', account.id)
          .eq('user_id', user!.id);

        if (deleteError) {
          logger.error(
            {
              error: deleteError,
              name: 'dashboard.updateWidgetLayout',
            },
            'Failed to delete existing widget configurations',
          );

          throw deleteError;
        }

        // Insert new widget configurations
        const widgetConfigs = data.widgets.map((widget) => ({
          account_id: account.id,
          user_id: user!.id,
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

          throw insertError;
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
      },
      {
        accountId: account.id,
        permission: 'dashboard.manage',
        client,
        resourceName: 'widget layout',
      },
    );
  },
  {
    schema: UpdateWidgetLayoutSchema,
  },
);

/**
 * Refreshes dashboard metrics.
 * 
 * Fetches the latest metrics for real-time updates.
 * Requires `dashboard.view` permission for the account.
 * 
 * @param accountSlug - The account slug to fetch metrics for
 * @returns Dashboard metrics including assets, users, licenses, and growth data
 * @throws {NotFoundError} If account doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks dashboard.view permission
 * 
 * @permission dashboard.view - Required to view dashboard metrics
 * 
 * Note: RLS policies on the underlying tables ensure users can only see
 * metrics for accounts they are members of with proper permissions.
 */
export async function refreshDashboardMetrics(
  accountSlug: string,
): Promise<TeamDashboardMetrics> {
  'use server';

  const logger = await getLogger();
  const client = getSupabaseServerClient();

  logger.info(
    {
      name: 'dashboard.refreshMetrics',
      accountSlug,
    },
    'Refreshing dashboard metrics...',
  );

  // Get account from slug
  const { data: account, error: accountError } = await client
    .from('accounts')
    .select('id, slug')
    .eq('slug', accountSlug)
    .single();

  if (accountError || !account) {
    logger.error(
      {
        error: accountError,
        name: 'dashboard.refreshMetrics',
        accountSlug,
      },
      'Failed to find account',
    );

    throw new NotFoundError('Account', accountSlug);
  }

  return withAccountPermission(
    async () => {
      // Call the database function to get metrics
      // RLS policies ensure user can only access their account's data
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

        throw error;
      }

      if (!data) {
        // Return default metrics if no data
        logger.info(
          {
            name: 'dashboard.refreshMetrics',
            accountSlug,
          },
          'No metrics data found, returning defaults',
        );

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

      return normalizedMetrics;
    },
    {
      accountId: account.id,
      permission: 'dashboard.view',
      client,
      resourceName: 'dashboard metrics',
    },
  );
}
