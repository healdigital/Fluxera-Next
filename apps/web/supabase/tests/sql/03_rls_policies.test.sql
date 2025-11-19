-- ============================================================================
-- Test Suite: RLS Policies
-- Description: Tests for Row Level Security policies on all tables
-- Author: Security Fixes Implementation
-- Date: 2025-11-20
-- ============================================================================

begin;

-- Create test schema
create schema if not exists tests;

-- ============================================================================
-- Test Setup: Create Test Users and Accounts
-- ============================================================================

-- Create test users (simulated)
create temp table test_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null
);

insert into test_users (email, role) values
  ('admin@test.com', 'admin'),
  ('user1@test.com', 'user'),
  ('user2@test.com', 'user');

-- Create test accounts
create temp table test_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid references test_users(id)
);

insert into test_accounts (name, slug, owner_id)
select 'Account 1', 'account-1', id from test_users where email = 'admin@test.com'
union all
select 'Account 2', 'account-2', id from test_users where email = 'user1@test.com';

-- ============================================================================
-- Test 1: Software Licenses - Owner Can Read
-- ============================================================================

create or replace function tests.test_licenses_owner_can_read()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_license_id uuid;
  v_user_id uuid;
  v_can_read boolean;
begin
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_user_id from test_users where email = 'admin@test.com';
  
  -- Create a license
  insert into public.software_licenses (
    account_id, name, vendor, license_key, license_type, purchase_date
  )
  values (
    v_account_id, 'Test License', 'Test Vendor', 'key123', 'perpetual', current_date
  )
  returning id into v_license_id;
  
  -- Simulate user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  
  -- Test: Owner should be able to read
  select exists(
    select 1 from public.software_licenses where id = v_license_id
  ) into v_can_read;
  
  assert v_can_read = true,
    'Owner should be able to read their licenses';
  
  raise notice 'PASS: License owner can read';
end;
$;

-- ============================================================================
-- Test 2: Software Licenses - Non-owner Cannot Read
-- ============================================================================

create or replace function tests.test_licenses_non_owner_cannot_read()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_license_id uuid;
  v_other_user_id uuid;
  v_can_read boolean;
begin
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_other_user_id from test_users where email = 'user2@test.com';
  
  -- Create a license
  insert into public.software_licenses (
    account_id, name, vendor, license_key, license_type, purchase_date
  )
  values (
    v_account_id, 'Test License', 'Test Vendor', 'key123', 'perpetual', current_date
  )
  returning id into v_license_id;
  
  -- Simulate different user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_other_user_id)::text, true);
  
  -- Test: Non-owner should NOT be able to read
  select exists(
    select 1 from public.software_licenses where id = v_license_id
  ) into v_can_read;
  
  assert v_can_read = false,
    'Non-owner should NOT be able to read licenses';
  
  raise notice 'PASS: Non-owner cannot read licenses';
end;
$;

-- ============================================================================
-- Test 3: Assets - Owner Can Create
-- ============================================================================

create or replace function tests.test_assets_owner_can_create()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_asset_id uuid;
  v_user_id uuid;
begin
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_user_id from test_users where email = 'admin@test.com';
  
  -- Simulate user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  
  -- Test: Owner should be able to create asset
  insert into public.assets (
    account_id, name, asset_type
  )
  values (
    v_account_id, 'Test Asset', 'laptop'
  )
  returning id into v_asset_id;
  
  assert v_asset_id is not null,
    'Owner should be able to create assets';
  
  raise notice 'PASS: Asset owner can create';
end;
$;

-- ============================================================================
-- Test 4: Assets - Non-owner Cannot Create
-- ============================================================================

create or replace function tests.test_assets_non_owner_cannot_create()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_other_user_id uuid;
  v_error_occurred boolean := false;
begin
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_other_user_id from test_users where email = 'user2@test.com';
  
  -- Simulate different user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_other_user_id)::text, true);
  
  -- Test: Non-owner should NOT be able to create asset
  begin
    insert into public.assets (
      account_id, name, asset_type
    )
    values (
      v_account_id, 'Test Asset', 'laptop'
    );
  exception
    when insufficient_privilege then
      v_error_occurred := true;
  end;
  
  assert v_error_occurred = true,
    'Non-owner should NOT be able to create assets';
  
  raise notice 'PASS: Non-owner cannot create assets';
end;
$;

-- ============================================================================
-- Test 5: License Assignments - Valid Assignment
-- ============================================================================

create or replace function tests.test_license_assignment_valid()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_license_id uuid;
  v_user_id uuid;
  v_assignment_id uuid;
begin
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_user_id from test_users where email = 'admin@test.com';
  
  -- Create a license
  insert into public.software_licenses (
    account_id, name, vendor, license_key, license_type, purchase_date
  )
  values (
    v_account_id, 'Test License', 'Test Vendor', 'key123', 'perpetual', current_date
  )
  returning id into v_license_id;
  
  -- Simulate user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  
  -- Test: Should be able to assign license to user
  insert into public.license_assignments (
    license_id, assigned_to_user, assigned_by
  )
  values (
    v_license_id, v_user_id, v_user_id
  )
  returning id into v_assignment_id;
  
  assert v_assignment_id is not null,
    'Should be able to create valid license assignment';
  
  raise notice 'PASS: Valid license assignment created';
end;
$;

-- ============================================================================
-- Test 6: User Profiles - User Can Read Own Profile
-- ============================================================================

create or replace function tests.test_user_profile_read_own()
returns void
language plpgsql
as $
declare
  v_user_id uuid;
  v_can_read boolean;
begin
  -- Get test user
  select id into v_user_id from test_users where email = 'admin@test.com';
  
  -- Create profile
  insert into public.user_profiles (id, display_name)
  values (v_user_id, 'Admin User');
  
  -- Simulate user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  
  -- Test: User should be able to read own profile
  select exists(
    select 1 from public.user_profiles where id = v_user_id
  ) into v_can_read;
  
  assert v_can_read = true,
    'User should be able to read own profile';
  
  raise notice 'PASS: User can read own profile';
end;
$;

-- ============================================================================
-- Test 7: User Profiles - User Cannot Read Other Profiles
-- ============================================================================

create or replace function tests.test_user_profile_cannot_read_others()
returns void
language plpgsql
as $
declare
  v_user1_id uuid;
  v_user2_id uuid;
  v_can_read boolean;
begin
  -- Get test users
  select id into v_user1_id from test_users where email = 'user1@test.com';
  select id into v_user2_id from test_users where email = 'user2@test.com';
  
  -- Create profile for user1
  insert into public.user_profiles (id, display_name)
  values (v_user1_id, 'User 1');
  
  -- Simulate user2 context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user2_id)::text, true);
  
  -- Test: User2 should NOT be able to read user1's profile
  select exists(
    select 1 from public.user_profiles where id = v_user1_id
  ) into v_can_read;
  
  assert v_can_read = false,
    'User should NOT be able to read other profiles';
  
  raise notice 'PASS: User cannot read other profiles';
end;
$;

-- ============================================================================
-- Test 8: Dashboard Alerts - Account Members Can Read
-- ============================================================================

create or replace function tests.test_dashboard_alerts_members_can_read()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_alert_id uuid;
  v_user_id uuid;
  v_can_read boolean;
begin
  -- Skip if dashboard_alerts table doesn't exist
  if not exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'dashboard_alerts'
  ) then
    raise notice 'SKIP: dashboard_alerts table does not exist';
    return;
  end if;
  
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_user_id from test_users where email = 'admin@test.com';
  
  -- Create alert
  execute format('insert into public.dashboard_alerts (account_id, title, description, severity, created_at) 
                  values (%L, %L, %L, %L, current_timestamp) returning id', 
                  v_account_id, 'Test Alert', 'Test Description', 'info')
  into v_alert_id;
  
  -- Simulate user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  
  -- Test: Account member should be able to read alert
  execute format('select exists(select 1 from public.dashboard_alerts where id = %L)', v_alert_id)
  into v_can_read;
  
  assert v_can_read = true,
    'Account member should be able to read alerts';
  
  raise notice 'PASS: Account member can read dashboard alerts';
end;
$;

-- ============================================================================
-- Test 9: Performance - RLS Policy Execution Time
-- ============================================================================

create or replace function tests.test_rls_performance()
returns void
language plpgsql
as $
declare
  v_start_time timestamp;
  v_end_time timestamp;
  v_duration interval;
  v_account_id uuid;
  v_user_id uuid;
begin
  -- Get test data
  select id into v_account_id from test_accounts where slug = 'account-1';
  select id into v_user_id from test_users where email = 'admin@test.com';
  
  -- Create 10 test licenses
  for i in 1..10 loop
    insert into public.software_licenses (
      account_id, name, vendor, license_key, license_type, purchase_date
    )
    values (
      v_account_id, 'License ' || i, 'Vendor', 'key' || i, 'perpetual', current_date
    );
  end loop;
  
  -- Simulate user context
  perform set_config('request.jwt.claims', json_build_object('sub', v_user_id)::text, true);
  
  -- Measure query time
  v_start_time := clock_timestamp();
  
  perform count(*) from public.software_licenses where account_id = v_account_id;
  
  v_end_time := clock_timestamp();
  v_duration := v_end_time - v_start_time;
  
  raise notice 'Performance: RLS query completed in %', v_duration;
  
  assert v_duration < interval '100 milliseconds',
    'RLS query should complete in under 100ms';
  
  raise notice 'PASS: RLS performance is acceptable';
end;
$;

-- ============================================================================
-- Run All Tests
-- ============================================================================

do $
begin
  raise notice '========================================';
  raise notice 'Running RLS Policies Tests';
  raise notice '========================================';
  
  perform tests.test_licenses_owner_can_read();
  perform tests.test_licenses_non_owner_cannot_read();
  perform tests.test_assets_owner_can_create();
  perform tests.test_assets_non_owner_cannot_create();
  perform tests.test_license_assignment_valid();
  perform tests.test_user_profile_read_own();
  perform tests.test_user_profile_cannot_read_others();
  perform tests.test_dashboard_alerts_members_can_read();
  perform tests.test_rls_performance();
  
  raise notice '========================================';
  raise notice 'All RLS Policies Tests Passed!';
  raise notice '========================================';
end;
$;

-- ============================================================================
-- Cleanup
-- ============================================================================

rollback;
