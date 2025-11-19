# License Database Functions Verification

## Quick Start

Run this script to verify all license database functions are properly installed:

```bash
tsx apps/web/scripts/verify-license-functions.ts
```

## What It Checks

The script verifies the existence and basic functionality of:

1. **get_license_stats** - Returns license statistics for an account
2. **get_licenses_with_assignments** - Returns licenses with assignment counts
3. **check_license_expirations** - Checks for expiring licenses and creates alerts

## Expected Output

### Success
```
🔍 Verifying license database functions...

1. Checking get_license_stats function...
✅ get_license_stats function exists

2. Checking get_licenses_with_assignments function...
✅ get_licenses_with_assignments function exists

3. Checking check_license_expirations function...
✅ check_license_expirations function exists

✅ All license functions verified successfully!
```

### Failure
If a function is missing, you'll see:
```
❌ get_license_stats function does not exist!
   Error: function public.get_license_stats(p_account_id uuid) does not exist
```

## Troubleshooting

### Function Not Found
If a function is missing:

1. **Check migrations are applied**:
   ```bash
   pnpm --filter web supabase migrations up
   ```

2. **Verify migration file exists**:
   - `apps/web/supabase/migrations/20251117000006_software_licenses.sql`

3. **Reset database** (if needed):
   ```bash
   pnpm supabase:web:reset
   ```

### Environment Variables
Ensure these are set in your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Related Files
- Verification Script: `apps/web/scripts/verify-license-functions.ts`
- Migration: `apps/web/supabase/migrations/20251117000006_software_licenses.sql`
- Loader: `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts`

## When to Run

Run this verification:
- After applying migrations
- When debugging license page errors
- Before deploying to production
- After database resets
