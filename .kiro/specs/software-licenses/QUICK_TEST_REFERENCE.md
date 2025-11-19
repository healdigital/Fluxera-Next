# License System - Quick Test Reference Card

## 🚀 Quick Start (2 minutes)

```bash
# 1. Start services
pnpm supabase:web:start
pnpm dev

# 2. Open browser
http://localhost:3000/home/makerkit/licenses

# 3. Run tests
pnpm supabase:web:test
```

## ✅ 5-Minute Smoke Test

### Test 1: View Licenses (30 seconds)
- [ ] Page loads
- [ ] Licenses display
- [ ] No console errors

### Test 2: Create License (1 minute)
- [ ] Click "Create License"
- [ ] Fill: Name, Software, Key, Type, Quantity, Dates
- [ ] Submit
- [ ] Appears in list

### Test 3: View Details (30 seconds)
- [ ] Click license card
- [ ] Details display
- [ ] Tabs work (Details, Assignments, History)

### Test 4: Assign to User (1 minute)
- [ ] Click "Assign to User"
- [ ] Select user
- [ ] Assign
- [ ] Appears in list
- [ ] Seats decrease

### Test 5: Edit License (1 minute)
- [ ] Click "Edit"
- [ ] Change expiration date
- [ ] Save
- [ ] Updates display

### Test 6: Filter & Search (1 minute)
- [ ] Use status filter
- [ ] Results update
- [ ] Search by name
- [ ] Results filter

## 🔍 Critical Checks

### Database
```bash
# Check migrations
pnpm --filter web supabase migrations list

# Test RLS
pnpm supabase:web:test
```

### Frontend
- [ ] No console errors
- [ ] Loading states work
- [ ] Forms validate
- [ ] Success messages show

### Performance
- [ ] Page loads < 2s
- [ ] Interactions smooth
- [ ] No lag on filter/search

## 🐛 Common Issues

### Issue: Page won't load
**Fix**: Check if dev server is running
```bash
pnpm dev
```

### Issue: Database errors
**Fix**: Reset database
```bash
pnpm supabase:web:reset
```

### Issue: No licenses showing
**Fix**: Check account slug in URL
```
Should be: /home/makerkit/licenses
Not: /home/wrong-slug/licenses
```

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Smoke Test: ☐ PASS ☐ FAIL
Database: ☐ PASS ☐ FAIL
Frontend: ☐ PASS ☐ FAIL
Performance: ☐ PASS ☐ FAIL

Issues Found: ___________
___________________________
___________________________

Overall Status: ☐ READY ☐ NOT READY
```

## 🎯 Success Criteria

- ✅ All smoke tests pass
- ✅ No console errors
- ✅ Page loads < 2s
- ✅ All CRUD operations work
- ✅ Filters and search work
- ✅ Assignments work

## 📞 Need Help?

- Full Guide: `COMPREHENSIVE_TESTING_GUIDE.md`
- Manual Checklist: `MANUAL_TESTING_CHECKLIST.md`
- Test Summary: `SYSTEM_TEST_SUMMARY.md`
- Testing README: `TESTING_README.md`

---

**Quick Test Status**: ☐ PASS ☐ FAIL
**Time Taken**: _____ minutes
**Ready for Production**: ☐ YES ☐ NO
