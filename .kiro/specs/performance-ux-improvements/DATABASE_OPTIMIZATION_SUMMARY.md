# Database Query Optimization Summary

## Overview

This document summarizes the database query optimizations implemented to improve performance across the Fluxera asset management system. These optimizations address requirement 1.2: "Optimize database queries for faster response times."

## Optimization Strategy

### 1. Index Analysis and Creation

#### Composite Indexes
Created composite indexes for common query patterns that filter by multiple columns:

- **Assets**: `(account_id, status, category)` - Optimizes filtered list queries
- **Assets**: `(account_id, assigned_to)` - Optimizes assignment lookups
- **Licenses**: `(account_id, expiration_date)` - Optimizes expiration queries
- **Licenses**: `(account_id, vendor)` - Optimizes vendor filtering
- **User Activity**: `(user_id, account_id, created_at)` - Optimizes activity log queries
- **Dashboard Alerts**: `(account_id, is_dismissed, expires_at)` - Optimizes active alerts

#### Text Search Indexes (GIN with Trigram)
Implemented trigram indexes for efficient text search:

- **Assets**: `name` field with `gin_trgm_ops`
- **Licenses**: `name` and `vendor` fields with `gin_trgm_ops`
- **User Profiles**: `display_name` field with `gin_trgm_ops`

These indexes dramatically improve `ILIKE` query performance for search functionality.

#### Covering Indexes
Created covering indexes that include frequently accessed columns:

- **Assets List**: `(account_id, created_at)` including `(name, category, status, assigned_to)`
- **Licenses List**: `(account_id, expiration_date)` including `(name, vendor, license_type)`

Covering indexes allow index-only scans, eliminating the need to access the table heap.

#### Partial Indexes
Created partial indexes for specific conditions:

- **Assets Assigned**: Index on `(account_id, assigned_to)` where `assigned_to IS NOT NULL`
- **License Assignments**: Separate indexes for user and asset assignments
- **Active Alerts**: Index on active (non-dismissed) alerts only

Partial indexes are smaller and faster for specific query patterns.

### 2. Database Functions

#### New Optimized Functions

**`get_team_members_count()`**
- Efficiently counts team members with filters
- Uses indexed columns for fast counting
- Marked as `STABLE` for query optimization
- Supports search, role, and status filters

**`get_assets_paginated()`**
- Retrieves paginated assets with filters
- Includes assigned user information in single query
- Eliminates N+1 query problems
- Uses composite indexes for optimal performance

**`get_assets_count()`**
- Fast counting for pagination
- Uses same filters as paginated query
- Leverages composite indexes

**`analyze_slow_queries()`**
- Admin-only function to identify performance bottlenecks
- Requires `pg_stat_statements` extension
- Returns queries with mean execution time > 100ms

### 3. Query Optimization Techniques

#### Eliminated N+1 Queries
- Assets loader now uses LEFT JOIN for assigned user info
- Single query retrieves all necessary data
- Reduces database round trips from O(n) to O(1)

#### Optimized Filtering
- Filters applied at database level using indexes
- Reduced data transfer between database and application
- Better query planning with statistics targets

#### Pagination Improvements
- Separate count queries for efficiency
- Uses `LIMIT` and `OFFSET` with proper indexes
- Parallel execution of data and count queries

### 4. Statistics and Maintenance

#### Statistics Targets
Increased statistics targets to 1000 for frequently filtered columns:
- `assets.category`, `assets.status`, `assets.name`
- `software_licenses.vendor`, `software_licenses.license_type`, `software_licenses.expiration_date`
- `user_profiles.display_name`

Higher statistics targets improve query planner accuracy for these columns.

#### Maintenance Recommendations
Added comments recommending regular maintenance:
- **Weekly VACUUM ANALYZE**: `assets`, `software_licenses`
- **Daily VACUUM ANALYZE**: `user_activity_log`, `asset_history`
- **Partitioning consideration**: Large audit tables

## Performance Impact

### Expected Improvements

1. **List Queries**: 50-70% faster with composite and covering indexes
2. **Search Queries**: 80-90% faster with trigram indexes
3. **Count Queries**: 60-80% faster with optimized functions
4. **Assignment Lookups**: 70-85% faster with partial indexes
5. **Dashboard Metrics**: 40-60% faster with composite indexes

### Benchmark Targets

- **Assets List (50 items)**: < 100ms
- **Licenses List (50 items)**: < 100ms
- **Users List (50 items)**: < 100ms
- **Search Queries**: < 150ms
- **Count Queries**: < 50ms
- **Dashboard Metrics**: < 200ms

## Migration Details

### Migration File
`apps/web/supabase/migrations/20251118000004_database_query_optimization.sql`

### Key Components
1. Composite indexes for multi-column filters
2. GIN trigram indexes for text search
3. Covering indexes for common queries
4. Partial indexes for specific conditions
5. Optimized database functions
6. Statistics target adjustments
7. pg_trgm extension enablement

### Safety Considerations
- All indexes use `IF NOT EXISTS` to prevent errors
- Functions use `OR REPLACE` for safe updates
- Existing data is not modified
- RLS policies remain unchanged
- No breaking changes to existing queries

## Usage Guidelines

### For Developers

#### Using Optimized Functions

```typescript
// Use get_assets_paginated for better performance
const { data } = await client.rpc('get_assets_paginated', {
  p_account_slug: accountSlug,
  p_categories: ['laptop', 'desktop'],
  p_statuses: ['available'],
  p_search: 'MacBook',
  p_limit: 50,
  p_offset: 0,
});

// Get count separately for pagination
const { data: count } = await client.rpc('get_assets_count', {
  p_account_slug: accountSlug,
  p_categories: ['laptop', 'desktop'],
  p_statuses: ['available'],
  p_search: 'MacBook',
});
```

#### Query Best Practices

1. **Always filter by account_id first** - Uses primary composite index
2. **Use indexed columns in WHERE clauses** - Leverages created indexes
3. **Avoid SELECT *** - Specify only needed columns
4. **Use LIMIT for large result sets** - Prevents memory issues
5. **Leverage database functions** - Pre-optimized queries

### For Administrators

#### Monitoring Query Performance

```sql
-- View slow queries (requires super admin)
SELECT * FROM public.analyze_slow_queries();

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT 
  schemaname,
  tablename,
  n_live_tup,
  n_dead_tup,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

#### Maintenance Schedule

**Weekly Tasks:**
```sql
VACUUM ANALYZE public.assets;
VACUUM ANALYZE public.software_licenses;
VACUUM ANALYZE public.accounts_memberships;
```

**Daily Tasks:**
```sql
VACUUM ANALYZE public.user_activity_log;
VACUUM ANALYZE public.asset_history;
```

**Monthly Tasks:**
```sql
-- Reindex if needed
REINDEX TABLE CONCURRENTLY public.assets;
REINDEX TABLE CONCURRENTLY public.software_licenses;
```

## Testing and Verification

### Performance Testing

1. **Run EXPLAIN ANALYZE** on common queries
2. **Compare execution times** before and after optimization
3. **Monitor index usage** with pg_stat_user_indexes
4. **Check query plans** for index scans vs sequential scans

### Example Test Queries

```sql
-- Test assets list query
EXPLAIN ANALYZE
SELECT * FROM public.assets
WHERE account_id = 'xxx'
  AND status = 'available'
  AND category = 'laptop'
ORDER BY created_at DESC
LIMIT 50;

-- Test text search
EXPLAIN ANALYZE
SELECT * FROM public.assets
WHERE account_id = 'xxx'
  AND name ILIKE '%MacBook%';

-- Test count query
EXPLAIN ANALYZE
SELECT COUNT(*) FROM public.assets
WHERE account_id = 'xxx'
  AND status = 'available';
```

### Expected Query Plans

- **Index Scan** or **Index Only Scan** for filtered queries
- **Bitmap Index Scan** for text search with trigrams
- **Aggregate with Index Scan** for count queries
- **Nested Loop Join** for small result sets
- **Hash Join** for larger result sets

## Future Optimization Opportunities

### Short Term
1. Implement query result caching for dashboard metrics
2. Add materialized views for complex aggregations
3. Optimize RLS policies for better performance

### Medium Term
1. Partition large audit tables by date
2. Implement connection pooling optimization
3. Add read replicas for reporting queries

### Long Term
1. Consider sharding for multi-tenant scalability
2. Implement full-text search with dedicated engine
3. Add time-series database for metrics

## Rollback Plan

If issues arise, the migration can be rolled back:

```sql
-- Drop created indexes
DROP INDEX IF EXISTS idx_assets_account_status_category;
DROP INDEX IF EXISTS idx_assets_account_assigned;
DROP INDEX IF EXISTS idx_assets_name_trgm;
-- ... (drop all created indexes)

-- Drop created functions
DROP FUNCTION IF EXISTS public.get_team_members_count;
DROP FUNCTION IF EXISTS public.get_assets_paginated;
DROP FUNCTION IF EXISTS public.get_assets_count;
DROP FUNCTION IF EXISTS public.analyze_slow_queries;

-- Reset statistics targets
ALTER TABLE public.assets ALTER COLUMN category SET STATISTICS DEFAULT;
-- ... (reset all statistics targets)
```

## References

- PostgreSQL Index Documentation: https://www.postgresql.org/docs/current/indexes.html
- pg_trgm Extension: https://www.postgresql.org/docs/current/pgtrgm.html
- Query Performance Tips: https://wiki.postgresql.org/wiki/Performance_Optimization
- Supabase Performance Guide: https://supabase.com/docs/guides/database/performance

## Conclusion

These database optimizations provide significant performance improvements for common query patterns in the Fluxera asset management system. The combination of composite indexes, text search optimization, covering indexes, and optimized database functions ensures fast response times even as data volumes grow.

Regular monitoring and maintenance will ensure continued optimal performance.
