# Platform Metrics Refresh Verification Guide

## Quick Verification

Run the SQL verification script:

```bash
# Using psql (if available)
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/verify_metrics_refresh.sql

# Or using Supabase CLI
supabase db execute --file supabase/verify_metrics_refresh.sql
```

## Manual Verification Steps

### 1. Check Cron Jobs

```sql
SELECT jobid, jobname, schedule, command, active 
FROM cron.job 
WHERE jobname LIKE '%metrics%';
```

**Expected Results:**
- `refresh-platform-metrics`: Schedule `*/5 * * * *`, Active: `true`
- `cleanup-metrics-logs`: Schedule `0 2 * * *`, Active: `true`

### 2. Check Functions

```sql
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%platform_metrics%';
```

**Expected Functions:**
- `refresh_platform_metrics`
- `refresh_platform_metrics_with_logging`
- `get_metrics_refresh_stats`
- `trigger_platform_metrics_refresh`

### 3. View Recent Logs

```sql
SELECT * FROM metrics_refresh_log 
ORDER BY started_at DESC 
LIMIT 10;
```

**Expected:**
- Logs should exist if cron has run
- Status should be 'success'
- Duration should be reasonable (< 1 second typically)

### 4. View Statistics

```sql
SELECT * FROM get_metrics_refresh_stats(24);
```

**Expected:**
- Success rate > 95%
- Average duration < 1 second
- No recent errors

### 5. Test Manual Refresh

```sql
SELECT public.refresh_platform_metrics_with_logging();
```

**Expected:**
- Function executes without error
- New log entry created
- Materialized view updated

### 6. Check Materialized View

```sql
SELECT * FROM platform_metrics;
```

**Expected:**
- Data is present
- `last_updated` is recent
- Counts are reasonable

## Troubleshooting

### No Logs Found

**Possible Causes:**
1. Cron job hasn't run yet (wait 5 minutes)
2. Cron job is not active
3. Function has errors

**Solutions:**
1. Check cron job status
2. Manually trigger refresh
3. Check database logs

### High Failure Rate

**Possible Causes:**
1. Database connectivity issues
2. Materialized view definition problems
3. Data integrity issues

**Solutions:**
1. Check database status
2. Review error messages in logs
3. Verify source tables exist

### Slow Performance

**Possible Causes:**
1. Large data volume
2. Missing indexes
3. Database load

**Solutions:**
1. Check data volume
2. Verify indexes exist
3. Monitor database performance

## Health Indicators

### Healthy System
- ✅ Success rate: 100%
- ✅ Average duration: < 1 second
- ✅ Last refresh: < 10 minutes ago
- ✅ No error messages

### Warning Signs
- ⚠️ Success rate: 90-95%
- ⚠️ Average duration: 1-5 seconds
- ⚠️ Last refresh: 10-15 minutes ago
- ⚠️ Occasional errors

### Critical Issues
- ❌ Success rate: < 90%
- ❌ Average duration: > 5 seconds
- ❌ Last refresh: > 15 minutes ago
- ❌ Frequent errors

## Monitoring Queries

### Success Rate (Last Hour)

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  ROUND((COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*)) * 100, 2) as success_rate
FROM metrics_refresh_log
WHERE started_at >= NOW() - INTERVAL '1 hour';
```

### Average Duration Trend

```sql
SELECT 
  DATE_TRUNC('hour', started_at) as hour,
  ROUND(AVG(duration_ms) / 1000, 2) as avg_duration_seconds,
  COUNT(*) as refresh_count
FROM metrics_refresh_log
WHERE started_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', started_at)
ORDER BY hour DESC;
```

### Recent Errors

```sql
SELECT 
  started_at,
  error_message,
  duration_ms
FROM metrics_refresh_log
WHERE status = 'error'
  AND started_at >= NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;
```

## Integration with Admin Dashboard

The metrics refresh system integrates with the admin dashboard through:

1. **Metrics Refresh Monitor Component**
   - Shows real-time refresh status
   - Displays success rate
   - Provides manual refresh button

2. **System Health Widget**
   - Monitors refresh performance
   - Alerts on failures
   - Shows trends

3. **Service Layer Functions**
   - `getMetricsRefreshStats()`: Fetch statistics
   - `getMetricsRefreshLogs()`: View logs
   - `triggerPlatformMetricsRefresh()`: Manual trigger

## Conclusion

The platform metrics refresh system is fully operational and provides:
- Automatic refresh every 5 minutes
- Comprehensive logging
- Performance monitoring
- Manual control for admins
- Health status tracking

For issues or questions, refer to the troubleshooting section or check the implementation documentation.
