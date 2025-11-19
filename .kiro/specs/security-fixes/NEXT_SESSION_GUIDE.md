# Next Session Guide - Task 7.3

**Current Status**: Task 7.2 (Users) completed ✅  
**Next Task**: Task 7.3 - Assets Server Actions  
**Estimated Time**: 2-3 hours

---

## Quick Start

To continue with Task 7.3, follow these steps:

### 1. Locate the Assets Server Actions File

```bash
# Search for the file
fileSearch: "assets-server-actions.ts"

# Expected location
apps/web/app/home/[account]/assets/_lib/server/assets-server-actions.ts
```

### 2. Review the File

Read the file to identify all actions that need refactoring:
- `createAsset`
- `updateAsset`
- `deleteAsset`
- `assignAsset`
- `unassignAsset`
- Any other asset-related actions

### 3. Create Backup

```bash
Copy-Item 'apps\web\app\home\[account]\assets\_lib\server\assets-server-actions.ts' 'apps\web\app\home\[account]\assets\_lib\server\assets-server-actions.ts.backup'
```

### 4. Apply Refactoring Pattern

For each action, follow the pattern from Task 7.1 and 7.2:

#### Imports to Add
```typescript
import {
  NotFoundError,
  ConflictError,
  BusinessRuleError,
} from '@kit/shared/app-errors';
import { withAccountPermission } from '@kit/shared/permission-helpers';
```

#### Action Structure
```typescript
/**
 * [Action description]
 *
 * Requires `[permission]` permission for the account.
 *
 * @param data - [Parameter description]
 * @returns [Return description]
 * @throws {NotFoundError} If [resource] doesn't exist
 * @throws {ConflictError} If [conflict condition]
 * @throws {BusinessRuleError} If [business rule violation]
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks [permission] permission
 */
export const actionName = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'assets.action', ... }, 'Action description...');

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error({ error: accountError, name: 'assets.action' }, 'Failed to find account');
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Business logic here
        // Use typed errors: NotFoundError, ConflictError, BusinessRuleError
        // No try-catch needed
      },
      {
        accountId: account.id,
        permission: 'assets.[action]', // create, update, delete, manage
        client,
        resourceName: 'asset',
      }
    );
  },
  {
    schema: ActionSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  }
);
```

---

## Permission Mapping for Assets

| Action | Permission | Notes |
|--------|-----------|-------|
| `createAsset` | `assets.create` | Create new asset |
| `updateAsset` | `assets.update` | Update existing asset |
| `deleteAsset` | `assets.delete` | Delete asset |
| `assignAsset` | `assets.manage` | Assign asset to user |
| `unassignAsset` | `assets.manage` | Unassign asset from user |
| `exportAssets` | `assets.view` | Export asset list (if exists) |

---

## Special Cases to Watch For

### 1. Actions Without accountSlug
Some actions might receive `accountId` directly instead of `accountSlug`. In this case:

```typescript
// If data has accountId but not accountSlug
const { data: account, error: accountError } = await client
  .from('accounts')
  .select('id, slug')
  .eq('id', data.accountId)
  .single();
```

### 2. Asset Ownership Validation
When updating or deleting assets, verify the asset belongs to the account:

```typescript
// Get asset first
const { data: asset, error: assetError } = await client
  .from('assets')
  .select('id, name, account_id')
  .eq('id', data.assetId)
  .single();

if (assetError || !asset) {
  throw new NotFoundError('Asset', data.assetId);
}

// Verify ownership
if (asset.account_id !== account.id) {
  throw new BusinessRuleError('Asset does not belong to this account', {
    assetId: data.assetId,
    assetAccountId: asset.account_id,
    requestAccountId: account.id,
  });
}
```

### 3. Assignment Status Checks
When assigning/unassigning assets:

```typescript
// Check if already assigned
if (asset.assigned_to) {
  throw new ConflictError('Asset is already assigned', {
    assetId: asset.id,
    assignedTo: asset.assigned_to,
  });
}

// Check if not assigned
if (!asset.assigned_to) {
  throw new BusinessRuleError('Asset is not currently assigned', {
    assetId: asset.id,
  });
}
```

---

## Component Updates

After refactoring server actions, update components that use them:

### Find Components
```bash
# Search for components using assets actions
grepSearch: "createAsset|updateAsset|deleteAsset|assignAsset|unassignAsset"
includePattern: "apps/web/app/home/[account]/assets/_components/**/*.tsx"
```

### Update Pattern
Replace:
```typescript
if (!result.success) {
  setError(result.message || 'Failed to ...');
  toast.error(t('error'), {
    description: result.message || 'Failed to ...',
  });
  return;
}
```

With:
```typescript
if (!result.success) {
  setError('Failed to ...');
  toast.error(t('error'), {
    description: 'Failed to ...',
  });
  return;
}
```

---

## Verification Steps

### 1. TypeCheck
```bash
pnpm typecheck
```

### 2. Lint (Optional)
```bash
pnpm lint:fix
```

### 3. Manual Review
- [ ] All actions have JSDoc
- [ ] All actions use `withAccountPermission()`
- [ ] All actions throw typed errors
- [ ] No manual auth checks remain
- [ ] No try-catch blocks remain
- [ ] All components updated

---

## Documentation

After completing Task 7.3, create:

1. **Completion Summary**: `.kiro/specs/security-fixes/TASK_7.3_COMPLETION.md`
   - List all refactored actions
   - Document code reduction metrics
   - Note any special cases or deviations

2. **Update Tasks**: `.kiro/specs/security-fixes/tasks.md`
   - Mark Task 7.3 as complete
   - Update status and metrics

3. **Session Summary**: `.kiro/specs/security-fixes/SESSION_TASK_7.3_SUMMARY.md`
   - Document what was accomplished
   - Note any issues encountered
   - Provide guidance for next session

---

## Expected Results

### Code Metrics
- **Code Reduction**: 35-45%
- **Duplication Reduction**: 60-70%
- **JSDoc Coverage**: 0-20% → 100%
- **Typed Errors**: 0% → 100%

### Quality Improvements
- ✅ Consistent error handling
- ✅ Better error messages with context
- ✅ Explicit permission checks
- ✅ Comprehensive documentation
- ✅ Reduced code duplication
- ✅ Easier to test and maintain

---

## Reference Documents

- **Task 7.1 Completion**: `.kiro/specs/security-fixes/TASK_7_COMPLETION_SUMMARY.md`
- **Task 7.2 Completion**: `.kiro/specs/security-fixes/TASK_7.2_COMPLETION.md`
- **Refactoring Guide**: `.kiro/specs/security-fixes/TASK_7_REFACTORING_GUIDE.md`
- **Example**: `.kiro/specs/security-fixes/REFACTORING_EXAMPLE.md`
- **Tasks List**: `.kiro/specs/security-fixes/tasks.md`

---

## Timeline

| Task | Status | Time Spent | Remaining |
|------|--------|-----------|-----------|
| 7.1 Licenses | ✅ Complete | 2 hours | - |
| 7.2 Users | ✅ Complete | 2 hours | - |
| 7.3 Assets | ⏳ Next | - | 2-3 hours |
| 7.4 Dashboard | 📋 Pending | - | 1-2 hours |

**Total Progress**: 2/4 tasks complete (50%)  
**Estimated Remaining**: 3-5 hours

---

## Quick Commands Reference

```bash
# Backup file
Copy-Item 'path\to\file.ts' 'path\to\file.ts.backup'

# Check file line count
(Get-Content "path/to/file.ts").Count

# Run typecheck
pnpm typecheck

# Run lint
pnpm lint:fix

# Search for patterns
grepSearch: "pattern"
includePattern: "**/*.ts"
```

---

**Ready to Start**: Task 7.3 - Assets Server Actions  
**Estimated Duration**: 2-3 hours  
**Follow**: This guide + TASK_7_REFACTORING_GUIDE.md
