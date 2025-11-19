# E2E Tests

End-to-end tests for the Fluxera asset management system using Playwright.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Supabase locally
pnpm supabase:web:start

# Run tests
pnpm --filter web-e2e test

# View test report
pnpm --filter web-e2e report

# Run tests in UI mode
pnpm --filter web-e2e test:ui
```

## Test Structure

```
tests/
├── assets/           # Asset management tests
├── licenses/         # License management tests
├── users/            # User management tests
├── dashboard/        # Dashboard tests
├── utils/            # Test utilities and helpers
├── fixtures/         # Test data fixtures
└── auth.setup.ts     # Authentication setup
```

## Available Scripts

- `pnpm test` - Run all tests
- `pnpm test:fast` - Run tests with 16 workers
- `pnpm test:ui` - Run tests in UI mode
- `pnpm test:setup` - Run authentication setup
- `pnpm test:summary` - Generate test summary
- `pnpm report` - View HTML test report

## CI Integration

Tests run automatically in GitHub Actions on pull requests and pushes.

See [CI_SETUP.md](./CI_SETUP.md) for detailed CI configuration.

## Writing Tests

See [tests/utils/README.md](./tests/utils/README.md) for test utilities and helpers.

## Configuration

Test configuration is in `playwright.config.ts`.
