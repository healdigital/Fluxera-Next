# License Expiration Check Script

## Overview

This script manually triggers the license expiration check process. It's useful for:
- Testing the expiration check functionality
- Running manual checks outside the scheduled time
- Debugging and monitoring
- Backup execution method if pg_cron fails

## Prerequisites

- Node.js and pnpm installed
- Supabase project with the license management schema deployed
- Environment variables configured

## Environment Variables

The script requires the following environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

These should be available in your `.env.local` file or environment.

## Usage

### Basic Execution

Run the script from the project root:

```bash
pnpm tsx apps/web/scripts/check-license-expirations.ts
```

### With Explicit Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-key \
pnpm tsx apps/web/scripts/check-license-expirations.ts
```

### Add to package.json Scripts

Add this to your `package.json`:

```json
{
  "scripts": {
    "check-licenses": "tsx apps/web/scripts/check-license-expirations.ts"
  }
}
```

Then run:

```bash
pnpm check-licenses
```

## What It Does

1. **Connects to Supabase** using the service role key (admin access)
2. **Calls the database function** `check_license_expirations_with_logging()`
3. **Logs execution details** including duration and alerts created
4. **Retrieves the latest log** to display results
5. **Exits with appropriate code** (0 for success, 1 for failure)

## Output Example

```
============================================================
License Expiration Check Script
============================================================

Starting license expiration check...
License expiration check completed successfully
Duration: 145ms
Alerts created: 3
Status: success

============================================================
Result Summary
============================================================
Success: true
Duration: 145ms
Alerts Created: 3
```

## Scheduling with Cron

### Linux/macOS Cron

Add to your crontab (`crontab -e`):

```bash
# Run daily at 9:00 AM
0 9 * * * cd /path/to/project && pnpm tsx apps/web/scripts/check-license-expirations.ts >> /var/log/license-check.log 2>&1
```

### Windows Task Scheduler

Create a scheduled task that runs:

```cmd
cmd /c "cd C:\path\to\project && pnpm tsx apps/web/scripts/check-license-expirations.ts"
```

### Docker/Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: license-expiration-check
spec:
  schedule: "0 9 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: check-licenses
            image: your-app-image
            command: ["pnpm", "tsx", "apps/web/scripts/check-license-expirations.ts"]
            env:
            - name: SUPABASE_URL
              valueFrom:
                secretKeyRef:
                  name: supabase-secrets
                  key: url
            - name: SUPABASE_SERVICE_ROLE_KEY
              valueFrom:
                secretKeyRef:
                  name: supabase-secrets
                  key: service-role-key
          restartPolicy: OnFailure
```

## Monitoring

### View Execution Logs

Query the database to see execution history:

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

### Check Statistics

```sql
SELECT * FROM get_license_expiration_check_stats();
```

### View Created Alerts

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

## Troubleshooting

### Error: Missing environment variables

Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set:

```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Error: Function not found

The database migration may not be applied. Run:

```bash
pnpm --filter web supabase migrations up
```

### Error: Permission denied

The service role key is required for this operation. Regular user keys won't work.

### No alerts created

This is normal if:
- No licenses are expiring within 30 days
- Alerts have already been created for expiring licenses
- All licenses have already expired

## Integration with pg_cron

This script complements the pg_cron scheduled job. The database has a scheduled job that runs automatically:

```sql
-- View scheduled jobs
SELECT jobid, jobname, schedule, command, active 
FROM cron.job 
WHERE jobname = 'check-license-expirations';
```

The script can be used as:
- A backup if pg_cron fails
- A manual trigger for testing
- An alternative for environments without pg_cron

## Exit Codes

- `0` - Success
- `1` - Failure (check error message in output)

## Security Considerations

- **Service Role Key**: This script uses the service role key which has admin access. Keep it secure.
- **Logging**: Execution logs are stored in the database for audit purposes.
- **RLS Bypass**: The function runs with `security definer` to bypass RLS for system operations.

## Related Files

- Migration: `apps/web/supabase/migrations/20251118000003_license_expiration_cron.sql`
- Service: `apps/web/app/home/[account]/licenses/_lib/server/license-expiration-check.service.ts`
- Notifications: `apps/web/app/home/[account]/licenses/_lib/server/license-notifications.service.ts`

## Next Steps

After running this script, you may want to:

1. **Send email notifications** - Run the notification processing script
2. **View alerts in UI** - Check the licenses page for renewal alerts
3. **Review logs** - Query the execution logs to verify success
4. **Monitor statistics** - Use the stats function to track performance
