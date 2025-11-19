# Server Action Refactoring Example

This document shows how to refactor existing server actions to use the new error classes and permission helpers.

## Before: Current Pattern (createLicense)

```typescript
export const createLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info({ name: 'licenses.create' }, 'Creating new license...');

      // Get account_id from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error({ error: accountError, name: 'licenses.create' }, 'Failed to find account');
        return { success: false, message: 'Account not found' };
      }

      // Get the current user for audit tracking
      const { data: { user: currentUser }, error: userError } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error({ error: userError, name: 'licenses.create' }, 'Failed to get current user');
        return { success: false, message: 'Authentication required' };
      }

      // Create the license
      const { data: license, error: createError } = await client
        .from('software_licenses')
        .insert({
          account_id: account.id,
          name: data.name,
          vendor: data.vendor,
          license_key: data.license_key,
          license_type: data.license_type,
          purchase_date: data.purchase_date,
          expiration_date: data.expiration_date,
          cost: data.cost || null,
          notes: data.notes || null,
          created_by: currentUser.id,
          updated_by: currentUser.id,
        })
        .select()
        .single();

      if (createError) {
        logger.error({ error: createError, name: 'licenses.create' }, 'Failed to create license');

        // Handle duplicate license key error
        if (createError.code === '23505') {
          return { success: false, message: 'A license with this key already exists for your account' };
        }

        return { success: false, message: 'Failed to create license' };
      }

      logger.info({ licenseId: license.id, name: 'licenses.create' }, 'License successfully created');

      revalidatePath(`/home/${data.accountSlug}/licenses`);

      return { success: true, data: license };
    } catch (error) {
      logger.error({ error, name: 'licenses.create' }, 'Unexpected error creating license');
      return { success: false, message: error instanceof Error ? error.message : 'Unexpected error' };
    }
  },
  { schema: CreateLicenseActionSchema }
);
```

**Issues with current pattern:**
- ❌ Manual auth check (duplicated across all actions)
- ❌ Manual account lookup (duplicated across all actions)
- ❌ No permission verification (relies only on RLS)
- ❌ Generic error messages
- ❌ Try-catch returns success: false instead of throwing
- ❌ ~80 lines of code

---

## After: Refactored Pattern

```typescript
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, ConflictError } from '@kit/shared/app-errors';

/**
 * Creates a new software license.
 * 
 * Requires `licenses.create` permission for the account.
 * 
 * @param data - License data including account slug
 * @returns The created license
 * @throws {NotFoundError} If account doesn't exist
 * @throws {ConflictError} If license key already exists
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.create permission
 */
export const createLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'licenses.create' }, 'Creating new license...');

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error({ error: accountError, name: 'licenses.create' }, 'Failed to find account');
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const { data: { user: currentUser } } = await client.auth.getUser();

        // Create the license
        const { data: license, error: createError } = await client
          .from('software_licenses')
          .insert({
            account_id: account.id,
            name: data.name,
            vendor: data.vendor,
            license_key: data.license_key,
            license_type: data.license_type,
            purchase_date: data.purchase_date,
            expiration_date: data.expiration_date,
            cost: data.cost || null,
            notes: data.notes || null,
            created_by: currentUser!.id,
            updated_by: currentUser!.id,
          })
          .select()
          .single();

        if (createError) {
          logger.error({ error: createError, name: 'licenses.create' }, 'Failed to create license');

          // Handle duplicate license key error
          if (createError.code === '23505') {
            throw new ConflictError('A license with this key already exists for your account', {
              licenseKey: data.license_key,
              accountId: account.id,
            });
          }

          throw createError;
        }

        logger.info({ licenseId: license.id, name: 'licenses.create' }, 'License successfully created');

        revalidatePath(`/home/${data.accountSlug}/licenses`);

        return { success: true, data: license };
      },
      {
        accountId: account.id,
        permission: 'licenses.create',
        client,
        resourceName: 'license',
      }
    );
  },
  { schema: CreateLicenseActionSchema }
);
```

**Benefits of refactored pattern:**
- ✅ Automatic auth/membership/permission checks
- ✅ Typed errors with proper HTTP status codes
- ✅ Better error messages with context
- ✅ JSDoc documentation
- ✅ ~50 lines of code (40% reduction)
- ✅ Throws errors instead of returning success: false
- ✅ Permission check is explicit and documented

---

## Key Changes Explained

### 1. Import New Utilities
```typescript
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, ConflictError } from '@kit/shared/app-errors';
```

### 2. Add JSDoc Documentation
```typescript
/**
 * Creates a new software license.
 * 
 * Requires `licenses.create` permission for the account.
 * 
 * @param data - License data including account slug
 * @returns The created license
 * @throws {NotFoundError} If account doesn't exist
 * @throws {ConflictError} If license key already exists
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.create permission
 */
```

### 3. Replace Account Not Found Error
```typescript
// Before
if (accountError || !account) {
  return { success: false, message: 'Account not found' };
}

// After
if (accountError || !account) {
  throw new NotFoundError('Account', data.accountSlug);
}
```

### 4. Wrap Logic with Permission Check
```typescript
return withAccountPermission(
  async () => {
    // Your protected logic here
  },
  {
    accountId: account.id,
    permission: 'licenses.create',  // Required permission
    client,
    resourceName: 'license',
  }
);
```

### 5. Remove Manual Auth/User Checks
```typescript
// Before
const { data: { user: currentUser }, error: userError } = await client.auth.getUser();
if (userError || !currentUser) {
  return { success: false, message: 'Authentication required' };
}

// After
const { data: { user: currentUser } } = await client.auth.getUser();
// No error check needed - withAccountPermission already verified auth
```

### 6. Use Typed Errors
```typescript
// Before
if (createError.code === '23505') {
  return { success: false, message: 'A license with this key already exists' };
}

// After
if (createError.code === '23505') {
  throw new ConflictError('A license with this key already exists for your account', {
    licenseKey: data.license_key,
    accountId: account.id,
  });
}
```

### 7. Remove Try-Catch (Let enhanceAction Handle It)
```typescript
// Before
try {
  // logic
} catch (error) {
  return { success: false, message: error.message };
}

// After
// No try-catch needed - enhanceAction handles errors
// Just throw typed errors when needed
```

---

## Refactoring Checklist

For each server action:

- [ ] Add imports for permission helpers and error classes
- [ ] Add comprehensive JSDoc documentation
- [ ] Replace account not found with `NotFoundError`
- [ ] Wrap main logic with `withAccountPermission()`
- [ ] Remove manual auth/membership checks
- [ ] Replace duplicate errors with `ConflictError`
- [ ] Replace not found errors with `NotFoundError`
- [ ] Replace business rule violations with `BusinessRuleError`
- [ ] Remove try-catch block
- [ ] Add error context (accountId, userId, etc.)
- [ ] Test with different permission scenarios
- [ ] Run `pnpm typecheck`
- [ ] Run `pnpm lint:fix`

---

## Permission Mapping

Use these permissions for license actions:

| Action | Permission | Description |
|--------|-----------|-------------|
| `createLicense` | `licenses.create` | Create new licenses |
| `updateLicense` | `licenses.update` | Update existing licenses |
| `deleteLicense` | `licenses.delete` | Delete licenses |
| `assignLicenseToUser` | `licenses.manage` | Assign licenses to users |
| `assignLicenseToAsset` | `licenses.manage` | Assign licenses to assets |
| `unassignLicense` | `licenses.manage` | Unassign licenses |
| `exportLicenses` | `licenses.view` | Export license data |

---

## Error Type Guidelines

| Scenario | Error Type | Example |
|----------|-----------|---------|
| Resource doesn't exist | `NotFoundError` | License, Account, User, Asset not found |
| Duplicate resource | `ConflictError` | License key already exists |
| Business rule violation | `BusinessRuleError` | Cannot delete license with active assignments |
| Invalid input | `ValidationError` | Invalid date format (handled by Zod) |
| Not authenticated | `UnauthorizedError` | Thrown by `withAccountPermission` |
| No permission | `ForbiddenError` | Thrown by `withAccountPermission` |

---

## Testing Refactored Actions

After refactoring, test these scenarios:

1. **Success Case**: User with permission can perform action
2. **No Permission**: User without permission gets 403 error
3. **Not Member**: Non-member gets 401 error
4. **Not Authenticated**: Unauthenticated user gets 401 error
5. **Resource Not Found**: Get 404 with descriptive message
6. **Duplicate**: Get 409 with conflict details
7. **Business Rule**: Get 422 with rule explanation

---

## Next Steps

1. Refactor `createLicense` (example above)
2. Refactor `updateLicense` (similar pattern)
3. Refactor `deleteLicense` (add BusinessRuleError for assignments)
4. Refactor `assignLicenseToUser` (use licenses.manage permission)
5. Refactor `assignLicenseToAsset` (use licenses.manage permission)
6. Refactor `unassignLicense` (use licenses.manage permission)
7. Refactor `exportLicenses` (use licenses.view permission)

Then repeat for:
- Users server actions
- Assets server actions
- Dashboard server actions

---

**Estimated Time**: 2-3 hours for all license actions
**Estimated Code Reduction**: 40-50% fewer lines
**Estimated Duplication Reduction**: 60-70% less duplicated code
