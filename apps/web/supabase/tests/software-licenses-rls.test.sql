-- Test RLS policies for Software Licenses Management System
-- This test verifies that all required RLS policies are created and properly configured

begin;

-- Test plan: 15 policy checks + 3 table checks = 18 tests
select plan(18);

-- ============================================================================
-- Test 1-3: Verify tables exist
-- ============================================================================

select has_table('public', 'software_licenses', 'software_licenses table exists');
select has_table('public', 'license_assignments', 'license_assignments table exists');
select has_table('public', 'license_renewal_alerts', 'license_renewal_alerts table exists');

-- ============================================================================
-- Test 4-7: Check RLS policies exist for software_licenses (SELECT, INSERT, UPDATE, DELETE)
-- ============================================================================

select policy_cmd_is(
  'public', 
  'software_licenses', 
  'Users can view team licenses', 
  'SELECT',
  'software_licenses has SELECT policy'
);

select policy_cmd_is(
  'public', 
  'software_licenses', 
  'Users can create team licenses', 
  'INSERT',
  'software_licenses has INSERT policy'
);

select policy_cmd_is(
  'public', 
  'software_licenses', 
  'Users can update team licenses', 
  'UPDATE',
  'software_licenses has UPDATE policy'
);

select policy_cmd_is(
  'public', 
  'software_licenses', 
  'Users can delete team licenses', 
  'DELETE',
  'software_licenses has DELETE policy'
);

-- ============================================================================
-- Test 8-10: Check RLS policies exist for license_assignments (SELECT, INSERT, DELETE)
-- ============================================================================

select policy_cmd_is(
  'public', 
  'license_assignments', 
  'Users can view team license assignments', 
  'SELECT',
  'license_assignments has SELECT policy'
);

select policy_cmd_is(
  'public', 
  'license_assignments', 
  'Users can create team license assignments', 
  'INSERT',
  'license_assignments has INSERT policy'
);

select policy_cmd_is(
  'public', 
  'license_assignments', 
  'Users can delete team license assignments', 
  'DELETE',
  'license_assignments has DELETE policy'
);

-- ============================================================================
-- Test 11-12: Check RLS policies exist for license_renewal_alerts (SELECT, INSERT)
-- ============================================================================

select policy_cmd_is(
  'public', 
  'license_renewal_alerts', 
  'Users can view team license alerts', 
  'SELECT',
  'license_renewal_alerts has SELECT policy'
);

select policy_cmd_is(
  'public', 
  'license_renewal_alerts', 
  'System can insert license alerts', 
  'INSERT',
  'license_renewal_alerts has INSERT policy'
);

-- ============================================================================
-- Test 13-15: Verify RLS is enabled on all tables
-- ============================================================================

select results_eq(
  'SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''software_licenses''',
  ARRAY[true],
  'RLS is enabled on software_licenses table'
);

select results_eq(
  'SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''license_assignments''',
  ARRAY[true],
  'RLS is enabled on license_assignments table'
);

select results_eq(
  'SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''license_renewal_alerts''',
  ARRAY[true],
  'RLS is enabled on license_renewal_alerts table'
);

-- ============================================================================
-- Test 16-18: Verify policies enforce team membership checks
-- ============================================================================

-- Check that software_licenses SELECT policy uses accounts_memberships
select results_eq(
  $$
    SELECT COUNT(*) > 0
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'software_licenses'
      AND policyname = 'Users can view team licenses'
      AND qual::text LIKE '%accounts_memberships%'
  $$,
  ARRAY[true],
  'software_licenses SELECT policy enforces team membership'
);

-- Check that license_assignments SELECT policy uses accounts_memberships
select results_eq(
  $$
    SELECT COUNT(*) > 0
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'license_assignments'
      AND policyname = 'Users can view team license assignments'
      AND qual::text LIKE '%accounts_memberships%'
  $$,
  ARRAY[true],
  'license_assignments SELECT policy enforces team membership'
);

-- Check that license_renewal_alerts SELECT policy uses accounts_memberships
select results_eq(
  $$
    SELECT COUNT(*) > 0
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'license_renewal_alerts'
      AND policyname = 'Users can view team license alerts'
      AND qual::text LIKE '%accounts_memberships%'
  $$,
  ARRAY[true],
  'license_renewal_alerts SELECT policy enforces team membership'
);

select * from finish();

rollback;
