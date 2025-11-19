-- Migration: Add Missing Permissions to Enum
-- Description: Adds licenses and assets permissions to app_permissions enum
-- Author: Security Fixes Implementation
-- Date: 2025-11-20
-- Note: This migration must run BEFORE 20251120000001_enhance_rls_policies.sql

-- ============================================================================
-- Add Permissions to Enum
-- ============================================================================

-- Add licenses permissions
alter type public.app_permissions add value if not exists 'licenses.view';
alter type public.app_permissions add value if not exists 'licenses.create';
alter type public.app_permissions add value if not exists 'licenses.update';
alter type public.app_permissions add value if not exists 'licenses.delete';
alter type public.app_permissions add value if not exists 'licenses.manage';

-- Add assets permissions
alter type public.app_permissions add value if not exists 'assets.view';
alter type public.app_permissions add value if not exists 'assets.create';
alter type public.app_permissions add value if not exists 'assets.update';
alter type public.app_permissions add value if not exists 'assets.delete';
alter type public.app_permissions add value if not exists 'assets.manage';

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
- assets.manage: Full asset management';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration was successful:
--
-- 1. Check all enum values:
--    select unnest(enum_range(null::public.app_permissions)) as permission
--    order by permission;
