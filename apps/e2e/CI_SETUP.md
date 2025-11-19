# E2E Tests CI Integration

This document describes the CI/CD integration for end-to-end tests using GitHub Actions.

## Overview

The E2E test suite runs automatically on:
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches
- Manual workflow dispatch

## Workflows

### 1. E2E Tests Workflow (`.github/workflows/e2e-tests.yml`)

This is the main workflow that runs the E2E tests.

**Steps:**
1. **Checkout code** - Gets the latest code from the repository
2. **Setup pnpm** - Installs pnpm package manager
3. **Setup Node.js** - Installs Node.js 20 with pnpm caching
4. **Install dependencies** - Installs all project dependencies
5. **Setup Supabase CLI** - Installs Supabase CLI
6. **Start Supabase** - Starts local Supabase instance with all migrations
7. **Wait for Supabase** - Ensures Supabase is ready before proceeding
8. **Generate types** - Generates TypeScript types from Supabase schema
9. **Build application** - Builds the Next.js application
10. **Install Playwright** - Installs Playwright browsers (Chromium only)
11. **Run E2E tests** - Executes all E2E tests
12. **Upload artifacts** - Uploads test reports, screenshots, and videos

**Artifacts:**
- `playwright-report` - HTML test report (retained for 30 days)
- `test-screenshots` - Screenshots of failed tests (retained for 7 days)
- `test-videos` - Videos of failed tests (retained for 7 days)

### 2. E2E Test Report Workflow (`.github/workflows/e2e-test-report.yml`)

This workflow runs after the E2E Tests workflow completes and posts results to PRs.

**Features:**
- Posts test results as PR comments
- Updates existing comments instead of creating duplicates
- Creates GitHub check runs with test status
- Includes pass/fail statistics
- Links to full test reports

## Environment Variables

### Required in CI

```yaml
# Supabase (uses local instance defaults)
SUPABASE_URL: http://127.0.0.1:54321
SUPABASE_ANON_KEY: <local-anon-key>
SUPABASE_SERVICE_ROLE_KEY: <local-service-role-key>

# Next.js
NEXT_PUBLIC_SITE_URL: http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY: <local-anon-key>

# Playwright
PLAYWRIGHT_SERVER_COMMAND: pnpm dev
CI: true

# Test configuration
ENABLE_BILLING_TESTS: false
ENABLE_TEAM_ACCOUNT_TESTS: true
```

### Optional Configuration

- `CI_WORKERS` - Number of parallel test workers (default: 2)
- Test timeouts are configured in `playwright.config.ts`

## Test Reporting

### In CI

Tests generate multiple report formats:
- **HTML Report** - Interactive report with screenshots and traces
- **JSON Report** - Machine-readable test results (`test-results.json`)
- **JUnit XML** - For CI integration (`test-results.xml`)
- **GitHub Actions** - Native GitHub annotations
- **List** - Console output

### Locally

Run tests locally with:
```bash
pnpm --filter web-e2e test
```

View the HTML report:
```bash
pnpm --filter web-e2e report
```

Generate a test summary:
```bash
pnpm --filter web-e2e test:summary
```

## Artifacts and Retention

| Artifact | Retention | When Created |
|----------|-----------|--------------|
| Playwright HTML Report | 30 days | Always |
| Test Screenshots | 7 days | On failure |
| Test Videos | 7 days | On failure |
| Test Results JSON | 30 days | Always |

## Debugging Failed Tests

### 1. View Test Report

Click on the "playwright-report" artifact in the GitHub Actions run to download the HTML report.

### 2. Check Screenshots

Failed tests automatically capture screenshots. Download the "test-screenshots" artifact.

### 3. Watch Videos

Tests that fail in CI record videos. Download the "test-videos" artifact.

### 4. View Traces

Traces are captured on first retry. Open them in Playwright Trace Viewer:
```bash
npx playwright show-trace trace.zip
```

### 5. Run Locally

Reproduce the issue locally:
```bash
# Start Supabase
pnpm supabase:web:start

# Run specific test
pnpm --filter web-e2e test tests/path/to/test.spec.ts

# Run in UI mode for debugging
pnpm --filter web-e2e test:ui
```

## Performance Optimization

### Parallel Execution

Tests run in parallel with 2 workers in CI. Adjust `CI_WORKERS` in `playwright.config.ts` based on CI resources.

### Test Isolation

Each test runs in isolation with:
- Fresh browser context
- Independent authentication state
- Isolated test data

### Caching

- Node modules are cached via pnpm
- Playwright browsers are cached
- Build artifacts are cached

## Troubleshooting

### Supabase Not Starting

If Supabase fails to start:
1. Check Docker is available in CI
2. Verify migrations are valid
3. Check timeout settings

### Tests Timing Out

If tests timeout:
1. Increase `timeout` in `playwright.config.ts`
2. Check for slow database queries
3. Verify network conditions

### Flaky Tests

If tests are flaky:
1. Add proper wait conditions
2. Use `data-test` attributes
3. Avoid hard-coded timeouts
4. Check for race conditions

### Build Failures

If build fails:
1. Run `pnpm typecheck` locally
2. Check for TypeScript errors
3. Verify all dependencies are installed

## Best Practices

### Writing CI-Friendly Tests

1. **Use data-test attributes** - More reliable than CSS selectors
2. **Wait for elements** - Use `waitFor` instead of `setTimeout`
3. **Clean up test data** - Use fixtures and cleanup helpers
4. **Avoid external dependencies** - Mock external APIs
5. **Keep tests independent** - Don't rely on test execution order

### Monitoring Test Health

1. **Track test duration** - Identify slow tests
2. **Monitor flakiness** - Fix flaky tests immediately
3. **Review failures** - Investigate all failures
4. **Update regularly** - Keep dependencies up to date

## Security Considerations

### Secrets Management

- Never commit real API keys
- Use local Supabase defaults in CI
- Store production secrets in GitHub Secrets
- Rotate keys regularly

### Test Data

- Use test-specific accounts
- Clean up after tests
- Don't use production data
- Isolate test environments

## Future Improvements

- [ ] Add visual regression testing
- [ ] Implement test sharding for faster execution
- [ ] Add performance benchmarks
- [ ] Create test coverage reports
- [ ] Add accessibility testing
- [ ] Implement cross-browser testing
