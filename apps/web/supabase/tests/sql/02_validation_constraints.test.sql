-- ============================================================================
-- Test Suite: Data Validation Constraints
-- Description: Tests for CHECK constraints on all tables
-- Author: Security Fixes Implementation
-- Date: 2025-11-20
-- ============================================================================

begin;

-- Create test schema
create schema if not exists tests;

-- ============================================================================
-- Test Setup: Helper Functions
-- ============================================================================

create or replace function tests.assert_constraint_violation(
  p_sql text,
  p_constraint_name text
)
returns void
language plpgsql
as $
declare
  v_error_message text;
begin
  begin
    execute p_sql;
    raise exception 'Expected constraint violation did not occur for: %', p_constraint_name;
  exception
    when check_violation then
      get stacked diagnostics v_error_message = message_text;
      raise notice 'PASS: Constraint % correctly rejected invalid data: %', p_constraint_name, v_error_message;
    when others then
      raise exception 'Unexpected error for constraint %: %', p_constraint_name, sqlerrm;
  end;
end;
$;

-- ============================================================================
-- USER PROFILES TESTS
-- ============================================================================

-- Test 1: Display name cannot be empty
create or replace function tests.test_user_profile_display_name_not_empty()
returns void
language plpgsql
as $
begin
  perform tests.assert_constraint_violation(
    format('insert into public.user_profiles (id, display_name) values (%L, %L)', 
      gen_random_uuid(), '   '),
    'check_display_name_not_empty'
  );
end;
$;

-- Test 2: Phone number cannot be empty
create or replace function tests.test_user_profile_phone_not_empty()
returns void
language plpgsql
as $
begin
  perform tests.assert_constraint_violation(
    format('insert into public.user_profiles (id, phone_number) values (%L, %L)', 
      gen_random_uuid(), '   '),
    'check_phone_number_not_empty'
  );
end;
$;

-- Test 3: Job title cannot be empty
create or replace function tests.test_user_profile_job_title_not_empty()
returns void
language plpgsql
as $
begin
  perform tests.assert_constraint_violation(
    format('insert into public.user_profiles (id, job_title) values (%L, %L)', 
      gen_random_uuid(), '   '),
    'check_job_title_not_empty'
  );
end;
$;

-- Test 4: Valid user profile should succeed
create or replace function tests.test_user_profile_valid()
returns void
language plpgsql
as $
declare
  v_user_id uuid;
begin
  v_user_id := gen_random_uuid();
  
  insert into public.user_profiles (id, display_name, phone_number, job_title)
  values (v_user_id, 'John Doe', '+1234567890', 'Developer');
  
  assert (select count(*) from public.user_profiles where id = v_user_id) = 1,
    'Valid user profile should be inserted';
  
  raise notice 'PASS: Valid user profile accepted';
end;
$;

-- ============================================================================
-- SOFTWARE LICENSES TESTS
-- ============================================================================

-- Test 5: License name cannot be empty
create or replace function tests.test_license_name_not_empty()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  -- Create test account
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.software_licenses (account_id, name, vendor, license_key, license_type, purchase_date) 
            values (%L, %L, %L, %L, %L, current_date)', 
      v_account_id, '   ', 'Vendor', 'key123', 'perpetual'),
    'check_name_not_empty'
  );
end;
$;

-- Test 6: Vendor cannot be empty
create or replace function tests.test_license_vendor_not_empty()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.software_licenses (account_id, name, vendor, license_key, license_type, purchase_date) 
            values (%L, %L, %L, %L, %L, current_date)', 
      v_account_id, 'License Name', '   ', 'key123', 'perpetual'),
    'check_vendor_not_empty'
  );
end;
$;

-- Test 7: Cost must be non-negative
create or replace function tests.test_license_cost_non_negative()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.software_licenses (account_id, name, vendor, license_key, license_type, purchase_date, cost) 
            values (%L, %L, %L, %L, %L, current_date, -100)', 
      v_account_id, 'License Name', 'Vendor', 'key123', 'perpetual'),
    'check_cost_non_negative'
  );
end;
$;

-- Test 8: Valid license should succeed
create or replace function tests.test_license_valid()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_license_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  insert into public.software_licenses (
    account_id, name, vendor, license_key, license_type, purchase_date, cost
  )
  values (
    v_account_id, 'Valid License', 'Valid Vendor', 'key123', 'perpetual', current_date, 100.00
  )
  returning id into v_license_id;
  
  assert v_license_id is not null,
    'Valid license should be inserted';
  
  raise notice 'PASS: Valid license accepted';
end;
$;

-- ============================================================================
-- ASSETS TESTS
-- ============================================================================

-- Test 9: Asset name cannot be empty
create or replace function tests.test_asset_name_not_empty()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.assets (account_id, name, asset_type) 
            values (%L, %L, %L)', 
      v_account_id, '   ', 'laptop'),
    'check_asset_name_not_empty'
  );
end;
$;

-- Test 10: Purchase date cannot be in future
create or replace function tests.test_asset_purchase_date_not_future()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.assets (account_id, name, asset_type, purchase_date) 
            values (%L, %L, %L, current_date + 30)', 
      v_account_id, 'Asset Name', 'laptop'),
    'check_purchase_date_not_future'
  );
end;
$;

-- Test 11: Warranty expiry must be after purchase date
create or replace function tests.test_asset_warranty_after_purchase()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.assets (account_id, name, asset_type, purchase_date, warranty_expiry_date) 
            values (%L, %L, %L, current_date, current_date - 30)', 
      v_account_id, 'Asset Name', 'laptop'),
    'check_warranty_after_purchase'
  );
end;
$;

-- Test 12: Serial number cannot be empty
create or replace function tests.test_asset_serial_number_not_empty()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  perform tests.assert_constraint_violation(
    format('insert into public.assets (account_id, name, asset_type, serial_number) 
            values (%L, %L, %L, %L)', 
      v_account_id, 'Asset Name', 'laptop', '   '),
    'check_serial_number_not_empty'
  );
end;
$;

-- Test 13: Valid asset should succeed
create or replace function tests.test_asset_valid()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
  v_asset_id uuid;
begin
  v_account_id := gen_random_uuid();
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Test Account', 'test-account', auth.uid(), '{}');
  
  insert into public.assets (
    account_id, name, asset_type, purchase_date, warranty_expiry_date, serial_number
  )
  values (
    v_account_id, 'Valid Asset', 'laptop', current_date - 30, current_date + 365, 'SN123456'
  )
  returning id into v_asset_id;
  
  assert v_asset_id is not null,
    'Valid asset should be inserted';
  
  raise notice 'PASS: Valid asset accepted';
end;
$;

-- ============================================================================
-- ACCOUNTS TESTS
-- ============================================================================

-- Test 14: Account name cannot be empty
create or replace function tests.test_account_name_not_empty()
returns void
language plpgsql
as $
begin
  perform tests.assert_constraint_violation(
    format('insert into public.accounts (id, name, slug, primary_owner_user_id, public_data) 
            values (%L, %L, %L, %L, %L)', 
      gen_random_uuid(), '   ', 'test-slug', auth.uid(), '{}'),
    'check_account_name_not_empty'
  );
end;
$;

-- Test 15: Account slug must be valid format
create or replace function tests.test_account_slug_format()
returns void
language plpgsql
as $
begin
  perform tests.assert_constraint_violation(
    format('insert into public.accounts (id, name, slug, primary_owner_user_id, public_data) 
            values (%L, %L, %L, %L, %L)', 
      gen_random_uuid(), 'Test Account', 'Invalid Slug!', auth.uid(), '{}'),
    'check_slug_format'
  );
end;
$;

-- Test 16: Valid account should succeed
create or replace function tests.test_account_valid()
returns void
language plpgsql
as $
declare
  v_account_id uuid;
begin
  v_account_id := gen_random_uuid();
  
  insert into public.accounts (id, name, slug, primary_owner_user_id, public_data)
  values (v_account_id, 'Valid Account', 'valid-account-123', auth.uid(), '{}');
  
  assert (select count(*) from public.accounts where id = v_account_id) = 1,
    'Valid account should be inserted';
  
  raise notice 'PASS: Valid account accepted';
end;
$;

-- ============================================================================
-- Run All Tests
-- ============================================================================

do $
begin
  raise notice '========================================';
  raise notice 'Running Validation Constraints Tests';
  raise notice '========================================';
  
  -- User Profiles
  perform tests.test_user_profile_display_name_not_empty();
  perform tests.test_user_profile_phone_not_empty();
  perform tests.test_user_profile_job_title_not_empty();
  perform tests.test_user_profile_valid();
  
  -- Software Licenses
  perform tests.test_license_name_not_empty();
  perform tests.test_license_vendor_not_empty();
  perform tests.test_license_cost_non_negative();
  perform tests.test_license_valid();
  
  -- Assets
  perform tests.test_asset_name_not_empty();
  perform tests.test_asset_purchase_date_not_future();
  perform tests.test_asset_warranty_after_purchase();
  perform tests.test_asset_serial_number_not_empty();
  perform tests.test_asset_valid();
  
  -- Accounts
  perform tests.test_account_name_not_empty();
  perform tests.test_account_slug_format();
  perform tests.test_account_valid();
  
  raise notice '========================================';
  raise notice 'All Validation Constraints Tests Passed!';
  raise notice '========================================';
end;
$;

-- ============================================================================
-- Cleanup
-- ============================================================================

rollback;
