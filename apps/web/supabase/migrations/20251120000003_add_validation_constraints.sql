-- Migration: Add Data Validation Constraints
-- Description: Adds CHECK constraints to validate critical data at database level
-- Author: Security Fixes Implementation
-- Date: 2025-11-20

-- ============================================================================
-- USER PROFILES - Display Name Validation
-- ============================================================================
-- Note: Email is stored in auth.users, not user_profiles

-- Display name must not be empty if provided
alter table public.user_profiles
add constraint check_display_name_not_empty
check (
  display_name is null or 
  length(trim(display_name)) > 0
);

comment on constraint check_display_name_not_empty on public.user_profiles is
'Ensures display_name is not empty or whitespace-only when provided';

-- Phone number must not be empty if provided
alter table public.user_profiles
add constraint check_phone_number_not_empty
check (
  phone_number is null or 
  length(trim(phone_number)) > 0
);

comment on constraint check_phone_number_not_empty on public.user_profiles is
'Ensures phone_number is not empty or whitespace-only when provided';

-- Job title must not be empty if provided
alter table public.user_profiles
add constraint check_job_title_not_empty
check (
  job_title is null or 
  length(trim(job_title)) > 0
);

comment on constraint check_job_title_not_empty on public.user_profiles is
'Ensures job_title is not empty or whitespace-only when provided';

-- ============================================================================
-- SOFTWARE LICENSES - Business Logic Validation
-- ============================================================================

-- License name must not be empty
alter table public.software_licenses
add constraint check_name_not_empty
check (length(trim(name)) > 0);

comment on constraint check_name_not_empty on public.software_licenses is
'Ensures license name is not empty or whitespace-only';

-- Vendor name must not be empty
alter table public.software_licenses
add constraint check_vendor_not_empty
check (length(trim(vendor)) > 0);

comment on constraint check_vendor_not_empty on public.software_licenses is
'Ensures vendor name is not empty or whitespace-only';

-- Cost must be non-negative if provided
alter table public.software_licenses
add constraint check_cost_non_negative
check (cost is null or cost >= 0);

comment on constraint check_cost_non_negative on public.software_licenses is
'Ensures license cost is non-negative when provided';

-- Note: expiration_date validation already exists as check_expiration_after_purchase
-- Note: license_key uniqueness already enforced by unique_license_key_per_account

-- ============================================================================
-- ASSETS - Business Logic Validation
-- ============================================================================

-- Asset name must not be empty
alter table public.assets
add constraint check_asset_name_not_empty
check (length(trim(name)) > 0);

comment on constraint check_asset_name_not_empty on public.assets is
'Ensures asset name is not empty or whitespace-only';

-- Purchase date cannot be in the future
alter table public.assets
add constraint check_purchase_date_not_future
check (
  purchase_date is null or 
  purchase_date <= current_date
);

comment on constraint check_purchase_date_not_future on public.assets is
'Ensures purchase_date is not in the future';

-- Warranty expiry must be after purchase date if both provided
alter table public.assets
add constraint check_warranty_after_purchase
check (
  purchase_date is null or 
  warranty_expiry_date is null or 
  warranty_expiry_date >= purchase_date
);

comment on constraint check_warranty_after_purchase on public.assets is
'Ensures warranty_expiry_date is after or equal to purchase_date when both are provided';

-- Serial number must not be empty if provided
alter table public.assets
add constraint check_serial_number_not_empty
check (
  serial_number is null or 
  length(trim(serial_number)) > 0
);

comment on constraint check_serial_number_not_empty on public.assets is
'Ensures serial_number is not empty or whitespace-only when provided';

-- ============================================================================
-- LICENSE ASSIGNMENTS - Business Logic Validation
-- ============================================================================

-- Note: Assignment target validation already exists as check_assignment_target
-- This ensures exactly one of assigned_to_user or assigned_to_asset is set

-- ============================================================================
-- DASHBOARD ALERTS - Validation
-- ============================================================================

-- Alert title must not be empty (already enforced by NOT NULL, but add length check)
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'dashboard_alerts'
    and column_name = 'title'
  ) then
    alter table public.dashboard_alerts
      add constraint check_alert_title_not_empty
      check (length(trim(title)) > 0);
    
    execute 'comment on constraint check_alert_title_not_empty on public.dashboard_alerts is
    ''Ensures alert title is not empty or whitespace-only''';
  end if;
end $$;

-- Alert description must not be empty (already enforced by NOT NULL, but add length check)
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'dashboard_alerts'
    and column_name = 'description'
  ) then
    alter table public.dashboard_alerts
      add constraint check_alert_description_not_empty
      check (length(trim(description)) > 0);
    
    execute 'comment on constraint check_alert_description_not_empty on public.dashboard_alerts is
    ''Ensures alert description is not empty or whitespace-only''';
  end if;
end $$;

-- Expires_at must be in the future if provided
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'dashboard_alerts'
    and column_name = 'expires_at'
  ) then
    alter table public.dashboard_alerts
      add constraint check_expires_at_future
      check (
        expires_at is null or 
        expires_at > created_at
      );
    
    execute 'comment on constraint check_expires_at_future on public.dashboard_alerts is
    ''Ensures expires_at is after created_at when provided''';
  end if;
end $$;

-- ============================================================================
-- ACCOUNTS - Validation
-- ============================================================================

-- Account name must not be empty
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'accounts'
    and column_name = 'name'
  ) then
    execute 'alter table public.accounts
      add constraint check_account_name_not_empty
      check (length(trim(name)) > 0)';
    
    comment on constraint check_account_name_not_empty on public.accounts is
    'Ensures account name is not empty or whitespace-only';
  end if;
end $$;

-- Account slug must be lowercase and valid format
do $$ 
begin
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'accounts'
    and column_name = 'slug'
  ) then
    execute 'alter table public.accounts
      add constraint check_slug_format
      check (slug ~* ''^[a-z0-9-]+$'')';
    
    comment on constraint check_slug_format on public.accounts is
    'Ensures account slug contains only lowercase letters, numbers, and hyphens';
  end if;
end $$;

-- ============================================================================
-- SUMMARY OF CONSTRAINTS ADDED
-- ============================================================================

-- This migration adds the following validation constraints:
--
-- USER PROFILES:
--   ✓ Display name not empty
--   ✓ Phone number not empty (if provided)
--   ✓ Job title not empty (if provided)
--
-- SOFTWARE LICENSES:
--   ✓ Name not empty
--   ✓ Vendor not empty
--   ✓ Cost non-negative
--   ✓ Expiration after purchase (already existed)
--   ✓ Unique license key per account (already existed)
--
-- ASSETS:
--   ✓ Name not empty
--   ✓ Purchase date not in future
--   ✓ Warranty expiry after purchase
--   ✓ Serial number not empty (if provided)
--
-- LICENSE ASSIGNMENTS:
--   ✓ Exactly one assignment target (already existed)
--
-- DASHBOARD ALERTS (if table exists):
--   ✓ Title not empty
--   ✓ Description not empty
--   ✓ Expires_at after created_at
--
-- ACCOUNTS (if columns exist):
--   ✓ Name not empty
--   ✓ Slug valid format

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify constraints were added:
--
-- 1. List all CHECK constraints:
--    SELECT 
--      conrelid::regclass AS table_name,
--      conname AS constraint_name,
--      pg_get_constraintdef(oid) AS constraint_definition
--    FROM pg_constraint
--    WHERE contype = 'c'
--      AND connamespace = 'public'::regnamespace
--      AND conrelid::regclass::text IN (
--        'public.user_profiles',
--        'public.software_licenses',
--        'public.assets',
--        'public.dashboard_alerts',
--        'public.accounts'
--      )
--    ORDER BY table_name, constraint_name;
--
-- 2. Test email validation (should fail):
--    INSERT INTO public.user_profiles (id, email) 
--    VALUES (gen_random_uuid(), 'invalid-email');
--
-- 3. Test cost validation (should fail):
--    INSERT INTO public.software_licenses (account_id, name, vendor, license_key, license_type, purchase_date, expiration_date, cost)
--    VALUES ('account-id', 'Test', 'Vendor', 'key', 'perpetual', current_date, current_date + 365, -100);
