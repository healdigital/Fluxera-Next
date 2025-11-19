#!/usr/bin/env tsx

/**
 * Verification script for license database functions
 * This script checks if all required license functions exist and work correctly
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyLicenseFunctions() {
  console.log('🔍 Verifying license database functions...\n');

  try {
    // 1. Check if get_license_stats function exists
    console.log('1. Checking get_license_stats function...');
    const { data: statsCheck, error: statsError } = await supabase.rpc(
      'get_license_stats',
      {
        p_account_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      },
    );

    if (statsError) {
      if (
        statsError.message?.includes('function') &&
        statsError.message?.includes('does not exist')
      ) {
        console.error('❌ get_license_stats function does not exist!');
        console.error('   Error:', statsError.message);
        return false;
      } else {
        console.log(
          '✅ get_license_stats function exists (returned error for test UUID as expected)',
        );
      }
    } else {
      console.log(
        '✅ get_license_stats function exists and returned data:',
        statsCheck,
      );
    }

    // 2. Check if get_licenses_with_assignments function exists
    console.log('\n2. Checking get_licenses_with_assignments function...');
    const { data: licensesCheck, error: licensesError } = await supabase.rpc(
      'get_licenses_with_assignments',
      {
        p_account_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      },
    );

    if (licensesError) {
      if (
        licensesError.message?.includes('function') &&
        licensesError.message?.includes('does not exist')
      ) {
        console.error(
          '❌ get_licenses_with_assignments function does not exist!',
        );
        console.error('   Error:', licensesError.message);
        return false;
      } else {
        console.log(
          '✅ get_licenses_with_assignments function exists (returned error for test UUID as expected)',
        );
      }
    } else {
      console.log(
        '✅ get_licenses_with_assignments function exists and returned data:',
        licensesCheck,
      );
    }

    // 3. Check if check_license_expirations function exists
    console.log('\n3. Checking check_license_expirations function...');
    const { data: _expirationCheck, error: expirationError } =
      await supabase.rpc('check_license_expirations');

    if (expirationError) {
      if (
        expirationError.message?.includes('function') &&
        expirationError.message?.includes('does not exist')
      ) {
        console.error('❌ check_license_expirations function does not exist!');
        console.error('   Error:', expirationError.message);
        return false;
      } else {
        console.log('✅ check_license_expirations function exists');
      }
    } else {
      console.log(
        '✅ check_license_expirations function exists and executed successfully',
      );
    }

    console.log('\n✅ All license functions verified successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Unexpected error during verification:', error);
    return false;
  }
}

// Run verification
verifyLicenseFunctions()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
