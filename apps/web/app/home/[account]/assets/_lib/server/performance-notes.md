# Asset Management Performance Optimizations

## Database Indexes

### Primary Indexes (from initial migration)
- `idx_assets_account_id` - Filter assets by account
- `idx_assets_category` - Filter by category
- `idx_assets_status` - Filter by status
- `idx_assets_assigned_to` - Filter by assigned user
- `idx_assets_created_at` - Sort by creation date
- `idx_asset_history_asset_id` - Query history by asset
- `idx_asset_history_account_id` - Query history by account
- `idx_asset_history_created_at` - Sort history by date

### Composite Indexes (performance optimization migration)
- `idx_assets_account_status_category` - Optimizes common filter combinations
- `idx_assets_account_created_at` - Optimizes pagination queries
- `idx_asset_history_account_asset_created` - Optimizes history queries with pagination
- `idx_assets_account_name` - Optimizes name search within account

## Query Optimizations

### N+1 Query Prevention
All loaders use Supabase's join syntax to fetch related data in a single query:
- Assets list fetches assigned user data in one query
- Asset detail fetches assigned user data in one query
- Asset history fetches user data in one query

### Pagination Implementation
- **Assets List**: Default 50 items per page, configurable via URL params
- **Asset History**: Limited to 50 most recent entries per asset
- Uses `range()` for efficient offset-based pagination
- Includes total count for pagination UI

### RLS Policy Performance
Composite indexes ensure RLS policies perform efficiently:
- `account_id` is always the first column in composite indexes
- Filters (status, category) are included in composite indexes
- Query planner can use indexes for both RLS checks and filters

## Performance Testing Recommendations

### Database Performance
1. Run `EXPLAIN ANALYZE` on common queries:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM assets
   WHERE account_id = 'xxx'
   AND status = 'available'
   ORDER BY created_at DESC
   LIMIT 50;
   ```

2. Verify index usage:
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   WHERE tablename IN ('assets', 'asset_history')
   ORDER BY idx_scan DESC;
   ```

3. Test with large datasets:
   - Create 1000+ assets per account
   - Verify query performance remains under 100ms
   - Check RLS policy overhead

### Application Performance
1. Monitor server-side rendering times
2. Check for unnecessary re-renders in client components
3. Verify pagination reduces initial page load time
4. Test filter combinations for performance

## Scalability Considerations

### Current Limits
- 50 assets per page (configurable)
- 50 history entries per asset
- No limit on total assets per account

### Future Optimizations
If performance degrades with scale:
1. Implement cursor-based pagination for better performance
2. Add full-text search indexes for name/description search
3. Consider materialized views for complex aggregations
4. Add caching layer for frequently accessed data
5. Implement virtual scrolling for large lists

## Monitoring

Key metrics to track:
- Average query execution time
- RLS policy overhead
- Page load times
- Database connection pool usage
- Index hit rates
