# License Management System - Testing Guide

## Overview
This directory contains comprehensive testing resources for the license management system at `http://localhost:3000/home/makerkit/licenses`.

## Quick Start

### 1. Prerequisites
```bash
# Ensure development environment is running
pnpm dev

# Ensure Supabase is running
pnpm supabase:web:start

# Verify database is up to date
pnpm --filter web supabase migrations list
```

### 2. Run Automated Tests

#### Database Tests
```bash
# Run RLS policy tests
pnpm --filter web supabase test db

# Run custom database tests
pnpm --filter web tsx scripts/test-license-system.ts
```

#### E2E Tests
```bash
# Run all license E2E tests
pnpm --filter e2e test tests/licenses/licenses.spec.ts

# Run with UI for debugging
pnpm --filter e2e test:ui tests/licenses/licenses.spec.ts

# Run specific test
pnpm --filter e2e test tests/licenses/licenses.spec.ts -g "should create new license"
```

#### Performance Tests
```bash
# Run Lighthouse audit
pnpm --filter web tsx scripts/lighthouse-accessibility-audit.ts

# Run performance monitoring
pnpm --filter web tsx scripts/performance-audit.ts
```

### 3. Manual Testing
Follow the checklist in `MANUAL_TESTING_CHECKLIST.md`

## Testing Resources

### 📚 Documentation Files

1. **COMPREHENSIVE_TESTING_GUIDE.md**
   - Complete testing strategy
   - All test cases with expected results
   - Success criteria
   - Reporting guidelines

2. **MANUAL_TESTING_CHECKLIST.md**
   - Quick manual testing checklist
   - Critical path tests (15 min)
   - Detailed feature tests (30 min)
   - Responsive, accessibility, and security tests

3. **test-license-system.ts**
   - Automated database and API tests
   - Performance benchmarks
   - Data integrity checks

### 🎯 Test Coverage

#### Automated Tests
- ✅ Database schema and migrations
- ✅ RLS policies
- ✅ Database functions
- ✅ Data integrity
- ✅ Performance benchmarks
- ✅ E2E user flows

#### Manual Tests
- ✅ UI/UX functionality
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design
- ✅ Accessibility
- ✅ Security

## Test Execution Workflow

### Daily Development Testing
```bash
# Quick smoke test
pnpm --filter e2e test tests/licenses/licenses.spec.ts --grep "smoke"

# Run database tests
pnpm --filter web tsx scripts/test-license-system.ts
```

### Pre-Commit Testing
```bash
# Run type checking
pnpm typecheck

# Run linting
pnpm lint:fix

# Run formatting
pnpm format:fix

# Run E2E tests
pnpm --filter e2e test tests/licenses/
```

### Pre-Deployment Testing
```bash
# Full test suite
pnpm test

# E2E tests
pnpm --filter e2e test

# Database tests
pnpm --filter web supabase test db

# Performance audit
pnpm --filter web tsx scripts/lighthouse-accessibility-audit.ts

# Manual testing checklist
# Follow MANUAL_TESTING_CHECKLIST.md
```

## Test Data Setup

### Create Test Account
```sql
-- Insert test account
INSERT INTO accounts (id, name, slug, primary_owner_user_id)
VALUES (
  'test-account-id',
  'Test Account',
  'makerkit',
  'user-id'
);
```

### Create Sample Licenses
```sql
-- Insert sample licenses
INSERT INTO software_licenses (
  account_id,
  name,
  software_name,
  license_key,
  license_type,
  quantity,
  start_date,
  expiration_date,
  status
) VALUES
  (
    'test-account-id',
    'Adobe Creative Cloud',
    'Adobe CC',
    'ADOBE-CC-2024-XXXX',
    'subscription',
    10,
    NOW(),
    NOW() + INTERVAL '365 days',
    'active'
  ),
  (
    'test-account-id',
    'Microsoft Office 365',
    'Office 365',
    'MS-O365-2024-XXXX',
    'subscription',
    50,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active'
  ),
  (
    'test-account-id',
    'Expiring Soon License',
    'Test Software',
    'EXPIRING-2024-XXXX',
    'perpetual',
    5,
    NOW() - INTERVAL '335 days',
    NOW() + INTERVAL '7 days',
    'active'
  ),
  (
    'test-account-id',
    'Expired License',
    'Old Software',
    'EXPIRED-2023-XXXX',
    'perpetual',
    5,
    NOW() - INTERVAL '400 days',
    NOW() - INTERVAL '30 days',
    'expired'
  );
```

### Create Sample Users and Assets
```sql
-- Insert sample users
INSERT INTO account_users (account_id, user_id, role)
VALUES
  ('test-account-id', 'user-1-id', 'member'),
  ('test-account-id', 'user-2-id', 'member');

-- Insert sample assets
INSERT INTO assets (account_id, name, type, serial_number, status)
VALUES
  ('test-account-id', 'MacBook Pro 1', 'laptop', 'MBP-001', 'active'),
  ('test-account-id', 'MacBook Pro 2', 'laptop', 'MBP-002', 'active');
```

## Troubleshooting

### Tests Failing

#### Database Connection Issues
```bash
# Check if Supabase is running
pnpm supabase:web:status

# Restart Supabase
pnpm supabase:web:stop
pnpm supabase:web:start
```

#### Migration Issues
```bash
# Reset database
pnpm supabase:web:reset

# Regenerate types
pnpm supabase:web:typegen
```

#### E2E Test Issues
```bash
# Clear test data
pnpm --filter e2e test:cleanup

# Run with debug mode
DEBUG=pw:api pnpm --filter e2e test tests/licenses/

# Run headed mode to see browser
pnpm --filter e2e test tests/licenses/ --headed
```

### Common Issues

#### Issue: "Table does not exist"
**Solution**: Run migrations
```bash
pnpm --filter web supabase migrations up
```

#### Issue: "Permission denied"
**Solution**: Check RLS policies
```bash
pnpm --filter web supabase test db
```

#### Issue: "Function does not exist"
**Solution**: Check if migration was applied
```bash
pnpm --filter web supabase migrations list
```

#### Issue: E2E tests timeout
**Solution**: Increase timeout or check if dev server is running
```bash
# In playwright.config.ts, increase timeout
timeout: 60000 // 60 seconds
```

## Performance Benchmarks

### Expected Performance
- Page load: < 2s
- License list query: < 500ms
- License detail query: < 300ms
- Filter/search: < 200ms
- Create/update operations: < 1s

### Monitoring
```bash
# Run performance tests
pnpm --filter web tsx scripts/test-license-system.ts

# Check database query performance
# In Supabase Studio, go to Database > Query Performance
```

## Accessibility Standards

### WCAG 2.1 Level AA Compliance
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Form labels
- ✅ Error messages

### Testing Tools
- Lighthouse (automated)
- axe DevTools (browser extension)
- NVDA/JAWS (screen readers)
- Keyboard only navigation

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test-licenses.yml
name: License System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm supabase:web:start
      - run: pnpm --filter web tsx scripts/test-license-system.ts
      - run: pnpm --filter e2e test tests/licenses/
```

## Reporting Issues

### Issue Template
```markdown
**Test Case**: [Name of test that failed]
**Severity**: Critical / High / Medium / Low
**Environment**: Development / Staging / Production

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshots/Videos**:


**Console Errors**:


**Additional Context**:

```

## Success Criteria

### Definition of Done
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No critical or high severity bugs
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Stakeholder sign-off

### Quality Gates
- **Code Coverage**: > 80%
- **E2E Test Pass Rate**: 100%
- **Performance Score**: > 90
- **Accessibility Score**: > 95
- **Security Score**: > 90

## Additional Resources

### Related Documentation
- [Software Licenses Requirements](./requirements.md)
- [Software Licenses Design](./design.md)
- [Software Licenses Tasks](./tasks.md)
- [User Guide - Managing Licenses](../../docs/user-guide/licenses/managing-licenses.md)

### External Resources
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Best Practices](https://web.dev/performance/)

## Contact

For questions or issues with testing:
- Create an issue in the project repository
- Contact the development team
- Check the project documentation

---

**Last Updated**: 2024-11-18
**Version**: 1.0.0
