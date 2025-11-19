# Platform Metrics Refresh System

## Overview

The Platform Metrics Refresh System automatically updates the `platform_metrics` materialized view every 5 minutes using PostgreSQL's pg_cron extension. This ensures that admin dashboard metrics are always up-to-date without impacting query performance.

## Architecture

### Database Components

1. **Materialized View**: `public.platform_metrics`
   - Stores aggregated platform-wide statistics
   - Includes total accounts, users, assets, licenses
   - Tracks 30-day growth metrics
   - Updated via concurrent refresh (non-blocking)

2. **Refresh Function**: `public.refresh_platform_metrics_with_logging()`
   - Wraps the materialized view refresh with error handling
   - Logs performance metrics to `metrics_refresh_log` table
   - Captures and logs any errors that occur during refresh

3. **Scheduled Job**: `refresh-platform-metrics`
   - Runs every 5 minutes using pg_cron
   - Cron expression: `*/5 * * * *`
   - Executes `refresh_platform_metrics_with_logging()`

4. **Log Table**: `public.metrics_refresh_log`
   - Records each refresh operation
   - Tracks success/failure status
   - Stores duration in milliseconds
   - Captures error messages for failed refreshes
   - Automatically cleaned up after 30 days

### Application Components

1. **Service Layer**: `metrics-refresh.service.ts`
   - `getMetricsRefreshStats()` - Retrieves refresh statistics
   - `getMetricsRefreshLogs()` - Fetches recent refresh logs
   - `triggerPlatformMetricsRefresh()` - Manually triggers a refresh
   - `checkMetricsRefreshHealth()` - Evaluates system health

2. **Server Actions**: `admin-dashboard-actions.ts`
   - `triggerMetricsRefreshAction` - Manual refresh trigger
   - `getMetricsRefreshStatsAction` - Fetch statistics

3. **UI Component**: `metrics-refresh-monitor.tsx`
   - Displays refresh statistics and health status
   - Provides manual refresh button
   - Shows success rate, duration, and error information
   - Auto-refreshes statistics

## Monitoring

### Health Checks

The system performs automatic health checks based on:

- **Success Rate**: 
  - Critical: < 80%
  - Warning: < 95%
  - Healthy: ≥ 95%

- **Average Duration**:
  - Warning: > 5 seconds
  - Healthy: ≤ 5 seconds

- **Last Refresh Time**:
  - Warning: > 10 minutes ago
  - Healthy: ≤ 10 minutes ago

### Metrics Tracked

- Total refresh operations
- Successful refreshes
- Failed refreshes
- Success rate percentage
- Average duration (ms)
- Maximum duration (ms)
- Minimum duration (ms)
- Last refresh timestamp
- Last error message

## Usage

### Viewing Refresh Status

Navigate to the Admin Dashboard to view the Metrics Refresh Monitor widget, which displays:
- Current health status
- Refresh statistics
- Performance metrics
- Recent errors (if any)

### Manual Refresh

Super administrators can manually trigger a refresh:

1. **Via UI**: Click "Trigger Refresh" button in the Metrics Refresh Monitor
2. **Via Database**: Execute `SELECT public.trigger_platform_metrics_refresh();`

### Querying Logs

```sql
-- Get recent refresh logs
SELECT * FROM public.metrics_refresh_log
ORDER BY created_at DESC
LIMIT 50;

-- Get refresh statistics for last 24 hours
SELECT * FROM public.get_metrics_refresh_stats(24);

-- Check for recent errors
SELECT * FROM public.metrics_refresh_log
WHERE status = 'error'
  AND created_at >= now() - interval '24 hours'
ORDER BY created_at DESC;
```

## Performance Considerations

### Concurrent Refresh

The system uses `REFRESH MATERIALIZED VIEW CONCURRENTLY` which:
- Does not block reads from the materialized view
- Requires a unique index (already created)
- Takes slightly longer than non-concurrent refresh
- Ensures zero downtime during refresh

### Refresh Duration

Typical refresh times:
- Small datasets (< 1000 accounts): 100-500ms
- Medium datasets (1000-10000 accounts): 500ms-2s
- Large datasets (> 10000 accounts): 2-5s

If refresh duration exceeds 5 seconds consistently, consider:
- Adding additional indexes
- Optimizing the materialized view query
- Increasing refresh interval

## Troubleshooting

### Refresh Failures

If refreshes are failing:

1. Check the error logs:
   ```sql
   SELECT error_message, created_at
   FROM public.metrics_refresh_log
   WHERE status = 'error'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. Verify pg_cron is running:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'refresh-platform-metrics';
   ```

3. Check for blocking queries:
   ```sql
   SELECT * FROM pg_stat_activity
   WHERE query LIKE '%platform_metrics%';
   ```

### High Refresh Duration

If refresh duration is consistently high:

1. Check table sizes:
   ```sql
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE tablename IN ('accounts', 'accounts_memberships', 'assets', 'software_licenses')
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

2. Analyze query performance:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM public.platform_metrics;
   ```

3. Consider adding indexes on frequently joined columns

### Scheduled Job Not Running

If the scheduled job stops running:

1. Verify pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check cron job status:
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-platform-metrics')
   ORDER BY start_time DESC
   LIMIT 10;
   ```

3. Restart the job if needed:
   ```sql
   SELECT cron.unschedule('refresh-platform-metrics');
   SELECT cron.schedule(
     'refresh-platform-metrics',
     '*/5 * * * *',
     $$ SELECT public.refresh_platform_metrics_with_logging(); $$
   );
   ```

## Maintenance

### Log Cleanup

Old logs are automatically cleaned up daily at 2 AM by the `cleanup-metrics-logs` scheduled job. This keeps the last 30 days of logs.

To manually clean up logs:
```sql
SELECT public.cleanup_old_metrics_logs();
```

### Adjusting Refresh Interval

To change the refresh interval, update the cron schedule:

```sql
-- Unschedule existing job
SELECT cron.unschedule('refresh-platform-metrics');

-- Schedule with new interval (e.g., every 10 minutes)
SELECT cron.schedule(
  'refresh-platform-metrics',
  '*/10 * * * *',
  $$ SELECT public.refresh_platform_metrics_with_logging(); $$
);
```

## Security

- Only super administrators can view refresh logs (RLS policy)
- Only super administrators can manually trigger refreshes
- The refresh function runs with `SECURITY DEFINER` to ensure proper permissions
- All operations are logged for audit purposes

## Migration

The scheduled job is created in migration `20251118000002_platform_metrics_cron.sql`. To apply:

```bash
pnpm --filter web supabase migrations up
```

To rollback, you would need to:
1. Unschedule the cron jobs
2. Drop the functions and table
3. Remove the migration file

## Future Enhancements

Potential improvements:
- Add Slack/email notifications for critical failures
- Implement adaptive refresh intervals based on platform activity
- Add more granular metrics (per-feature refresh times)
- Create dashboard for historical refresh performance trends
- Add automatic recovery mechanisms for failed refreshes
