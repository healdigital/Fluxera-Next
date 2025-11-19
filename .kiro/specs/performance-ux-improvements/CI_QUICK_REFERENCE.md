# CI Integration Quick Reference

## Overview

E2E tests run automatically in CI using GitHub Actions. This guide provides quick answers to common questions.

## When Do Tests Run?

Tests run automatically on:
- ✅ Pull requests to `main` or `develop`
- ✅ Pushes to `main` or `develop`
- ✅ Manual workflow dispatch (Actions tab)

## Where to Find Results?

### 1. PR Comments
Look for the "E2E Test Results" comment with:
- Pass/fail statistics
- Test counts
- Links to full reports

### 2. GitHub Checks
Check the "E2E Test Results" check run in the PR checks section.

### 3. Actions Tab
View full workflow logs in the Actions tab of the repository.

### 4. Artifacts
Download from the workflow run:
- `playwright-report` - HTML report (always)
- `test-screenshots` - Screenshots (on failure)
- `test-videos` - Videos (on failure)

## How Long Do Tests Take?

**Expected**: 15-20 minutes total
- Setup: 2-3 min
- Supabase: 2-3 min
- Build: 3-5 min
- Tests: 8-10 min
- Cleanup: 1 min

## What If Tests Fail?

### Step 1: Check PR Comment
Review the failed test names in the PR comment.

### Step 2: Download Artifacts
1. Go to the workflow run
2. Scroll to "Artifacts" section
3. Download `playwright-report`
4. Open `index.html` in browser

### Step 3: View Screenshots/Videos
Download `test-screenshots` or `test-videos` artifacts to see what happened.

### Step 4: Run Locally
```bash
# Start Supabase
pnpm supabase:web:start

# Run specific test
pnpm --filter web-e2e test tests/path/to/test.spec.ts

# Run in UI mode
pnpm --filter web-e2e test:ui
```

## Common Issues

### Tests Timeout
- Check if Supabase started correctly
- Review workflow logs for errors
- Verify migrations are valid

### Flaky Tests
- Add proper wait conditions
- Use `data-test` attributes
- Avoid hard-coded timeouts

### Build Failures
- Run `pnpm typecheck` locally
- Check for TypeScript errors
- Verify dependencies installed

## Environment Variables

All configured automatically in CI:
- Supabase: Local instance defaults
- Next.js: Local development URLs
- Playwright: CI-optimized settings

No secrets or manual configuration needed!

## Manual Workflow Dispatch

To run tests manually:
1. Go to Actions tab
2. Select "E2E Tests" workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

## Monitoring Test Health

Good indicators:
- ✅ Pass rate > 95%
- ✅ Execution time < 20 min
- ✅ No flaky tests
- ✅ All artifacts uploaded

## Getting Help

1. Check `apps/e2e/CI_SETUP.md` for detailed guide
2. Review workflow files in `.github/workflows/`
3. Check Playwright config in `apps/e2e/playwright.config.ts`
4. Ask team for help with persistent issues

## Quick Commands

```bash
# Run tests locally
pnpm --filter web-e2e test

# View HTML report
pnpm --filter web-e2e report

# Generate test summary
pnpm --filter web-e2e test:summary

# Run in UI mode (debugging)
pnpm --filter web-e2e test:ui

# Run specific test
pnpm --filter web-e2e test tests/assets/assets.spec.ts
```

## Workflow Files

- `.github/workflows/e2e-tests.yml` - Main test workflow
- `.github/workflows/e2e-test-report.yml` - PR reporting

## Documentation

- `apps/e2e/CI_SETUP.md` - Complete CI guide
- `TASK_12_COMPLETE.md` - Implementation details
- `E2E_TESTING_GUIDE.md` - E2E testing guide

## Status

✅ CI integration is production-ready and fully automated!
