# Running Security Tests

Quick reference guide for running E2E security tests in different environments.

---

## 🚀 Local Development

### Prerequisites

1. **Start the application:**
   ```bash
   # In root directory
   pnpm dev
   ```

2. **Start Supabase:**
   ```bash
   pnpm supabase:web:start
   ```

### Run Tests

```bash
# Navigate to E2E directory
cd apps/e2e

# Run all security tests
pnpm test tests/security/

# Run with UI (see browser)
pnpm test tests/security/ --headed

# Run specific suite
pnpm test tests/security/permissions.spec.ts
pnpm test tests/security/data-isolation.spec.ts

# Run specific test
pnpm test tests/security/permissions.spec.ts -g "licenses.create"

# Debug mode
pnpm test tests/security/ --debug
```

---

## 🔧 CI/CD Environments

### GitHub Actions

```yaml
name: Security Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start Supabase
        run: pnpm supabase:web:start
      
      - name: Start application
        run: |
          pnpm dev &
          sleep 30
      
      - name: Install Playwright browsers
        run: |
          cd apps/e2e
          pnpm exec playwright install chromium
      
      - name: Run security tests
        run: |
          cd apps/e2e
          pnpm test tests/security/ --reporter=json,junit,html
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: security-test-results
          path: |
            apps/e2e/playwright-report/
            apps/e2e/test-results/
            apps/e2e/test-results.json
            apps/e2e/test-results.xml
      
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: security-test-screenshots
          path: apps/e2e/test-results/**/*.png
```

### GitLab CI

```yaml
security-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  
  before_script:
    - npm install -g pnpm
    - pnpm install
    - pnpm supabase:web:start
    - pnpm dev &
    - sleep 30
  
  script:
    - cd apps/e2e
    - pnpm test tests/security/ --reporter=json,junit,html
  
  artifacts:
    when: always
    paths:
      - apps/e2e/playwright-report/
      - apps/e2e/test-results/
    reports:
      junit: apps/e2e/test-results.xml
```

---

## 🐳 Docker Environment

### Dockerfile for Testing

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/e2e/package.json ./apps/e2e/

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Start services and run tests
CMD ["sh", "-c", "pnpm supabase:web:start && pnpm dev & sleep 30 && cd apps/e2e && pnpm test tests/security/"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
    depends_on:
      - db
  
  db:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_PASSWORD=postgres
  
  tests:
    build: .
    command: sh -c "sleep 10 && cd apps/e2e && pnpm test tests/security/"
    depends_on:
      - app
      - db
    volumes:
      - ./apps/e2e/test-results:/app/apps/e2e/test-results
```

### Run with Docker

```bash
# Build and run
docker-compose up --build

# Run tests only
docker-compose run tests

# View results
docker-compose run tests cat /app/apps/e2e/test-results.json
```

---

## 📊 Test Reports

### View HTML Report

```bash
cd apps/e2e
pnpm playwright show-report
```

### Generate Custom Report

```bash
# JSON report
pnpm test tests/security/ --reporter=json > security-results.json

# JUnit XML (for CI/CD)
pnpm test tests/security/ --reporter=junit > security-results.xml

# Multiple reporters
pnpm test tests/security/ --reporter=json,junit,html
```

---

## 🔍 Debugging

### Run Single Test with Debug

```bash
cd apps/e2e
pnpm test tests/security/permissions.spec.ts -g "licenses.create" --debug
```

### View Trace

```bash
# After test failure
pnpm playwright show-trace test-results/[test-name]/trace.zip
```

### Headed Mode (See Browser)

```bash
pnpm test tests/security/ --headed --slowMo=1000
```

### Step Through Test

```bash
pnpm test tests/security/ --debug
# Use Playwright Inspector to step through
```

---

## 🎯 Test Filtering

### By Test Name

```bash
# Run tests matching pattern
pnpm test tests/security/ -g "permission"
pnpm test tests/security/ -g "isolation"
pnpm test tests/security/ -g "licenses"
```

### By File

```bash
# Run specific file
pnpm test tests/security/permissions.spec.ts

# Run multiple files
pnpm test tests/security/permissions.spec.ts tests/security/data-isolation.spec.ts
```

### By Tag (if implemented)

```bash
# Run tests with specific tag
pnpm test tests/security/ --grep @critical
pnpm test tests/security/ --grep @smoke
```

---

## ⚡ Performance Optimization

### Parallel Execution

```bash
# Run with more workers
pnpm test tests/security/ --workers=4

# Run fully parallel
pnpm test tests/security/ --fully-parallel
```

### Sharding (for CI/CD)

```bash
# Split tests across multiple machines
pnpm test tests/security/ --shard=1/3  # Machine 1
pnpm test tests/security/ --shard=2/3  # Machine 2
pnpm test tests/security/ --shard=3/3  # Machine 3
```

---

## 🐛 Troubleshooting

### Tests Timeout

```bash
# Increase timeout
pnpm test tests/security/ --timeout=120000
```

### Browser Not Found

```bash
# Install browsers
cd apps/e2e
pnpm exec playwright install chromium
```

### Port Already in Use

```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

```bash
# Reset Supabase
pnpm supabase:web:stop
pnpm supabase:web:start
```

### Clear Test Data

```bash
cd apps/e2e
rm -rf .auth/
rm -rf test-results/
```

---

## 📈 Monitoring

### Watch Mode

```bash
# Re-run tests on file changes
pnpm test tests/security/ --watch
```

### Update Snapshots

```bash
# Update visual snapshots (if any)
pnpm test tests/security/ --update-snapshots
```

---

## 🔐 Environment Variables

### Required Variables

```bash
# .env.local in apps/e2e/
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional Variables

```bash
# Enable specific tests
ENABLE_BILLING_TESTS=false
ENABLE_TEAM_ACCOUNT_TESTS=true

# Playwright configuration
PLAYWRIGHT_SERVER_COMMAND="pnpm dev"
CI=false
```

---

## 📝 Best Practices

### Before Running Tests

1. ✅ Ensure app is running (`pnpm dev`)
2. ✅ Ensure Supabase is running (`pnpm supabase:web:start`)
3. ✅ Clear old test data (`rm -rf apps/e2e/.auth/`)
4. ✅ Check environment variables

### During Development

1. ✅ Run tests frequently
2. ✅ Use headed mode to debug
3. ✅ Check screenshots on failure
4. ✅ Review trace files

### In CI/CD

1. ✅ Run on every PR
2. ✅ Block merge on failure
3. ✅ Upload artifacts
4. ✅ Monitor test duration

---

## 🎯 Quick Commands Reference

```bash
# Most common commands
pnpm test tests/security/                    # Run all
pnpm test tests/security/ --headed           # With UI
pnpm test tests/security/permissions.spec.ts # Specific file
pnpm test tests/security/ -g "licenses"      # Filter by name
pnpm test tests/security/ --debug            # Debug mode
pnpm playwright show-report                  # View report
```

---

**Last Updated**: November 20, 2025  
**Playwright Version**: 1.40.0  
**Node Version**: 20.x  
**Test Count**: 25 security tests
