# Quick Start: Performance Audit

## 🚀 Quick Setup (5 minutes)

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Open Browser
Navigate to: `http://localhost:3000`

### 3. Open Chrome DevTools
Press `F12` or `Cmd+Option+I`

## 📊 Run Lighthouse Audits (20 minutes)

### For Each Page:
1. **Assets:** `/home/[account]/assets`
2. **Licenses:** `/home/[account]/licenses`
3. **Users:** `/home/[account]/users`
4. **Dashboard:** `/home/[account]/dashboard`

### Steps:
1. Navigate to page
2. Open DevTools → Lighthouse tab
3. Select: Desktop, All categories
4. Click "Analyze page load"
5. Record scores in `PERFORMANCE_BASELINE_REPORT.md`

### Record These Metrics:
- ✅ Performance score (target: ≥85)
- ✅ Accessibility score (target: 100)
- ✅ FCP - First Contentful Paint (target: ≤1.8s)
- ✅ LCP - Largest Contentful Paint (target: ≤2.5s)
- ✅ TBT - Total Blocking Time (target: ≤200ms)
- ✅ CLS - Cumulative Layout Shift (target: ≤0.1)

## 🔍 Chrome DevTools Performance (15 minutes)

### For Each Page:
1. DevTools → Performance tab
2. Click Record (●)
3. Refresh page
4. Wait for full load
5. Stop recording
6. Identify bottlenecks:
   - Long tasks (yellow/red bars >50ms)
   - Slow network requests
   - Layout shifts

## 📈 Web Vitals Monitoring (Automatic)

### Already Running!
Check browser console for real-time metrics:
```
[Web Vitals] FCP: { value: 1234, rating: 'good' }
[Web Vitals] LCP: { value: 2345, rating: 'good' }
[Web Vitals] CLS: { value: 0.05, rating: 'good' }
```

## 📝 Document Findings

### Update: `PERFORMANCE_BASELINE_REPORT.md`
1. Fill in all Lighthouse scores
2. Record Core Web Vitals
3. List identified bottlenecks
4. Note optimization opportunities

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Performance Score | ≥85 | ⏳ To measure |
| Accessibility Score | 100 | ⏳ To measure |
| FCP | ≤1.8s | ⏳ To measure |
| LCP | ≤2.5s | ⏳ To measure |
| TBT | ≤200ms | ⏳ To measure |
| CLS | ≤0.1 | ⏳ To measure |

## 🔗 Full Documentation

- **Detailed Guide:** `PERFORMANCE_AUDIT_GUIDE.md`
- **Baseline Report:** `PERFORMANCE_BASELINE_REPORT.md`
- **Task Summary:** `TASK_1_SUMMARY.md`

## ⚡ Quick Tips

1. **Use Incognito Mode** - Avoid extension interference
2. **Run Multiple Times** - Average results for accuracy
3. **Realistic Data** - Test with production-like data volumes
4. **Network Throttling** - Test on Fast 3G for realistic conditions
5. **Clear Cache** - Between runs for consistency

## 🐛 Common Issues

### Lighthouse Won't Run
- Close other tabs
- Disable extensions
- Use Incognito mode

### Inconsistent Results
- Run 3 times, take average
- Check for background processes
- Ensure stable network

### Low Scores
- Don't worry! This is the baseline
- Document issues for optimization
- Focus on biggest bottlenecks first

## ✅ Completion Checklist

- [ ] Development server running
- [ ] Lighthouse audits completed for all 4 pages
- [ ] Performance profiles captured
- [ ] Web Vitals monitored
- [ ] Baseline report filled in
- [ ] Top 5 issues identified
- [ ] Ready for optimization phase

## 🎉 Next Steps

After completing the audit:
1. Review documented metrics
2. Identify top performance issues
3. Prioritize by impact
4. Move to Task 2: Image Optimization
