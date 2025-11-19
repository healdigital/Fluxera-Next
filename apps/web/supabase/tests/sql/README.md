# SQL Security Tests

Comprehensive test suite for database security functions, constraints, and RLS policies.

## Overview

This test suite validates:
- **RLS Helper Functions**: Permission checking functions
- **Validation Constraints**: Data integrity constraints
- **RLS Policies**: Row-level security access control

## Test Files

### 01_rls_helper_functions.test.sql
Tests for permission helper functions:
- `supamode.has_permission_by_name()` - Permission lookup by name
- `supamode.current_user_has_permission()` - Current user permission check
- Index usage and performance
- Edge cases (null values, non-existent permissions)

**Test Coverage:**
- ✅ Valid permission checks
- ✅ Missing permission handling
- ✅ Non-existent permission handling
- ✅ Null account ID handling
- ✅ Multiple permission checks
- ✅ Current user context
- ✅ Performance benchmarks
- ✅ Index verification

### 02_validation_constraints.test.sql
Tests for CHECK constraints on all tables:
- User profiles validation
- Software licenses validation
- Assets validation
- Accounts validation

**Test Coverage:**
- ✅ Empty string rejection
- ✅ Whitespace-only rejection
- ✅ Negative cost rejection
- ✅ Future date rejection
- ✅ Date ordering validation
- ✅ Format validation (slugs, emails)
- ✅ Valid data acceptance

### 03_rls_policies.test.sql
Tests for Row Level Security policies:
- Software licenses access control
- Assets access control
- License assignments access control
- User profiles access control
- Dashboard alerts access control

**Test Coverage:**
- ✅ Owner can read/write
- ✅ Non-owner cannot read/write
- ✅ User can read own profile
- ✅ User cannot read other profiles
- ✅ Account members can access shared data
- ✅ RLS performance benchmarks

## Running Tests

### Prerequisites

1. **Supabase must be running:**
   ```bash
   pnpm supabase:web:start
   ```

2. **PostgreSQL client tools installed:**
   - Linux/Mac: `psql` (usually included with PostgreSQL)
   - Windows: Install PostgreSQL or use WSL

### Run All Tests

**Linux/Mac:**
```bash
cd apps/web/supabase/tests/sql
chmod +x run-all-tests.sh
./run-all-tests.sh
```

**Windows (PowerShell):**
```powershell
cd apps\web\supabase\tests\sql
.\run-all-tests.ps1
```

### Run Individual Tests

```bash
# Set database URL (if different from default)
export SUPABASE_DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Run specific test
psql $SUPABASE_DB_URL -f 01_rls_helper_functions.test.sql
psql $SUPABASE_DB_URL -f 02_validation_constraints.test.sql
psql $SUPABASE_DB_URL -f 03_rls_policies.test.sql
```

## Test Output

### Success Output
```
=========================================
Running RLS Helper Functions Tests
=========================================
PASS: has_permission_by_name() returns true for valid permission
PASS: has_permission_by_name() returns false for missing permission
PASS: has_permission_by_name() returns false for non-existent permission
...
=========================================
All RLS Helper Functions Tests Passed!
=========================================
```

### Failure Output
```
ERROR:  Expected constraint violation did not occur for: check_name_not_empty
CONTEXT:  PL/pgSQL function tests.test_license_name_not_empty() line 10
```

## Test Architecture

### Transaction Isolation
All tests run within a transaction that is rolled back at the end:
```sql
begin;
-- ... tests ...
rollback;
```

This ensures:
- No test data persists in the database
- Tests can be run repeatedly
- No cleanup required

### Test Helper Functions
Common utilities for testing:
```sql
-- Assert constraint violation
tests.assert_constraint_violation(sql_text, constraint_name)

-- Simulate user context
set_config('request.jwt.claims', json_build_object('sub', user_id)::text, true)
```

### Performance Benchmarks
Tests include performance checks:
- Permission lookups should complete in < 1 second (100 checks)
- RLS queries should complete in < 100ms
- Index usage is verified

## Adding New Tests

### 1. Create Test File
```sql
-- apps/web/supabase/tests/sql/04_new_feature.test.sql
begin;

create schema if not exists tests;

-- Test setup
-- ...

-- Test functions
create or replace function tests.test_new_feature()
returns void
language plpgsql
as $
begin
  -- Test logic
  assert condition, 'Error message';
  raise notice 'PASS: Test description';
end;
$;

-- Run tests
do $
begin
  perform tests.test_new_feature();
end;
$;

rollback;
```

### 2. Add to Test Runner
Edit `run-all-tests.sh` and `run-all-tests.ps1`:
```bash
test_files=(
    "01_rls_helper_functions.test.sql"
    "02_validation_constraints.test.sql"
    "03_rls_policies.test.sql"
    "04_new_feature.test.sql"  # Add here
)
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: SQL Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: pnpm supabase:web:start
      - run: cd apps/web/supabase/tests/sql && ./run-all-tests.sh
```

## Troubleshooting

### Connection Issues
```bash
# Check Supabase is running
pnpm supabase:web:status

# Check database connection
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1"
```

### Permission Errors
```bash
# Ensure migrations are applied
pnpm --filter web supabase migrations up

# Reset database if needed
pnpm supabase:web:reset
```

### Test Failures
1. Check migration order (tests depend on migrations)
2. Verify test data setup
3. Check for conflicting data in database
4. Review error messages in output

## Best Practices

### Writing Tests
- ✅ Use descriptive test names
- ✅ Test both positive and negative cases
- ✅ Include edge cases (null, empty, invalid)
- ✅ Add performance benchmarks for critical paths
- ✅ Use transactions for isolation
- ✅ Clean up test data (rollback)

### Test Organization
- ✅ One test file per feature/migration
- ✅ Group related tests together
- ✅ Use consistent naming (XX_feature.test.sql)
- ✅ Document test purpose and coverage

### Performance
- ✅ Keep tests fast (< 1 second per test)
- ✅ Use indexes for lookups
- ✅ Minimize test data creation
- ✅ Benchmark critical operations

## Related Documentation

- [Security Fixes Requirements](../../../.kiro/specs/security-fixes/requirements.md)
- [RLS Helper Functions Migration](../../migrations/20251120000000_rls_helper_functions.sql)
- [Validation Constraints Migration](../../migrations/20251120000003_add_validation_constraints.sql)
- [Enhanced RLS Policies Migration](../../migrations/20251120000001_enhance_rls_policies.sql)

## Support

For issues or questions:
1. Check test output for specific error messages
2. Review related migration files
3. Verify Supabase is running correctly
4. Check database logs: `pnpm supabase:web:logs`
