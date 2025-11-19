-- Asset Management Performance Optimization Migration
-- This migration adds composite indexes to optimize common query patterns
-- and improve performance for filtering, pagination, and search operations

-- ============================================================================
-- COMPOSITE INDEXES FOR ASSETS TABLE
-- ============================================================================

-- Composite index for common filter combinations (account + status + category)
-- Optimizes queries that filter by account, status, and/or category
-- Used in: Assets list page with multiple filters applied
create index if not exists idx_assets_account_status_category 
  on public.assets(account_id, status, category);

-- Composite index for pagination queries (account + created_at)
-- Optimizes the most common query pattern: list assets by account, ordered by date
-- Used in: Assets list page default view
create index if not exists idx_assets_account_created_at 
  on public.assets(account_id, created_at desc);

-- Composite index for name search within account
-- Optimizes search queries that filter by account and search by name
-- Used in: Assets list page with search filter
create index if not exists idx_assets_account_name 
  on public.assets(account_id, name);

-- ============================================================================
-- COMPOSITE INDEXES FOR ASSET_HISTORY TABLE
-- ============================================================================

-- Composite index for history queries with pagination
-- Optimizes queries that fetch history for a specific asset within an account
-- Used in: Asset detail page history section
create index if not exists idx_asset_history_account_asset_created 
  on public.asset_history(account_id, asset_id, created_at desc);

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

-- Update query planner statistics for better query optimization
analyze public.assets;
analyze public.asset_history;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on index public.idx_assets_account_status_category is 
  'Composite index for filtering assets by account, status, and category';

comment on index public.idx_assets_account_created_at is 
  'Composite index for paginated asset listing ordered by creation date';

comment on index public.idx_assets_account_name is 
  'Composite index for searching assets by name within an account';

comment on index public.idx_asset_history_account_asset_created is 
  'Composite index for fetching asset history with pagination';
