# Implementation Plan - Security & Quality Fixes

## Overview

This implementation plan addresses critical security, performance, and quality issues identified in the audit. Based on analysis of the current codebase, many foundational elements are already in place (RLS policies, basic functions, error handling utilities). This plan focuses on enhancing existing implementations with proper security clauses, permission checks, validation constraints, and standardized patterns.

**Current State Analysis:**
- ✅ RLS policies exist but lack permission-based checks (only membership checks)
- ✅ SQL functions exist but missing SECURITY clauses
- ✅ Basic error handling exists but needs standardized error classes
- ✅ Database schema is complete but missing CHECK constraints
- ❌ No permission helper functions
- ❌ No environment validation
- ❌ No security verification script

---

## Phase 1: Critical Security Fixes (Week 1)

### - [ ] 1. Enhance RLS Policies with Permission Checks
- [ ] 1.1 Create helper functions for RLS optimization
  - Create migration `20251120000000_rls_helper_functions.sql`
  - Implement `user_account_ids()` function returning account IDs for current user
  - Implement `user_has_permission(account_id, permission)` function for permission checks
  - Add composite indexes: `idx_accounts_memberships_user_account`, `idx_account_roles_permissions`
  - Test helper functions return correct results
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 1.2 Update RLS policies to use permission checks
  - Create migration `20251120000001_enhance_rls_policies.sql`
  - Update software_licenses INSERT policy to check `licenses.create` permission
  - Update software_licenses UPDATE policy to check `licenses.update` permission
  - Update software_licenses DELETE policy to check `licenses.delete` permission
  - Update assets INSERT policy to check `assets.create` permission
  - Update assets UPDATE policy to check `assets.update` permission
  - Update assets DELETE policy to check `assets.delete` permission
  - Update user_profiles UPDATE policy (admin) to check `members.manage` permission
  - Update license_renewal_alerts INSERT policy to check owner role or `licenses.manage`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.3 Test enhanced RLS policies
  - Create test script `apps/web/scripts/test-rls-policies.ts`
  - Test policies block users without permissions
  - Test policies allow users with correct permissions
  - Verify performance improvements with helper functions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

### - [ ] 2. Add SECURITY Clauses to SQL Functions
- [ ] 2.1 Add SECURITY clauses to existing functions
  - Create migration `20251120000002_add_security_clauses.sql`
  - Add SECURITY DEFINER + search_path to `check_license_expirations()`
  - Add SECURITY DEFINER + search_path to `create_asset_history_entry()`
  - Add SECURITY DEFINER + search_path to `log_user_activity()`
  - Add SECURITY INVOKER to `get_team_members()`
  - Add SECURITY INVOKER to `get_license_stats()`
  - Add SECURITY INVOKER to `get_licenses_with_assignments()`
  - Add SECURITY DEFINER + admin check to admin dashboard functions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.2 Add comprehensive SQL documentation
  - Add COMMENT statements to all functions explaining purpose
  - Document security model choice (DEFINER vs INVOKER)
  - Document permission requirements
  - Add usage examples in comments
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 2.3 Test function security
  - Create test script `apps/web/scripts/test-function-security.ts`
  - Verify SECURITY DEFINER functions execute with elevated privileges
  - Verify SECURITY INVOKER functions respect RLS
  - Test admin functions reject non-admin users
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

### - [ ] 3. Add Data Validation Constraints
- [ ] 3.1 Add CHECK constraints to existing tables
  - Create migration `20251120000003_add_validation_constraints.sql`
  - Add email format validation to user_profiles (RFC 5322 pattern)
  - Add display_name non-empty check to user_profiles
  - Add name non-empty check to software_licenses and assets
  - Add cost non-negative check to software_licenses
  - Add purchase_price non-negative check to assets
  - Add purchase_date not-future check to assets
  - Add warranty_expiry_date after purchase_date check to assets
  - Note: expiration_date and assignment target constraints already exist
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.2 Test validation constraints
  - Create test script `apps/web/scripts/test-validation-constraints.ts`
  - Test constraints reject invalid email formats
  - Test constraints reject empty required fields
  - Test constraints reject negative numbers
  - Test constraints reject future purchase dates
  - Verify error messages are clear and actionable
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

### - [ ] 4. Create Security Verification Script
- [ ] 4.1 Implement comprehensive security verification
  - Create `apps/web/scripts/verify-security-fixes.ts`
  - Implement `verifyRLSPolicies()` - check all policies use permission helpers
  - Implement `verifyFunctionSecurity()` - check all functions have SECURITY clauses
  - Implement `verifyConstraints()` - check all required CHECK constraints exist
  - Add detailed error reporting with specific missing items
  - Add success summary with counts
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 4.2 Test and document verification script
  - Run script against local database
  - Verify it detects missing security clauses
  - Verify it detects missing constraints
  - Create README documenting usage
  - Add to CI/CD pipeline
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 2: Application Layer Improvements (Week 2)

**Note:** Performance optimization with caching is deferred as it's not a security requirement. Focus on standardizing application patterns.

---

### - [ ] 5. Implement Standardized Error Classes
- [ ] 5.1 Extend existing error handling with typed error classes
  - Create `packages/shared/src/lib/app-errors.ts`
  - Implement `AppError` base class with code and statusCode
  - Implement `NotFoundError` extending AppError (404)
  - Implement `UnauthorizedError` extending AppError (401)
  - Implement `ValidationError` extending AppError (400)
  - Implement `ForbiddenError` extending AppError (403)
  - Export all error classes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.2 Integrate error classes with existing error-handler.ts
  - Update handleError() to recognize new error classes
  - Add type guards for each error class
  - Maintain backward compatibility with existing error handling
  - Update formatErrorForToast() to handle new errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

### - [ ] 6. Implement Permission Helper Functions
- [ ] 6.1 Create reusable permission verification utilities
  - Create `packages/shared/src/lib/permission-helpers.ts`
  - Implement `withAccountPermission<T>()` wrapper function
  - Add membership verification logic
  - Add permission verification using has_permission()
  - Throw UnauthorizedError on permission failures
  - Add JSDoc documentation with examples
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.2 Create permission helper tests
  - Create `packages/shared/src/lib/__tests__/permission-helpers.test.ts`
  - Test successful permission checks
  - Test failed membership checks
  - Test failed permission checks
  - Test error messages are descriptive
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

### - [ ] 7. Refactor Server Actions to Use New Patterns
- [ ] 7.1 Update licenses server actions
  - Refactor `licenses-server-actions.ts` to use withAccountPermission()
  - Replace try-catch with new error classes
  - Add comprehensive JSDoc documentation
  - Remove duplicated permission logic
  - Test all license operations still work
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 8.2_

- [ ] 7.2 Update users server actions
  - Refactor `users-server-actions.ts` to use withAccountPermission()
  - Replace try-catch with new error classes
  - Add comprehensive JSDoc documentation
  - Remove duplicated permission logic
  - Test all user operations still work
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 8.2_

- [ ] 7.3 Update assets server actions
  - Refactor `assets-server-actions.ts` to use withAccountPermission()
  - Replace try-catch with new error classes
  - Add comprehensive JSDoc documentation
  - Remove duplicated permission logic
  - Test all asset operations still work
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 8.2_

- [ ] 7.4 Update dashboard server actions
  - Refactor `dashboard-server-actions.ts` to use withAccountPermission()
  - Replace try-catch with new error classes
  - Add comprehensive JSDoc documentation
  - Test all dashboard operations still work
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 8.2_

---

---

## Phase 3: Testing & Documentation (Week 3)

### - [ ] 8. Write SQL Function Tests
- [ ] 8.1 Create pgTAP tests for security functions
  - Create `apps/web/supabase/tests/security-functions.test.sql`
  - Test `user_account_ids()` returns correct accounts
  - Test `user_has_permission()` validates permissions correctly
  - Test SECURITY DEFINER functions execute with elevated privileges
  - Test SECURITY INVOKER functions respect RLS
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8.2 Create pgTAP tests for enhanced RLS policies
  - Create `apps/web/supabase/tests/enhanced-rls.test.sql`
  - Test license policies check permissions (not just membership)
  - Test asset policies check permissions
  - Test user policies check permissions
  - Test policies block unauthorized users
  - Test policies allow authorized users
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8.3 Run and verify SQL tests
  - Set up pgTAP in local environment
  - Execute all SQL tests
  - Fix any failures
  - Document test results
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

### - [ ] 9. Write E2E Security Tests
- [ ] 9.1 Create permission enforcement tests
  - Create `apps/e2e/tests/security/permissions.spec.ts`
  - Test license operations require correct permissions
  - Test asset operations require correct permissions
  - Test user operations require correct permissions
  - Test users without permissions see disabled UI
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9.2 Create data isolation tests
  - Create `apps/e2e/tests/security/data-isolation.spec.ts`
  - Test users only see their account's data
  - Test users cannot access other accounts' data
  - Test RLS prevents cross-account data leaks
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9.3 Run and verify E2E security tests
  - Execute security tests in CI/CD
  - Verify all tests pass
  - Fix any failures
  - Document test coverage
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

### - [ ] 10. Add Comprehensive Documentation
- [ ] 10.1 Document security architecture
  - Create `docs/security/ARCHITECTURE.md`
  - Document RLS policy design and patterns
  - Document SECURITY clause usage guidelines
  - Document permission system architecture
  - Include diagrams and examples
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10.2 Document SQL functions
  - Add COMMENT statements to all new functions
  - Document security model choice (DEFINER vs INVOKER)
  - Document permission requirements
  - Add usage examples in comments
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 10.3 Document application patterns
  - Create `docs/security/APPLICATION_PATTERNS.md`
  - Document withAccountPermission() usage
  - Document error class usage
  - Provide code examples
  - Document best practices
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 10.4 Create security troubleshooting guide
  - Create `docs/security/TROUBLESHOOTING.md`
  - Document common permission errors
  - Document RLS debugging techniques
  - Document security verification process
  - Add FAQ section
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

### - [ ] 11. Implement Environment Validation
- [ ] 11.1 Create environment validation utility
  - Create `packages/shared/src/lib/env-validator.ts`
  - Define Zod schema for all required environment variables
  - Implement `validateEnv()` function
  - Add detailed error messages for missing/invalid variables
  - Export type-safe environment object
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11.2 Integrate environment validation
  - Add validation call in `apps/web/app/layout.tsx` or startup
  - Prevent application startup on validation failure
  - Log validation errors with details
  - Test with missing variables
  - Test with invalid variables
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

### - [ ] 12. Final Verification and Deployment
- [ ] 12.1 Run complete security verification
  - Execute `verify-security-fixes.ts` script
  - Verify all RLS policies have permission checks
  - Verify all functions have SECURITY clauses
  - Verify all constraints are in place
  - Document verification results
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12.2 Run complete test suite
  - Execute all SQL tests (pgTAP)
  - Execute all E2E security tests
  - Execute all unit tests
  - Verify 100% pass rate
  - Fix any failures
  - _Requirements: All_

- [ ] 12.3 Review and finalize documentation
  - Review all security documentation
  - Verify completeness and accuracy
  - Add missing sections
  - Create deployment checklist
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12.4 Create deployment plan
  - Document migration order
  - Create rollback procedures
  - Define monitoring metrics
  - Create post-deployment verification checklist
  - _Requirements: All_

- [ ] 12.5 Deploy to production
  - Apply migrations in order
  - Monitor for errors
  - Run verification script
  - Verify all functionality works
  - Create post-deployment report
  - _Requirements: All_

---

## Success Metrics

### Security (Critical)
- [ ] All RLS policies verify permissions (not just membership): ✅ Target: 100%
- [ ] All SQL functions have explicit SECURITY clauses: ✅ Target: 100%
- [ ] All critical columns have CHECK constraints: ✅ Target: 100%
- [ ] Security verification script passes: ✅ Target: 100%
- [ ] Zero permission bypass vulnerabilities: ✅ Target: 0

### Code Quality
- [ ] Standardized error handling across all modules: ✅ Target: 100%
- [ ] Permission helper usage in all server actions: ✅ Target: 100%
- [ ] Comprehensive JSDoc documentation: ✅ Target: 100%
- [ ] Code duplication reduction: ✅ Target: >50%

### Testing
- [ ] SQL function test coverage: ✅ Target: 100% of security functions
- [ ] E2E security test coverage: ✅ Target: All permission scenarios
- [ ] All tests passing: ✅ Target: 100%

### Documentation
- [ ] Security architecture documented: ✅ Target: Complete
- [ ] Application patterns documented: ✅ Target: Complete
- [ ] Troubleshooting guide created: ✅ Target: Complete
- [ ] SQL functions documented: ✅ Target: 100%

---

## Rollback Procedures

### Database Migrations Rollback
```bash
# Rollback in reverse order
pnpm --filter web supabase migrations down 20251120000003_add_validation_constraints
pnpm --filter web supabase migrations down 20251120000002_add_security_clauses
pnpm --filter web supabase migrations down 20251120000001_enhance_rls_policies
pnpm --filter web supabase migrations down 20251120000000_rls_helper_functions

# Verify rollback
pnpm --filter web supabase db diff
```

### Application Code Rollback
```bash
# Revert error classes
git revert <error-classes-commit>

# Revert permission helpers
git revert <permission-helpers-commit>

# Revert server actions refactoring
git revert <server-actions-commit>

# Redeploy
pnpm build
pnpm deploy
```

### Verification After Rollback
```bash
# Run tests to ensure system still works
pnpm test

# Check database state
pnpm --filter web supabase db diff

# Verify application functionality
pnpm e2e:test
```

---

## Implementation Notes

### Prerequisites
- Supabase CLI installed and configured
- pgTAP extension installed for SQL testing
- Local development environment set up
- Access to staging environment

### Development Workflow
1. Create migration files in `apps/web/supabase/migrations/`
2. Test migrations locally: `pnpm --filter web supabase db reset`
3. Run verification scripts after each phase
4. Ensure `pnpm typecheck` and `pnpm lint:fix` pass
5. Run E2E tests before deployment

### Key Principles
- **Security First**: All RLS policies must verify permissions, not just membership
- **Explicit Security**: All SQL functions must have explicit SECURITY clauses
- **Fail Safe**: Use CHECK constraints to prevent invalid data at database level
- **Standardization**: Use consistent patterns across all modules
- **Documentation**: Document security decisions and patterns

### Testing Strategy
- **SQL Tests**: Use pgTAP for database-level testing
- **E2E Tests**: Use Playwright for permission enforcement testing
- **Unit Tests**: Test helper functions and error classes
- **Verification Script**: Automated security verification

### Migration Strategy
- Apply migrations in order (helper functions → policies → constraints → security clauses)
- Test each migration independently
- Create rollback scripts for each migration
- Document breaking changes

---

**Plan Version**: 2.0  
**Created**: November 19, 2025  
**Updated**: November 19, 2025  
**Estimated Duration**: 3 weeks  
**Estimated Effort**: 120 hours  
**Priority**: High (Security Critical)
