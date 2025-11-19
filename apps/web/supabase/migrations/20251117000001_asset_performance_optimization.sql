-- Asset Management Performance Optimization Migration
-- This migration adds composite indexes and optimizations for better query performance

-- ============================================================================
-- COMPOSITE INDEXES FOR RLS POLICY OPTIMIZATION
-- ============================================================================

-- Composite index for the most common query pattern: filtering by account + status + category
-- This significantly improves performance when users filter assets
create index idx_assets_account_status_category on public.assets(account_id, status, category);

-- Composite index for account + created_at for efficient pagination
create index idx_assets_account_created_at on public.assets(account_id, created_at desc);

-- Composite index for asset history queries (account + asset + created_at)
-- This optimizes the history loading with pagination
create index idx_asset_history_account_asset_created on public.asset_history(account_id, asset_id, created_at desc);

-- Index for name search with account_id (for text search optimization)
create index idx_assets_account_name on public.assets(account_id, name);

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

-- Update statistics for the query planner to make better decisions
analyze public.assets;
analyze public.asset_history;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on index idx_assets_account_status_category is 'Composite index for efficient filtering by account, status, and category';
comment on index idx_assets_account_created_at is 'Composite index for efficient pagination by account and creation date';
comment on index idx_asset_history_account_asset_created is 'Composite index for efficient history queries with pagination';
comment on index idx_assets_account_name is 'Composite index for efficient name search within account';
