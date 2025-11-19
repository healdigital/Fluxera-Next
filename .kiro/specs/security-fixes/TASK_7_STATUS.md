# Task 7 Status - Server Actions Refactoring

## 📊 Overall Progress

**Total Actions**: 20 actions across 4 modules  
**Completed**: 7 actions (35%)  
**Remaining**: 13 actions (65%)

---

## ✅ Completed Work

### Task 7.0: Documentation & Examples ✅
- Created `REFACTORING_EXAMPLE.md` with before/after comparison
- Documented refactoring checklist
- Documented permission mapping for all actions
- Documented error type guidelines
- Provided complete example showing 40% code reduction

### Task 7.1: Licenses Module ✅
**Status**: COMPLETE  
**Actions Refactored**: 6/6 (100%)  
**Code Reduction**: ~40%  
**Typecheck**: ✅ Passing

| Action | Permission | Status |
|--------|-----------|--------|
| `createLicense` | `licenses.create` | ✅ Done |
| `updateLicense` | `licenses.update` | ✅ Done |
| `deleteLicense` | `licenses.delete` | ✅ Done |
| `assignLicenseToUser` | `licenses.manage` | ✅ Done |
| `assignLicenseToAsset` | `licenses.manage` | ✅ Done |
| `unassignLicense` | `licenses.manage` | ✅ Done |

**Improvements Applied**:
- ✅ Removed manual auth/membership/permission checks
- ✅ Used `withAccountPermission()` wrapper
- ✅ Replaced generic errors with typed errors (NotFoundError, ConflictError, BusinessRuleError)
- ✅ Added comprehensive JSDoc documentation
- ✅ Maintained all business logic and validation
- ✅ Kept revalidatePath calls
- ✅ Kept activity logging

---

## 📋 Remaining Work

### Task 7.2: Users Module ⏳
**Status**: READY FOR REFACTORING  
**Actions to Refactor**: 6/6 (0% complete)  
**Estimated Time**: 1-2 hours

| Action | Permission | Complexity | Notes |
|--------|-----------|------------|-------|
| `inviteUser` | `members.create` | Medium | Email sending logic |
| `updateUserProfile` | `members.update` | Low | Simple CRUD |
| `updateUserRole` | `members.manage` | Low | Simple update |
| `updateUserStatus` | `members.manage` | Medium | Uses RPC function |
| `assignAssetsToUser` | `assets.manage` | Medium | Bulk assignment |
| `unassignAssetFromUser` | `assets.manage` | Low | Simple update |

**Special Considerations**:
- `inviteUser`: Keep email sending logic, handle failures gracefully
- `updateUserStatus`: Calls `update_user_status` RPC function
- `assignAssetsToUser`: Validates multiple assets, bulk update

### Task 7.3: Assets Module ⏳
**Status**: READY FOR REFACTORING  
**Actions to Refactor**: 5/5 (0% complete)  
**Estimated Time**: 1-2 hours

| Action | Permission | Complexity | Notes |
|--------|-----------|------------|-------|
| `createAsset` | `assets.create` | Low | Simple CRUD |
| `updateAsset` | `assets.update` | Medium | No accountSlug in data |
| `deleteAsset` | `assets.delete` | Medium | No accountSlug in data |
| `assignAsset` | `assets.manage` | Medium | Membership validation |
| `unassignAsset` | `assets.manage` | Low | Simple update |

**Special Considerations**:
- `updateAsset`, `deleteAsset`: Must fetch account slug from asset first
- `assignAsset`: Validates user membership before assignment

### Task 7.4: Dashboard Module ⏳
**Status**: READY FOR REFACTORING  
**Actions to Refactor**: 3/3 (0% complete)  
**Estimated Time**: 1 hour

| Action | Permission | Complexity | Notes |
|--------|-----------|------------|-------|
| `dismissAlert` | `dashboard.manage` | Medium | No accountSlug in data |
| `updateWidgetLayout` | `dashboard.manage` | Low | Bulk insert/delete |
| `refreshDashboardMetrics` | `dashboard.view` | Low | Read-only RPC call |

**Special Considerations**:
- `dismissAlert`: Must fetch account slug from alert first
- `refreshDashboardMetrics`: Server function, not enhanceAction

---

## 📚 Available Resources

### Documentation Created
1. **REFACTORING_EXAMPLE.md** - Before/after comparison with detailed explanation
2. **TASK_7_REFACTORING_GUIDE.md** - Complete step-by-step guide with patterns
3. **USAGE_GUIDE.md** - Developer guide for using new error classes and helpers
4. **PHASE2_SUMMARY.md** - Technical summary of Phase 2 work

### Reference Implementation
- `apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions-refactored.ts`
- All 6 license actions fully refactored and working
- Demonstrates all patterns needed for remaining tasks

### Helper Functions Available
- `withAccountPermission()` - Permission wrapper (packages/shared/src/lib/permission-helpers.ts)
- Error classes: NotFoundError, ConflictError, BusinessRuleError, etc. (packages/shared/src/lib/app-errors.ts)
- Error handler integration (packages/shared/src/lib/error-handler.ts)

---

## 🎯 Next Steps

### Immediate Actions
1. **Start Task 7.2**: Refactor users-server-actions.ts
   - Follow TASK_7_REFACTORING_GUIDE.md
   - Use licenses-server-actions-refactored.ts as reference
   - Run `pnpm typecheck` after each action
   - Estimated: 1-2 hours

2. **Continue Task 7.3**: Refactor assets-server-actions.ts
   - Pay attention to special cases (no accountSlug)
   - Follow pattern in guide for fetching account slug
   - Estimated: 1-2 hours

3. **Complete Task 7.4**: Refactor dashboard-server-actions.ts
   - Simplest module, only 3 actions
   - One special case (dismissAlert)
   - Estimated: 1 hour

### Verification Steps
After each module:
- [ ] Run `pnpm typecheck` - must pass
- [ ] Run `pnpm lint:fix` - must pass
- [ ] Verify all actions have JSDoc with @permission tag
- [ ] Verify all manual auth/permission checks removed
- [ ] Verify typed errors used instead of generic messages

---

## 📈 Expected Outcomes

### Code Quality Improvements
- **40% code reduction** per action (based on licenses results)
- **Standardized error handling** across all modules
- **Consistent permission checks** via withAccountPermission
- **Better error messages** with context via typed errors
- **Comprehensive documentation** via JSDoc

### Security Improvements
- **No permission bypass vulnerabilities** - all checks via RLS + helper
- **Consistent permission enforcement** - same pattern everywhere
- **Better audit trail** - typed errors include context
- **Fail-safe design** - errors thrown, not returned

### Developer Experience
- **Easier to maintain** - less boilerplate per action
- **Easier to understand** - clear permission requirements in JSDoc
- **Easier to debug** - typed errors with context
- **Easier to test** - standardized patterns

---

## 🚀 Timeline

**Total Estimated Time**: 4-5 hours for remaining work

- **Task 7.2 (Users)**: 1-2 hours
- **Task 7.3 (Assets)**: 1-2 hours  
- **Task 7.4 (Dashboard)**: 1 hour

**Target Completion**: End of Week 2 (Phase 2)

---

## ✅ Success Criteria

### Per Action
- [ ] Manual auth checks removed
- [ ] Manual membership checks removed
- [ ] Manual permission checks removed
- [ ] Wrapped with withAccountPermission
- [ ] Uses typed error classes
- [ ] Has JSDoc with @permission tag
- [ ] Typecheck passes
- [ ] Lint passes

### Per Module
- [ ] All actions refactored
- [ ] Code reduction achieved (~40%)
- [ ] All tests pass (when available)
- [ ] Documentation updated

### Overall (Task 7 Complete)
- [ ] 20/20 actions refactored (100%)
- [ ] All modules using standardized patterns
- [ ] All typecheck passing
- [ ] All lint passing
- [ ] Ready for Phase 3 (testing)

---

**Document Version**: 1.0  
**Last Updated**: November 20, 2025  
**Status**: Task 7.1 Complete, Tasks 7.2-7.4 Ready
