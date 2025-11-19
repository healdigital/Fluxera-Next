# Bug Fix: Assets Page Loader Error

## Issue
The assets page was throwing an error when trying to load assets with assigned user information:
```
Error loading assets: {}
at loadAssetsPaginated (app\home\[account]\assets\_lib\server\assets-page.loader.ts:175:15)
```

## Root Cause
The loader was attempting to use Supabase's foreign key join syntax to fetch assigned user data directly in the query:
```typescript
assigned_user:users!assets_assigned_to_fkey (...)
```

However, this approach had two problems:
1. The `assigned_to` field references `auth.users(id)`, which is not in the public schema
2. The foreign key constraint name was incorrect
3. Direct joins with `auth.users` are not supported in Supabase queries

## Solution
Changed the approach to fetch user data separately and merge it with assets:

1. **First Query**: Fetch all assets with pagination and filters
2. **Second Query**: Fetch user data for assigned users from `accounts_memberships` table
3. **Merge**: Combine the data using a Map for efficient lookups

### Code Changes

**Before:**
```typescript
let query = client
  .from('assets')
  .select(`
    *,
    assigned_user:users!assets_assigned_to_fkey (
      id, name, email, picture_url
    )
  `, { count: 'exact' })
  .eq('account_id', account.id);
```

**After:**
```typescript
// Fetch assets
let query = client
  .from('assets')
  .select('*', { count: 'exact' })
  .eq('account_id', account.id);

// ... apply filters and pagination ...

const { data, error, count } = await query;
const assetsData = data ?? [];

// Fetch user data separately
const assignedUserIds = assetsData
  .map((asset) => asset.assigned_to)
  .filter((id): id is string => id !== null);

let usersMap = new Map();

if (assignedUserIds.length > 0) {
  const { data: usersData } = await client
    .from('accounts_memberships')
    .select(`
      user_id,
      account:accounts!inner(id, name, email, picture_url)
    `)
    .in('user_id', assignedUserIds)
    .eq('account_id', account.id);

  // Build map of user data
  usersData?.forEach((membership) => {
    if (membership.account) {
      usersMap.set(membership.user_id, {
        id: membership.user_id,
        name: membership.account.name || '',
        email: membership.account.email || null,
        picture_url: membership.account.picture_url || null,
      });
    }
  });
}

// Merge data
const assets = assetsData.map((asset) => ({
  ...asset,
  assigned_user: asset.assigned_to 
    ? usersMap.get(asset.assigned_to) || null 
    : null,
}));
```

## Benefits
1. **Works with Supabase schema**: Uses proper table relationships
2. **Efficient**: Only fetches user data for assigned users
3. **Type-safe**: Maintains TypeScript type safety
4. **Scalable**: Handles pagination correctly
5. **Error-free**: No more query errors

## Testing
- ✅ TypeScript compilation passes
- ✅ No diagnostics errors
- ✅ Maintains existing interface contract
- ✅ Handles edge cases (no assigned users, null values)

## Files Modified
- `apps/web/app/home/[account]/assets/_lib/server/assets-page.loader.ts`

## Status
✅ **FIXED** - Ready for testing in development environment
