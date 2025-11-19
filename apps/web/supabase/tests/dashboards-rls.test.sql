-- Test RLS policies for Dashboard & Analytics System
-- This test verifies that all required RLS policies are created and properly configured

begin;

-- Test plan: 2 table checks + 5 policy checks + 1 materialized view + 7 function checks = 15 tests
select plan(15);

-- ============================================================================
-- Test 1-2: Verify tables exist
-- ============================================================================

select has_table('public', 'dashboard_widgets', 'dashboard_widgets table exists');
select has_table('public', 'dashboard_alerts', 'dashboard_alerts table exists');

-- ============================================================================
-- Test 3-5: Check RLS policies exist for dashboard_widgets
-- ============================================================================

select policy_cmd_is(
  'public', 
  'dashboard_widgets', 
  'Users can view own widget configs', 
  'SELECT',
  'dashboard_widgets has SELECT policy'
);

select policy_cmd_is(
  'public', 
  'dashboard_widgets', 
  'Users can manage own widget configs', 
  'ALL',
  'dashboard_widgets has ALL policy for user management'
);

-- ============================================================================
-- Test 6-8: Check RLS policies exist for dashboard_alerts
-- ============================================================================

select policy_cmd_is(
  'public', 
  'dashboard_alerts', 
  'Team members can view team alerts', 
  'SELECT',
  'dashboard_alerts has SELECT policy'
);

select policy_cmd_is(
  'public', 
  'dashboard_alerts', 
  'Users can dismiss alerts', 
  'UPDATE',
  'dashboard_alerts has UPDATE policy'
);

select policy_cmd_is(
  'public', 
  'dashboard_alerts', 
  'System can create alerts', 
  'INSERT',
  'dashboard_alerts has INSERT policy'
);

-- ============================================================================
-- Test 9-10: Verify materialized view and enums exist
-- ============================================================================

select ok(
  (select count(*) > 0 from pg_matviews where schemaname = 'public' and matviewname = 'platform_metrics'),
  'platform_metrics materialized view exists'
);

-- ============================================================================
-- Test 11-17: Verify database functions exist
-- ============================================================================

select has_function(
  'public',
  'refresh_platform_metrics',
  'refresh_platform_metrics function exists'
);

select has_function(
  'public',
  'get_team_dashboard_metrics',
  'get_team_dashboard_metrics function exists'
);

select has_function(
  'public',
  'get_asset_status_distribution',
  'get_asset_status_distribution function exists'
);

select has_function(
  'public',
  'get_dashboard_trends',
  'get_dashboard_trends function exists'
);

select has_function(
  'public',
  'create_dashboard_alert',
  'create_dashboard_alert function exists'
);

select has_function(
  'public',
  'get_admin_platform_metrics',
  'get_admin_platform_metrics function exists'
);

select has_function(
  'public',
  'get_account_activity_list',
  'get_account_activity_list function exists'
);

select * from finish();
rollback;
