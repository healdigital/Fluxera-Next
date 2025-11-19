#!/usr/bin/env tsx

/**
 * License Expiration Check Script
 *
 * This script manually triggers the license expiration check process.
 * It can be run:
 * - Manually for testing
 * - Via cron job as a backup to pg_cron
 * - For debugging and monitoring
 *
 * Usage:
 *   pnpm tsx apps/web/scripts/check-license-expirations.ts
 *
 * Environment Variables:
 *   SUPABASE_SERVICE_ROLE_KEY - Required for admin access
 *   SUPABASE_URL - Supabase project URL
 */
import { createClient } from '@supabase/supabase-js';

interface CheckResult {
  success: boolean;
  duration_ms?: number;
  alerts_created?: number;
  error?: string;
}

async function checkLicenseExpirations(): Promise<CheckResult> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      success: false,
      error:
        'Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const startTime = Date.now();

  try {
    console.log('Starting license expiration check...');

    // Call the database function
    const { error } = await supabase.rpc(
      'check_license_expirations_with_logging',
    );

    if (error) {
      console.error('Error executing license expiration check:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    const duration = Date.now() - startTime;

    // Get the latest log entry to see results
    const { data: latestLog, error: logError } = await supabase
      .from('license_expiration_check_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (logError) {
      console.warn('Could not fetch execution log:', logError.message);
    }

    console.log('License expiration check completed successfully');
    console.log(`Duration: ${duration}ms`);

    if (latestLog) {
      console.log(`Alerts created: ${latestLog.alerts_created}`);
      console.log(`Status: ${latestLog.status}`);

      if (latestLog.error_message) {
        console.error(`Error message: ${latestLog.error_message}`);
      }
    }

    return {
      success: true,
      duration_ms: duration,
      alerts_created: latestLog?.alerts_created ?? 0,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Unexpected error during license expiration check:', error);

    return {
      success: false,
      duration_ms: duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('License Expiration Check Script');
  console.log('='.repeat(60));
  console.log();

  const result = await checkLicenseExpirations();

  console.log();
  console.log('='.repeat(60));
  console.log('Result Summary');
  console.log('='.repeat(60));
  console.log(`Success: ${result.success}`);

  if (result.duration_ms) {
    console.log(`Duration: ${result.duration_ms}ms`);
  }

  if (result.alerts_created !== undefined) {
    console.log(`Alerts Created: ${result.alerts_created}`);
  }

  if (result.error) {
    console.error(`Error: ${result.error}`);
  }

  console.log();

  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

main();
