#!/usr/bin/env node
/**
 * Security Verification Script
 * 
 * This script verifies that all security fixes have been properly implemented:
 * 1. RLS policies use permission checks (not just membership)
 * 2. SQL functions have explicit SECURITY clauses
 * 3. Required CHECK constraints are in place
 * 4. Required permissions are defined in enum
 * 
 * Usage: node apps/web/scripts/verify-security-fixes.ts
 * Or: tsx apps/web/scripts/verify-security-fixes.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface VerificationResult {
  category: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: VerificationResult[] = [];

async function verifyRLSPolicies() {
  console.log('\n🔍 Verifying RLS Policies...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query all RLS policies
    const { data: policies, error } = await supabase
      .rpc('pg_policies_query', {
        query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename IN ('software_licenses', 'assets', 'license_assignments', 
                             'license_renewal_alerts', 'asset_history')
          ORDER BY tablename, cmd
        `
      });

    if (error) {
      // Fallback: use direct query
      const { data: policiesData, error: queryError } = await supabase
        .from('pg_policies')
        .select('schemaname, tablename, policyname, cmd, qual, with_check')
        .eq('schemaname', 'public')
        .in('tablename', ['software_licenses', 'assets', 'license_assignments', 
                          'license_renewal_alerts', 'asset_history']);
      
      if (queryError) {
        results.push({
          category: 'RLS Policies',
          passed: false,
          message: 'Failed to query RLS policies',
          details: [queryError.message]
        });
        return;
      }
    }

    // Check if policies use has_permission function
    const policiesWithPermissionCheck = policies?.filter((p: any) => {
      const definition = p.qual || p.with_check || '';
      return definition.includes('has_permission');
    }) || [];

    const totalPolicies = policies?.length || 0;
    const policiesWithChecks = policiesWithPermissionCheck.length;

    if (policiesWithChecks === totalPolicies && totalPolicies > 0) {
      results.push({
        category: 'RLS Policies',
        passed: true,
        message: `All ${totalPolicies} RLS policies use permission checks`,
        details: policiesWithPermissionCheck.map((p: any) => 
          `✓ ${p.tablename}.${p.policyname} (${p.cmd})`
        )
      });
    } else {
      const policiesWithoutChecks = policies?.filter((p: any) => {
        const definition = p.qual || p.with_check || '';
        return !definition.includes('has_permission');
      }) || [];

      results.push({
        category: 'RLS Policies',
        passed: false,
        message: `Only ${policiesWithChecks}/${totalPolicies} policies use permission checks`,
        details: policiesWithoutChecks.map((p: any) => 
          `✗ ${p.tablename}.${p.policyname} (${p.cmd}) - Missing permission check`
        )
      });
    }
  } catch (error) {
    results.push({
      category: 'RLS Policies',
      passed: false,
      message: 'Error verifying RLS policies',
      details: [error instanceof Error ? error.message : String(error)]
    });
  }
}

async function verifyFunctionSecurity() {
  console.log('\n🔍 Verifying SQL Function Security...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query function security settings
    const { data: functions, error } = await supabase
      .rpc('pg_functions_query', {
        query: `
          SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            CASE p.prosecdef 
              WHEN true THEN 'DEFINER'
              ELSE 'INVOKER'
            END as security_type,
            pg_get_functiondef(p.oid) as definition
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public'
            AND p.proname IN ('check_license_expirations', 'get_license_stats', 
                             'get_licenses_with_assignments', 'create_asset_history_entry')
          ORDER BY p.proname
        `
      });

    if (error) {
      results.push({
        category: 'Function Security',
        passed: false,
        message: 'Failed to query function security',
        details: [error.message]
      });
      return;
    }

    const criticalFunctions = [
      'check_license_expirations',
      'get_license_stats',
      'get_licenses_with_assignments',
      'create_asset_history_entry'
    ];

    const foundFunctions = functions?.map((f: any) => f.function_name) || [];
    const missingFunctions = criticalFunctions.filter(f => !foundFunctions.includes(f));

    if (missingFunctions.length > 0) {
      results.push({
        category: 'Function Security',
        passed: false,
        message: 'Some critical functions are missing',
        details: missingFunctions.map(f => `✗ ${f} - Not found`)
      });
      return;
    }

    // Check if all functions have explicit SECURITY clause
    const functionsWithSecurity = functions?.filter((f: any) => 
      f.definition.includes('SECURITY DEFINER') || f.definition.includes('SECURITY INVOKER')
    ) || [];

    // Check if DEFINER functions have search_path
    const definerFunctions = functions?.filter((f: any) => 
      f.security_type === 'DEFINER'
    ) || [];

    const definerWithSearchPath = definerFunctions.filter((f: any) => 
      f.definition.toLowerCase().includes('search_path')
    );

    if (functionsWithSecurity.length === functions?.length && 
        definerWithSearchPath.length === definerFunctions.length) {
      results.push({
        category: 'Function Security',
        passed: true,
        message: `All ${functions?.length} functions have proper SECURITY clauses`,
        details: functions?.map((f: any) => 
          `✓ ${f.function_name} - ${f.security_type}${f.security_type === 'DEFINER' ? ' + search_path' : ''}`
        )
      });
    } else {
      results.push({
        category: 'Function Security',
        passed: false,
        message: 'Some functions lack proper SECURITY configuration',
        details: functions?.map((f: any) => {
          const hasSearchPath = f.definition.toLowerCase().includes('search_path');
          const needsSearchPath = f.security_type === 'DEFINER' && !hasSearchPath;
          return needsSearchPath 
            ? `✗ ${f.function_name} - ${f.security_type} but missing search_path`
            : `✓ ${f.function_name} - ${f.security_type}`;
        })
      });
    }
  } catch (error) {
    results.push({
      category: 'Function Security',
      passed: false,
      message: 'Error verifying function security',
      details: [error instanceof Error ? error.message : String(error)]
    });
  }
}

async function verifyCheckConstraints() {
  console.log('\n🔍 Verifying CHECK Constraints...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query CHECK constraints
    const { data: constraints, error } = await supabase
      .rpc('pg_constraints_query', {
        query: `
          SELECT 
            conrelid::regclass AS table_name,
            conname AS constraint_name,
            pg_get_constraintdef(oid) AS constraint_definition
          FROM pg_constraint
          WHERE contype = 'c'
            AND connamespace = 'public'::regnamespace
            AND conrelid::regclass::text IN (
              'public.user_profiles',
              'public.software_licenses',
              'public.assets',
              'public.dashboard_alerts',
              'public.accounts'
            )
          ORDER BY table_name, constraint_name
        `
      });

    if (error) {
      results.push({
        category: 'CHECK Constraints',
        passed: false,
        message: 'Failed to query CHECK constraints',
        details: [error.message]
      });
      return;
    }

    const requiredConstraints = [
      { table: 'user_profiles', constraint: 'check_display_name_not_empty' },
      { table: 'software_licenses', constraint: 'check_name_not_empty' },
      { table: 'software_licenses', constraint: 'check_vendor_not_empty' },
      { table: 'software_licenses', constraint: 'check_cost_non_negative' },
      { table: 'assets', constraint: 'check_asset_name_not_empty' },
      { table: 'assets', constraint: 'check_purchase_date_not_future' },
      { table: 'assets', constraint: 'check_warranty_after_purchase' },
    ];

    const foundConstraints = constraints?.map((c: any) => ({
      table: c.table_name.replace('public.', ''),
      constraint: c.constraint_name
    })) || [];

    const missingConstraints = requiredConstraints.filter(req => 
      !foundConstraints.some(found => 
        found.table === req.table && found.constraint === req.constraint
      )
    );

    if (missingConstraints.length === 0) {
      results.push({
        category: 'CHECK Constraints',
        passed: true,
        message: `All ${requiredConstraints.length} required CHECK constraints are in place`,
        details: foundConstraints.map((c: any) => 
          `✓ ${c.table}.${c.constraint}`
        )
      });
    } else {
      results.push({
        category: 'CHECK Constraints',
        passed: false,
        message: `Missing ${missingConstraints.length} required CHECK constraints`,
        details: [
          ...foundConstraints.map((c: any) => `✓ ${c.table}.${c.constraint}`),
          ...missingConstraints.map(c => `✗ ${c.table}.${c.constraint} - Missing`)
        ]
      });
    }
  } catch (error) {
    results.push({
      category: 'CHECK Constraints',
      passed: false,
      message: 'Error verifying CHECK constraints',
      details: [error instanceof Error ? error.message : String(error)]
    });
  }
}

async function verifyPermissionsEnum() {
  console.log('\n🔍 Verifying Permissions Enum...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Query enum values
    const { data: enumValues, error } = await supabase
      .rpc('pg_enum_query', {
        query: `
          SELECT enumlabel as permission
          FROM pg_enum
          WHERE enumtypid = 'public.app_permissions'::regtype
          ORDER BY enumlabel
        `
      });

    if (error) {
      results.push({
        category: 'Permissions Enum',
        passed: false,
        message: 'Failed to query permissions enum',
        details: [error.message]
      });
      return;
    }

    const requiredPermissions = [
      'licenses.view',
      'licenses.create',
      'licenses.update',
      'licenses.delete',
      'licenses.manage',
      'assets.view',
      'assets.create',
      'assets.update',
      'assets.delete',
      'assets.manage'
    ];

    const foundPermissions = enumValues?.map((e: any) => e.permission) || [];
    const missingPermissions = requiredPermissions.filter(p => !foundPermissions.includes(p));

    if (missingPermissions.length === 0) {
      results.push({
        category: 'Permissions Enum',
        passed: true,
        message: `All ${requiredPermissions.length} required permissions are defined`,
        details: requiredPermissions.map(p => `✓ ${p}`)
      });
    } else {
      results.push({
        category: 'Permissions Enum',
        passed: false,
        message: `Missing ${missingPermissions.length} required permissions`,
        details: [
          ...foundPermissions.filter((p: string) => requiredPermissions.includes(p)).map((p: string) => `✓ ${p}`),
          ...missingPermissions.map(p => `✗ ${p} - Missing`)
        ]
      });
    }
  } catch (error) {
    results.push({
      category: 'Permissions Enum',
      passed: false,
      message: 'Error verifying permissions enum',
      details: [error instanceof Error ? error.message : String(error)]
    });
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('SECURITY VERIFICATION RESULTS');
  console.log('='.repeat(80) + '\n');

  let allPassed = true;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.category}: ${result.message}`);
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
    }
    console.log('');

    if (!result.passed) {
      allPassed = false;
    }
  }

  console.log('='.repeat(80));
  
  if (allPassed) {
    console.log('✅ ALL SECURITY CHECKS PASSED');
    console.log('='.repeat(80) + '\n');
    process.exit(0);
  } else {
    console.log('❌ SOME SECURITY CHECKS FAILED');
    console.log('='.repeat(80) + '\n');
    process.exit(1);
  }
}

async function main() {
  console.log('🔒 Security Verification Script');
  console.log('================================\n');
  console.log(`Connecting to: ${supabaseUrl}\n`);

  if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  try {
    await verifyPermissionsEnum();
    await verifyRLSPolicies();
    await verifyFunctionSecurity();
    await verifyCheckConstraints();
    
    printResults();
  } catch (error) {
    console.error('\n❌ Fatal error during verification:', error);
    process.exit(1);
  }
}

main();
