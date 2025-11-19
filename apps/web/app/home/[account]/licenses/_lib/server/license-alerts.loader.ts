import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { getLogger } from '@kit/shared/logger';

import type { Database } from '~/lib/database.types';

/**
 * Load license renewal alerts for an account
 */
export async function loadLicenseRenewalAlerts(
  client: SupabaseClient<Database>,
  accountSlug: string,
) {
  const logger = await getLogger();

  try {
    // Get account_id from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        {
          error: accountError,
          accountSlug,
          name: 'license-alerts.load',
        },
        'Failed to find account',
      );

      throw new Error('Account not found');
    }

    // Fetch recent alerts (last 30 days) with license details
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: alerts, error: alertsError } = await client
      .from('license_renewal_alerts')
      .select(
        `
        id,
        license_id,
        alert_type,
        sent_at,
        software_licenses (
          id,
          name,
          vendor,
          expiration_date
        )
      `,
      )
      .eq('account_id', account.id)
      .gte('sent_at', thirtyDaysAgo.toISOString())
      .order('sent_at', { ascending: false });

    if (alertsError) {
      logger.error(
        {
          error: alertsError,
          accountId: account.id,
          name: 'license-alerts.load',
        },
        'Failed to fetch license renewal alerts',
      );

      throw alertsError;
    }

    // Transform the data to include calculated fields
    const transformedAlerts = (alerts || []).map((alert) => {
      const license = alert.software_licenses as unknown as {
        id: string;
        name: string;
        vendor: string;
        expiration_date: string;
      } | null;

      if (!license) {
        return null;
      }

      const expirationDate = new Date(license.expiration_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: alert.id,
        licenseId: alert.license_id,
        licenseName: license.name,
        vendor: license.vendor,
        expirationDate: license.expiration_date,
        daysUntilExpiry,
        alertType: alert.alert_type as '30_day' | '7_day',
        sentAt: alert.sent_at || new Date().toISOString(),
        isExpired: daysUntilExpiry < 0,
      };
    });

    // Filter out null values (licenses that were deleted)
    const validAlerts = transformedAlerts.filter(
      (alert): alert is NonNullable<typeof alert> => alert !== null,
    );

    logger.info(
      {
        accountId: account.id,
        alertCount: validAlerts.length,
        name: 'license-alerts.load',
      },
      'License renewal alerts loaded successfully',
    );

    return validAlerts;
  } catch (error) {
    logger.error(
      {
        error,
        accountSlug,
        name: 'license-alerts.load',
      },
      'Unexpected error loading license renewal alerts',
    );

    throw error;
  }
}

/**
 * Get count of active (non-expired) license renewal alerts
 */
export async function getLicenseAlertsCount(
  client: SupabaseClient<Database>,
  accountSlug: string,
) {
  const logger = await getLogger();

  try {
    // Get account_id from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        {
          error: accountError,
          accountSlug,
          name: 'license-alerts.count',
        },
        'Failed to find account',
      );

      return 0;
    }

    // Count alerts for licenses that haven't expired yet
    const { data: alerts, error: alertsError } = await client
      .from('license_renewal_alerts')
      .select(
        `
        id,
        software_licenses!inner (
          expiration_date
        )
      `,
        { count: 'exact', head: false },
      )
      .eq('account_id', account.id)
      .gte(
        'software_licenses.expiration_date',
        new Date().toISOString().split('T')[0],
      );

    if (alertsError) {
      logger.error(
        {
          error: alertsError,
          accountId: account.id,
          name: 'license-alerts.count',
        },
        'Failed to count license renewal alerts',
      );

      return 0;
    }

    return alerts?.length || 0;
  } catch (error) {
    logger.error(
      {
        error,
        accountSlug,
        name: 'license-alerts.count',
      },
      'Unexpected error counting license renewal alerts',
    );

    return 0;
  }
}
