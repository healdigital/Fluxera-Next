# Task 19: E2E Tests Verification Guide

## Quick Start

This guide helps you verify that all E2E tests are working correctly.

## Prerequisites

### 1. Start Development Server
```bash
# Terminal 1
pnpm dev
```

Wait for the server to start and show:
```
✓ Ready in X.XXs
○ Local:   http://localhost:3000
```

### 2. Start Supabase
```bash
# Terminal 2
pnpm supabase:web:start
```

Wait for Supabase to be ready:
```
Started supabase local development setup.
API URL: http://localhost:54321
```

### 3. Verify Database
```bash
# Check database is accessible
pnpm supabase:web:status
```

## Running Tests

### Run All License Tests
```bash
cd apps/e2e
npx playwright test tests/licenses/licenses.spec.ts --reporter=list
```

### Expected Output
```
Running 26 tests using 5 workers

✓ [chromium] › License Management - Create License Flow › user can create a new license
✓ [chromium] › License Management - Create License Flow › validates expiration date
✓ [chromium] › License Management - Create License Flow › prevents duplicate keys
... (23 more tests)

26 passed (2.5m)
```

## Test Suites Breakdown

### Suite 1: Create License Flow (5 tests)
```bash
npx playwright test tests/licenses/licenses.spec.ts --grep "Create License Flow"
```

**Expected Results:**
- ✅ Create new license and see in list
- ✅ Validate expiration date after purchase date
- ✅ Prevent duplicate license keys
- ✅ Create multiple licenses with different types
- ✅ Form validates required fields

### Suite 2: Assign License Flows (7 tests)
```bash
npx playwright test tests/licenses/licenses.spec.ts --grep "Assign License Flows"
```

**Expected Results:**
- ✅ Assign license to team member
- ✅ Assign license to asset
- ✅ Unassign license
- ✅ Assignment count updates correctly
- ✅ Prevent duplicate user assignments
- ✅ Prevent duplicate asset assignments

### Suite 3: Update and Delete Flows (4 tests)
```bash
npx playwright test tests/licenses/licenses.spec.ts --grep "Update and Delete"
```

**Expected Results:**
- ✅ Edit license information
- ✅ Delete license without assignments
- ✅ Delete dialog shows warning with assignments
- ✅ Updated information persists after reload

### Suite 4: Filtering and Export Flows (10 tests)
```bash
npx playwright test tests/licenses/licenses.spec.ts --grep "Filtering and Export"
```

**Expected Results:**
- ✅ Filter by vendor
- ✅ Filter by license type
- ✅ Search by name
- ✅ Export to CSV
- ✅ Export filtered results only
- ✅ Display expiring soon badge
- ✅ Display expired badge
- ✅ Filter by expiration status (expiring soon)
- ✅ Filter by expiration status (expired)
- ✅ Visual highlighting of expired licenses

## Debugging Failed Tests

### View Test in Browser
```bash
npx playwright test tests/licenses/licenses.spec.ts --headed --debug
```

### View Test with UI Mode
```bash
npx playwright test tests/licenses/licenses.spec.ts --ui
```

### View Test Trace
```bash
# After a test fails, view the trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

### View Screenshots
Failed tests automatically capture screenshots in:
```
test-results/[test-name]/test-failed-1.png
```

## Common Issues

### Issue 1: Timeout Errors
**Symptom:** Tests fail with "Timeout 15000ms exceeded"

**Cause:** Development server not running

**Solution:**
```bash
# Start the server
pnpm dev
```

### Issue 2: Database Connection Errors
**Symptom:** Tests fail with database errors

**Cause:** Supabase not running or database not migrated

**Solution:**
```bash
# Reset database
pnpm supabase:web:reset

# Regenerate types
pnpm supabase:web:typegen
```

### Issue 3: Element Not Found
**Symptom:** Tests fail with "locator not found"

**Cause:** UI changes or missing data-test attributes

**Solution:**
1. Check if data-test attributes exist in components
2. Verify component is rendering
3. Check browser console for errors

### Issue 4: Flaky Tests
**Symptom:** Tests pass sometimes, fail other times

**Cause:** Race conditions or timing issues

**Solution:**
1. Check for proper waits in test code
2. Increase timeout if needed
3. Add explicit waits for dynamic content

## Test Coverage Verification

### Manual Verification Checklist

#### License Creation
- [ ] Can create a new license
- [ ] License appears in list after creation
- [ ] Form validates required fields
- [ ] Expiration date must be after purchase date
- [ ] Duplicate license keys are prevented
- [ ] Can create multiple license types

#### License Assignment
- [ ] Can assign license to user
- [ ] Can assign license to asset
- [ ] Can unassign license
- [ ] Assignment count updates correctly
- [ ] Duplicate assignments are prevented
- [ ] Assignments appear in detail view

#### License Update
- [ ] Can edit license information
- [ ] Updated information is saved
- [ ] Updated information persists after reload
- [ ] Edit form pre-populates with current data

#### License Deletion
- [ ] Can delete license without assignments
- [ ] Warning shown when deleting with assignments
- [ ] Confirmation required before deletion
- [ ] License removed from list after deletion

#### Filtering and Search
- [ ] Can filter by vendor
- [ ] Can filter by license type
- [ ] Can filter by expiration status
- [ ] Can search by name
- [ ] Can clear filters
- [ ] Filtered results are accurate

#### Export
- [ ] Can export licenses to CSV
- [ ] Export includes all license data
- [ ] Export respects current filters
- [ ] CSV file downloads successfully

#### Expiration Status
- [ ] Expiring soon badge displays correctly
- [ ] Expired badge displays correctly
- [ ] Visual highlighting for expired licenses
- [ ] Expiration filters work correctly

## Performance Benchmarks

### Expected Test Duration
- **Single test:** 5-30 seconds
- **Full suite:** 2-5 minutes
- **With retries:** Up to 10 minutes

### Acceptable Ranges
- ✅ < 3 minutes: Excellent
- ⚠️ 3-5 minutes: Good
- ❌ > 5 minutes: Needs optimization

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests - Licenses

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start Supabase
        run: pnpm supabase:web:start
      
      - name: Start dev server
        run: pnpm dev &
        
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run tests
        run: cd apps/e2e && npx playwright test tests/licenses/licenses.spec.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/e2e/playwright-report/
```

## Success Criteria

### All Tests Pass ✅
```
26 passed (2.5m)
```

### No Flaky Tests ✅
- Tests pass consistently
- No random failures
- No timing issues

### Good Performance ✅
- Tests complete in < 5 minutes
- No unnecessary waits
- Efficient test execution

### Comprehensive Coverage ✅
- All requirements tested
- All user flows covered
- Edge cases handled

## Reporting Issues

If tests fail, provide:
1. Test name that failed
2. Error message
3. Screenshot (in test-results/)
4. Trace file (if available)
5. Steps to reproduce
6. Environment details

## Next Steps After Verification

1. ✅ Confirm all tests pass
2. ✅ Review test coverage
3. ✅ Add to CI/CD pipeline
4. ✅ Document any issues
5. ✅ Update tests as needed

## Conclusion

This verification guide ensures that all E2E tests for the software licenses feature are working correctly. Follow the steps above to verify test execution and troubleshoot any issues.

**Status:** Ready for verification once development server is running.
