# Performance Audit Checklist

Use this checklist to track your progress through the performance audit process.

## 🚀 Setup Phase

- [ ] Development server is running (`pnpm dev`)
- [ ] Browser is Chrome (latest version)
- [ ] Using Incognito mode (to avoid extension interference)
- [ ] Test account has realistic data volumes
- [ ] Console is open to view Web Vitals logs

## 📊 Lighthouse Audits (4 pages × 5 minutes = 20 minutes)

### Assets Page (`/home/[account]/assets`)
- [ ] Navigate to page
- [ ] Open DevTools → Lighthouse
- [ ] Run audit (Desktop, All categories)
- [ ] Record Performance score in baseline report
- [ ] Record Accessibility score in baseline report
- [ ] Record FCP, LCP, TBT, CLS, Speed Index
- [ ] Export report (optional)

### Licenses Page (`/home/[account]/licenses`)
- [ ] Navigate to page
- [ ] Open DevTools → Lighthouse
- [ ] Run audit (Desktop, All categories)
- [ ] Record Performance score in baseline report
- [ ] Record Accessibility score in baseline report
- [ ] Record FCP, LCP, TBT, CLS, Speed Index
- [ ] Export report (optional)

### Users Page (`/home/[account]/users`)
- [ ] Navigate to page
- [ ] Open DevTools → Lighthouse
- [ ] Run audit (Desktop, All categories)
- [ ] Record Performance score in baseline report
- [ ] Record Accessibility score in baseline report
- [ ] Record FCP, LCP, TBT, CLS, Speed Index
- [ ] Export report (optional)

### Dashboard Page (`/home/[account]/dashboard`)
- [ ] Navigate to page
- [ ] Open DevTools → Lighthouse
- [ ] Run audit (Desktop, All categories)
- [ ] Record Performance score in baseline report
- [ ] Record Accessibility score in baseline report
- [ ] Record FCP, LCP, TBT, CLS, Speed Index
- [ ] Export report (optional)

## 🔍 Chrome DevTools Performance Analysis (4 pages × 3 minutes = 12 minutes)

### Assets Page
- [ ] DevTools → Performance tab
- [ ] Record page load
- [ ] Identify long tasks (>50ms)
- [ ] Note slow network requests
- [ ] Document bottlenecks in baseline report

### Licenses Page
- [ ] DevTools → Performance tab
- [ ] Record page load
- [ ] Identify long tasks (>50ms)
- [ ] Note slow network requests
- [ ] Document bottlenecks in baseline report

### Users Page
- [ ] DevTools → Performance tab
- [ ] Record page load
- [ ] Identify long tasks (>50ms)
- [ ] Note slow network requests
- [ ] Document bottlenecks in baseline report

### Dashboard Page
- [ ] DevTools → Performance tab
- [ ] Record page load
- [ ] Identify long tasks (>50ms)
- [ ] Note slow network requests
- [ ] Document bottlenecks in baseline report

## 📈 Web Vitals Verification (Automatic)

- [ ] Verify FCP logs appear in console
- [ ] Verify LCP logs appear in console
- [ ] Verify CLS logs appear in console
- [ ] Verify FID/INP logs appear on interaction
- [ ] Record average values in baseline report

## 🌐 Network Analysis (4 pages × 2 minutes = 8 minutes)

### For Each Page:
- [ ] Assets page: Record total requests, transferred size, load time
- [ ] Licenses page: Record total requests, transferred size, load time
- [ ] Users page: Record total requests, transferred size, load time
- [ ] Dashboard page: Record total requests, transferred size, load time

## 📦 Bundle Analysis (5 minutes)

- [ ] Click "View Treemap" in Lighthouse report
- [ ] Identify packages >100KB
- [ ] Note largest dependencies
- [ ] Document in baseline report

## 🎯 Performance Targets Verification

### Check Against Targets:
- [ ] Performance scores ≥85?
- [ ] Accessibility scores = 100?
- [ ] FCP ≤1.8s?
- [ ] LCP ≤2.5s?
- [ ] TBT ≤200ms?
- [ ] CLS ≤0.1?

## 📝 Documentation (10 minutes)

- [ ] All Lighthouse scores recorded
- [ ] All Core Web Vitals recorded
- [ ] Performance bottlenecks documented
- [ ] Bundle sizes documented
- [ ] Top 5 issues identified
- [ ] Issues prioritized by impact
- [ ] Recommendations noted

## 🎉 Completion

- [ ] Baseline report is complete
- [ ] Average scores calculated
- [ ] Issues prioritized
- [ ] Ready to start optimizations
- [ ] Task 1 marked as complete

## ⏱️ Estimated Time

| Phase | Time |
|-------|------|
| Setup | 5 min |
| Lighthouse Audits | 20 min |
| Performance Analysis | 12 min |
| Network Analysis | 8 min |
| Bundle Analysis | 5 min |
| Documentation | 10 min |
| **Total** | **~60 min** |

## 📋 Quick Reference

### Performance Targets
- Performance: ≥85
- Accessibility: 100
- FCP: ≤1.8s
- LCP: ≤2.5s
- TBT: ≤200ms
- CLS: ≤0.1

### Pages to Audit
1. `/home/[account]/assets`
2. `/home/[account]/licenses`
3. `/home/[account]/users`
4. `/home/[account]/dashboard`

### Files to Update
- `PERFORMANCE_BASELINE_REPORT.md` - Record all metrics here

## 💡 Tips

- Run each audit 2-3 times and average the results
- Clear cache between runs for consistency
- Use Network throttling (Fast 3G) for realistic conditions
- Take screenshots of interesting findings
- Note any errors or warnings in console

## ✅ Sign-Off

- [ ] Audit completed by: ________________
- [ ] Date: ________________
- [ ] Baseline established: Yes / No
- [ ] Ready for optimization: Yes / No

---

**Next Step:** Review findings and proceed to Task 2 (Image Optimization)
