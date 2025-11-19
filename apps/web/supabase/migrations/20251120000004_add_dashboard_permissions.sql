-- Migration: Add Dashboard Permissions to Enum
-- Description: Adds dashboard.view and dashboard.manage permissions to app_permissions enum
-- Author: Security Fixes Implementation - Task 7.4
-- Date: 2025-11-20
-- Note: Required for dashboard server actions refactoring

-- ============================================================================
-- Add Dashboard Permissions to Enum
-- ============================================================================

-- Add dashboard permissions
alter type public.app_permissions add value if not exists 'dashboard.view';
alter type public.app_permissions add value if not exists 'dashboard.manage';

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on type public.app_permissions is 
'Application permissions enum. Includes:
- roles.manage: Manage roles and permissions
- billing.manage: Manage billing and subscriptions
- settings.manage: Manage account settings
- members.manage: Manage team members
- invites.manage: Manage team invitations
- licenses.view: View software licenses
- licenses.create: Create software licenses
- licenses.update: Update software licenses
- licenses.delete: Delete software licenses
- licenses.manage: Full license management (includes assignments)
- assets.view: View assets
- assets.create: Create assets
- assets.update: Update assets
- assets.delete: Delete assets
- assets.manage: Full asset management
- dashboard.view: View dashboard and metrics
- dashboard.manage: Manage dashboard (dismiss alerts, configure widgets)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration was successful:
--
-- 1. Check all enum values:
--    select unnest(enum_range(null::public.app_permissions)) as permission
--    order by permission;
--
-- 2. Verify dashboard permissions exist:
--    select unnest(enum_range(null::public.app_permissions)) as permission
--    where permission like 'dashboard.%';
