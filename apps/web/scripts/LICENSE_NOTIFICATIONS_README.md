# License Notification System

## Overview

The License Notification System sends email alerts to team administrators when software licenses are approaching their expiration dates. It consists of two main components:

1. **Alert Generation** - Checks for expiring licenses and creates alert records
2. **Notification Processing** - Sends email notifications for created alerts

## Architecture

### Two-Step Process

```
Step 1: Alert Generation
├── check-license-expirations.ts
├── Scans all licenses
├── Creates alert records (30_day, 7_day)
└── Logs execution

Step 2: Notification Processing
├── process-license-notifications.ts
├── Fetches today's alerts
├── Sends emails to administrators
└── Reports results
```

### Combined Workflow

The `run-license-alerts.ts` script runs both steps in sequence:

```bash
pnpm tsx apps/web/scripts/run-license-alerts.ts
```

## Scripts

### 1. check-license-expirations.ts

Checks for expiring licenses and creates alert records.

**Usage:**
```bash
pnpm tsx apps/web/scripts/check-license-expirations.ts
```

**What it does:**
- Connects to Supabase with service role key
- Calls `check_license_expirations_with_logging()`
- Creates 30-day alerts for licenses expiring in 8-30 days
- Creates 7-day alerts for licenses expiring in 0-7 days
- Logs execution metrics

**Output:**
```
Starting license expiration check...
License expiration check completed successfully
Duration: 145ms
Alerts created: 3
Status: success
```

### 2. process-license-notifications.ts

Processes alerts and sends email notifications.

**Usage:**
```bash
pnpm tsx apps/web/scripts/process-license-notifications.ts
```

**What it does:**
- Fetches all alerts created today
- For each alert:
  - Gets license and account details
  - Finds team administrators
  - Renders email template
  - Sends email to each administrator
- Reports success/failure statistics

**Output:**
```
Fetching license renewal alerts created today...
Found 3 alerts to process
Processing alert for license: Adobe Creative Cloud
✓ Email sent to admin@company.com for license Adobe Creative Cloud
✓ Email sent to owner@company.com for license Adobe Creative Cloud
...
Emails Sent: 6
Emails Failed: 0
```

### 3. run-license-alerts.ts

Combined workflow that runs both scripts in sequence.

**Usage:**
```bash
pnpm tsx apps/web/scripts/run-license-alerts.ts
```

**What it does:**
- Runs expiration check
- Runs notification processing
- Reports combined results
- Exits with appropriate status code

**Output:**
```
============================================================
License Alerts Workflow
============================================================

Running: Step 1: Check License Expirations
...
✓ License expiration check completed successfully

Running: Step 2: Process License Notifications
...
✓ Notification processing completed successfully

Workflow Summary
Total Duration: 2345ms
Step 1 (Expiration Check): ✓ Success
Step 2 (Notifications): ✓ Success
```

## Environment Variables

All scripts require these environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration
EMAIL_SENDER=noreply@yourcompany.com

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://yourapp.com
NEXT_PUBLIC_PRODUCT_NAME=Your Product Name
```

## Email Template

### Alert Types

**30-Day Alert (Warning)**
- Subject: "License Renewal Reminder: [License Name] expires in X days"
- Sent when license expires in 8-30 days
- Yellow/warning styling
- Provides early notice for renewal planning

**7-Day Alert (Urgent)**
- Subject: "⚠️ Urgent: License [License Name] expires in X days"
- Sent when license expires in 0-7 days
- Red/urgent styling
- Requires immediate action

### Email Content

Each email includes:
- License name and vendor
- Expiration date
- Days remaining
- Direct link to license detail page
- Renewal reminder and tips
- Contact vendor instructions

### Recipients

Emails are sent to all team administrators (users with 'owner' role) for the account that owns the license.

## Scheduling

### Option 1: pg_cron (Recommended)

The database has built-in scheduled jobs:

```sql
-- View scheduled jobs
SELECT jobid, jobname, schedule, command, active 
FROM cron.job 
WHERE jobname = 'check-license-expirations';
```

**Advantages:**
- Runs automatically in database
- No external infrastructure needed
- Reliable and consistent
- Logs execution in database

**Note:** pg_cron only runs the expiration check. You need to schedule notification processing separately.

### Option 2: System Cron

Add to crontab (`crontab -e`):

```bash
# Run complete workflow daily at 9:00 AM
0 9 * * * cd /path/to/project && pnpm tsx apps/web/scripts/run-license-alerts.ts >> /var/log/license-alerts.log 2>&1
```

### Option 3: CI/CD Pipeline

**GitHub Actions:**

```yaml
name: License Alerts

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run license alerts
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          EMAIL_SENDER: ${{ secrets.EMAIL_SENDER }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
          NEXT_PUBLIC_PRODUCT_NAME: ${{ secrets.NEXT_PUBLIC_PRODUCT_NAME }}
        run: pnpm tsx apps/web/scripts/run-license-alerts.ts
```

### Option 4: Docker/Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: license-alerts
spec:
  schedule: "0 9 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: license-alerts
            image: your-app-image
            command: ["pnpm", "tsx", "apps/web/scripts/run-license-alerts.ts"]
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
            - name: EMAIL_SENDER
              value: "noreply@yourcompany.com"
            - name: NEXT_PUBLIC_SITE_URL
              value: "https://yourapp.com"
            - name: NEXT_PUBLIC_PRODUCT_NAME
              value: "Your Product"
          restartPolicy: OnFailure
```

## Monitoring

### View Execution Logs

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

### View Sent Alerts

```sql
SELECT 
  lra.alert_type,
  sl.name as license_name,
  sl.vendor,
  sl.expiration_date,
  lra.sent_at,
  a.name as account_name
FROM license_renewal_alerts lra
JOIN software_licenses sl ON sl.id = lra.license_id
JOIN accounts a ON a.id = lra.account_id
WHERE lra.sent_at >= current_date
ORDER BY lra.sent_at DESC;
```

### Check Email Delivery

Monitor your email service provider's dashboard for:
- Delivery rates
- Bounce rates
- Open rates
- Click rates

### Alert Statistics

```sql
SELECT 
  alert_type,
  count(*) as total_alerts,
  count(distinct account_id) as affected_accounts,
  count(distinct license_id) as affected_licenses
FROM license_renewal_alerts
WHERE sent_at >= current_date - interval '30 days'
GROUP BY alert_type;
```

## Troubleshooting

### No Emails Sent

**Check 1: Are alerts being created?**
```sql
SELECT * FROM license_renewal_alerts 
WHERE sent_at >= current_date 
ORDER BY sent_at DESC;
```

**Check 2: Are there expiring licenses?**
```sql
SELECT name, vendor, expiration_date 
FROM software_licenses 
WHERE expiration_date BETWEEN current_date AND current_date + interval '30 days';
```

**Check 3: Email configuration**
```bash
echo $EMAIL_SENDER
echo $NEXT_PUBLIC_SITE_URL
```

### Emails Not Delivered

**Check 1: Email service logs**
- Check your email provider's dashboard
- Look for bounce or rejection messages

**Check 2: Spam filters**
- Verify SPF, DKIM, DMARC records
- Check if emails are in spam folder

**Check 3: Administrator emails**
```sql
SELECT 
  a.name as account_name,
  u.email as admin_email
FROM accounts_memberships am
JOIN accounts a ON a.id = am.account_id
JOIN auth.users u ON u.id = am.user_id
WHERE am.role = 'owner';
```

### Script Errors

**Error: Missing environment variables**
- Ensure all required env vars are set
- Check `.env.local` file

**Error: Function not found**
- Run migrations: `pnpm --filter web supabase migrations up`

**Error: Permission denied**
- Verify service role key is correct
- Check RLS policies

### Duplicate Emails

The system prevents duplicate alerts using unique constraints:
```sql
constraint unique_alert_per_license unique(license_id, alert_type)
```

If you're getting duplicates:
1. Check if alerts are being manually created
2. Verify the constraint exists in database
3. Check for multiple cron jobs running

## Testing

### Test Alert Generation

1. Create a test license expiring in 25 days:
```sql
INSERT INTO software_licenses (
  account_id, name, vendor, license_key, license_type,
  purchase_date, expiration_date
) VALUES (
  '<your_account_id>',
  'Test License',
  'Test Vendor',
  'TEST-KEY-123',
  'trial',
  current_date - interval '5 days',
  current_date + interval '25 days'
);
```

2. Run expiration check:
```bash
pnpm tsx apps/web/scripts/check-license-expirations.ts
```

3. Verify alert created:
```sql
SELECT * FROM license_renewal_alerts 
WHERE license_id = '<test_license_id>';
```

### Test Email Sending

1. Ensure you have a test license with an alert

2. Run notification processing:
```bash
pnpm tsx apps/web/scripts/process-license-notifications.ts
```

3. Check your email inbox

4. Verify email content and links

### Test Complete Workflow

```bash
pnpm tsx apps/web/scripts/run-license-alerts.ts
```

## Performance

### Execution Times

- **Alert Generation**: < 100ms for typical workloads
- **Notification Processing**: ~500ms per alert (depends on email service)
- **Complete Workflow**: 1-5 seconds for typical workloads

### Optimization Tips

1. **Batch Email Sending**: The script already sends emails in parallel
2. **Database Indexes**: Ensure indexes exist on `expiration_date` and `sent_at`
3. **Email Service**: Use a reliable email service with good delivery rates
4. **Monitoring**: Set up alerts for failed executions

## Security

### Service Role Key

- Required for admin access to database
- Keep secure and never commit to version control
- Rotate regularly
- Use environment variables or secrets management

### Email Security

- Use authenticated SMTP or email service API
- Configure SPF, DKIM, DMARC records
- Use TLS for email transmission
- Don't include sensitive license keys in emails

### Data Privacy

- Emails only sent to team administrators
- License details only visible to team members
- Audit trail maintained in database
- Comply with data protection regulations

## Related Files

- **Scripts:**
  - `apps/web/scripts/check-license-expirations.ts`
  - `apps/web/scripts/process-license-notifications.ts`
  - `apps/web/scripts/run-license-alerts.ts`

- **Services:**
  - `apps/web/app/home/[account]/licenses/_lib/server/license-expiration-check.service.ts`
  - `apps/web/app/home/[account]/licenses/_lib/server/license-notifications.service.ts`

- **Email Template:**
  - `packages/email-templates/src/emails/license-expiration.email.tsx`
  - `packages/email-templates/src/locales/en/license-expiration-email.json`

- **Migration:**
  - `apps/web/supabase/migrations/20251118000003_license_expiration_cron.sql`

## Next Steps

1. **Deploy Migration**: Apply the database migration
2. **Configure Environment**: Set all required environment variables
3. **Test Workflow**: Run the combined script manually
4. **Schedule Job**: Set up automated scheduling
5. **Monitor**: Check logs and email delivery
6. **Customize**: Adjust alert thresholds and email templates as needed
