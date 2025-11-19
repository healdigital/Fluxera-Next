# Task 7 - Server Actions Refactoring

**Status**: 35% Complete (7/20 actions)  
**Phase**: 2 of 3  
**Estimated Remaining Time**: 4-5 hours

---

## 📋 Quick Summary

### What's Done ✅
- **Task 7.0**: Documentation complete
- **Task 7.1**: Licenses module complete (6/6 actions)
- Infrastructure ready (error classes, permission helpers)
- Reference implementation available
- All guides written

### What's Next ⏳
- **Task 7.2**: Users module (6 actions, 1-2 hours)
- **Task 7.3**: Assets module (5 actions, 1-2 hours)
- **Task 7.4**: Dashboard module (3 actions, 1 hour)

---

## 🚀 How to Continue

### Step 1: Read the Guide (5 minutes)
📖 **CONTINUATION_GUIDE.md** - Everything you need to know

### Step 2: Start Refactoring
1. Open `apps/web/app/home/[account]/users/_lib/server/users-server-actions.ts`
2. Follow the pattern from **TASK_7_REFACTORING_GUIDE.md**
3. Use `licenses-server-actions-refactored.ts` as reference
4. Run `pnpm typecheck` after each action

### Step 3: Repeat for Assets and Dashboard
Same process, different files.

---

## 📚 Document Index

### Essential (Read These)
1. **CONTINUATION_GUIDE.md** ⭐ START HERE
   - Quick start guide
   - Template to copy
   - Special cases
   - Troubleshooting

2. **TASK_7_REFACTORING_GUIDE.md** ⭐ DETAILED GUIDE
   - Complete step-by-step instructions
   - Permission mapping
   - Error handling guidelines
   - Verification checklist

3. **Reference Implementation**
   - `apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions-refactored.ts`
   - Working code to copy patterns from

### Supporting
- **REFACTORING_EXAMPLE.md** - Before/after comparison
- **TASK_7_STATUS.md** - Progress tracking
- **USAGE_GUIDE.md** - How to use helpers and errors
- **PHASE2_PROGRESS_REPORT.md** - Overall status

---

## 🎯 The Pattern (Quick Reference)

```typescript
export const actionName = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    // Get account
    const { data: account } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (!account) {
      throw new NotFoundError('Account', data.accountSlug);
    }

    // Wrap with permission check
    return withAccountPermission(
      async () => {
        // Business logic here
        return { success: true, data: result };
      },
      {
        accountId: account.id,
        permission: 'module.action',
        client,
        resourceName: 'resource',
      },
    );
  },
  { schema: ActionSchema },
);
```

---

## 🗺️ Permission Mapping

### Users (Task 7.2)
- inviteUser → `members.create`
- updateUserProfile → `members.update`
- updateUserRole → `members.manage`
- updateUserStatus → `members.manage`
- assignAssetsToUser → `assets.manage`
- unassignAssetFromUser → `assets.manage`

### Assets (Task 7.3)
- createAsset → `assets.create`
- updateAsset → `assets.update`
- deleteAsset → `assets.delete`
- assignAsset → `assets.manage`
- unassignAsset → `assets.manage`

### Dashboard (Task 7.4)
- dismissAlert → `dashboard.manage`
- updateWidgetLayout → `dashboard.manage`
- refreshDashboardMetrics → `dashboard.view`

---

## ✅ Checklist Per Action

- [ ] Remove manual auth/membership/permission checks
- [ ] Wrap with `withAccountPermission`
- [ ] Use typed errors (NotFoundError, ConflictError, etc.)
- [ ] Add JSDoc with @permission tag
- [ ] Keep revalidatePath and logging
- [ ] Run `pnpm typecheck` ✅
- [ ] Run `pnpm lint:fix` ✅

---

## 📊 Expected Results

### Code Reduction
- **Before**: ~78 lines per action (average)
- **After**: ~45 lines per action (average)
- **Reduction**: 42% (proven in Task 7.1)

### Quality Improvements
- ✅ No duplicated auth/permission logic
- ✅ Consistent error handling
- ✅ Clear permission requirements
- ✅ Better error messages with context
- ✅ Comprehensive documentation

---

## 🆘 Need Help?

### TypeScript Errors?
→ Check **CONTINUATION_GUIDE.md** → Troubleshooting section

### Pattern Unclear?
→ Look at `licenses-server-actions-refactored.ts`

### Special Case?
→ Check **TASK_7_REFACTORING_GUIDE.md** → Special Cases section

---

## 🎉 Success Criteria

### When Task 7 is Complete
- ✅ 20/20 actions refactored
- ✅ All typecheck passing
- ✅ All lint passing
- ✅ ~40% code reduction achieved
- ✅ All JSDoc documentation added
- ✅ Ready for Phase 3 (testing)

---

## 📈 Timeline

**Current**: Task 7.1 Complete  
**Next**: Tasks 7.2-7.4 (4-5 hours)  
**Target**: End of Week 2

---

## 🔗 Quick Links

- **Start Here**: CONTINUATION_GUIDE.md
- **Detailed Guide**: TASK_7_REFACTORING_GUIDE.md
- **Reference Code**: `apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions-refactored.ts`
- **Progress**: TASK_7_STATUS.md
- **Overall Status**: PHASE2_PROGRESS_REPORT.md

---

**Last Updated**: November 20, 2025  
**Status**: Ready to continue  
**Next Action**: Start Task 7.2 (Users module)
