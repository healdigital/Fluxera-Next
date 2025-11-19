# Usage Guide - Error Classes & Permission Helpers

## Quick Reference for Developers

This guide shows how to use the new standardized error classes and permission helpers in your server actions and API routes.

---

## Error Classes

### Import
```typescript
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  BusinessRuleError,
  ConflictError,
} from '@kit/shared/app-errors';
```

### Usage Examples

#### 1. Not Found (404)
```typescript
// When a resource doesn't exist
throw new NotFoundError('License', licenseId);
// Error: "License with identifier 'lic-123' not found"

// Without identifier
throw new NotFoundError('User profile');
// Error: "User profile not found"
```

#### 2. Unauthorized (401)
```typescript
// When user is not authenticated
throw new UnauthorizedError('You must be logged in to perform this action');

// When user is not a member
throw new UnauthorizedError('You are not a member of this account', {
  accountId,
  userId,
});
```

#### 3. Forbidden (403)
```typescript
// When user lacks permissions
throw new ForbiddenError('delete', 'license');
// Error: "You do not have permission to delete license"

// Without resource
throw new ForbiddenError('access this resource');
// Error: "You do not have permission to access this resource"
```

#### 4. Validation Error (400)
```typescript
// From Zod validation
const result = schema.safeParse(data);
if (!result.success) {
  throw ValidationError.fromZodError(result.error);
}

// Manual validation
throw new ValidationError('Invalid input', {
  email: ['Email is required', 'Email must be valid'],
  name: ['Name must be at least 3 characters'],
});
```

#### 5. Business Rule Violation (422)
```typescript
// When business logic prevents an operation
throw new BusinessRuleError(
  'Cannot delete license with active assignments',
  { activeAssignments: 5 }
);

throw new BusinessRuleError(
  'License has expired and cannot be assigned'
);
```

#### 6. Conflict (409)
```typescript
// When resource already exists
throw new ConflictError('License key already exists', {
  key: licenseKey,
});

throw new ConflictError('User with this email already exists');
```

---

## Permission Helpers

### Import
```typescript
import {
  withAccountPermission,
  verifyPermission,
  verifyMembership,
} from '@kit/shared/permission-helpers';
```

### Usage Examples

#### 1. Wrap Server Actions with Permission Check
```typescript
'use server';

import { withAccountPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function createLicense(data: CreateLicenseData) {
  const client = getSupabaseServerClient();

  return withAccountPermission(
    async () => {
      // Your protected logic here
      const { data: license, error } = await client
        .from('software_licenses')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return license;
    },
    {
      accountId: data.account_id,
      permission: 'licenses.create',
      client,
      resourceName: 'license',
    }
  );
}
```

#### 2. Check Permission Before Rendering UI
```typescript
import { verifyPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function LicenseActions({ accountId }: Props) {
  const client = getSupabaseServerClient();

  const canCreate = await verifyPermission({
    accountId,
    permission: 'licenses.create',
    client,
  });

  const canDelete = await verifyPermission({
    accountId,
    permission: 'licenses.delete',
    client,
  });

  return (
    <div>
      {canCreate && <CreateButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

#### 3. Check Membership
```typescript
import { verifyMembership } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function AccountPage({ accountId }: Props) {
  const client = getSupabaseServerClient();

  const isMember = await verifyMembership({
    accountId,
    client,
  });

  if (!isMember) {
    redirect('/home');
  }

  // Render account page
}
```

---

## Complete Server Action Example

### Before (Old Pattern)
```typescript
'use server';

export async function deleteLicense(licenseId: string, accountId: string) {
  try {
    const client = getSupabaseServerClient();

    // Manual auth check
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Manual membership check
    const { data: membership } = await client
      .from('accounts_memberships')
      .select('id')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return { error: 'Not a member' };
    }

    // Manual permission check
    const { data: hasPermission } = await client.rpc('has_permission', {
      account_id: accountId,
      permission_name: 'licenses.delete',
      user_id: user.id,
    });

    if (!hasPermission) {
      return { error: 'Permission denied' };
    }

    // Check for active assignments
    const { data: assignments } = await client
      .from('license_assignments')
      .select('id')
      .eq('license_id', licenseId)
      .limit(1);

    if (assignments && assignments.length > 0) {
      return { error: 'Cannot delete license with active assignments' };
    }

    // Delete license
    const { error } = await client
      .from('software_licenses')
      .delete()
      .eq('id', licenseId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete license error:', error);
    return { error: 'Failed to delete license' };
  }
}
```

### After (New Pattern)
```typescript
'use server';

import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, BusinessRuleError } from '@kit/shared/app-errors';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * Deletes a software license.
 * 
 * @param licenseId - The ID of the license to delete
 * @param accountId - The account ID that owns the license
 * @throws {NotFoundError} If license doesn't exist
 * @throws {BusinessRuleError} If license has active assignments
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.delete permission
 */
export async function deleteLicense(licenseId: string, accountId: string) {
  const client = getSupabaseServerClient();

  return withAccountPermission(
    async () => {
      // Check for active assignments
      const { data: assignments } = await client
        .from('license_assignments')
        .select('id')
        .eq('license_id', licenseId)
        .limit(1);

      if (assignments && assignments.length > 0) {
        throw new BusinessRuleError(
          'Cannot delete license with active assignments',
          { assignmentCount: assignments.length }
        );
      }

      // Delete license
      const { error } = await client
        .from('software_licenses')
        .delete()
        .eq('id', licenseId);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('License', licenseId);
        }
        throw error;
      }

      return { success: true };
    },
    {
      accountId,
      permission: 'licenses.delete',
      client,
      resourceName: 'license',
    }
  );
}
```

### Benefits of New Pattern
- ✅ 50% less code
- ✅ No manual auth/membership/permission checks
- ✅ Typed errors with proper HTTP status codes
- ✅ Better error messages
- ✅ JSDoc documentation
- ✅ Easier to test
- ✅ Consistent across all actions

---

## Error Handling in Client Components

### Using with enhanceAction
```typescript
'use client';

import { useActionState } from 'react';
import { deleteLicense } from './actions';

export function DeleteLicenseButton({ licenseId, accountId }: Props) {
  const [state, formAction, pending] = useActionState(
    async () => {
      try {
        await deleteLicense(licenseId, accountId);
        return { success: true };
      } catch (error) {
        // Error handler will format the error appropriately
        return { error: formatErrorForToast(error) };
      }
    },
    { success: false }
  );

  return (
    <form action={formAction}>
      <button disabled={pending}>
        {pending ? 'Deleting...' : 'Delete'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

---

## Available Permissions

Based on the current schema, here are the available permissions:

### License Permissions
- `licenses.view` - View licenses
- `licenses.create` - Create new licenses
- `licenses.update` - Update existing licenses
- `licenses.delete` - Delete licenses
- `licenses.manage` - Manage license assignments

### Asset Permissions
- `assets.view` - View assets
- `assets.create` - Create new assets
- `assets.update` - Update existing assets
- `assets.delete` - Delete assets
- `assets.manage` - Manage asset assignments

### User Permissions
- `users.view` - View users
- `users.create` - Invite new users
- `users.update` - Update user profiles
- `users.delete` - Remove users

### Account Permissions
- `members.manage` - Manage team members
- `roles.manage` - Manage roles and permissions
- `settings.manage` - Manage account settings
- `billing.manage` - Manage billing and subscriptions
- `invites.manage` - Manage invitations

---

## Best Practices

### 1. Always Use Permission Helpers in Server Actions
```typescript
// ✅ Good
export async function createLicense(data: CreateLicenseData) {
  return withAccountPermission(
    async () => { /* logic */ },
    { accountId, permission: 'licenses.create', client }
  );
}

// ❌ Bad - Manual permission checks
export async function createLicense(data: CreateLicenseData) {
  const hasPermission = await checkPermission(...);
  if (!hasPermission) return { error: 'No permission' };
  // ...
}
```

### 2. Use Specific Error Types
```typescript
// ✅ Good
if (!license) {
  throw new NotFoundError('License', licenseId);
}

// ❌ Bad - Generic error
if (!license) {
  throw new Error('License not found');
}
```

### 3. Include Context in Errors
```typescript
// ✅ Good
throw new ForbiddenError('delete', 'license', {
  accountId,
  licenseId,
  userId,
});

// ❌ Bad - No context
throw new ForbiddenError('delete', 'license');
```

### 4. Document Server Actions
```typescript
// ✅ Good
/**
 * Creates a new software license.
 * 
 * @param data - License data
 * @throws {ValidationError} If data is invalid
 * @throws {ConflictError} If license key already exists
 * @throws {ForbiddenError} If user lacks licenses.create permission
 */
export async function createLicense(data: CreateLicenseData) {
  // ...
}

// ❌ Bad - No documentation
export async function createLicense(data: CreateLicenseData) {
  // ...
}
```

### 5. Use Type Guards for Error Handling
```typescript
import { isNotFoundError, isForbiddenError } from '@kit/shared/app-errors';

try {
  await deleteLicense(id, accountId);
} catch (error) {
  if (isNotFoundError(error)) {
    // Handle not found
  } else if (isForbiddenError(error)) {
    // Handle permission denied
  } else {
    // Handle other errors
  }
}
```

---

## Migration Checklist

When refactoring existing server actions:

- [ ] Import permission helpers and error classes
- [ ] Wrap main logic with `withAccountPermission()`
- [ ] Replace manual auth/membership checks
- [ ] Replace generic errors with typed errors
- [ ] Add JSDoc documentation
- [ ] Add error context (accountId, userId, etc.)
- [ ] Test with different permission scenarios
- [ ] Update client-side error handling if needed
- [ ] Run `pnpm typecheck` to verify
- [ ] Run `pnpm lint:fix` to format

---

## Support

For questions or issues:
1. Check this guide first
2. Review the JSDoc documentation in the source files
3. Check the Phase 2 summary document
4. Review existing refactored server actions as examples

---

**Last Updated**: November 20, 2025
**Version**: 1.0
**Status**: Phase 2 Complete (Tasks 5 & 6.1)
