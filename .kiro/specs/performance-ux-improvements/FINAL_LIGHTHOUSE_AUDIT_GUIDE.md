# Final Lighthouse Audit Guide

## Overview

This guide provides instructions for running comprehensive Lighthouse audits on all main pages of the Fluxera application to verify performance and accessibility targets have been met.

## Prerequisites

### 1. Build Production Version

```bash
# Build the production version
pnpm --filter web build

# Start the production server
pnpm --filter web start
```

### 2. Install Lighthouse CLI (Optional)

```bash
# Install globally
npm install -g lighthouse

# Or use npx (no installation required)
npx lighthouse --version
```

## Pages to Audit

### Team Account Pages

1. **Dashboard**: `http://localhost:3000/home/[account]/dashboard`
2. **Assets List**: `http://localhost:3000/home/[account]/assets`
3. **Asset Detail**: `http://localhost:3000/home/[account]/assets/[id]`
4. **Licenses List**: `http://localhost:3000/home/[account]/licenses`
5. **License Detail**: `http://localhost:3000/home/[account]/licenses/[id]`
6. **Users List**: `http://localhost:3000/home/[account]/users`
7. **User Detail**: `http://localhost:3000/home/[account]/users/[id]`

### Admin Pages

8. **Admin Dashboard**: `http://localhost:3000/admin/dashboard`

### Public Pages

9. **Home/Landing**: `http://localhost:3000/`
10. **Sign In**: `http://localhost:3000/auth/sign-in`

## Running Audits

### Method 1: Chrome DevTools (Recommended)

1. **Open Chrome DevTools**:
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Navigate to Lighthouse Tab**:
   - Click on the "Lighthouse" tab
   - If not visible, click the `>>` icon and select "Lighthouse"

3. **Configure Audit**:
   - **Mode**: Navigation (default)
   - **Device**: Desktop and Mobile (run both)
   - **Categories**: Select all:
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO

4. **Run Audit**:
   - Click "Analyze page load"
   - Wait for audit to complete (30-60 seconds)

5. **Save Results**:
   - Click "View Report"
   - Click the gear icon → "Save as HTML"
   - Save to: `.kiro/specs/performance-ux-improvements/lighthouse-reports/`

### Method 2: Lighthouse CLI

```bash
# Create reports directory
mkdir -p .kiro/specs/performance-ux-improvements/lighthouse-reports

# Run audit for a page (Desktop)
npx lighthouse http://localhost:3000/home/test-account/dashboard \
  --output html \
  --output-path .kiro/specs/performance-ux-improvements/lighthouse-reports/dashboard-desktop.html \
  --preset desktop \
  --chrome-flags="--headless"

# Run audit for a page (Mobile)
npx lighthouse http://localhost:3000/home/test-account/dashboard \
  --output html \
  --output-path .kiro/specs/performance-ux-improvements/lighthouse-reports/dashboard-mobile.html \
  --preset mobile \
  --chrome-flags="--headless"
```

### Method 3: Automated Script

Create a script to audit all pages:

```bash
# Create audit script
cat > scripts/run-lighthouse-audits.sh << 'EOF'
#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000"
ACCOUNT_SLUG="test-account"
REPORTS_DIR=".kiro/specs/performance-ux-improvements/lighthouse-reports"

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Pages to audit
declare -a PAGES=(
  "home:/"
  "dashboard:/home/$ACCOUNT_SLUG/dashboard"
  "assets:/home/$ACCOUNT_SLUG/assets"
  "licenses:/home/$ACCOUNT_SLUG/licenses"
  "users:/home/$ACCOUNT_SLUG/users"
  "admin:/admin/dashboard"
)

# Run audits
for page in "${PAGES[@]}"; do
  IFS=':' read -r name path <<< "$page"
  
  echo "Auditing $name (Desktop)..."
  npx lighthouse "$BASE_URL$path" \
    --output html \
    --output-path "$REPORTS_DIR/${name}-desktop.html" \
    --preset desktop \
    --chrome-flags="--headless" \
    --quiet
  
  echo "Auditing $name (Mobile)..."
  npx lighthouse "$BASE_URL$path" \
    --output html \
    --output-path "$REPORTS_DIR/${name}-mobile.html" \
    --preset mobile \
    --chrome-flags="--headless" \
    --quiet
done

echo "All audits complete! Reports saved to $REPORTS_DIR"
EOF

# Make executable
chmod +x scripts/run-lighthouse-audits.sh

# Run the script
./scripts/run-lighthouse-audits.sh
```

## Performance Targets

### Required Scores

| Category | Target | Status |
|----------|--------|--------|
| Performance | ≥ 85 | 🎯 Required |
| Accessibility | = 100 | 🎯 Required |
| Best Practices | ≥ 90 | ✅ Nice to have |
| SEO | ≥ 90 | ✅ Nice to have |

### Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| First Contentful Paint (FCP) | ≤ 1.8s | Time until first content appears |
| Largest Contentful Paint (LCP) | ≤ 2.5s | Time until largest content appears |
| Total Blocking Time (TBT) | ≤ 200ms | Time page is blocked from user input |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | Visual stability score |
| Speed Index | ≤ 3.4s | How quickly content is visually displayed |

## Interpreting Results

### Performance Score Breakdown

- **90-100**: Excellent - No action needed
- **50-89**: Needs improvement - Review opportunities
- **0-49**: Poor - Immediate action required

### Common Issues and Fixes

#### Performance Issues

1. **Large JavaScript Bundles**:
   - ✅ Already addressed with code splitting
   - ✅ Already addressed with package optimization
   - Verify chunks are loading correctly

2. **Unoptimized Images**:
   - Replace `<img>` with Next.js `<Image />`
   - Add width and height attributes
   - Use WebP/AVIF formats

3. **Render-Blocking Resources**:
   - Defer non-critical CSS
   - Inline critical CSS
   - Use font-display: swap

4. **Long Tasks**:
   - Break up long JavaScript execution
   - Use web workers for heavy computation
   - Implement progressive rendering

#### Accessibility Issues

1. **Missing ARIA Labels**:
   - Add `aria-label` to icon buttons
   - Add `aria-describedby` to form fields
   - Add `aria-live` to dynamic content

2. **Color Contrast**:
   - Ensure 4.5:1 ratio for normal text
   - Ensure 3:1 ratio for large text
   - Test with contrast checker tools

3. **Keyboard Navigation**:
   - Ensure all interactive elements are focusable
   - Add visible focus indicators
   - Test tab order

4. **Screen Reader Support**:
   - Add semantic HTML elements
   - Add skip navigation links
   - Test with screen reader

## Audit Checklist

### Pre-Audit

- [ ] Production build is running
- [ ] Test account is set up with sample data
- [ ] All features are functional
- [ ] No console errors in browser

### During Audit

- [ ] Run audit on all main pages
- [ ] Test both desktop and mobile
- [ ] Save all reports
- [ ] Document any issues found

### Post-Audit

- [ ] Review all scores
- [ ] Identify failing metrics
- [ ] Prioritize issues by impact
- [ ] Create action items for fixes

## Documenting Results

### Create Summary Report

Create a file: `.kiro/specs/performance-ux-improvements/FINAL_AUDIT_RESULTS.md`

```markdown
# Final Lighthouse Audit Results

## Audit Date
[Date]

## Environment
- Build: Production
- Server: Local (localhost:3000)
- Chrome Version: [Version]
- Lighthouse Version: [Version]

## Results Summary

### Desktop Scores

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Dashboard | XX | XX | XX | XX |
| Assets | XX | XX | XX | XX |
| Licenses | XX | XX | XX | XX |
| Users | XX | XX | XX | XX |
| Admin | XX | XX | XX | XX |

### Mobile Scores

| Page | Performance | Accessibility | Best Practices | SEO |
|------|-------------|---------------|----------------|-----|
| Dashboard | XX | XX | XX | XX |
| Assets | XX | XX | XX | XX |
| Licenses | XX | XX | XX | XX |
| Users | XX | XX | XX | XX |
| Admin | XX | XX | XX | XX |

## Core Web Vitals

### Dashboard (Desktop)
- FCP: X.Xs
- LCP: X.Xs
- TBT: XXXms
- CLS: X.XX
- Speed Index: X.Xs

### Dashboard (Mobile)
- FCP: X.Xs
- LCP: X.Xs
- TBT: XXXms
- CLS: X.XX
- Speed Index: X.Xs

## Issues Found

### Critical (Must Fix)
1. [Issue description]
   - Impact: [Performance/Accessibility/etc.]
   - Recommendation: [How to fix]

### Important (Should Fix)
1. [Issue description]
   - Impact: [Performance/Accessibility/etc.]
   - Recommendation: [How to fix]

### Minor (Nice to Fix)
1. [Issue description]
   - Impact: [Performance/Accessibility/etc.]
   - Recommendation: [How to fix]

## Comparison with Baseline

| Metric | Baseline | Current | Change |
|--------|----------|---------|--------|
| Performance Score | XX | XX | +/- XX |
| FCP | X.Xs | X.Xs | +/- X.Xs |
| LCP | X.Xs | X.Xs | +/- X.Xs |
| TBT | XXXms | XXXms | +/- XXXms |
| CLS | X.XX | X.XX | +/- X.XX |

## Recommendations

### Immediate Actions
1. [Action item]
2. [Action item]

### Future Optimizations
1. [Action item]
2. [Action item]

## Conclusion

[Summary of audit results and whether targets were met]
```

## Continuous Monitoring

### Set Up Lighthouse CI

For ongoing monitoring, consider setting up Lighthouse CI:

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm --filter web build
      - run: pnpm --filter web start &
      - run: sleep 10
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/home/test-account/dashboard
          uploadArtifacts: true
```

### Performance Budgets

Set performance budgets in `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 1.0}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Lighthouse fails to run**:
   - Ensure production server is running
   - Check port 3000 is not in use
   - Try running with `--chrome-flags="--no-sandbox"`

2. **Inconsistent scores**:
   - Run multiple audits and average results
   - Ensure no other processes are consuming resources
   - Use throttling for consistent network conditions

3. **Authentication required**:
   - Use Lighthouse with authentication:
     ```bash
     npx lighthouse URL --extra-headers="{\"Cookie\":\"session=...\"}"
     ```
   - Or create a test account with no auth required

## References

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance Budgets](https://web.dev/performance-budgets-101/)
