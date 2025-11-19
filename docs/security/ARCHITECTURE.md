# Security Architecture Documentation

**Version:** 1.0  
**Last Updated:** November 20, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Multi-Tenant Architecture](#multi-tenant-architecture)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Permission System](#permission-system)
5. [SQL Function Security](#sql-function-security)
6. [Data Validation](#data-validation)
7. [Security Diagrams](#security-diagrams)
8. [Best Practices](#best-practices)

---

## Overview

Fluxera implements a comprehensive security architecture based on PostgreSQL Row Level Security (RLS), role-based access control (RBAC), and permission-based authorization. This multi-layered approach ensures data isolation, proper access control, and defense in depth.

### Security Layers

```
┌─────────────────────────────────────────────────┐
│         Application Layer (Next.js)             │
│  - Server Actions with Permission Checks        │
│  - Error Handling & Validation                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Authorization Layer (Supabase)          │
│  - JWT Token Validation                         │
│  - User Authentication                          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Database Layer (PostgreSQL)             │
│  - Row Level Security (RLS) Policies            │
│  - Permission-Based Access Control              │
│  - Data Validation Constraints                  │
└─────────────────────────────────────────────────┘
```

### Key Principles

1. **Defense in Depth**: Multiple security layers protect data
2. **Least Privilege**: Users only access what they need
3. **Fail Safe**: System denies access by default
4. **Explicit Security**: All security decisions are explicit and documented
5. **Audit Trail**: All security events are logged

---

## Multi-Tenant Architecture

### Account Types

Fluxera supports two types of accounts:

#### 1. Personal Accounts
- Individual user accounts
- `auth.users.id = accounts.id` (1:1 relationship)
- User is automatically owner of their personal account
- Cannot have additional members

#### 2. Team Accounts
- Shared workspaces with multiple members
- Members have roles (owner, admin, member)
- Members have granular permissions
- Support for role-based and permission-based access control

### Data Association

All data in Fluxera is associated with accounts via foreign keys:

```sql
-- Example: Software Licenses
CREATE TABLE software_licenses (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- ... other columns
);

-- Example: Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- ... other columns
);
```

### Account Membership

Users belong to accounts through the `account_memberships` table:

```sql
CREATE TABLE account_memberships (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  -- ... other columns
  UNIQUE(account_id, user_id)
);
```

---

## Row Level Security (RLS)

### RLS Policy Design

All tables with account-scoped data have RLS policies that:

1. **Verify Membership**: User must be a member of the account
2. **Verify Permission**: User must have the required permission
3. **Use Optimized Functions**: Leverage helper functions for performance

### RLS Helper Functions

#### `has_permission_by_name(account_id, permission_name)`

Checks if the current user has a specific permission for an account.

```sql
CREATE OR REPLACE FUNCTION public.has_permission_by_name(
  p_account_id UUID,
  p_permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN supamode.has_permission(
    supamode.get_current_user_account_id(p_account_id),
    p_permission_name::app_permissions
  );
END;
$$;
```

**Usage in RLS Policies:**

```sql
CREATE POLICY "Users can view licenses if they have permission"
  ON software_licenses
  FOR SELECT
  USING (
    public.has_permission_by_name(account_id, 'licenses.view')
  );
```

#### `current_user_has_permission(permission_name)`

Convenience function for checking permissions without account_id.

```sql
CREATE OR REPLACE FUNCTION public.current_user_has_permission(
  p_permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM account_memberships am
    WHERE am.user_id = v_user_id
      AND supamode.has_permission(
        supamode.get_current_user_account_id(am.account_id),
        p_permission_name::app_permissions
      )
  );
END;
$$;
```

### RLS Policy Patterns

#### Pattern 1: SELECT Policy (Read Access)

```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  USING (
    public.has_permission_by_name(account_id, 'resource.view')
  );
```

**When to use:**
- User needs to read data
- Requires `resource.view` permission

#### Pattern 2: INSERT Policy (Create Access)

```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR INSERT
  WITH CHECK (
    public.has_permission_by_name(account_id, 'resource.create')
  );
```

**When to use:**
- User needs to create new records
- Requires `resource.create` permission

#### Pattern 3: UPDATE Policy (Modify Access)

```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR UPDATE
  USING (
    public.has_permission_by_name(account_id, 'resource.update')
  )
  WITH CHECK (
    public.has_permission_by_name(account_id, 'resource.update')
  );
```

**When to use:**
- User needs to modify existing records
- Requires `resource.update` permission
- Both USING and WITH CHECK ensure user has permission before and after update

#### Pattern 4: DELETE Policy (Remove Access)

```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR DELETE
  USING (
    public.has_permission_by_name(account_id, 'resource.delete')
  );
```

**When to use:**
- User needs to delete records
- Requires `resource.delete` permission

### Performance Optimization

#### Indexes for RLS

```sql
-- Index for permission lookups
CREATE INDEX idx_permissions_name 
  ON permissions(name);

-- Index for membership lookups
CREATE INDEX idx_account_memberships_user_account 
  ON account_memberships(user_id, account_id);

-- Index for role-based queries
CREATE INDEX idx_account_memberships_role 
  ON account_memberships(account_id, role);
```

#### Query Plan Analysis

```sql
-- Check if RLS policies use indexes
EXPLAIN ANALYZE
SELECT * FROM software_licenses
WHERE account_id = 'some-uuid';
```

**Expected output:**
- Index Scan on software_licenses
- Index Scan on account_memberships
- Execution time < 10ms

---

## Permission System

### Permission Enum

All permissions are defined in the `app_permissions` enum:

```sql
CREATE TYPE app_permissions AS ENUM (
  -- License permissions
  'licenses.view',
  'licenses.create',
  'licenses.update',
  'licenses.delete',
  'licenses.manage',
  
  -- Asset permissions
  'assets.view',
  'assets.create',
  'assets.update',
  'assets.delete',
  'assets.manage',
  
  -- Member permissions
  'members.view',
  'members.manage',
  
  -- Dashboard permissions
  'dashboard.view',
  'dashboard.manage'
);
```

### Permission Hierarchy

```
owner (all permissions)
  ├── admin (most permissions)
  │   ├── licenses.* (all license operations)
  │   ├── assets.* (all asset operations)
  │   ├── members.view (view members)
  │   └── dashboard.* (all dashboard operations)
  └── member (limited permissions)
      ├── licenses.view (view licenses)
      ├── assets.view (view assets)
      ├── members.view (view members)
      └── dashboard.view (view dashboard)
```

### Permission Assignment

Permissions are assigned through roles:

```sql
-- Owner has all permissions
INSERT INTO role_permissions (role, permission)
SELECT 'owner', unnest(enum_range(NULL::app_permissions));

-- Admin has most permissions
INSERT INTO role_permissions (role, permission)
VALUES
  ('admin', 'licenses.view'),
  ('admin', 'licenses.create'),
  ('admin', 'licenses.update'),
  ('admin', 'licenses.delete'),
  ('admin', 'licenses.manage'),
  -- ... other permissions
;

-- Member has read-only permissions
INSERT INTO role_permissions (role, permission)
VALUES
  ('member', 'licenses.view'),
  ('member', 'assets.view'),
  ('member', 'members.view'),
  ('member', 'dashboard.view');
```

### Custom Permissions

For fine-grained control, assign permissions directly to users:

```sql
-- Grant specific permission to a user
INSERT INTO user_permissions (user_id, account_id, permission)
VALUES (
  'user-uuid',
  'account-uuid',
  'licenses.manage'
);
```

---

## SQL Function Security

### SECURITY Clauses

All SQL functions must have explicit SECURITY clauses:

#### SECURITY DEFINER

**When to use:**
- Function needs elevated privileges
- Function bypasses RLS (e.g., audit trail)
- Function performs administrative tasks

**Example:**

```sql
CREATE OR REPLACE FUNCTION check_license_expirations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Function runs with owner privileges
  -- Can bypass RLS to create alerts
  INSERT INTO license_renewal_alerts (...)
  SELECT ... FROM software_licenses
  WHERE expiration_date < CURRENT_DATE + INTERVAL '30 days';
END;
$$;
```

**Security considerations:**
- Always set `search_path = public` to prevent SQL injection
- Validate all inputs
- Document why DEFINER is needed

#### SECURITY INVOKER

**When to use:**
- Function reads data using RLS
- Function doesn't need elevated privileges
- Function performs user-scoped operations

**Example:**

```sql
CREATE OR REPLACE FUNCTION get_user_licenses(p_account_id UUID)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Function runs with caller's privileges
  -- RLS policies apply automatically
  RETURN QUERY
  SELECT * FROM software_licenses
  WHERE account_id = p_account_id;
END;
$$;
```

### Function Documentation

All functions must have comprehensive COMMENT statements:

```sql
COMMENT ON FUNCTION check_license_expirations() IS
'Checks for expiring licenses and creates renewal alerts.

Security Model: SECURITY DEFINER
- Runs with elevated privileges to bypass RLS
- Creates alerts in license_renewal_alerts table
- Only accessible to authenticated users

Usage:
  SELECT check_license_expirations();

Performance:
  - Uses index on expiration_date
  - Processes ~1000 licenses/second
  - Runs daily via cron job

Last Updated: 2025-11-20';
```

---

## Data Validation

### CHECK Constraints

All critical data has CHECK constraints at the database level:

#### String Validation

```sql
-- Non-empty strings
ALTER TABLE software_licenses
ADD CONSTRAINT check_name_not_empty
CHECK (length(trim(name)) > 0);

-- Email format
ALTER TABLE user_profiles
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Slug format
ALTER TABLE accounts
ADD CONSTRAINT check_slug_format
CHECK (slug ~* '^[a-z0-9-]+$');
```

#### Numeric Validation

```sql
-- Non-negative numbers
ALTER TABLE software_licenses
ADD CONSTRAINT check_cost_non_negative
CHECK (cost >= 0);

-- Positive integers
ALTER TABLE software_licenses
ADD CONSTRAINT check_total_seats_positive
CHECK (total_seats > 0);
```

#### Date Validation

```sql
-- Future dates
ALTER TABLE software_licenses
ADD CONSTRAINT check_expiration_date_future
CHECK (expiration_date > purchase_date);

-- Date ordering
ALTER TABLE assets
ADD CONSTRAINT check_warranty_after_purchase
CHECK (
  warranty_expiry_date IS NULL OR
  warranty_expiry_date > purchase_date
);
```

#### Conditional Validation

```sql
-- Exactly one target (user OR asset, not both)
ALTER TABLE license_assignments
ADD CONSTRAINT check_single_assignment_target
CHECK (
  (assigned_to_user_id IS NOT NULL AND assigned_to_asset_id IS NULL) OR
  (assigned_to_user_id IS NULL AND assigned_to_asset_id IS NOT NULL)
);
```

### Validation Strategy

1. **Database Level**: CHECK constraints (fail-safe)
2. **Application Level**: Zod schemas (user-friendly errors)
3. **Client Level**: Form validation (immediate feedback)

---

## Security Diagrams

### Authentication Flow

```
┌─────────┐         ┌──────────┐         ┌──────────┐
│ Client  │────────>│ Supabase │────────>│ Database │
│ (Next)  │  JWT    │  Auth    │  RLS    │ (Postgres)│
└─────────┘         └──────────┘         └──────────┘
     │                    │                    │
     │ 1. Login           │                    │
     │─────────────────>  │                    │
     │                    │ 2. Validate        │
     │                    │─────────────────>  │
     │                    │ 3. JWT Token       │
     │  <─────────────────│                    │
     │ 4. API Request     │                    │
     │─────────────────>  │                    │
     │                    │ 5. Verify JWT      │
     │                    │─────────────────>  │
     │                    │ 6. Apply RLS       │
     │                    │ <──────────────────│
     │ 7. Response        │                    │
     │  <─────────────────│                    │
```

### Permission Check Flow

```
┌──────────────┐
│ Server Action│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ withAccountPermission()      │
│ 1. Get current user          │
│ 2. Verify membership         │
│ 3. Check permission          │
└──────┬───────────────────────┘
       │
       ├─── ✅ Has Permission ───> Execute Action
       │
       └─── ❌ No Permission ────> Throw ForbiddenError
```

### RLS Policy Evaluation

```
┌─────────────┐
│ SQL Query   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ RLS Policy Check            │
│ 1. Get auth.uid()           │
│ 2. Check membership         │
│ 3. Check permission         │
└──────┬──────────────────────┘
       │
       ├─── ✅ Policy Pass ───> Return Rows
       │
       └─── ❌ Policy Fail ───> Return Empty Set
```

---

## Best Practices

### 1. Always Use Permission Checks

❌ **Bad:**
```typescript
// Only checks membership
const { data } = await client
  .from('software_licenses')
  .select('*')
  .eq('account_id', accountId);
```

✅ **Good:**
```typescript
// Uses withAccountPermission for proper checks
export const getLicenses = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.view',
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

### 2. Use Typed Errors

❌ **Bad:**
```typescript
throw new Error('License not found');
```

✅ **Good:**
```typescript
throw new NotFoundError({
  message: 'License not found',
  details: { licenseId }
});
```

### 3. Document Security Decisions

❌ **Bad:**
```sql
CREATE FUNCTION do_something() ...
-- No documentation
```

✅ **Good:**
```sql
CREATE FUNCTION do_something() ...

COMMENT ON FUNCTION do_something() IS
'Does something important.

Security Model: SECURITY DEFINER
- Needs elevated privileges because...
- Bypasses RLS for...

Usage: SELECT do_something();
Performance: O(n) where n is...';
```

### 4. Test Security Thoroughly

```typescript
// Test permission enforcement
test('should deny access without permission', async () => {
  await expect(
    createLicense({ accountSlug: 'test', ... })
  ).rejects.toThrow(ForbiddenError);
});

// Test data isolation
test('should not see other account data', async () => {
  const licenses = await getLicenses({ accountSlug: 'account-a' });
  expect(licenses).not.toContainEqual(
    expect.objectContaining({ account_id: 'account-b-id' })
  );
});
```

### 5. Monitor Security Events

```typescript
// Log security failures
logger.warn('Permission denied', {
  userId: user.id,
  accountId,
  permission: 'licenses.create',
  timestamp: new Date()
});
```

---

## Conclusion

Fluxera's security architecture provides comprehensive protection through multiple layers:

1. **Database Layer**: RLS policies with permission checks
2. **Application Layer**: Permission helpers and typed errors
3. **Validation Layer**: CHECK constraints and Zod schemas

By following these patterns and best practices, you ensure that:
- Users only access data they're authorized to see
- All security decisions are explicit and auditable
- The system fails safely when permissions are insufficient
- Security is maintained even if application code has bugs

---

**For implementation examples, see:**
- [Application Patterns](./APPLICATION_PATTERNS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Usage Guide](../../.kiro/specs/security-fixes/USAGE_GUIDE.md)
