# Dashboard Database Optimization Guide

This guide provides detailed information about database optimizations for the dashboard system.

## Index Strategy

### Dashboard Widgets Table

```sql
-- Primary access patterns
create index idx_dashboard_widgets_account_id on public.dashboard_widgets(account_id);
create index idx_dashboard_widgets_user_id on public.dashboard_widgets(user_id);
create index idx_dashboard_widgets_position on public.dashboard_widgets(position_order);

-- Composite unique index for widget configuration
create unique index idx_dashboard_widgets_unique 
  on public.dashboard_widgets(account_id, coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), widget_type);
```

**Rationale**:
- `account_id` index: Fast filtering by team account
- `user_id` index: Quick lookup of user-specific configurations
- `position_order` index: Efficient sorting for widget display order
- Unique index: Prevents duplicate widget configurations

### Dashboard Alerts Table

```sql
-- Primary access patterns
create index idx_dashboard_alerts_account_id on public.dashboard_alerts(account_id);
create index idx_dashboard_alerts_severity on public.dashboard_alerts(severity);
create index idx_dashboard_alerts_dismissed on public.dashboard_alerts(is_dismissed);
create index idx_dashboard_alerts_created_at on public.dashboard_alerts(created_at desc);

-- Partial index for active alerts
create index idx_dashboard_alerts_expires_at on public.dashboard_alerts(expires_at) 
  where expires_at is not null;
```

**Rationale**:
- `account_id` index: Fast filtering by team account
- `severity` index: Quick sorting by alert priority
- `is_dismissed` index: Efficient filtering of active alerts
- `created_at` index: Fast sorting by recency (DESC for newest first)
- Partial index on `expires_at`: Only indexes rows with expiration dates, reducing index size

## Query Optimization

### Team Dashboard Metrics Function

**Function**: `get_team_dashboard_metrics(p_account_slug text)`

**Optimization Techniques**:

1. **Single Query Aggregation**: All metrics calculated in one query
2. **LEFT JOINs**: Ensures data is returned even if related tables are empty
3. **COALESCE**: Handles NULL values gracefully
4. **Subqueries for Growth Metrics**: Separate subqueries for 30-day growth to avoid complex joins

**Query Plan Analysis**:
```sql
EXPLAIN ANALYZE
SELECT * FROM get_team_dashboard_metrics('your-account-slug');
```

**Expected Performance**:
- Execution time: < 100ms for typical account (< 10,000 assets)
- Execution time: < 500ms for large account (< 100,000 assets)

### Asset Status Distribution Function

**Function**: `get_asset_status_distribution(p_account_slug text)`

**Optimization Techniques**:

1. **Pre-calculated Total**: Single query to get total assets
2. **GROUP BY Status**: Efficient aggregation by status
3. **Percentage Calculation**: Computed in database to reduce client processing
4. **ORDER BY Count**: Returns most common statuses first

**Query Plan Analysis**:
```sql
EXPLAIN ANALYZE
SELECT * FROM get_asset_status_distribution('your-account-slug');
```

**Expected Performance**:
- Execution time: < 50ms for typical account
- Execution time: < 200ms for large account

### Dashboard Trends Function

**Function**: `get_dashboard_trends(p_account_slug text, p_metric_type text, p_days int)`

**Optimization Techniques**:

1. **Generate Series**: Creates date range efficiently
2. **LEFT JOIN**: Ensures all dates are included even with no data
3. **Date Filtering**: Uses indexed created_at column
4. **Conditional Logic**: Separate queries for different metric types

**Query Plan Analysis**:
```sql
EXPLAIN ANALYZE
SELECT * FROM get_dashboard_trends('your-account-slug', 'assets', 30);
```

**Expected Performance**:
- Execution time: < 100ms for 30 days
- Execution time: < 500ms for 365 days

## Materialized View Optimization

### Platform Metrics View

**View**: `public.platform_metrics`

**Purpose**: Cache expensive platform-wide aggregations for admin dashboard

**Refresh Strategy**:
```sql
-- Manual refresh
SELECT refresh_platform_metrics();

-- Scheduled refresh (via cron job)
-- Every 5 minutes
```

**Benefits**:
- Reduces load on primary tables
- Consistent performance for admin dashboard
- Concurrent refresh doesn't block reads

**Monitoring**:
```sql
-- Check last refresh time
SELECT last_updated FROM platform_metrics;

-- Check view size
SELECT pg_size_pretty(pg_total_relation_size('platform_metrics'));
```

## RLS Policy Performance

### Dashboard Widgets Policies

```sql
-- Read policy
create policy "Users can view own widget configs"
  on public.dashboard_widgets for select
  to authenticated
  using (
    user_id = auth.uid() and
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );
```

**Optimization**:
- Uses indexed columns (`user_id`, `account_id`)
- Subquery is efficient due to `accounts_memberships` indexes
- Policy is simple and fast to evaluate

### Dashboard Alerts Policies

```sql
-- Read policy
create policy "Team members can view team alerts"
  on public.dashboard_alerts for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
    and is_dismissed = false
    and (expires_at is null or expires_at > now())
  );
```

**Optimization**:
- Uses indexed columns (`account_id`, `is_dismissed`, `expires_at`)
- Membership check is cached by Supabase
- Expiration check uses partial index

## Performance Monitoring

### Query Performance Tracking

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%dashboard%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Index Usage Analysis

```sql
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
  AND tablename IN ('dashboard_widgets', 'dashboard_alerts')
ORDER BY idx_scan DESC;
```

### Table Statistics

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('dashboard_widgets', 'dashboard_alerts')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Optimization Checklist

### Before Deployment

- [ ] Run EXPLAIN ANALYZE on all dashboard functions
- [ ] Verify all indexes are being used
- [ ] Check RLS policy performance
- [ ] Test with realistic data volumes
- [ ] Monitor query execution times
- [ ] Verify materialized view refresh works

### Regular Maintenance

- [ ] Weekly: Review slow query log
- [ ] Weekly: Check index usage statistics
- [ ] Monthly: Analyze table bloat
- [ ] Monthly: Update table statistics (ANALYZE)
- [ ] Quarterly: Review and optimize queries
- [ ] Quarterly: Consider new indexes based on usage patterns

## Common Performance Issues

### Issue: Slow Dashboard Load

**Symptoms**:
- Dashboard takes > 2 seconds to load
- High database CPU usage

**Diagnosis**:
```sql
-- Check for missing indexes
SELECT * FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
  AND seq_scan > idx_scan 
  AND n_live_tup > 1000;
```

**Solutions**:
1. Add missing indexes
2. Optimize RLS policies
3. Increase cache TTL
4. Use materialized views for expensive queries

### Issue: High Memory Usage

**Symptoms**:
- Database memory usage increasing
- Slow query performance

**Diagnosis**:
```sql
-- Check for large result sets
SELECT * FROM pg_stat_statements
WHERE rows > 10000
ORDER BY rows DESC;
```

**Solutions**:
1. Add pagination to large queries
2. Limit result set sizes
3. Use cursors for large data sets
4. Optimize JOIN operations

### Issue: Lock Contention

**Symptoms**:
- Queries waiting for locks
- Slow write operations

**Diagnosis**:
```sql
-- Check for locks
SELECT * FROM pg_locks
WHERE NOT granted;
```

**Solutions**:
1. Reduce transaction duration
2. Use optimistic locking
3. Batch updates
4. Consider queue-based updates

## Best Practices

### Query Design

1. **Use Prepared Statements**: Reduces parsing overhead
2. **Limit Result Sets**: Always use LIMIT for large queries
3. **Avoid SELECT ***: Only select needed columns
4. **Use Appropriate JOINs**: LEFT JOIN when data might be missing
5. **Filter Early**: Apply WHERE clauses before JOINs when possible

### Index Design

1. **Index Foreign Keys**: Always index columns used in JOINs
2. **Composite Indexes**: For queries filtering on multiple columns
3. **Partial Indexes**: For queries with constant WHERE conditions
4. **Index Maintenance**: Regularly REINDEX to prevent bloat

### Function Design

1. **Security Definer**: Use for functions that need elevated privileges
2. **Set Search Path**: Prevent schema injection attacks
3. **Error Handling**: Use RAISE EXCEPTION for clear error messages
4. **Return Types**: Use appropriate return types (JSONB, TABLE, etc.)

### Monitoring

1. **Enable Logging**: Log slow queries (> 100ms)
2. **Track Statistics**: Use pg_stat_statements
3. **Monitor Indexes**: Check index usage regularly
4. **Alert on Issues**: Set up alerts for slow queries

## Resources

- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [Index Types in PostgreSQL](https://www.postgresql.org/docs/current/indexes-types.html)
- [Query Optimization](https://www.postgresql.org/docs/current/performance-tips.html)
