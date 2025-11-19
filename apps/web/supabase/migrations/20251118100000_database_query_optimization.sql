-- ============================================================================
-- Database Query Optimization Migration
-- ============================================================================
-- This migration adds missing indexes and optimizes database queries for better performance
-- Addresses requirement 1.2: Optimize database queries for faster response times

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable pg_trgm extension for text search performance
create extension if not exists pg_trgm;

comment on extension pg_trgm is 'Provides trigram matching for efficient text search';

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- Assets: Composite index for filtering by account + status + category
-- Optimizes queries that filter by multiple columns simultaneously
create index if not exists idx_assets_account_status_category 
  on public.assets(account_id, status, category);

-- Assets: Composite index for account + assigned_to for assignment queries
create index if not exists idx_assets_account_assigned 
  on public.assets(account_id, assigned_to) 
  where assigned_to is not null;

-- Assets: Text search optimization for name field
create index if not exists idx_assets_name_trgm 
  on public.assets using gin(name gin_trgm_ops);

-- Software Licenses: Composite index for account + expiration date filtering
create index if not exists idx_licenses_account_expiration 
  on public.software_licenses(account_id, expiration_date);

-- Software Licenses: Composite index for account + vendor filtering
create index if not exists idx_licenses_account_vendor 
  on public.software_licenses(account_id, vendor);

-- Software Licenses: Text search optimization for name and vendor
create index if not exists idx_licenses_name_trgm 
  on public.software_licenses using gin(name gin_trgm_ops);

create index if not exists idx_licenses_vendor_trgm 
  on public.software_licenses using gin(vendor gin_trgm_ops);

-- License Assignments: Composite index for license + user/asset lookups
create index if not exists idx_license_assignments_license_user 
  on public.license_assignments(license_id, assigned_to_user) 
  where assigned_to_user is not null;

create index if not exists idx_license_assignments_license_asset 
  on public.license_assignments(license_id, assigned_to_asset) 
  where assigned_to_asset is not null;

-- User Profiles: Text search optimization for display name
create index if not exists idx_user_profiles_display_name_trgm 
  on public.user_profiles using gin(display_name gin_trgm_ops);

-- User Activity Log: Composite index for user + account + date range queries
create index if not exists idx_user_activity_user_account_date 
  on public.user_activity_log(user_id, account_id, created_at desc);

-- Accounts Memberships: Composite index for user + account lookups
create index if not exists idx_accounts_memberships_user_account 
  on public.accounts_memberships(user_id, account_id);

-- Dashboard Alerts: Composite index for account + dismissed status + expiry
create index if not exists idx_dashboard_alerts_account_active 
  on public.dashboard_alerts(account_id, is_dismissed, expires_at) 
  where is_dismissed = false;

-- ============================================================================
-- COVERING INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Assets: Covering index for list queries (includes commonly selected columns)
create index if not exists idx_assets_list_covering 
  on public.assets(account_id, created_at desc) 
  include (name, category, status, assigned_to);

-- Licenses: Covering index for list queries
create index if not exists idx_licenses_list_covering 
  on public.software_licenses(account_id, expiration_date) 
  include (name, vendor, license_type);

-- ============================================================================
-- VACUUM AND ANALYZE RECOMMENDATIONS
-- ============================================================================

-- Add comments for maintenance recommendations
comment on table public.assets is 'IT assets managed by team accounts. Recommend VACUUM ANALYZE weekly for optimal performance.';
comment on table public.software_licenses is 'Software licenses managed by team accounts. Recommend VACUUM ANALYZE weekly for optimal performance.';
comment on table public.user_activity_log is 'Audit log of user actions. Consider partitioning by created_at for large datasets. Recommend VACUUM ANALYZE daily.';
comment on table public.asset_history is 'Audit trail for asset changes. Consider partitioning by created_at for large datasets. Recommend VACUUM ANALYZE daily.';

-- ============================================================================
-- STATISTICS TARGETS FOR BETTER QUERY PLANNING
-- ============================================================================

-- Increase statistics target for frequently filtered columns
alter table public.assets alter column category set statistics 1000;
alter table public.assets alter column status set statistics 1000;
alter table public.assets alter column name set statistics 1000;

alter table public.software_licenses alter column vendor set statistics 1000;
alter table public.software_licenses alter column license_type set statistics 1000;
alter table public.software_licenses alter column expiration_date set statistics 1000;

alter table public.user_profiles alter column display_name set statistics 1000;
