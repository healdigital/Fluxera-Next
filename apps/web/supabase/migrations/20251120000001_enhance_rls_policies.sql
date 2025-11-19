-- Migration: Enhance RLS Policies with Permission Checks
-- Description: Updates RLS policies to check permissions instead of just membership
-- Author: Security Fixes Implementation
-- Date: 2025-11-20
-- Note: This migration enhances existing RLS policies to use permission-based access control

-- ============================================================================
-- SOFTWARE LICENSES - Enhanced RLS Policies
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view team licenses" on public.software_licenses;
drop policy if exists "Users can create team licenses" on public.software_licenses;
drop policy if exists "Users can update team licenses" on public.software_licenses;
drop policy if exists "Users can delete team licenses" on public.software_licenses;

-- SELECT: Users can view licenses if they have licenses.view permission
create policy "Users can view team licenses"
  on public.software_licenses for select
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.view'::public.app_permissions)
    )
  );

-- INSERT: Users can create licenses if they have licenses.create permission
create policy "Users can create team licenses"
  on public.software_licenses for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.create'::public.app_permissions)
    )
  );

-- UPDATE: Users can update licenses if they have licenses.update permission
create policy "Users can update team licenses"
  on public.software_licenses for update
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.update'::public.app_permissions)
    )
  )
  with check (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.update'::public.app_permissions)
    )
  );

-- DELETE: Users can delete licenses if they have licenses.delete permission
create policy "Users can delete team licenses"
  on public.software_licenses for delete
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.delete'::public.app_permissions)
    )
  );

-- ============================================================================
-- LICENSE ASSIGNMENTS - Enhanced RLS Policies
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view team license assignments" on public.license_assignments;
drop policy if exists "Users can create team license assignments" on public.license_assignments;
drop policy if exists "Users can delete team license assignments" on public.license_assignments;

-- SELECT: Users can view assignments if they have licenses.view permission
create policy "Users can view team license assignments"
  on public.license_assignments for select
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = license_assignments.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.view'::public.app_permissions)
    )
  );

-- INSERT: Users can create assignments if they have licenses.manage permission
create policy "Users can create team license assignments"
  on public.license_assignments for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = license_assignments.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.manage'::public.app_permissions)
    )
  );

-- DELETE: Users can delete assignments if they have licenses.manage permission
create policy "Users can delete team license assignments"
  on public.license_assignments for delete
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = license_assignments.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.manage'::public.app_permissions)
    )
  );

-- ============================================================================
-- LICENSE RENEWAL ALERTS - Enhanced RLS Policies
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view team license alerts" on public.license_renewal_alerts;
drop policy if exists "System can insert license alerts" on public.license_renewal_alerts;

-- SELECT: Users can view alerts if they have licenses.view permission
create policy "Users can view team license alerts"
  on public.license_renewal_alerts for select
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = license_renewal_alerts.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.view'::public.app_permissions)
    )
  );

-- INSERT: System can insert alerts (for automated expiration checks)
-- This policy allows the check_license_expirations() function to insert alerts
create policy "System can insert license alerts"
  on public.license_renewal_alerts for insert
  to authenticated
  with check (
    -- Allow if user has licenses.manage permission (for manual alerts)
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = license_renewal_alerts.account_id
        and public.has_permission(auth.uid(), am.account_id, 'licenses.manage'::public.app_permissions)
    )
  );

-- ============================================================================
-- ASSETS - Enhanced RLS Policies
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view team assets" on public.assets;
drop policy if exists "Users can create team assets" on public.assets;
drop policy if exists "Users can update team assets" on public.assets;
drop policy if exists "Users can delete team assets" on public.assets;

-- SELECT: Users can view assets if they have assets.view permission
create policy "Users can view team assets"
  on public.assets for select
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and public.has_permission(auth.uid(), am.account_id, 'assets.view'::public.app_permissions)
    )
  );

-- INSERT: Users can create assets if they have assets.create permission
create policy "Users can create team assets"
  on public.assets for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and public.has_permission(auth.uid(), am.account_id, 'assets.create'::public.app_permissions)
    )
  );

-- UPDATE: Users can update assets if they have assets.update permission
create policy "Users can update team assets"
  on public.assets for update
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and public.has_permission(auth.uid(), am.account_id, 'assets.update'::public.app_permissions)
    )
  )
  with check (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and public.has_permission(auth.uid(), am.account_id, 'assets.update'::public.app_permissions)
    )
  );

-- DELETE: Users can delete assets if they have assets.delete permission
create policy "Users can delete team assets"
  on public.assets for delete
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and public.has_permission(auth.uid(), am.account_id, 'assets.delete'::public.app_permissions)
    )
  );

-- ============================================================================
-- ASSET HISTORY - Enhanced RLS Policies
-- ============================================================================

-- Drop existing policies
drop policy if exists "Users can view team asset history" on public.asset_history;
drop policy if exists "System can insert asset history" on public.asset_history;

-- SELECT: Users can view asset history if they have assets.view permission
create policy "Users can view team asset history"
  on public.asset_history for select
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships am
      where am.user_id = auth.uid()
        and am.account_id = asset_history.account_id
        and public.has_permission(auth.uid(), am.account_id, 'assets.view'::public.app_permissions)
    )
  );

-- INSERT: System can insert history (via triggers)
-- This allows the create_asset_history_entry() trigger to work
create policy "System can insert asset history"
  on public.asset_history for insert
  to authenticated
  with check (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on policy "Users can view team licenses" on public.software_licenses is
'Users can view licenses if they have licenses.view permission for the account';

comment on policy "Users can create team licenses" on public.software_licenses is
'Users can create licenses if they have licenses.create permission for the account';

comment on policy "Users can update team licenses" on public.software_licenses is
'Users can update licenses if they have licenses.update permission for the account';

comment on policy "Users can delete team licenses" on public.software_licenses is
'Users can delete licenses if they have licenses.delete permission for the account';

comment on policy "Users can view team assets" on public.assets is
'Users can view assets if they have assets.view permission for the account';

comment on policy "Users can create team assets" on public.assets is
'Users can create assets if they have assets.create permission for the account';

comment on policy "Users can update team assets" on public.assets is
'Users can update assets if they have assets.update permission for the account';

comment on policy "Users can delete team assets" on public.assets is
'Users can delete assets if they have assets.delete permission for the account';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration was successful:
--
-- 1. Check policies exist:
--    select schemaname, tablename, policyname, cmd
--    from pg_policies
--    where schemaname = 'public'
--      and tablename in ('software_licenses', 'assets', 'license_assignments')
--    order by tablename, cmd;
--
-- 2. Test permission check (should return false if user doesn't have permission):
--    select public.has_permission(auth.uid(), 'account-id', 'licenses.create'::public.app_permissions);
