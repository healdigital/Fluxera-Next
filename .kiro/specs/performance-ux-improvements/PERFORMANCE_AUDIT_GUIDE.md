# Performance Audit Guide

This guide provides step-by-step instructions for conducting performance audits on the Fluxera application.

## Prerequisites

1. **Development Environment Running:**
   ```bash
   pnpm dev
   ```

2. **Test Account Setup:**
   - Ensure you have a test account with sample data
   - Assets, licenses, users, and dashboard should have realistic data volumes

3. **Browser Setup:**
   - Use Chrome (latest version)
   - Close unnecessary tabs and extensions
   - Use Incognito mode for consistent results

## Part 1: Lighthouse Audits

### Step 1: Run Lighthouse on Assets Page

1. Navigate to: `http://localhost:3000/home/[your-account]/assets`
2. Open Chrome DevTools (F12 or Cmd+Option+I)
3. Click on "Lighthouse" tab
4. Configuration:
   - Mode: Navigation
   - Device: Desktop
   - Categories: All (Performance, Accessibility, Best Practices, SEO)
5. Click "Analyze page load"
6. Wait for audit to complete (30-60 seconds)
7. Record the following in `PERFORMANCE_BASELINE_REPORT.md`:
   - Performance score
   - Accessibility score
   - Best Practices score
   - SEO score
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Total Blocking Time (TBT)
   - Cumulative Layout Shift (CLS)
   - Speed Index
8. Click "View Treemap" to analyze bundle size
9. Export report (optional): Click the download icon

### Step 2: Run Lighthouse on Licenses Page

Repeat Step 1 for: `http://localhost:3000/home/[your-account]/licenses`

### Step 3: Run Lighthouse on Users Page

Repeat Step 1 for: `http://localhost:3000/home/[your-account]/users`

### Step 4: Run Lighthouse on Dashboard Page

Repeat Step 1 for: `http://localhost:3000/home/[your-account]/dashboard`

## Part 2: Chrome DevTools Performance Analysis

### Step 1: Profile Assets Page

1. Navigate to: `http://localhost:3000/home/[your-account]/assets`
2. Open Chrome DevTools (F12)
3. Click on "Performance" tab
4. Click the "Record" button (circle icon)
5. Refresh the page (Cmd+R or Ctrl+R)
6. Wait for page to fully load
7. Click "Stop" button
8. Analyze the recording:
   - **Main Thread Activity:** Look for long tasks (yellow/red bars)
   - **Network:** Check request waterfall and timing
   - **Frames:** Look for dropped frames (red bars)
   - **Bottom-Up/Call Tree:** Identify expensive functions
9. Document bottlenecks in `PERFORMANCE_BASELINE_REPORT.md`:
   - Long JavaScript tasks (>50ms)
   - Slow network requests
   - Layout thrashing
   - Excessive re-renders

### Step 2: Profile Licenses Page

Repeat Step 1 for the Licenses page.

### Step 3: Profile Users Page

Repeat Step 1 for the Users page.

### Step 4: Profile Dashboard Page

Repeat Step 1 for the Dashboard page.

## Part 3: Network Analysis

### For Each Page:

1. Open Chrome DevTools (F12)
2. Click on "Network" tab
3. Ensure "Disable cache" is checked
4. Refresh the page
5. Record the following:
   - **Total requests:** Number shown at bottom
   - **Total transferred:** Size shown at bottom
   - **Finish time:** Time shown at bottom
   - **DOMContentLoaded:** Blue line timing
   - **Load:** Red line timing
6. Sort by "Size" to identify large resources
7. Sort by "Time" to identify slow requests
8. Document findings in `PERFORMANCE_BASELINE_REPORT.md`

## Part 4: Bundle Analysis

### Analyze JavaScript Bundles:

1. In Lighthouse report, click "View Treemap"
2. Identify largest dependencies:
   - Look for packages >100KB
   - Check for duplicate dependencies
   - Identify unused code
3. Document in report:
   - Total JavaScript size
   - Largest packages
   - Optimization opportunities

### Analyze CSS:

1. In Network tab, filter by "CSS"
2. Record total CSS size
3. Check for unused CSS using Coverage tool:
   - Open DevTools > More tools > Coverage
   - Click record
   - Refresh page
   - Stop recording
   - Review unused CSS percentage

## Part 5: Web Vitals Monitoring

### Real-Time Monitoring:

1. Install Web Vitals Chrome Extension (optional)
2. Navigate to each page
3. Check console for Web Vitals logs (if WebVitals component is added)
4. Record metrics:
   - FCP (First Contentful Paint)
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay) - requires interaction
   - CLS (Cumulative Layout Shift)
   - TTFB (Time to First Byte)

## Part 6: Interaction Performance

### Test User Interactions:

For each page, test and time the following:

1. **Search/Filter Operations:**
   - Type in search box
   - Apply filters
   - Measure response time (should be <1s)

2. **Form Submissions:**
   - Fill out forms
   - Submit
   - Measure time to feedback (should be <500ms for loading indicator)

3. **Navigation:**
   - Click between pages
   - Measure time to interactive

4. **Data Loading:**
   - Scroll through lists
   - Load more items (pagination)
   - Measure rendering time

## Part 7: Mobile Performance (Optional)

### Test on Mobile Device:

1. In Lighthouse, select "Mobile" device
2. Re-run all audits
3. Compare mobile vs desktop scores
4. Document mobile-specific issues

## Part 8: Document Findings

### Update PERFORMANCE_BASELINE_REPORT.md:

1. Fill in all measured metrics
2. Calculate averages across pages
3. List all identified bottlenecks
4. Prioritize issues by impact:
   - **Critical:** Blocks page load or causes errors
   - **High:** Significantly impacts user experience
   - **Medium:** Noticeable but not blocking
   - **Low:** Minor optimization opportunity

### Create Issue List:

For each identified issue, document:
- Description
- Impact (Critical/High/Medium/Low)
- Affected pages
- Recommended solution
- Estimated effort

## Performance Targets

### Lighthouse Scores (0-100):
- Performance: ≥ 85
- Accessibility: = 100
- Best Practices: ≥ 90
- SEO: ≥ 90

### Core Web Vitals:
- FCP: ≤ 1.8s (Good)
- LCP: ≤ 2.5s (Good)
- FID: ≤ 100ms (Good)
- CLS: ≤ 0.1 (Good)
- TTFB: ≤ 800ms (Good)

### Page Load Times:
- Initial render: ≤ 2s
- Time to Interactive: ≤ 3.5s
- Search/Filter response: ≤ 1s
- Form submission feedback: ≤ 500ms

## Tips for Accurate Measurements

1. **Consistency:**
   - Run tests multiple times
   - Use same network conditions
   - Clear cache between runs
   - Close other applications

2. **Realistic Data:**
   - Test with production-like data volumes
   - Include images and attachments
   - Test with various data states (empty, partial, full)

3. **Network Conditions:**
   - Test on different network speeds
   - Use Chrome DevTools Network throttling
   - Test both fast and slow connections

4. **Browser State:**
   - Use Incognito mode
   - Disable extensions
   - Clear cache when needed
   - Restart browser between major tests

## Next Steps After Audit

1. Review all documented metrics
2. Identify top 5 performance issues
3. Create optimization plan
4. Implement fixes incrementally
5. Re-test after each optimization
6. Document improvements

## Automation (Future)

Consider setting up:
- Lighthouse CI for automated audits
- Performance budgets
- Continuous monitoring
- Alerting for regressions
