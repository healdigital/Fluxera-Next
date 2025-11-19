# Continuation Guide - Tasks 7.2, 7.3, 7.4

**Purpose**: Guide for continuing the server actions refactoring  
**Current Status**: Task 7.1 Complete (7/20 actions done)  
**Remaining Work**: Tasks 7.2-7.4 (13 actions, ~4-5 hours)

---

## 🎯 Quick Start

### What You Need to Know

1. **Pattern is Established**: Task 7.1 (licenses) is complete and serves as reference
2. **Documentation is Complete**: All guides and examples are ready
3. **Infrastructure is Ready**: Error classes and helpers are working
4. **Typecheck Passes**: No errors, ready to continue

### Files You'll Work With

**Task 7.2 - Users Module**:
- Source: `apps/web/app/home/[account]/users/_lib/server/users-server-actions.ts`
- Actions: 6 (inviteUser, updateUserProfile, updateUserRole, updateUserStatus, assignAssetsToUser, unassignAssetFromUser)

**Task 7.3 - Assets Module**:
- Source: `apps/web/app/home/[account]/assets/_lib/server/assets-server-actions.ts`
- Actions: 5 (createAsset, updateAsset, deleteAsset, assignAsset, unassignAsset)

**Task 7.4 - Dashboard Module**:
- Source: `apps/web/app/home/[account]/dashboard/_lib/server/dashboard-server-actions.ts`
- Actions: 3 (dismissAlert, updateWidgetLayout, refreshDashboardMetrics)

---

## 📚 Essential Documents

### Must Read (in order)

1. **TASK_7_REFACTORING_GUIDE.md** ⭐ PRIMARY GUIDE
   - Complete step-by-step instructions
   - Correct pattern with examples
   - Permission mapping
   - Special cases
   - Verification checklist

2. **REFACTORING_EXAMPLE.md**
   - Before/after comparison
   - Shows 40% code reduction
   - Explains each improvement

3. **Reference Implementation**
   - `apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions-refactored.ts`
   - All 6 actions fully refactored
   - Working code you can copy patterns from

### Supporting Documents

- **USAGE_GUIDE.md** - How to use error classes and helpers
- **TASK_7_STATUS.md** - Progress tracking
- **PHASE2_PROGRESS_REPORT.md** - Overall status

---

## 🔧 The Refactoring Pattern

### Template (Copy This)

```typescript
/**
 * [Action description]
 *
 * @permission [module].[action] - Required to [action description]
 * @throws {NotFoundError} If [resource] doesn't exist
 * @throws {ConflictError} If [conflict condition]
 * @throws {BusinessRuleError} If [business rule violation]
 */
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

        // Your business logic here
        // - Database operations
        // - Validation
        // - Activity logging
        // - etc.

        // Revalidate paths
        revalidatePath(`/home/${data.accountSlug}/...`);

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

### What to Remove

❌ Remove these (they're now handled by `withAccountPermission`):
```typescript
// Remove manual auth check
const { data: { user }, error: authError } = await client.auth.getUser();
if (authError || !user) {
  return { success: false, message: 'Authentication required' };
}

// Remove manual membership check
const { data: membership } = await client
  .from('accounts_memberships')
  .select('id')
  .eq('account_id', accountId)
  .eq('user_id', user.id)
  .single();
if (!membership) {
  return { success: false, message: 'Not a member' };
}

// Remove manual permission check
const { data: hasPermission } = await client.rpc('has_permission', {
  account_id: accountId,
  permission_name: 'some.permission',
  user_id: user.id,
});
if (!hasPermission) {
  return { success: false, message: 'Permission denied' };
}

// Remove try-catch wrapper (errors are thrown now)
try {
  // ...
} catch (error) {
  return { success: false, message: error.message };
}
```

### What to Keep

✅ Keep these:
- Business logic (database operations, validation)
- Activity logging (`client.rpc('log_user_activity', ...)`)
- Path revalidation (`revalidatePath(...)`)
- Specific error handling (e.g., checking RPC error messages)

---

## 🗺️ Permission Mapping Reference

### Users Module (Task 7.2)
```typescript
inviteUser              → 'members.create'
updateUserProfile       → 'members.update'
updateUserRole          → 'members.manage'
updateUserStatus        → 'members.manage'
assignAssetsToUser      → 'assets.manage'
unassignAssetFromUser   → 'assets.manage'
```

### Assets Module (Task 7.3)
```typescript
createAsset   → 'assets.create'
updateAsset   → 'assets.update'
deleteAsset   → 'assets.delete'
assignAsset   → 'assets.manage'
unassignAsset → 'assets.manage'
```

### Dashboard Module (Task 7.4)
```typescript
dismissAlert              → 'dashboard.manage'
updateWidgetLayout        → 'dashboard.manage'
refreshDashboardMetrics   → 'dashboard.view'
```

---

## ⚠️ Special Cases

### Case 1: No accountSlug in Data

Some actions (updateAsset, deleteAsset, dismissAlert) don't have accountSlug in their input.

**Solution**: Fetch it from the resource first:

```typescript
export const updateAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    // Fetch asset to get account slug
    const { data: existingAsset, error: fetchError } = await client
      .from('assets')
      .select('account_id, accounts!inner(slug)')
      .eq('id', data.id)
      .single();

    if (fetchError || !existingAsset) {
      throw new NotFoundError('Asset', data.id);
    }

    const accountSlug = (existingAsset.accounts as { slug: string }).slug;

    // Now get full account
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
    schema: UpdateAssetSchema, // No accountSlug extension needed
  },
);
```

### Case 2: Database Functions

Some actions call database functions (updateUserStatus). Keep the function call:

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

### Case 3: Server Functions (not enhanceAction)

`refreshDashboardMetrics` is a server function, not wrapped in enhanceAction:

```typescript
export async function refreshDashboardMetrics(
  accountSlug: string,
): Promise<TeamDashboardMetrics> {
  'use server';

  const logger = await getLogger();
  const client = getSupabaseServerClient();

  // Get account
  const { data: account } = await client
    .from('accounts')
    .select('id, slug')
    .eq('slug', accountSlug)
    .single();

  if (!account) {
    throw new NotFoundError('Account', accountSlug);
  }

  return withAccountPermission(
    async () => {
      // Business logic...
      return metrics;
    },
    {
      accountId: account.id,
      permission: 'dashboard.view',
      client,
      resourceName: 'dashboard metrics',
    },
  );
}
```

---

## ✅ Verification Checklist

After refactoring each action:

- [ ] Removed manual `client.auth.getUser()` at start
- [ ] Removed manual membership checks
- [ ] Removed manual `has_permission` RPC calls
- [ ] Wrapped business logic with `withAccountPermission`
- [ ] Used typed errors (NotFoundError, ConflictError, BusinessRuleError)
- [ ] Added JSDoc with `@permission` tag
- [ ] Kept `revalidatePath` calls
- [ ] Kept activity logging (if present)
- [ ] Run `pnpm typecheck` - must pass ✅
- [ ] Run `pnpm lint:fix` - must pass ✅

---

## 🚀 Workflow

### For Each Action

1. **Open the original file** (e.g., users-server-actions.ts)
2. **Find the action** you want to refactor
3. **Copy the template** from this guide
4. **Fill in the specifics**:
   - Action name
   - Permission from mapping table
   - Business logic from original
5. **Remove boilerplate**:
   - Manual auth checks
   - Manual membership checks
   - Manual permission checks
   - Try-catch wrapper
6. **Replace errors**:
   - Generic messages → Typed errors
7. **Add JSDoc**:
   - Description
   - @permission tag
   - @throws tags
8. **Test**:
   - Run `pnpm typecheck`
   - Fix any errors
9. **Repeat** for next action

### After Each Module

1. Run `pnpm typecheck` - must pass
2. Run `pnpm lint:fix` - auto-fix issues
3. Update progress in tasks.md
4. Commit changes

---

## 📊 Progress Tracking

Update tasks.md after completing each module:

```markdown
- [x] 7.2 Update users server actions
  - ✅ Refactored 6/6 actions
  - ✅ Typecheck passes
  - ✅ Lint passes
  - ✅ Code reduction: ~40%
```

---

## 🆘 Troubleshooting

### TypeScript Errors

**Error**: `Parameter 'client' implicitly has an 'any' type`
- **Cause**: Wrong signature for withAccountPermission
- **Fix**: Use the template pattern exactly as shown

**Error**: `This expression is not callable`
- **Cause**: Trying to call the result of withAccountPermission
- **Fix**: withAccountPermission returns a Promise, don't add `()` at the end

**Error**: `Expected 2 arguments, but got 3`
- **Cause**: Wrong parameters to withAccountPermission
- **Fix**: Use object with `{ accountId, permission, client, resourceName }`

### Common Mistakes

❌ **Wrong**: Calling withAccountPermission with accountSlug
```typescript
withAccountPermission(data.accountSlug, 'permission', async () => {})
```

✅ **Correct**: Calling with options object
```typescript
withAccountPermission(
  async () => {},
  {
    accountId: account.id,
    permission: 'module.action',
    client,
    resourceName: 'resource',
  }
)
```

---

## 📞 Need Help?

1. **Check the reference**: licenses-server-actions-refactored.ts
2. **Read the guide**: TASK_7_REFACTORING_GUIDE.md
3. **Check the example**: REFACTORING_EXAMPLE.md
4. **Run typecheck**: `pnpm typecheck` for immediate feedback

---

## 🎉 When You're Done

After completing all three tasks (7.2, 7.3, 7.4):

1. ✅ All 20 actions refactored
2. ✅ All typecheck passing
3. ✅ All lint passing
4. ✅ ~40% code reduction achieved
5. ✅ Phase 2 complete!

**Next**: Phase 3 - Testing & Documentation

---

**Document Version**: 1.0  
**Created**: November 20, 2025  
**Status**: Ready for use  
**Estimated Time**: 4-5 hours total
