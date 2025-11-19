# License Expiration Check System

## Overview

The License Expiration Check System automatically checks for expiring software licenses and generates renewal alerts daily using PostgreSQL's pg_cron extension. This ensures that teams receive timely notifications about licenses that need renewal.

## Architecture

### Components

1. **Database Function**: `check_license_expirations()`
   - Scans all active licenses
   - Generates 30-day alerts for licenses expiring in 8-30 days
   - Generates 7-day alerts for licenses expiring in 0-7 days
   - Uses upsert pattern to prevent duplicate alerts

2. **Logging Wrapper**: `check_license_expirations_with_logging()`
   - Wraps the core function with error handling
   - Records execution metrics (duration, alerts created)
   - Logs both successful and failed executions

3. **Scheduled Job**: `check-license-expirations`
   - Runs daily at 9:00 AM UTC using pg_cron
   - Cron expression: `0 9 * * *`
   - Executes `check_license_expirations_with_logging()`

4. **Cleanup Job**: `cleanup-license-expiration-logs`
   - Runs weekly on Sunday at 3:00 AM UTC
   - Removes logs older than 90 days
   - Keeps the database clean

5. **Service Layer**: `license-expiration-check.service.ts`
   - Provides methods to manually trigger checks
   - Retrieves execution logs and statistics
   - Used for monitoring and debugging

## Database Schema

### license_expiration_check_logs Table

```sql
create table public.license_expiration_check_logs (
  id uuid primary key,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone not null,
  duration_ms numeric(10, 2) not null,
  alerts_created integer not null default 0,
  status varchar(20) not null check (status in ('success', 'error')),
  error_message text,
  created_at timestamp with time zone default now()
);
```

## Alert Logic

The system generates two types of alerts:

### 30-Day Alert
- Triggered when a license expires in 8-30 days
- Alert type: `30_day`
- Provides early warning for renewal planning

### 7-Day Alert
- Triggered when a license expires in 0-7 days
- Alert type: `7_day`
- Urgent notification for immediate action

### Duplicate Prevention
- Uses unique constraint on `(license_id, alert_type)`
- Prevents sending the same alert multiple times
- Alerts are only created once per license per type

## Usage

### Manual Trigger

You can manually trigger a license expiration check:

```typescript
import { triggerLicenseExpirationCheck } from './license-expiration-check.service';

const result = await triggerLicenseExpirationCheck();

if (result.success) {
  console.log('License expiration check completed successfully');
} else {
  console.error('Check failed:', result.error);
}
```

### View Execution Logs

```typescript
import { getLicenseExpirationCheckLogs } from './license-expiration-check.service';

const logs = await getLicenseExpirationCheckLogs(10); // Get last 10 logs

logs.forEach(log => {
  console.log(`Check at ${log.started_at}: ${log.status}`);
  console.log(`Duration: ${log.duration_ms}ms`);
  console.log(`Alerts created: ${log.alerts_created}`);
});
```

### Get Statistics

```typescript
import { getLicenseExpirationCheckStats } from './license-expiration-check.service';

const stats = await getLicenseExpirationCheckStats();

console.log(`Total checks: ${stats.total_checks}`);
console.log(`Success rate: ${(stats.successful_checks / stats.total_checks * 100).toFixed(2)}%`);
console.log(`Total alerts created: ${stats.total_alerts_created}`);
console.log(`Average duration: ${stats.average_duration_ms}ms`);
```

## Monitoring

### Check Job Status

Query the scheduled jobs:

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  nodename
FROM cron.job
WHERE jobname = 'check-license-expirations';
```

### View Recent Executions

```sql
SELECT 
  started_at,
  completed_at,
  duration_ms,
  alerts_created,
  status,
  error_message
FROM license_expiration_check_logs
ORDER BY started_at DESC
LIMIT 10;
```

### Check for Errors

```sql
SELECT 
  started_at,
  error_message,
  duration_ms
FROM license_expiration_check_logs
WHERE status = 'error'
ORDER BY started_at DESC;
```

### View Statistics

```sql
SELECT * FROM get_license_expiration_check_stats();
```

## Troubleshooting

### Job Not Running

If the scheduled job stops running:

1. Verify pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check if the job is active:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'check-license-expirations';
   ```

3. Check cron job run history:
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-license-expirations')
   ORDER BY start_time DESC
   LIMIT 10;
   ```

### Reschedule Job

If you need to reschedule the job:

```sql
-- Unschedule existing job
SELECT cron.unschedule('check-license-expirations');

-- Schedule with new time (e.g., 6:00 AM UTC)
SELECT cron.schedule(
  'check-license-expirations',
  '0 6 * * *',
  'select public.check_license_expirations_with_logging();'
);
```

### Manual Execution

To manually run the check:

```sql
SELECT public.check_license_expirations_with_logging();
```

### Check Alert Generation

Verify alerts are being created:

```sql
SELECT 
  lra.alert_type,
  sl.name,
  sl.vendor,
  sl.expiration_date,
  lra.sent_at
FROM license_renewal_alerts lra
JOIN software_licenses sl ON sl.id = lra.license_id
WHERE lra.sent_at >= current_date
ORDER BY lra.sent_at DESC;
```

## Configuration

### Change Schedule

The default schedule is daily at 9:00 AM UTC. To change:

1. Unschedule the existing job
2. Schedule with new cron expression
3. Common patterns:
   - Every 6 hours: `0 */6 * * *`
   - Twice daily (9 AM and 9 PM): `0 9,21 * * *`
   - Every weekday at 9 AM: `0 9 * * 1-5`

### Adjust Alert Thresholds

To change when alerts are generated, modify the `check_license_expirations()` function:

```sql
-- Example: Change 30-day alert to 45 days
if days_until_expiry <= 45 and days_until_expiry > 7 then
  insert into public.license_renewal_alerts (license_id, account_id, alert_type)
  values (license_record.id, license_record.account_id, '30_day')
  on conflict (license_id, alert_type) do nothing;
end if;
```

### Log Retention

The default retention is 90 days. To change:

```sql
-- Unschedule existing cleanup job
SELECT cron.unschedule('cleanup-license-expiration-logs');

-- Schedule with new retention (e.g., 30 days)
SELECT cron.schedule(
  'cleanup-license-expiration-logs',
  '0 3 * * 0',
  $$
    delete from public.license_expiration_check_logs
    where started_at < now() - interval '30 days';
  $$
);
```

## Performance Considerations

- The check function uses indexed columns (`expiration_date`)
- Upsert pattern prevents duplicate processing
- Logs are automatically cleaned up to prevent table bloat
- Function runs as `security definer` with minimal permissions
- Average execution time: < 100ms for typical workloads

## Security

- Function runs with `security definer` privilege
- Only creates alerts, doesn't modify license data
- Logs are accessible only to authenticated users
- No sensitive license information in logs
- Manual trigger requires admin client access

## Integration

This system integrates with:

1. **Email Notification System** (Task 16.2)
   - Alerts trigger email notifications
   - Emails sent to team administrators

2. **In-App Notifications** (Task 16.3)
   - Alerts displayed in UI
   - Badge counts updated

3. **License Management UI**
   - Expiration badges show alert status
   - Detail pages display alert history

## Migration

The system is deployed via migration:
- File: `20251118000003_license_expiration_cron.sql`
- Includes: tables, functions, scheduled jobs
- Safe to run multiple times (idempotent)

## Testing

### Test Alert Generation

1. Create a test license expiring in 25 days
2. Run manual check: `SELECT public.check_license_expirations_with_logging();`
3. Verify alert created: `SELECT * FROM license_renewal_alerts WHERE license_id = '<test_license_id>';`

### Test Error Handling

1. Temporarily break the function (e.g., invalid table name)
2. Run manual check
3. Verify error logged: `SELECT * FROM license_expiration_check_logs WHERE status = 'error';`

### Test Scheduled Execution

1. Wait for scheduled time (9:00 AM UTC)
2. Check logs: `SELECT * FROM license_expiration_check_logs ORDER BY started_at DESC LIMIT 1;`
3. Verify alerts created for expiring licenses

## Future Enhancements

- Add support for custom alert thresholds per license
- Implement alert escalation for critical licenses
- Add Slack/Teams integration for notifications
- Create dashboard widget for check status
- Add metrics export for monitoring systems
