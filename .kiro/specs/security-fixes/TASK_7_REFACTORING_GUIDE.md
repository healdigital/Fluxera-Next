# Task 7 Refactoring Guide - Correct Pattern

## ✅ Completed
- **Task 7.1**: Licenses refactored (6 actions) - DONE

## 📋 Remaining Tasks
- **Task 7.2**: Users (6 actions)
- **Task 7.3**: Assets (5 actions)  
- **Task 7.4**: Dashboard (3 actions)

---

## Correct Refactoring Pattern

### Step-by-Step Process

#### 1. Import Required Dependencies

```typescript
import { enhanceAction } from '@kit/next/actions';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from '@kit/shared/app-errors';
import { getLogger } from '@kit/shared/logger';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
```

#### 2. Structure of Refactored Action

```typescript
export const actionName = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'module.action' }, 'Action description...');

    // Step 1: Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      throw new NotFoundError('Account', data.accountSlug);
    }

    // Step 2: Wrap business logic with permission check
    return withAccountPermission(
      async () => {
        // Get current user if needed
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Business logic here
        // ...

        // Return result
        return {
          success: true,
          data: result,
        };
      },
      {
        accountId: account.id,
        permission: 'module.action', // e.g., 'licenses.create'
        client,
        resourceName: 'resource name', // e.g., 'license'
      },
    );
  },
  {
    schema: ActionSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);
```

---

## Permission Mapping

### Users Module
| Action | Permission | Resource Name |
|--------|-----------|---------------|
| `inviteUser` | `members.create` | `user invitation` |
| `updateUserProfile` | `members.update` | `user profile` |
| `updateUserRole` | `members.manage` | `user role` |
| `updateUserStatus` | `members.manage` | `user status` |
| `assignAssetsToUser` | `assets.manage` | `asset assignment` |
| `unassignAssetFromUser` | `assets.manage` | `asset assignment` |

### Assets Module
| Action | Permission | Resource Name |
|--------|-----------|---------------|
| `createAsset` | `assets.create` | `asset` |
| `updateAsset` | `assets.update` | `asset` |
| `deleteAsset` | `assets.delete` | `asset` |
| `assignAsset` | `assets.manage` | `asset assignment` |
| `unassignAsset` | `assets.manage` | `asset assignment` |

### Dashboard Module
| Action | Permission | Resource Name |
|--------|-----------|---------------|
| `dismissAlert` | `dashboard.manage` | `alert` |
| `updateWidgetLayout` | `dashboard.manage` | `widget layout` |
| `refreshDashboardMetrics` | `dashboard.view` | `dashboard metrics` |

---

## Error Handling Guidelines

### Replace Generic Errors with Typed Errors

**Before:**
```typescript
return {
  success: false,
  message: 'Asset not found',
};
```

**After:**
```typescript
throw new NotFoundError('Asset', assetId);
```

### Error Type Selection

- **NotFoundError**: Resource doesn't exist
  ```typescript
  throw new NotFoundError('Asset', assetId);
  ```

- **ConflictError**: Resource already exists or state conflict
  ```typescript
  throw new ConflictError('License key already exists', { licenseKey });
  ```

- **BusinessRuleError**: Business logic violation
  ```typescript
  throw new BusinessRuleError('Cannot assign already assigned asset', { assetId });
  ```

- **ForbiddenError**: Automatically thrown by `withAccountPermission`
- **UnauthorizedError**: Automatically thrown by `withAccountPermission`

---

## Special Cases

### Actions Without accountSlug in Data

Some actions (like `updateAsset`, `deleteAsset`) don't have `accountSlug` in their schema.

**Solution**: Fetch the account slug from the resource first:

```typescript
export const updateAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    // Get the asset to find its account slug
    const { data: existingAsset, error: fetchError } = await client
      .from('assets')
      .select('account_id, accounts!inner(slug)')
      .eq('id', data.id)
      .single();

    if (fetchError || !existingAsset) {
      throw new NotFoundError('Asset', data.id);
    }

    const accountSlug = (existingAsset.accounts as { slug: string }).slug;

    // Now get the full account
    const { data: account } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', accountSlug)
      .single();

    return withAccountPermission(
      async () => {
        // Business logic...
      },
      {
        accountId: account!.id,
        permission: 'assets.update',
        client,
        resourceName: 'asset',
      },
    );
  },
  {
    schema: UpdateAssetSchema,
  },
);
```

### Actions with Database Functions

Some actions call database functions (like `updateUserStatus`). Keep the function call but wrap it:

```typescript
return withAccountPermission(
  async () => {
    const { error: updateError } = await client.rpc('update_user_status', {
      p_user_id: data.user_id,
      p_account_id: account.id,
      p_status: data.status,
      p_reason: data.reason || undefined,
    });

    if (updateError) {
      // Check for specific error messages
      if (updateError.message.includes('cannot deactivate your own')) {
        throw new BusinessRuleError('You cannot deactivate your own account');
      }
      throw updateError;
    }

    return { success: true };
  },
  {
    accountId: account.id,
    permission: 'members.manage',
    client,
    resourceName: 'user status',
  },
);
```

---

## Verification Checklist

After refactoring each action:

- [ ] Removed manual auth checks (`client.auth.getUser()` at start)
- [ ] Removed manual membership checks
- [ ] Removed manual permission checks (`has_permission` RPC)
- [ ] Wrapped business logic with `withAccountPermission`
- [ ] Used typed error classes (NotFoundError, ConflictError, BusinessRuleError)
- [ ] Added JSDoc with `@permission` tag
- [ ] Kept revalidatePath calls
- [ ] Kept activity logging (if present)
- [ ] Run `pnpm typecheck` - must pass
- [ ] Run `pnpm lint:fix` - must pass

---

## Example: Complete Refactored Action

```typescript
/**
 * Creates a new asset
 *
 * @permission assets.create - Required to create assets
 * @throws {NotFoundError} If account doesn't exist
 */
export const createAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'assets.create' }, 'Creating new asset...');

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Create the asset
        const { data: asset, error: createError } = await client
          .from('assets')
          .insert({
            account_id: account.id,
            name: data.name,
            category: data.category,
            status: data.status || 'available',
            description: data.description || null,
            serial_number: data.serial_number || null,
            purchase_date: data.purchase_date || null,
            warranty_expiry_date: data.warranty_expiry_date || null,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        logger.info({ assetId: asset.id }, 'Asset successfully created');

        revalidatePath(`/home/${data.accountSlug}/assets`);

        return {
          success: true,
          data: asset,
        };
      },
      {
        accountId: account.id,
        permission: 'assets.create',
        client,
        resourceName: 'asset',
      },
    );
  },
  {
    schema: CreateAssetSchema,
  },
);
```

---

## Next Steps

1. **Task 7.2**: Refactor `users-server-actions.ts` (6 actions)
2. **Task 7.3**: Refactor `assets-server-actions.ts` (5 actions)
3. **Task 7.4**: Refactor `dashboard-server-actions.ts` (3 actions)

Each task should take approximately 1-2 hours following this guide.

---

**Document Version**: 1.0  
**Created**: November 20, 2025  
**Status**: Ready for implementation
