# Task 20: Quick Start Guide

## Setup (5 minutes)

### 1. Apply Database Migration
```bash
pnpm --filter web supabase migrations up
```

### 2. Generate TypeScript Types
```bash
pnpm supabase:web:typegen
```

### 3. Verify Installation
```sql
-- Check scheduled jobs
SELECT jobname, schedule FROM cron.job 
WHERE jobname IN ('refresh-platform-metrics', 'cleanup-metrics-logs');

-- Test manual refresh
SELECT public.trigger_platform_metrics_refresh();

-- View logs
SELECT * FROM public.metrics_refresh_log ORDER BY created_at DESC LIMIT 5;
```

## Usage

### View Monitoring Dashboard
1. Navigate to `/admin/dashboard` as super admin
2. Scroll to "Metrics Refresh Monitor" section
3. View health status and statistics

### Manual Refresh
1. Click "Trigger Refresh" button
2. Wait for success notification
3. Statistics automatically update

### Check Statistics
1. Click "Refresh Stats" button
2. View updated metrics
3. Check health status

## Monitoring

### Key Metrics
- **Success Rate**: Should be ≥ 95%
- **Average Duration**: Should be < 5 seconds
- **Last Refresh**: Should be < 10 minutes ago

### Health Status
- 🟢 **Healthy**: All metrics normal
- 🟡 **Warning**: Performance degraded
- 🔴 **Critical**: System issues detected

## Troubleshooting

### Job Not Running
```sql
-- Check job status
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-platform-metrics')
ORDER BY start_time DESC LIMIT 10;
```

### High Duration
```sql
-- Check recent durations
SELECT duration_ms, started_at 
FROM public.metrics_refresh_log 
WHERE created_at >= now() - interval '1 hour'
ORDER BY duration_ms DESC;
```

### Errors
```sql
-- View recent errors
SELECT error_message, created_at 
FROM public.metrics_refresh_log 
WHERE status = 'error'
ORDER BY created_at DESC LIMIT 10;
```

## Documentation

- **Full Documentation**: `METRICS_REFRESH_README.md`
- **Implementation Details**: `TASK_20_SUMMARY.md`
- **Testing Checklist**: `TASK_20_VERIFICATION.md`
- **UI Reference**: `TASK_20_VISUAL_REFERENCE.md`

## Support

For issues or questions, refer to the troubleshooting section in `METRICS_REFRESH_README.md`.
