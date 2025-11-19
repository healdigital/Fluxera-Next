-- Migration: RLS Helper Functions for Performance Optimization
-- Description: Creates reusable helper functions to optimize RLS policy checks
-- Author: Security Fixes Implementation
-- Date: 2025-11-20
-- Note: This migration leverages the existing supamode.has_permission() function
--       and adds convenience wrappers for common RLS patterns

-- ============================================================================
-- Helper Function 1: Check Permission by Name
-- ============================================================================
-- Convenience wrapper that accepts permission name instead of UUID
-- Looks up permission ID and calls supamode.has_permission()

create or replace function supamode.has_permission_by_name(
  p_account_id uuid,
  p_permission_name text
)
returns boolean
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_permission_id uuid;
begin
  -- Look up permission ID by name
  select id into v_permission_id
  from supamode.permissions
  where name = p_permission_name
  limit 1;
  
  -- If permission doesn't exist, return false
  if v_permission_id is null then
    return false;
  end if;
  
  -- Use existing has_permission function
  return supamode.has_permission(p_account_id, v_permission_id);
end;
$$;

comment on function supamode.has_permission_by_name(uuid, text) is 
'Convenience wrapper for has_permission() that accepts permission name instead of UUID.
Parameters:
  - p_account_id: The account ID to check permissions for
  - p_permission_name: The permission name (e.g., ''licenses.create'')
Returns: true if user has the permission, false otherwise
Security Model: SECURITY INVOKER - runs with caller privileges
Performance: Adds one permission lookup, then uses optimized has_permission()
Usage Example:
  select supamode.has_permission_by_name(
    supamode.get_current_user_account_id(), 
    ''licenses.create''
  );';

-- ============================================================================
-- Helper Function 2: Check Current User Permission
-- ============================================================================
-- Convenience wrapper that automatically uses current user's account
-- Useful for RLS policies that check current user permissions

create or replace function supamode.current_user_has_permission(
  p_permission_name text
)
returns boolean
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_account_id uuid;
begin
  -- Get current user's account ID
  v_account_id := supamode.get_current_user_account_id();
  
  -- If no account, return false
  if v_account_id is null then
    return false;
  end if;
  
  -- Check permission
  return supamode.has_permission_by_name(v_account_id, p_permission_name);
end;
$$;

comment on function supamode.current_user_has_permission(text) is 
'Checks if the current user has a specific permission.
Parameters:
  - p_permission_name: The permission name (e.g., ''licenses.create'')
Returns: true if current user has the permission, false otherwise
Security Model: SECURITY INVOKER - runs with caller privileges
Usage in RLS: Simplifies permission checks in RLS policies
Usage Example:
  create policy "Users can create licenses"
    on software_licenses for insert
    with check (supamode.current_user_has_permission(''licenses.create''));';

-- ============================================================================
-- Performance Indexes
-- ============================================================================
-- Add indexes to optimize permission lookups by name

create index if not exists idx_permissions_name 
  on supamode.permissions(name);

comment on index supamode.idx_permissions_name is
'Index for efficient permission lookups by name.
Used by: has_permission_by_name() function';

-- Ensure existing indexes are in place for account_roles
create index if not exists idx_account_roles_account_id 
  on supamode.account_roles(account_id);

comment on index supamode.idx_account_roles_account_id is
'Index for efficient account role lookups.
Used by: has_permission() and related functions';

-- ============================================================================
-- Grant Permissions
-- ============================================================================
-- Allow authenticated users to execute helper functions

grant execute on function supamode.has_permission_by_name(uuid, text) to authenticated;
grant execute on function supamode.current_user_has_permission(text) to authenticated;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries to verify the migration was successful:
--
-- 1. Check functions exist:
--    select routine_name, routine_type, security_type 
--    from information_schema.routines 
--    where routine_schema = 'public' 
--      and routine_name in ('user_account_ids', 'user_has_permission');
--
-- 2. Check indexes exist:
--    select indexname, indexdef 
--    from pg_indexes 
--    where schemaname = 'public' 
--      and indexname in ('idx_accounts_memberships_user_account', 'idx_account_roles_permissions');
--
-- 3. Test user_account_ids():
--    select * from user_account_ids();
--
-- 4. Test user_has_permission():
--    select user_has_permission(account_id, 'licenses.create') 
--    from accounts limit 1;
