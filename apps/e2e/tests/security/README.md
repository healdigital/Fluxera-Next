# E2E Security Tests

This directory contains end-to-end security tests that verify the application's security controls are working correctly.

## Test Suites

### 1. Permission Enforcement Tests (`permissions.spec.ts`)

Tests that verify permission-based access control is properly enforced:

#### License Permission Tests
- ✅ Users without `licenses.create` cannot create licenses
- ✅ Users without `licenses.update` cannot edit licenses
- ✅ Users without `licenses.delete` cannot delete licenses
- ✅ Users without `licenses.manage` cannot assign licenses
- ✅ UI elements are disabled for users without permissions

#### Asset Permission Tests
- ✅ Users without `assets.create` cannot create assets
- ✅ Users without `assets.update` cannot edit assets
- ✅ Users without `assets.delete` cannot delete assets
- ✅ Users without `assets.manage` cannot assign assets
- ✅ UI elements are disabled for users without permissions

#### User Management Permission Tests
- ✅ Users without `members.manage` cannot invite users
- ✅ Users without `members.manage` cannot change user roles
- ✅ Users without `members.manage` cannot change user status
- ✅ UI elements are disabled for users without permissions

#### Read-Only Permission Tests
- ✅ Users with only view permissions can see but not modify data
- ✅ All modification buttons are disabled for read-only users
- ✅ Direct URL access to edit pages is blocked

### 2. Data Isolation Tests (`data-isolation.spec.ts`)

Tests that verify RLS policies prevent cross-account data access:

#### License Data Isolation
- ✅ Users cannot see licenses from other accounts
- ✅ Direct URL access to other accounts' licenses is blocked
- ✅ License assignments are isolated between accounts
- ✅ Assignment dialogs only show users/assets from current account

#### Asset Data Isolation
- ✅ Users cannot see assets from other accounts
- ✅ Direct URL access to other accounts' assets is blocked
- ✅ Asset assignments are isolated between accounts
- ✅ Assignment dialogs only show users from current account

#### User Data Isolation
- ✅ Users cannot see members from other accounts
- ✅ Direct URL access to other accounts' user details is blocked
- ✅ User activity logs are isolated between accounts
- ✅ User lists only show members from current account

#### Dashboard Data Isolation
- ✅ Dashboard metrics are isolated between accounts
- ✅ Dashboard alerts are isolated between accounts
- ✅ Each account sees only its own data in dashboards

## Running the Tests

### Run all security tests
```bash
cd apps/e2e
pnpm test tests/security/
```

### Run specific test suite
```bash
# Permission tests only
pnpm test tests/security/permissions.spec.ts

# Data isolation tests only
pnpm test tests/security/data-isolation.spec.ts
```

### Run in headed mode (see browser)
```bash
pnpm test tests/security/ --headed
```

### Run with debug mode
```bash
pnpm test tests/security/ --debug
```

### Run specific test
```bash
pnpm test tests/security/permissions.spec.ts -g "user without licenses.create"
```

## Test Architecture

### Test Setup Pattern
Each test follows this pattern:

1. **Setup**: Create test account(s) and data
2. **Action**: Attempt restricted operation
3. **Verification**: Verify operation is blocked or UI is disabled
4. **Cleanup**: Automatic cleanup via Playwright fixtures

### Permission Testing Strategy

Tests verify both:
- **UI-level protection**: Buttons disabled/hidden
- **Server-level protection**: Direct API/URL access blocked

This ensures defense-in-depth security.

### Data Isolation Testing Strategy

Tests verify:
- **List views**: Only show current account's data
- **Detail views**: Block access to other accounts' resources
- **Assignment dialogs**: Only show current account's users/assets
- **Dashboard metrics**: Only show current account's statistics

## Test Data

Tests use:
- **Random emails**: Generated via `auth.createRandomEmail()`
- **Unique names**: Timestamped to avoid conflicts
- **Isolated accounts**: Each test creates its own account(s)
- **Automatic cleanup**: Playwright handles cleanup

## Expected Behavior

### When Permission is Denied

The application should:
1. **Disable UI elements** (buttons, links) for unauthorized actions
2. **Show error messages** if user attempts direct URL access
3. **Redirect** to appropriate page if access is denied
4. **Log security events** (server-side)

### When Data is Isolated

The application should:
1. **Return empty lists** when accessing other accounts' data
2. **Show 404 or permission error** for direct resource access
3. **Filter dropdowns** to only show current account's data
4. **Prevent SQL injection** via RLS policies

## Troubleshooting

### Tests Failing Due to UI Changes

If UI elements have changed:
1. Update `data-test` attributes in components
2. Update selectors in test files
3. Verify button/dialog naming conventions

### Tests Failing Due to Permission Changes

If permission model has changed:
1. Update permission names in tests
2. Update role assignments in test setup
3. Verify RLS policies match test expectations

### Tests Failing Due to Timing Issues

If tests are flaky:
1. Increase `waitForTimeout` values
2. Add explicit waits for specific elements
3. Use `waitForURL` instead of `waitForTimeout`
4. Check for race conditions in server actions

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Security Tests
  run: |
    cd apps/e2e
    pnpm test tests/security/ --reporter=json
```

### Test Reports

Tests generate:
- **HTML report**: `apps/e2e/playwright-report/`
- **JSON report**: `apps/e2e/test-results.json`
- **JUnit XML**: `apps/e2e/test-results.xml`
- **Screenshots**: On failure only

## Security Test Coverage

### Current Coverage
- ✅ License CRUD operations (4 permissions)
- ✅ Asset CRUD operations (4 permissions)
- ✅ User management operations (3 permissions)
- ✅ License assignments (1 permission)
- ✅ Asset assignments (1 permission)
- ✅ Read-only access (2 scenarios)
- ✅ Cross-account data isolation (12 scenarios)

### Total Test Cases
- **Permission Tests**: 13 test cases
- **Data Isolation Tests**: 12 test cases
- **Total**: 25 security test cases

## Best Practices

### Writing New Security Tests

1. **Test both UI and API**: Verify UI is disabled AND server blocks requests
2. **Use unique data**: Timestamp all test data to avoid conflicts
3. **Test positive and negative**: Verify both allowed and denied scenarios
4. **Clean up**: Use Playwright's automatic cleanup
5. **Document**: Add comments explaining security expectations

### Maintaining Security Tests

1. **Run regularly**: Include in CI/CD pipeline
2. **Update with features**: Add tests for new permissions
3. **Review failures**: Security test failures are critical
4. **Keep in sync**: Update when permission model changes

## Related Documentation

- [Security Architecture](../../../../docs/security/ARCHITECTURE.md)
- [RLS Policies](../../../../apps/web/supabase/migrations/)
- [Permission System](../../../../packages/shared/src/lib/permission-helpers.ts)
- [Server Actions](../../../../apps/web/app/home/[account]/)

## Support

For questions or issues:
1. Check test output and screenshots
2. Review Playwright trace viewer
3. Verify database RLS policies
4. Check server action implementations
5. Contact security team if needed

---

**Last Updated**: November 20, 2025  
**Test Count**: 25 security tests  
**Coverage**: Permissions + Data Isolation  
**Status**: ✅ Ready for CI/CD
