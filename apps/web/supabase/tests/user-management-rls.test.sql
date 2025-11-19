-- Test RLS policies for User Management System
-- This test verifies that all required RLS policies are created and properly configured

begin;

-- Test plan: 12 policy checks + 3 table checks + 3 RLS enabled checks = 18 tests
select plan(18);

-- ============================================================================
-- Test 1-3: Verify tables exist
-- ============================================================================

select has_table('public', 'user_profiles', 'user_profiles table exists');
select has_table('public', 'user_account_status', 'user_account_status table exists');
select has_table('public', 'user_activity_log', 'user_activity_log table exists');

-- ============================================================================
-- Test 4-8: Check RLS policies exist for user_profiles
-- ============================================================================

select policy_cmd_is(
  'public', 
  'user_profiles', 
  'Users can view own profile', 
  'SELECT',
  'user_profiles has SELECT policy for own profile'
);

select policy_cmd_is(
  'public', 
  'user_profiles', 
  'Team members can view team user profiles', 
  'SELECT',
  'user_profiles has SELECT policy for team members'
);

select policy_cmd_is(
  'public', 
  'user_profiles', 
  'Users can insert own profile', 
  'INSERT',
  'user_profiles has INSERT policy'
);

select policy_cmd_is(
  'public', 
  'user_profiles', 
  'Users can update own profile', 
  'UPDATE',
  'user_profiles has UPDATE policy for own profile'
);

select policy_cmd_is(
  'public', 
  'user_profiles', 
  'Admins can update team member profiles', 
  'UPDATE',
  'user_profiles has UPDATE policy for admins'
);

-- ============================================================================
-- Test 9-10: Check RLS policies exist for user_account_status
-- ============================================================================

select policy_cmd_is(
  'public', 
  'user_account_status', 
  'Team members can view user status', 
  'SELECT',
  'user_account_status has SELECT policy'
);

select policy_cmd_is(
  'public', 
  'user_account_status', 
  'Admins can manage user status', 
  'ALL',
  'user_account_status has ALL policy for admins'
);

-- ============================================================================
-- Test 11-13: Check RLS policies exist for user_activity_log
-- ============================================================================

select policy_cmd_is(
  'public', 
  'user_activity_log', 
  'Users can view own activity', 
  'SELECT',
  'user_activity_log has SELECT policy for own activity'
);

select policy_cmd_is(
  'public', 
  'user_activity_log', 
  'Admins can view team activity', 
  'SELECT',
  'user_activity_log has SELECT policy for admins'
);

select policy_cmd_is(
  'public', 
  'user_activity_log', 
  'System can insert activity logs', 
  'INSERT',
  'user_activity_log has INSERT policy'
);

-- ============================================================================
-- Test 14-16: Verify RLS is enabled on all tables
-- ============================================================================

select results_eq(
  'SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''user_profiles''',
  ARRAY[true],
  'RLS is enabled on user_profiles table'
);

select results_eq(
  'SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''user_account_status''',
  ARRAY[true],
  'RLS is enabled on user_account_status table'
);

select results_eq(
  'SELECT rowsecurity FROM pg_tables WHERE schemaname = ''public'' AND tablename = ''user_activity_log''',
  ARRAY[true],
  'RLS is enabled on user_activity_log table'
);

-- ============================================================================
-- Test 17-18: Verify policies enforce proper access control
-- ============================================================================

-- Check that user_profiles SELECT policy for team members uses accounts_memberships
select results_eq(
  $$
    SELECT COUNT(*) > 0
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Team members can view team user profiles'
      AND qual::text LIKE '%accounts_memberships%'
  $$,
  ARRAY[true],
  'user_profiles SELECT policy enforces team membership'
);

-- Check that user_account_status policies use has_permission for admins
select results_eq(
  $$
    SELECT COUNT(*) > 0
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_account_status'
      AND policyname = 'Admins can manage user status'
      AND qual::text LIKE '%has_permission%'
  $$,
  ARRAY[true],
  'user_account_status policy enforces permission checks'
);

select * from finish();

rollback;
