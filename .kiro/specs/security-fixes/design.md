# Design Document - Security & Quality Fixes

## Overview

This design document outlines the technical approach to fix all critical security, performance, and quality issues identified in the Fluxera platform audit. The solution is organized into 4 phases executed over 4 weeks, with each phase building on the previous one.

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Server       │  │ Loaders      │  │ Components   │     │
│  │ Actions      │  │              │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘     │
│         │                  │                                │
│         └──────────┬───────┘                                │
│                    │                                        │
│         ┌──────────▼───────────┐                           │
│         │  Permission Helpers  │                           │
│         │  Error Handlers      │                           │
│         └──────────┬───────────┘                           │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Database Layer (Supabase)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              RLS Policies (Enhanced)                  │  │
│  │  • Permission-based checks                            │  │
│  │  • Optimized with helper functions                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           SQL Functions (Secured)                     │  │
│  │  • SECURITY DEFINER for system functions             │  │
│  │  • SECURITY INVOKER for user functions               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         CHECK Constraints (Validation)                │  │
│  │  • Email format validation                            │  │
│  │  • Date range validation                              │  │
│  │  • Positive number validation                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. RLS Policy Enhancement

#### Design Pattern: Permission-Based Access Control

**Current (Insecure)**:
```sql
-- Only checks membership, not permissions
create policy "Users can create team licenses"
  on public.software_licenses for insert
  with check (
    account_id in (
      select account_id from accounts_memberships
      where user_id = auth.uid()
    )
  );
```

**New (Secure)**:
```sql
-- Checks both membership AND permissions
create policy "Users can create team licenses"
  on public.software_licenses for insert
  with check (
    account_id in (
      select am.account_id 
      from accounts_memberships am
      join account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and (ar.name = 'owner' or ar.permissions ? 'licenses.create')
    )
  );
```

#### Optimization Strategy

Create reusable helper functions to avoid subquery repetition:

```sql
-- Helper function 1: Get user's account IDs
create function user_account_ids()
returns setof uuid
language sql stable security invoker
as $
  select account_id 
  from accounts_memberships
  where user_id = auth.uid();
$;

-- Helper function 2: Check specific permission
create function user_has_permission(
  p_account_id uuid,
  p_permission text
)
returns boolean
language sql stable security invoker
as $
  select exists (
    select 1 
    from accounts_memberships am
    join account_roles ar on am.role = ar.name
    where am.user_id = auth.uid()
      and am.account_id = p_account_id
      and (ar.name = 'owner' or ar.permissions ? p_permission)
  );
$;

-- Optimized policy using helper
create policy "Users can create team licenses"
  on public.software_licenses for insert
  with check (
    user_has_permission(account_id, 'licenses.create')
  );
```

#### Performance Indexes

```sql
-- Composite index for membership lookups
create index idx_accounts_memberships_user_account 
  on accounts_memberships(user_id, account_id) 
  include (role);

-- Index for role permission lookups
create index idx_account_roles_permissions 
  on account_roles using gin(permissions);
```

### 2. SQL Function Security

#### Classification System

| Function Type | Security Clause | Use Case | Example |
|--------------|----------------|----------|---------|
| System Functions | SECURITY DEFINER | Need elevated privileges | check_license_expirations() |
| User Functions | SECURITY INVOKER | Use caller's permissions | get_team_members() |
| Admin Functions | SECURITY DEFINER + Check | Need privileges + verification | get_admin_platform_metrics() |

#### Implementation Pattern

**System Function (SECURITY DEFINER)**:
```sql
create or replace function check_license_expirations()
returns void
language plpgsql
security definer  -- Runs with function owner's privileges
set search_path = public, pg_temp  -- Prevent SQL injection
as $
begin
  -- Can insert into license_renewal_alerts
  -- even if caller doesn't have permission
  insert into license_renewal_alerts (...)
  select ... from software_licenses ...;
end;
$;

-- Grant execute to authenticated users
grant execute on function check_license_expirations() to authenticated;
```

**User Function (SECURITY INVOKER)**:
```sql
create or replace function get_team_members(
  p_account_slug text,
  p_search text default null
)
returns table (...)
language plpgsql
security invoker  -- Runs with caller's privileges
stable
as $
begin
  -- Results automatically filtered by RLS
  return query
  select ... from user_profiles
  where account_id = (
    select id from accounts where slug = p_account_slug
  );
end;
$;
```

**Admin Function (SECURITY DEFINER + Verification)**:
```sql
create or replace function get_admin_platform_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $
begin
  -- Verify caller is super admin
  if not exists (
    select 1 from auth.users
    where id = auth.uid()
      and raw_app_meta_data->>'is_super_admin' = 'true'
  ) then
    raise exception 'Insufficient permissions';
  end if;
  
  -- Can access all data
  return (select jsonb_build_object(...));
end;
$;
```

### 3. Data Validation Constraints

#### Constraint Categories

**Email Validation**:
```sql
alter table user_profiles
add constraint check_email_format 
check (
  email is null or 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
);
```

**Date Validation**:
```sql
-- Expiration date cannot be in the past
alter table software_licenses
add constraint check_expiration_date_valid
check (
  expiration_date is null or 
  expiration_date >= current_date
);

-- Purchase date cannot be in the future
alter table assets
add constraint check_purchase_date_not_future
check (
  purchase_date is null or 
  purchase_date <= current_date
);
```

**Numeric Validation**:
```sql
-- Total seats must be positive
alter table software_licenses
add constraint check_total_seats_positive
check (total_seats is null or total_seats > 0);

-- Purchase price must be non-negative
alter table assets
add constraint check_purchase_price_positive
check (purchase_price is null or purchase_price >= 0);
```

**Business Logic Validation**:
```sql
-- License assignment must have exactly one target
alter table license_assignments
add constraint check_assignment_target
check (
  (assigned_to_user is not null and assigned_to_asset is null) or
  (assigned_to_user is null and assigned_to_asset is not null)
);
```

### 4. Application Layer Helpers

#### Permission Helper

```typescript
// packages/shared/src/lib/permission-helpers.ts

export async function withAccountPermission<T>(
  accountSlug: string,
  permission: string,
  action: () => Promise<T>
): Promise<T> {
  const client = getSupabaseServerClient();
  const user = await requireUser(client);
  
  // Check membership and permission
  const { data: membership, error } = await client
    .from('accounts_memberships')
    .select(`
      role,
      account_roles!inner(
        name,
        permissions
      )
    `)
    .eq('account_id', (
      await client
        .from('accounts')
        .select('id')
        .eq('slug', accountSlug)
        .single()
    ).data?.id)
    .eq('user_id', user.id)
    .single();
    
  if (error || !membership) {
    throw new UnauthorizedError('Not a member of this account');
  }
  
  const role = membership.account_roles;
  const hasPermission = 
    role.name === 'owner' || 
    role.permissions?.includes(permission);
    
  if (!hasPermission) {
    throw new UnauthorizedError(
      `Missing permission: ${permission}`
    );
  }
  
  return action();
}
```

#### Error Classes

```typescript
// packages/shared/src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND',
      404
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

#### Usage in Server Actions

```typescript
// apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions.ts

export const createLicense = enhanceAction(
  async (data) => {
    return withAccountPermission(
      data.accountSlug,
      'licenses.create',
      async () => {
        const client = getSupabaseServerClient();
        
        const { data: license, error } = await client
          .from('software_licenses')
          .insert({
            account_id: data.accountId,
            name: data.name,
            vendor: data.vendor,
            license_type: data.licenseType,
            expiration_date: data.expirationDate,
          })
          .select()
          .single();
          
        if (error) {
          throw new AppError(
            'Failed to create license',
            'LICENSE_CREATE_ERROR'
          );
        }
        
        return { success: true, data: license };
      }
    );
  },
  { schema: CreateLicenseSchema }
);
```

## Data Models

### Enhanced RLS Policy Model

```typescript
interface RLSPolicy {
  tableName: string;
  policyName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  using?: string;  // For SELECT, UPDATE, DELETE
  withCheck?: string;  // For INSERT, UPDATE
  permissionRequired: string;  // e.g., 'licenses.create'
}
```

### SQL Function Security Model

```typescript
interface SQLFunction {
  name: string;
  securityClause: 'DEFINER' | 'INVOKER';
  requiresAdminCheck: boolean;
  searchPath: string;  // For SECURITY DEFINER
  grantTo: string[];  // Roles that can execute
}
```

## Error Handling

### Error Flow

```
User Action
    │
    ▼
Server Action (with enhanceAction)
    │
    ├─► Permission Check (withAccountPermission)
    │   ├─► UnauthorizedError (401)
    │   └─► Continue
    │
    ├─► Database Operation
    │   ├─► RLS Policy Check
    │   │   └─► PostgreSQL Error → AppError (500)
    │   ├─► CHECK Constraint Violation → ValidationError (400)
    │   └─► Success
    │
    └─► Return Result or Error
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    fields?: Record<string, string>;  // For validation errors
  };
}
```

## Testing Strategy

### SQL Function Tests (pgTAP)

```sql
-- apps/web/supabase/tests/license-functions.test.sql

begin;
select plan(10);

-- Test 1: get_license_stats returns correct counts
prepare test_license_stats as
  select total_licenses, expiring_soon, expired
  from get_license_stats('test-account-id');

select results_eq(
  'test_license_stats',
  $$ values (10::bigint, 2::bigint, 1::bigint) $$,
  'get_license_stats should return correct statistics'
);

-- Test 2: check_license_expirations creates alerts
select lives_ok(
  $$ select check_license_expirations() $$,
  'check_license_expirations should execute without error'
);

select bag_eq(
  $$ select alert_type from license_renewal_alerts $$,
  $$ values ('critical'), ('warning'), ('info') $$,
  'check_license_expirations should create all alert types'
);

select * from finish();
rollback;
```

### RLS Policy Tests

```sql
-- apps/web/supabase/tests/rls-policies.test.sql

begin;
select plan(5);

-- Setup test data
set local role authenticated;
set local request.jwt.claims.sub to 'test-user-id';

-- Test 1: User can only see their account's licenses
select results_eq(
  $$ select count(*) from software_licenses $$,
  $$ values (5::bigint) $$,
  'User should only see licenses from their accounts'
);

-- Test 2: User cannot create license without permission
prepare test_insert as
  insert into software_licenses (account_id, name, vendor)
  values ('other-account-id', 'Test', 'Test Vendor');

select throws_ok(
  'test_insert',
  'new row violates row-level security policy',
  'User without permission cannot create license'
);

select * from finish();
rollback;
```

### E2E Tests

```typescript
// apps/e2e/tests/security/permissions.spec.ts

test.describe('Permission Enforcement', () => {
  test('should prevent license creation without permission', async ({ page }) => {
    // Login as user without licenses.create permission
    await loginAs(page, 'member@example.com');
    
    // Navigate to licenses page
    await page.goto('/home/test-account/licenses');
    
    // Create license button should be disabled
    await expect(page.getByRole('button', { name: 'Create License' }))
      .toBeDisabled();
  });
  
  test('should allow license creation with permission', async ({ page }) => {
    // Login as user with licenses.create permission
    await loginAs(page, 'admin@example.com');
    
    // Navigate to licenses page
    await page.goto('/home/test-account/licenses');
    
    // Create license button should be enabled
    await expect(page.getByRole('button', { name: 'Create License' }))
      .toBeEnabled();
      
    // Fill and submit form
    await page.getByRole('button', { name: 'Create License' }).click();
    await page.getByLabel('Name').fill('Test License');
    await page.getByLabel('Vendor').fill('Test Vendor');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Should see success message
    await expect(page.getByText('License created successfully'))
      .toBeVisible();
  });
});
```

## Deployment Strategy

### Phase 1: Security Fixes (Week 1)

1. **Day 1-2**: Create and test RLS policy migrations
2. **Day 3-4**: Add SECURITY clauses to functions
3. **Day 5**: Add CHECK constraints
4. **Day 6-7**: Test in staging, deploy to production

### Phase 2: Performance Optimization (Week 2)

1. **Day 1-2**: Create helper functions
2. **Day 3-4**: Update policies to use helpers
3. **Day 5**: Create performance indexes
4. **Day 6-7**: Benchmark and deploy

### Phase 3: Application Layer (Week 3)

1. **Day 1-2**: Implement permission helpers
2. **Day 3-4**: Implement error classes
3. **Day 5**: Refactor server actions
4. **Day 6-7**: Test and deploy

### Phase 4: Testing & Documentation (Week 4)

1. **Day 1-2**: Write SQL tests
2. **Day 3-4**: Write E2E tests
3. **Day 5**: Add documentation
4. **Day 6-7**: Final review and deployment

## Rollback Plan

Each migration includes a rollback script:

```sql
-- Migration: 20251120000000_fix_rls_policies.sql
-- Rollback: 20251120000000_fix_rls_policies_rollback.sql

-- Rollback script restores original policies
drop policy if exists "Users can create team licenses" on software_licenses;

create policy "Users can create team licenses"
  on software_licenses for insert
  with check (
    account_id in (
      select account_id from accounts_memberships
      where user_id = auth.uid()
    )
  );
```

## Monitoring and Metrics

### Key Metrics to Track

1. **Security**:
   - Number of unauthorized access attempts
   - RLS policy violations
   - Permission check failures

2. **Performance**:
   - Average RLS policy check time
   - Database query execution time
   - Function execution time

3. **Quality**:
   - Test coverage percentage
   - Number of validation errors
   - Error rate by type

### Monitoring Queries

```sql
-- Monitor RLS policy performance
select 
  schemaname,
  tablename,
  policyname,
  avg(execution_time) as avg_time_ms
from pg_stat_statements
where query like '%policy%'
group by schemaname, tablename, policyname
order by avg_time_ms desc;

-- Monitor function performance
select 
  funcname,
  calls,
  total_time / calls as avg_time_ms
from pg_stat_user_functions
order by avg_time_ms desc;
```

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**Next Review**: After Phase 1 implementation
