# Bug Fix: License Function Permissions

## Issue Description

**Error**: `permission denied for function get_licenses_with_assignments`

**Location**: `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts:137`

**Root Cause**: The database function `get_licenses_with_assignments` was created with `SECURITY DEFINER` but lacked explicit EXECUTE permissions for authenticated users.

## Technical Details

### Problem
When a function is created with `SECURITY DEFINER` in PostgreSQL/Supabase:
1. The function runs with the privileges of the user who created it (typically the database owner)
2. However, users still need EXECUTE permission to call the function
3. The original migration created the function but didn't grant EXECUTE permissions

### Impact
- Users cannot view the licenses page
- The loader fails when trying to call the RPC function
- This affects all authenticated users trying to access `/home/[account]/licenses`

## Solution

### Migration Created
**File**: `apps/web/supabase/migrations/20251118000011_grant_license_function_permissions.sql`

This migration grants EXECUTE permissions on all license-related functions:
- `get_licenses_with_assignments(uuid)`
- `get_license_stats(uuid)`
- `check_license_expirations()`

### Why This Works
1. **SECURITY DEFINER**: Function runs with elevated privileges to access all necessary tables
2. **GRANT EXECUTE**: Allows authenticated users to call the function
3. **RLS Still Applies**: The function internally filters data by account_id, ensuring users only see their team's data

## Verification Steps

### 1. Apply the Migration

```bash
# Start Supabase locally
pnpm supabase:web:start

# Apply the new migration
pnpm --filter web supabase migrations up

# Or reset the database (clean rebuild)
pnpm supabase:web:reset
```

### 2. Verify Permissions in Database

```sql
-- Check function permissions
SELECT 
  routine_name,
  routine_type,
  security_type,
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name LIKE '%license%';

-- Should show:
-- get_licenses_with_assignments | FUNCTION | DEFINER | authenticated | EXECUTE
-- get_license_stats             | FUNCTION | DEFINER | authenticated | EXECUTE
-- check_license_expirations     | FUNCTION | DEFINER | authenticated | EXECUTE
```

### 3. Test the Licenses Page

1. Navigate to `/home/[account]/licenses`
2. The page should load without permission errors
3. Licenses should be displayed correctly
4. All CRUD operations should work

### 4. Check Server Logs

The error should no longer appear:
```
❌ Before: Failed to load licenses: permission denied for function get_licenses_with_assignments
✅ After: Licenses loaded successfully
```

## Related Files

### Modified
- `apps/web/supabase/migrations/20251118000011_grant_license_function_permissions.sql` (NEW)

### Affected
- `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts`
- `apps/web/app/home/[account]/licenses/page.tsx`

## Prevention

### For Future Functions
When creating SECURITY DEFINER functions, always include GRANT statements:

```sql
-- Create function
create or replace function public.my_function(p_param uuid)
returns table(...)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- function body
end;
$$;

-- IMPORTANT: Grant execute permissions
grant execute on function public.my_function(uuid) to authenticated;
```

### Migration Template
```sql
-- 1. Create function with SECURITY DEFINER
create or replace function public.function_name(...)
...
security definer
...

-- 2. Grant EXECUTE to authenticated users
grant execute on function public.function_name(...) to authenticated;

-- 3. Add descriptive comment
comment on function public.function_name(...) is 'Description. Granted to authenticated users.';
```

## Testing Checklist

- [x] Migration created
- [ ] Migration applied locally
- [ ] Permissions verified in database
- [ ] Licenses page loads without errors
- [ ] License list displays correctly
- [ ] License creation works
- [ ] License editing works
- [ ] License deletion works
- [ ] License assignments work
- [ ] No console errors
- [ ] TypeScript compilation passes

## Status

**Status**: Migration created, awaiting application and verification

**Next Steps**:
1. Apply the migration: `pnpm supabase:web:reset`
2. Test the licenses page
3. Verify all CRUD operations
4. Update this document with test results

## Notes

- This is a critical bug that blocks the entire licenses feature
- The fix is simple but essential for proper RLS and function security
- Similar issues may exist with other SECURITY DEFINER functions
- Consider auditing all database functions for proper GRANT statements


## Update - Fix Applied Successfully

### Applied Migrations
- `20251118000010_fix_license_functions.sql` - Updated function with license_key field
- `20251118000011_grant_license_function_permissions.sql` - Granted EXECUTE permissions

### Verification Steps Completed
1. ✅ Database reset completed successfully
2. ✅ All migrations applied without errors  
3. ✅ TypeScript types regenerated
4. ✅ Function permissions granted to authenticated users

### Next Steps
1. Start the development server: `pnpm dev`
2. Navigate to `/home/[account]/licenses` to verify the fix
3. Confirm licenses load without permission errors

The permission denied error should now be resolved. The `get_licenses_with_assignments` function and all other license-related functions now have proper EXECUTE permissions for authenticated users.
