-- =============================================
-- Dashboard Performance Optimization Migration
-- =============================================
-- This migration adds additional indexes to optimize dashboard queries
-- and improve overall performance

-- =============================================
-- ADDITIONAL INDEXES FOR DASHBOARD QUERIES
-- =============================================

-- Composite index for assets by account and status (for status distribution)
create index if not exists idx_assets_account_status 
  on public.assets(account_id, status) 
  where status is not null;

-- Composite index for assets by account and created_at (for trend queries)
create index if not exists idx_assets_account_created 
  on public.assets(account_id, created_at desc);

-- Composite index for memberships by account and created_at (for trend queries)
create index if not exists idx_memberships_account_created 
  on public.accounts_memberships(account_id, created_at desc);

-- Composite index for licenses by account and expiration date (for expiring licenses)
create index if not exists idx_licenses_account_expiration 
  on public.software_licenses(account_id, expiration_date) 
  where expiration_date is not null;

-- Composite index for licenses by account and created_at (for trend queries)
create index if not exists idx_licenses_account_created 
  on public.software_licenses(account_id, created_at desc);

-- Composite index for user account status (for active users count)
-- Only create if table exists
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'user_account_status') then
    create index if not exists idx_user_account_status_active 
      on public.user_account_status(account_id, user_id, status) 
      where status = 'active';
  end if;
end;
$$;

-- Composite index for asset maintenance by asset and status (for pending maintenance)
-- Only create if table exists
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'asset_maintenance') then
    create index if not exists idx_asset_maintenance_status 
      on public.asset_maintenance(asset_id, status) 
      where status = 'pending';
  end if;
end;
$$;

-- Index on accounts slug for faster lookups
create index if not exists idx_accounts_slug 
  on public.accounts(slug) 
  where slug is not null;

-- Composite index for dashboard widgets lookup
create index if not exists idx_dashboard_widgets_account_user_visible 
  on public.dashboard_widgets(account_id, user_id, is_visible) 
  where is_visible = true;

-- Composite index for active dashboard alerts
create index if not exists idx_dashboard_alerts_account_active 
  on public.dashboard_alerts(account_id, is_dismissed, expires_at) 
  where is_dismissed = false;

-- =============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- =============================================

-- Update statistics for better query planning (only for existing tables)
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'assets') then
    analyze public.assets;
  end if;
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'accounts_memberships') then
    analyze public.accounts_memberships;
  end if;
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'software_licenses') then
    analyze public.software_licenses;
  end if;
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'dashboard_widgets') then
    analyze public.dashboard_widgets;
  end if;
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'dashboard_alerts') then
    analyze public.dashboard_alerts;
  end if;
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'user_account_status') then
    analyze public.user_account_status;
  end if;
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'asset_maintenance') then
    analyze public.asset_maintenance;
  end if;
end;
$$;

-- =============================================
-- COMMENTS
-- =============================================

-- Add comments for created indexes
do $$
begin
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_assets_account_status') then
    comment on index idx_assets_account_status is 'Optimizes asset status distribution queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_assets_account_created') then
    comment on index idx_assets_account_created is 'Optimizes asset trend queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_memberships_account_created') then
    comment on index idx_memberships_account_created is 'Optimizes user trend queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_licenses_account_expiration') then
    comment on index idx_licenses_account_expiration is 'Optimizes expiring license queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_licenses_account_created') then
    comment on index idx_licenses_account_created is 'Optimizes license trend queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_user_account_status_active') then
    comment on index idx_user_account_status_active is 'Optimizes active user count queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_asset_maintenance_status') then
    comment on index idx_asset_maintenance_status is 'Optimizes pending maintenance queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_accounts_slug') then
    comment on index idx_accounts_slug is 'Optimizes account lookup by slug';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_dashboard_widgets_account_user_visible') then
    comment on index idx_dashboard_widgets_account_user_visible is 'Optimizes widget configuration queries';
  end if;
  if exists (select from pg_indexes where schemaname = 'public' and indexname = 'idx_dashboard_alerts_account_active') then
    comment on index idx_dashboard_alerts_account_active is 'Optimizes active alerts queries';
  end if;
end;
$$;
