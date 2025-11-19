# Quick Start: Running SQL Tests

**Task 8 Complete!** Here's how to run the tests.

---

## Prerequisites

1. **Supabase must be running:**
   ```bash
   pnpm supabase:web:start
   ```

2. **PostgreSQL client installed:**
   - Already installed if you have Supabase CLI

---

## Run Tests

### Windows (PowerShell)
```powershell
cd apps\web\supabase\tests\sql
.\run-all-tests.ps1
```

### Unix/Linux/Mac
```bash
cd apps/web/supabase/tests/sql
chmod +x run-all-tests.sh
./run-all-tests.sh
```

---

## Expected Output

```
=========================================
SQL Security Tests Runner
=========================================

✓ Connected to Supabase database

=========================================
Running: 01_rls_helper_functions
=========================================
PASS: has_permission_by_name() returns true for valid permission
PASS: has_permission_by_name() returns false for missing permission
PASS: has_permission_by_name() returns false for non-existent permission
PASS: has_permission_by_name() handles null account ID
PASS: has_permission_by_name() works for multiple permissions
PASS: current_user_has_permission() works for authenticated user
PASS: Permission lookup performance is acceptable
PASS: Required indexes exist
✓ 01_rls_helper_functions completed successfully

=========================================
Running: 02_validation_constraints
=========================================
PASS: Constraint check_display_name_not_empty correctly rejected invalid data
PASS: Constraint check_phone_number_not_empty correctly rejected invalid data
PASS: Valid user profile accepted
... (13 more tests)
✓ 02_validation_constraints completed successfully

=========================================
Running: 03_rls_policies
=========================================
PASS: License owner can read
PASS: Non-owner cannot read licenses
PASS: Asset owner can create
... (6 more tests)
✓ 03_rls_policies completed successfully

=========================================
Test Summary
=========================================
Total test suites: 3
Passed: 3
Failed: 0
=========================================
All tests passed!
```

---

## What Gets Tested

### 1. RLS Helper Functions (8 tests)
- ✅ Permission checks work correctly
- ✅ Handles missing permissions
- ✅ Handles null values
- ✅ Performance is acceptable
- ✅ Indexes are in place

### 2. Validation Constraints (16 tests)
- ✅ Empty strings rejected
- ✅ Invalid dates rejected
- ✅ Negative costs rejected
- ✅ Invalid formats rejected
- ✅ Valid data accepted

### 3. RLS Policies (9 tests)
- ✅ Owners can access their data
- ✅ Non-owners cannot access data
- ✅ Users can read own profile
- ✅ Users cannot read other profiles
- ✅ Performance is acceptable

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Check Supabase is running
pnpm supabase:web:status

# Start if not running
pnpm supabase:web:start
```

### "psql: command not found"
PostgreSQL client is not installed. It should come with Supabase CLI.

### Tests fail
1. Check migrations are applied: `pnpm --filter web supabase migrations up`
2. Reset database if needed: `pnpm supabase:web:reset`
3. Check error messages in output

---

## Next Steps

1. **Run tests locally** to verify everything works
2. **Add to CI/CD** (see README.md for GitHub Actions example)
3. **Add to pre-commit hook** (optional)

---

## Documentation

- **Detailed Report:** [TASK_8_COMPLETION.md](./TASK_8_COMPLETION.md)
- **Test Guide:** [apps/web/supabase/tests/sql/README.md](../../apps/web/supabase/tests/sql/README.md)
- **Quick Summary:** [TASK_8_SUMMARY.md](./TASK_8_SUMMARY.md)

---

**Ready to test? Run the commands above!** 🚀
