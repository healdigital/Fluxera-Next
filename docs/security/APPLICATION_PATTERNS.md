# Application Security Patterns

**Version:** 1.0  
**Last Updated:** November 20, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Server Actions](#server-actions)
3. [Error Handling](#error-handling)
4. [Permission Checks](#permission-checks)
5. [Data Validation](#data-validation)
6. [Code Examples](#code-examples)
7. [Common Patterns](#common-patterns)
8. [Anti-Patterns](#anti-patterns)

---

## Overview

This document provides practical patterns and examples for implementing secure server actions in Fluxera. All patterns follow the security architecture defined in [ARCHITECTURE.md](./ARCHITECTURE.md).

### Key Principles

1. **Use `withAccountPermission()`** for all account-scoped operations
2. **Use typed errors** for consistent error handling
3. **Validate inputs** with Zod schemas
4. **Document thoroughly** with JSDoc
5. **Test security** with E2E tests

---

## Server Actions

### Basic Pattern

All server actions follow this structure:

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, ConflictError } from '@kit/shared/app-errors';

// 1. Define Zod schema
const CreateResourceSchema = z.object({
  accountSlug: z.string().min(1),
  name: z.string().min(1),
  // ... other fields
});

/**
 * Creates a new resource.
 *
 * @param data - Resource creation data
 * @returns Created resource
 * @throws {ForbiddenError} If user lacks 'resources.create' permission
 * @throws {ConflictError} If resource name already exists
 *
 * @example
 * ```typescript
 * const resource = await createResource({
 *   accountSlug: 'my-team',
 *   name: 'New Resource'
 * });
 * ```
 */
export const createResource = enhanceAction(
  async (data) => {
    // 2. Use withAccountPermission wrapper
    return withAccountPermission(
      data.accountSlug,
      'resources.create',
      async (client, accountId) => {
        // 3. Check for conflicts
        const { data: existing } = await client
          .from('resources')
          .select('id')
          .eq('account_id', accountId)
          .eq('name', data.name)
          .single();

        if (existing) {
          throw new ConflictError({
            message: 'Resource with this name already exists',
            details: { name: data.name }
          });
        }

        // 4. Perform operation
        const { data: resource, error } = await client
          .from('resources')
          .insert({
            account_id: accountId,
            name: data.name,
            // ... other fields
          })
          .select()
          .single();

        if (error) throw error;

        return resource;
      }
    );
  },
  {
    schema: CreateResourceSchema
  }
);
```

### Pattern Breakdown

#### 1. Schema Definition

```typescript
const CreateResourceSchema = z.object({
  accountSlug: z.string().min(1),
  // Always include accountSlug for account-scoped operations
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  // Use appropriate Zod validators
});
```

**Best practices:**
- Always include `accountSlug` for account-scoped operations
- Use specific validators (min, max, email, url, etc.)
- Make optional fields explicit with `.optional()`
- Add custom error messages with `.refine()`

#### 2. Permission Wrapper

```typescript
return withAccountPermission(
  data.accountSlug,        // Account identifier
  'resources.create',      // Required permission
  async (client, accountId) => {
    // Your logic here
    // client: Authenticated Supabase client
    // accountId: Resolved account UUID
  }
);
```

**What it does:**
1. Verifies user is authenticated
2. Resolves account slug to UUID
3. Checks user membership in account
4. Verifies user has required permission
5. Provides authenticated client and account ID

**Throws:**
- `UnauthorizedError` if not authenticated or not a member
- `ForbiddenError` if lacks permission

#### 3. Business Logic

```typescript
// Check for conflicts
const { data: existing } = await client
  .from('resources')
  .select('id')
  .eq('account_id', accountId)
  .eq('name', data.name)
  .single();

if (existing) {
  throw new ConflictError({
    message: 'Resource with this name already exists',
    details: { name: data.name }
  });
}
```

**Best practices:**
- Check for conflicts before creating
- Use typed errors with context
- Validate business rules
- Handle edge cases

#### 4. Database Operation

```typescript
const { data: resource, error } = await client
  .from('resources')
  .insert({
    account_id: accountId,  // Always use resolved accountId
    ...data
  })
  .select()
  .single();

if (error) throw error;
return resource;
```

**Best practices:**
- Always use `accountId` from wrapper
- Use `.select()` to return created data
- Use `.single()` for single record operations
- Throw errors for database failures

---

## Error Handling

### Error Types

#### NotFoundError (404)

Use when a resource doesn't exist:

```typescript
const { data: license } = await client
  .from('software_licenses')
  .select('*')
  .eq('id', licenseId)
  .eq('account_id', accountId)
  .single();

if (!license) {
  throw new NotFoundError({
    message: 'License not found',
    details: { licenseId }
  });
}
```

#### UnauthorizedError (401)

Thrown automatically by `withAccountPermission()` when:
- User is not authenticated
- User is not a member of the account

```typescript
// You don't need to throw this manually
// withAccountPermission handles it
```

#### ForbiddenError (403)

Thrown automatically by `withAccountPermission()` when:
- User lacks required permission

```typescript
// You don't need to throw this manually
// withAccountPermission handles it
```

#### ValidationError (400)

Thrown automatically by `enhanceAction()` when:
- Input data fails Zod schema validation

```typescript
// You don't need to throw this manually
// enhanceAction handles it
```

#### ConflictError (409)

Use when operation conflicts with existing data:

```typescript
const { data: existing } = await client
  .from('assets')
  .select('id')
  .eq('serial_number', data.serialNumber)
  .single();

if (existing) {
  throw new ConflictError({
    message: 'Asset with this serial number already exists',
    details: { serialNumber: data.serialNumber }
  });
}
```

#### BusinessRuleError (422)

Use when operation violates business rules:

```typescript
if (data.totalSeats < data.usedSeats) {
  throw new BusinessRuleError({
    message: 'Total seats cannot be less than used seats',
    details: {
      totalSeats: data.totalSeats,
      usedSeats: data.usedSeats
    }
  });
}
```

### Error Context

Always provide context in error details:

```typescript
throw new NotFoundError({
  message: 'User-friendly message',
  details: {
    // Include relevant IDs and values
    resourceId: 'uuid',
    accountId: 'uuid',
    attemptedValue: 'value'
  }
});
```

---

## Permission Checks

### Permission Mapping

| Resource | View | Create | Update | Delete | Manage |
|----------|------|--------|--------|--------|--------|
| Licenses | `licenses.view` | `licenses.create` | `licenses.update` | `licenses.delete` | `licenses.manage` |
| Assets | `assets.view` | `assets.create` | `assets.update` | `assets.delete` | `assets.manage` |
| Members | `members.view` | - | - | - | `members.manage` |
| Dashboard | `dashboard.view` | - | - | - | `dashboard.manage` |

### Permission Guidelines

#### View Permission

Use for read-only operations:

```typescript
export const getLicenses = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.view',  // Read-only
      async (client, accountId) => {
        const { data: licenses } = await client
          .from('software_licenses')
          .select('*')
          .eq('account_id', accountId);
        return licenses;
      }
    );
  },
  { schema: GetLicensesSchema }
);
```

#### Create Permission

Use for creating new resources:

```typescript
export const createLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.create',  // Create new
      async (client, accountId) => {
        // Create logic
      }
    );
  },
  { schema: CreateLicenseSchema }
);
```

#### Update Permission

Use for modifying existing resources:

```typescript
export const updateLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.update',  // Modify existing
      async (client, accountId) => {
        // Update logic
      }
    );
  },
  { schema: UpdateLicenseSchema }
);
```

#### Delete Permission

Use for removing resources:

```typescript
export const deleteLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.delete',  // Remove
      async (client, accountId) => {
        // Delete logic
      }
    );
  },
  { schema: DeleteLicenseSchema }
);
```

#### Manage Permission

Use for complex operations (assign, unassign, bulk operations):

```typescript
export const assignLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.manage',  // Complex operation
      async (client, accountId) => {
        // Assignment logic
      }
    );
  },
  { schema: AssignLicenseSchema }
);
```

---

## Data Validation

### Zod Schema Patterns

#### Basic Types

```typescript
const schema = z.object({
  // Strings
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  
  // Numbers
  cost: z.number().nonnegative(),
  seats: z.number().int().positive(),
  
  // Dates
  expirationDate: z.string().datetime(),
  
  // Enums
  status: z.enum(['active', 'inactive', 'expired']),
  
  // UUIDs
  id: z.string().uuid(),
  
  // Emails
  email: z.string().email(),
  
  // URLs
  website: z.string().url().optional(),
});
```

#### Custom Validation

```typescript
const schema = z.object({
  totalSeats: z.number().int().positive(),
  usedSeats: z.number().int().nonnegative(),
}).refine(
  (data) => data.usedSeats <= data.totalSeats,
  {
    message: 'Used seats cannot exceed total seats',
    path: ['usedSeats']
  }
);
```

#### Conditional Fields

```typescript
const schema = z.object({
  assignmentType: z.enum(['user', 'asset']),
  userId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
}).refine(
  (data) => {
    if (data.assignmentType === 'user') {
      return !!data.userId && !data.assetId;
    }
    return !!data.assetId && !data.userId;
  },
  {
    message: 'Must provide exactly one of userId or assetId',
  }
);
```

---

## Code Examples

### Example 1: Create Operation

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { ConflictError } from '@kit/shared/app-errors';

const CreateLicenseSchema = z.object({
  accountSlug: z.string().min(1),
  name: z.string().min(1).max(255),
  vendor: z.string().min(1).max(255),
  totalSeats: z.number().int().positive(),
  cost: z.number().nonnegative(),
  expirationDate: z.string().datetime(),
});

/**
 * Creates a new software license.
 *
 * @param data - License creation data
 * @returns Created license
 * @throws {ForbiddenError} If user lacks 'licenses.create' permission
 * @throws {ConflictError} If license name already exists
 */
export const createLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.create',
      async (client, accountId) => {
        // Check for duplicate name
        const { data: existing } = await client
          .from('software_licenses')
          .select('id')
          .eq('account_id', accountId)
          .eq('name', data.name)
          .single();

        if (existing) {
          throw new ConflictError({
            message: 'License with this name already exists',
            details: { name: data.name }
          });
        }

        // Create license
        const { data: license, error } = await client
          .from('software_licenses')
          .insert({
            account_id: accountId,
            name: data.name,
            vendor: data.vendor,
            total_seats: data.totalSeats,
            cost: data.cost,
            expiration_date: data.expirationDate,
          })
          .select()
          .single();

        if (error) throw error;

        return license;
      }
    );
  },
  {
    schema: CreateLicenseSchema
  }
);
```

### Example 2: Update Operation

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, BusinessRuleError } from '@kit/shared/app-errors';

const UpdateLicenseSchema = z.object({
  accountSlug: z.string().min(1),
  licenseId: z.string().uuid(),
  totalSeats: z.number().int().positive().optional(),
  cost: z.number().nonnegative().optional(),
  expirationDate: z.string().datetime().optional(),
});

/**
 * Updates an existing software license.
 *
 * @param data - License update data
 * @returns Updated license
 * @throws {ForbiddenError} If user lacks 'licenses.update' permission
 * @throws {NotFoundError} If license doesn't exist
 * @throws {BusinessRuleError} If update violates business rules
 */
export const updateLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.update',
      async (client, accountId) => {
        // Fetch current license
        const { data: license } = await client
          .from('software_licenses')
          .select('*, license_assignments(count)')
          .eq('id', data.licenseId)
          .eq('account_id', accountId)
          .single();

        if (!license) {
          throw new NotFoundError({
            message: 'License not found',
            details: { licenseId: data.licenseId }
          });
        }

        // Validate business rules
        if (data.totalSeats !== undefined) {
          const usedSeats = license.license_assignments[0]?.count || 0;
          if (data.totalSeats < usedSeats) {
            throw new BusinessRuleError({
              message: 'Cannot reduce seats below current usage',
              details: {
                requestedSeats: data.totalSeats,
                usedSeats
              }
            });
          }
        }

        // Update license
        const { data: updated, error } = await client
          .from('software_licenses')
          .update({
            total_seats: data.totalSeats,
            cost: data.cost,
            expiration_date: data.expirationDate,
          })
          .eq('id', data.licenseId)
          .eq('account_id', accountId)
          .select()
          .single();

        if (error) throw error;

        return updated;
      }
    );
  },
  {
    schema: UpdateLicenseSchema
  }
);
```

### Example 3: Delete Operation

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, BusinessRuleError } from '@kit/shared/app-errors';

const DeleteLicenseSchema = z.object({
  accountSlug: z.string().min(1),
  licenseId: z.string().uuid(),
});

/**
 * Deletes a software license.
 *
 * @param data - License deletion data
 * @returns Success message
 * @throws {ForbiddenError} If user lacks 'licenses.delete' permission
 * @throws {NotFoundError} If license doesn't exist
 * @throws {BusinessRuleError} If license has active assignments
 */
export const deleteLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.delete',
      async (client, accountId) => {
        // Check if license exists and has assignments
        const { data: license } = await client
          .from('software_licenses')
          .select('*, license_assignments(count)')
          .eq('id', data.licenseId)
          .eq('account_id', accountId)
          .single();

        if (!license) {
          throw new NotFoundError({
            message: 'License not found',
            details: { licenseId: data.licenseId }
          });
        }

        const assignmentCount = license.license_assignments[0]?.count || 0;
        if (assignmentCount > 0) {
          throw new BusinessRuleError({
            message: 'Cannot delete license with active assignments',
            details: {
              licenseId: data.licenseId,
              assignmentCount
            }
          });
        }

        // Delete license
        const { error } = await client
          .from('software_licenses')
          .delete()
          .eq('id', data.licenseId)
          .eq('account_id', accountId);

        if (error) throw error;

        return { success: true };
      }
    );
  },
  {
    schema: DeleteLicenseSchema
  }
);
```

### Example 4: Complex Operation (Assign)

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { NotFoundError, BusinessRuleError } from '@kit/shared/app-errors';

const AssignLicenseSchema = z.object({
  accountSlug: z.string().min(1),
  licenseId: z.string().uuid(),
  targetType: z.enum(['user', 'asset']),
  targetId: z.string().uuid(),
});

/**
 * Assigns a license to a user or asset.
 *
 * @param data - License assignment data
 * @returns Created assignment
 * @throws {ForbiddenError} If user lacks 'licenses.manage' permission
 * @throws {NotFoundError} If license or target doesn't exist
 * @throws {BusinessRuleError} If no seats available
 */
export const assignLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.manage',
      async (client, accountId) => {
        // Fetch license with assignment count
        const { data: license } = await client
          .from('software_licenses')
          .select('*, license_assignments(count)')
          .eq('id', data.licenseId)
          .eq('account_id', accountId)
          .single();

        if (!license) {
          throw new NotFoundError({
            message: 'License not found',
            details: { licenseId: data.licenseId }
          });
        }

        // Check seat availability
        const usedSeats = license.license_assignments[0]?.count || 0;
        if (usedSeats >= license.total_seats) {
          throw new BusinessRuleError({
            message: 'No available seats for this license',
            details: {
              totalSeats: license.total_seats,
              usedSeats
            }
          });
        }

        // Verify target exists
        const targetTable = data.targetType === 'user' 
          ? 'user_profiles' 
          : 'assets';
        const { data: target } = await client
          .from(targetTable)
          .select('id')
          .eq('id', data.targetId)
          .eq('account_id', accountId)
          .single();

        if (!target) {
          throw new NotFoundError({
            message: `${data.targetType} not found`,
            details: { targetId: data.targetId }
          });
        }

        // Create assignment
        const { data: assignment, error } = await client
          .from('license_assignments')
          .insert({
            license_id: data.licenseId,
            assigned_to_user_id: data.targetType === 'user' 
              ? data.targetId 
              : null,
            assigned_to_asset_id: data.targetType === 'asset' 
              ? data.targetId 
              : null,
          })
          .select()
          .single();

        if (error) throw error;

        return assignment;
      }
    );
  },
  {
    schema: AssignLicenseSchema
  }
);
```

---

## Common Patterns

### Pattern 1: Fetch with Validation

```typescript
// Always verify resource belongs to account
const { data: resource } = await client
  .from('resources')
  .select('*')
  .eq('id', resourceId)
  .eq('account_id', accountId)  // Important!
  .single();

if (!resource) {
  throw new NotFoundError({
    message: 'Resource not found',
    details: { resourceId }
  });
}
```

### Pattern 2: Check Before Create

```typescript
// Check for conflicts before creating
const { data: existing } = await client
  .from('resources')
  .select('id')
  .eq('account_id', accountId)
  .eq('unique_field', data.uniqueField)
  .single();

if (existing) {
  throw new ConflictError({
    message: 'Resource already exists',
    details: { uniqueField: data.uniqueField }
  });
}
```

### Pattern 3: Validate Business Rules

```typescript
// Validate before update
if (data.newValue < currentValue) {
  throw new BusinessRuleError({
    message: 'New value cannot be less than current value',
    details: {
      currentValue,
      newValue: data.newValue
    }
  });
}
```

### Pattern 4: Cascade Checks

```typescript
// Check dependencies before delete
const { data: dependencies } = await client
  .from('dependent_resources')
  .select('count')
  .eq('parent_id', resourceId);

if (dependencies && dependencies.count > 0) {
  throw new BusinessRuleError({
    message: 'Cannot delete resource with dependencies',
    details: {
      resourceId,
      dependencyCount: dependencies.count
    }
  });
}
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Manual Auth Checks

```typescript
// DON'T DO THIS
const user = await getUser();
if (!user) {
  throw new Error('Not authenticated');
}

const membership = await getMembership(user.id, accountId);
if (!membership) {
  throw new Error('Not a member');
}

// Use withAccountPermission instead!
```

### ❌ Anti-Pattern 2: Generic Errors

```typescript
// DON'T DO THIS
throw new Error('Something went wrong');

// Use typed errors with context
throw new NotFoundError({
  message: 'License not found',
  details: { licenseId }
});
```

### ❌ Anti-Pattern 3: Missing Validation

```typescript
// DON'T DO THIS
const { data } = await client
  .from('resources')
  .insert(data);  // No validation!

// Use Zod schemas with enhanceAction
```

### ❌ Anti-Pattern 4: Ignoring Account Scope

```typescript
// DON'T DO THIS
const { data } = await client
  .from('resources')
  .select('*')
  .eq('id', resourceId);  // Missing account_id check!

// Always filter by account_id
const { data } = await client
  .from('resources')
  .select('*')
  .eq('id', resourceId)
  .eq('account_id', accountId);
```

### ❌ Anti-Pattern 5: Hardcoded Permissions

```typescript
// DON'T DO THIS
if (user.role === 'admin') {
  // Allow operation
}

// Use permission system
return withAccountPermission(
  accountSlug,
  'resources.create',
  async (client, accountId) => {
    // Operation
  }
);
```

---

## Conclusion

By following these patterns, you ensure:

1. **Consistent Security**: All operations check permissions
2. **Better Errors**: Typed errors with context
3. **Maintainability**: Standardized patterns across codebase
4. **Testability**: Clear contracts for testing
5. **Documentation**: Self-documenting code with JSDoc

---

**For more information, see:**
- [Security Architecture](./ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Usage Guide](../../.kiro/specs/security-fixes/USAGE_GUIDE.md)
