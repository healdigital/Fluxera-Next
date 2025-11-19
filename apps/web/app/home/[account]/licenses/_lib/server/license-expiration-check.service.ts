import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

/**
 * Service for managing license expiration checks
 * Provides methods to manually trigger checks and view execution logs
 */

export interface LicenseExpirationCheckLog {
  id: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  alerts_created: number;
  status: 'success' | 'error';
  error_message: string | null;
  created_at: string;
}

/**
 * Manually trigger a license expiration check
 * This calls the same function that runs on the scheduled job
 */
export async function triggerLicenseExpirationCheck(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = getSupabaseServerAdminClient();

    // Call the function with logging
    const { error } = await client.rpc(
      'check_license_expirations_with_logging',
    );

    if (error) {
      console.error('Error triggering license expiration check:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error(
      'Unexpected error triggering license expiration check:',
      error,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recent license expiration check logs
 * @param limit - Number of logs to retrieve (default: 10)
 */
export async function getLicenseExpirationCheckLogs(
  limit = 10,
): Promise<LicenseExpirationCheckLog[]> {
  try {
    const client = getSupabaseServerAdminClient();

    const { data, error } = await client
      .from('license_expiration_check_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching license expiration check logs:', error);
      return [];
    }

    return (data ?? []) as LicenseExpirationCheckLog[];
  } catch (error) {
    console.error(
      'Unexpected error fetching license expiration check logs:',
      error,
    );
    return [];
  }
}

/**
 * Get the most recent license expiration check log
 */
export async function getLatestLicenseExpirationCheckLog(): Promise<LicenseExpirationCheckLog | null> {
  try {
    const client = getSupabaseServerAdminClient();

    const { data, error } = await client
      .from('license_expiration_check_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error(
        'Error fetching latest license expiration check log:',
        error,
      );
      return null;
    }

    return data as LicenseExpirationCheckLog;
  } catch (error) {
    console.error(
      'Unexpected error fetching latest license expiration check log:',
      error,
    );
    return null;
  }
}

/**
 * Get license expiration check statistics
 */
export async function getLicenseExpirationCheckStats(): Promise<{
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
  total_alerts_created: number;
  average_duration_ms: number;
  last_check_at: string | null;
}> {
  try {
    const client = getSupabaseServerAdminClient();

    const { data, error } = await client.rpc(
      'get_license_expiration_check_stats',
    );

    if (error) {
      console.error('Error fetching license expiration check stats:', error);
      return {
        total_checks: 0,
        successful_checks: 0,
        failed_checks: 0,
        total_alerts_created: 0,
        average_duration_ms: 0,
        last_check_at: null,
      };
    }

    return (
      data[0] || {
        total_checks: 0,
        successful_checks: 0,
        failed_checks: 0,
        total_alerts_created: 0,
        average_duration_ms: 0,
        last_check_at: null,
      }
    );
  } catch (error) {
    console.error(
      'Unexpected error fetching license expiration check stats:',
      error,
    );
    return {
      total_checks: 0,
      successful_checks: 0,
      failed_checks: 0,
      total_alerts_created: 0,
      average_duration_ms: 0,
      last_check_at: null,
    };
  }
}
