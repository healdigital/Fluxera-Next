-- ============================================================================
-- Test Suite: RLS Helper Functions
-- Description: Tests for supamode.has_permission_by_name() and 
--              supamode.current_user_has_permission()
-- Author: Security Fixes Implementation
-- Date: 2025-11-20
-- ============================================================================

begin;

-- Create test schema
create schema if not exists tests;

-- ============================================================================
-- Test Setup: Create Test Data
-- ============================================================================

-- Create test accounts
insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
values 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Test Account 1', 'test-account-1', auth.uid(), '{}'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'Test Account 2', 'test-account-2', auth.uid(), '{}');

-- Create test roles
insert into supamode.roles (id, name, hierarchy_level)
values
  ('10000000-0000-0000-0000-000000000001'::uuid, 'test_admin', 100),
  ('10000000-0000-0000-0000-000000000002'::uuid, 'test_user', 50);

-- Create test permissions
insert into supamode.permissions (id, name, description)
values
  ('20000000-0000-0000-0000-000000000001'::uuid, 'licenses.create', 'Create licenses'),
  ('20000000-0000-0000-0000-000000000002'::uuid, 'licenses.read', 'Read licenses'),
  ('20000000-0000-0000-0000-000000000003'::uuid, 'licenses.update', 'Update licenses'),
  ('20000000-0000-0000-0000-000000000004'::uuid, 'licenses.delete', 'Delete licenses'),
  ('20000000-0000-0000-0000-000000000005'::uuid, 'assets.create', 'Create assets');

-- Assign permissions to roles
insert into supamode.role_permissions (role_id, permission_id)
values
  -- Admin has all permissions
  ('10000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000001'::uuid),
  ('10000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000002'::uuid),
  ('10000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000003'::uuid),
  ('10000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000004'::uuid),
  ('10000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000005'::uuid),
  -- User has only read permission
  ('10000000-0000-0000-0000-000000000002'::uuid, '20000000-0000-0000-0000-000000000002'::uuid);

-- Assign roles to accounts
insert into supamode.account_roles (account_id, role_id)
values
  ('00000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000001'::uuid),
  ('00000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000002'::uuid);

-- ============================================================================
-- Test 1: has_permission_by_name() - Valid Permission
-- ============================================================================

create or replace function tests.test_has_permission_by_name_valid()
returns void
language plpgsql
as $
declare
  v_result boolean;
begin
  -- Test: Admin account should have licenses.create permission
  select supamode.has_permission_by_name(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'licenses.create'
  ) into v_result;
  
  assert v_result = true, 
    'Admin account should have licenses.create permission';
  
  raise notice 'PASS: has_permission_by_name() returns true for valid permission';
end;
$;

-- ============================================================================
-- Test 2: has_permission_by_name() - Missing Permission
-- ============================================================================

create or replace function tests.test_has_permission_by_name_missing()
returns void
language plpgsql
as $
declare
  v_result boolean;
begin
  -- Test: User account should NOT have licenses.create permission
  select supamode.has_permission_by_name(
    '00000000-0000-0000-0000-000000000002'::uuid,
    'licenses.create'
  ) into v_result;
  
  assert v_result = false, 
    'User account should NOT have licenses.create permission';
  
  raise notice 'PASS: has_permission_by_name() returns false for missing permission';
end;
$;

-- ============================================================================
-- Test 3: has_permission_by_name() - Non-existent Permission
-- ============================================================================

create or replace function tests.test_has_permission_by_name_nonexistent()
returns void
language plpgsql
as $
declare
  v_result boolean;
begin
  -- Test: Non-existent permission should return false
  select supamode.has_permission_by_name(
    '00000000-0000-0000-0000-000000000001'::uuid,
    'nonexistent.permission'
  ) into v_result;
  
  assert v_result = false, 
    'Non-existent permission should return false';
  
  raise notice 'PASS: has_permission_by_name() returns false for non-existent permission';
end;
$;

-- ============================================================================
-- Test 4: has_permission_by_name() - Null Account ID
-- ============================================================================

create or replace function tests.test_has_permission_by_name_null_account()
returns void
language plpgsql
as $
declare
  v_result boolean;
begin
  -- Test: Null account ID should return false
  select supamode.has_permission_by_name(
    null,
    'licenses.create'
  ) into v_result;
  
  assert v_result = false, 
    'Null account ID should return false';
  
  raise notice 'PASS: has_permission_by_name() handles null account ID';
end;
$;

-- ============================================================================
-- Test 5: has_permission_by_name() - Multiple Permissions
-- ============================================================================

create or replace function tests.test_has_permission_by_name_multiple()
returns void
language plpgsql
as $
declare
  v_has_create boolean;
  v_has_read boolean;
  v_has_update boolean;
  v_has_delete boolean;
begin
  -- Test: Admin should have all license permissions
  select 
    supamode.has_permission_by_name('00000000-0000-0000-0000-000000000001'::uuid, 'licenses.create'),
    supamode.has_permission_by_name('00000000-0000-0000-0000-000000000001'::uuid, 'licenses.read'),
    supamode.has_permission_by_name('00000000-0000-0000-0000-000000000001'::uuid, 'licenses.update'),
    supamode.has_permission_by_name('00000000-0000-0000-0000-000000000001'::uuid, 'licenses.delete')
  into v_has_create, v_has_read, v_has_update, v_has_delete;
  
  assert v_has_create = true and v_has_read = true and v_has_update = true and v_has_delete = true,
    'Admin should have all license permissions';
  
  raise notice 'PASS: has_permission_by_name() works for multiple permissions';
end;
$;

-- ============================================================================
-- Test 6: current_user_has_permission() - With Valid User
-- ============================================================================

create or replace function tests.test_current_user_has_permission_valid()
returns void
language plpgsql
as $
declare
  v_result boolean;
  v_current_user_id uuid;
begin
  -- Get current user ID
  v_current_user_id := auth.uid();
  
  -- Create account membership for current user
  insert into public.accounts_memberships (account_id, user_id, role)
  values ('00000000-0000-0000-0000-000000000001'::uuid, v_current_user_id, 'owner')
  on conflict do nothing;
  
  -- Test: Current user should have permission through their account
  select supamode.current_user_has_permission('licenses.create') into v_result;
  
  assert v_result = true, 
    'Current user should have licenses.create permission';
  
  raise notice 'PASS: current_user_has_permission() works for authenticated user';
end;
$;

-- ============================================================================
-- Test 7: Performance Test - Permission Lookup
-- ============================================================================

create or replace function tests.test_permission_lookup_performance()
returns void
language plpgsql
as $
declare
  v_start_time timestamp;
  v_end_time timestamp;
  v_duration interval;
  v_result boolean;
begin
  v_start_time := clock_timestamp();
  
  -- Run 100 permission checks
  for i in 1..100 loop
    select supamode.has_permission_by_name(
      '00000000-0000-0000-0000-000000000001'::uuid,
      'licenses.create'
    ) into v_result;
  end loop;
  
  v_end_time := clock_timestamp();
  v_duration := v_end_time - v_start_time;
  
  raise notice 'Performance: 100 permission checks completed in %', v_duration;
  
  assert v_duration < interval '1 second',
    'Permission checks should complete in under 1 second';
  
  raise notice 'PASS: Permission lookup performance is acceptable';
end;
$;

-- ============================================================================
-- Test 8: Index Usage Verification
-- ============================================================================

create or replace function tests.test_index_usage()
returns void
language plpgsql
as $
declare
  v_has_name_index boolean;
  v_has_account_roles_index boolean;
begin
  -- Check if idx_permissions_name exists
  select exists(
    select 1 from pg_indexes 
    where schemaname = 'supamode' 
    and indexname = 'idx_permissions_name'
  ) into v_has_name_index;
  
  -- Check if idx_account_roles_account_id exists
  select exists(
    select 1 from pg_indexes 
    where schemaname = 'supamode' 
    and indexname = 'idx_account_roles_account_id'
  ) into v_has_account_roles_index;
  
  assert v_has_name_index = true,
    'Index idx_permissions_name should exist';
    
  assert v_has_account_roles_index = true,
    'Index idx_account_roles_account_id should exist';
  
  raise notice 'PASS: Required indexes exist';
end;
$;

-- ============================================================================
-- Run All Tests
-- ============================================================================

do $
begin
  raise notice '========================================';
  raise notice 'Running RLS Helper Functions Tests';
  raise notice '========================================';
  
  perform tests.test_has_permission_by_name_valid();
  perform tests.test_has_permission_by_name_missing();
  perform tests.test_has_permission_by_name_nonexistent();
  perform tests.test_has_permission_by_name_null_account();
  perform tests.test_has_permission_by_name_multiple();
  perform tests.test_current_user_has_permission_valid();
  perform tests.test_permission_lookup_performance();
  perform tests.test_index_usage();
  
  raise notice '========================================';
  raise notice 'All RLS Helper Functions Tests Passed!';
  raise notice '========================================';
end;
$;

-- ============================================================================
-- Cleanup
-- ============================================================================

rollback;
