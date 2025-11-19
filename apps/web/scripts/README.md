# Background Scripts

This directory contains background scripts for automated tasks.

## License Expiration Check

The `check-license-expirations.ts` script checks for expiring software licenses and generates renewal alerts.

### Usage

```bash
# Run manually
pnpm tsx apps/web/scripts/check-license-expirations.ts

# Or add to package.json scripts
pnpm check-license-expirations
```

### Environment Variables

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for bypassing RLS

### Scheduling

This script should be run daily. Here are some options:

#### Option 1: Cron (Linux/Mac)

Add to your crontab:

```bash
# Run daily at 9:00 AM
0 9 * * * cd /path/to/project && pnpm tsx apps/web/scripts/check-license-expirations.ts >> /var/log/license-check.log 2>&1
```

#### Option 2: Windows Task Scheduler

1. Open Task Scheduler
2. Create a new task
3. Set trigger to daily at your preferred time
4. Set action to run: `cmd.exe /c "cd C:\path\to\project && pnpm tsx apps\web\scripts\check-license-expirations.ts"`

#### Option 3: Vercel Cron Jobs

If deploying to Vercel, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-license-expirations",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Then create an API route at `apps/web/app/api/cron/check-license-expirations/route.ts`.

#### Option 4: GitHub Actions

Create `.github/workflows/license-check.yml`:

```yaml
name: Check License Expirations

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  check-licenses:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm tsx apps/web/scripts/check-license-expirations.ts
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Logging

The script logs execution details including:
- Start time
- Number of alerts generated (30-day and 7-day)
- Any errors encountered

Logs are output to stdout/stderr and can be redirected to a file for monitoring.

### Monitoring

Monitor the script execution by:
1. Checking log files for errors
2. Verifying alerts are being created in the `license_renewal_alerts` table
3. Setting up alerts for script failures (e.g., via monitoring tools)
