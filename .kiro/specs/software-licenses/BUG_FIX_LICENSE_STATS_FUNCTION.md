# Bug Fix: Missing get_license_stats Function

## Issue
The application was throwing an error:
```
Failed to load license stats: permission denied for function get_license_stats
```

## Root Cause
The `get_license_stats` database function was referenced in multiple places but was never actually created in the database migrations. The migration `20251118000011_grant_license_function_permissions.sql` attempted to grant execute permissions on the function, but the function itself didn't exist.

## Solution
The function was already defined in migration `20251118000012_fix_license_functions_complete.sql`, which includes:

1. **get_licenses_with_assignments** - Returns licenses with assignment counts
2. **get_license_stats** - Returns aggregate statistics (total, expiring soon, expired, assignments)

Both functions are created with:
- `security definer` - Runs with the privileges of the function owner
- `set search_path = public` - Ensures consistent schema resolution
- `stable` - Indicates the function doesn't modify data
- Proper grants to `authenticated` role

## Function Definition
```sql
create or replace function public.get_license_stats(p_account_id uuid)
returns table(
  total_licenses bigint,
  expiring_soon bigint,
  expired bigint,
  total_assignments bigint
)
language plpgsql
security definer
set search_path = public
stable
as $
begin
  return query
  select
    count(distinct sl.id)::bigint as total_licenses,
    count(distinct case 
      when sl.expiration_date >= current_date 
        and sl.expiration_date <= current_date + interval '30 days'
      then sl.id 
    end)::bigint as expiring_soon,
    count(distinct case 
      when sl.expiration_date < current_date 
      then sl.id 
    end)::bigint as expired,
    count(la.id)::bigint as total_assignments
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id;
end;
$;
```

## Steps Taken
1. Identified that the function was missing from the database
2. Found the function definition in migration `20251118000012_fix_license_functions_complete.sql`
3. Stopped and restarted Supabase to clean up Docker container conflicts
4. Applied all migrations with `--include-all` flag
5. Regenerated TypeScript types with `pnpm supabase:web:typegen`

## Verification
After applying the migrations:
- The `get_license_stats` function exists in the database
- The function has proper RLS and security settings
- The function is granted to authenticated users
- TypeScript types are up to date

## Related Files
- `apps/web/supabase/migrations/20251118000012_fix_license_functions_complete.sql` - Contains the function definition
- `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts` - Uses the function
- `apps/web/supabase/migrations/20251118000013_add_license_stats_function.sql` - Backup migration (not needed)

## Prevention
To prevent similar issues in the future:
1. Always create functions before granting permissions on them
2. Test migrations locally before committing
3. Use `pnpm supabase:web:reset` to verify clean database setup
4. Run `pnpm typecheck` after database changes

## Status
✅ **RESOLVED** - The function now exists and is properly configured with RLS permissions.

## Post-Fix Verification
After applying the fix:
1. ✅ Migration `20251118000012_fix_license_functions_complete.sql` was applied successfully
2. ✅ TypeScript types were regenerated and include `get_license_stats` function
3. ✅ Function signature in types matches the implementation:
   ```typescript
   get_license_stats: {
     Args: { p_account_id: string }
     Returns: {
       expired: number
       expiring_soon: number
       total_assignments: number
       total_licenses: number
     }[]
   }
   ```
4. ✅ Function has proper security settings (`security definer`, `stable`)
5. ✅ Function is granted to `authenticated` role

## Note
There is an unrelated type error in `@kit/team-accounts` package regarding the `get_account_members` function return type. This is a separate issue and does not affect the license stats functionality.
