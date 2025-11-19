# Manual Testing Checklist for License Management System

## Quick Start
1. Open browser to `http://localhost:3000`
2. Login with test account
3. Navigate to `http://localhost:3000/home/makerkit/licenses`

## 🎯 Critical Path Testing (15 minutes)

### Test 1: View License List
- [ ] Navigate to `/home/makerkit/licenses`
- [ ] Page loads without errors
- [ ] License cards display correctly
- [ ] Status badges show correct colors
- [ ] Expiration dates are visible

**Expected**: Clean, organized list of licenses with clear status indicators

### Test 2: Create New License
- [ ] Click "Create License" button
- [ ] Fill in form:
  - Name: "Test Adobe License"
  - Software: "Adobe Creative Cloud"
  - License Key: "TEST-ADOBE-2024-XXXX"
  - Type: "Subscription"
  - Quantity: 10
  - Start Date: Today
  - Expiration: 1 year from now
- [ ] Click "Create"
- [ ] Success message appears
- [ ] New license appears in list

**Expected**: License created successfully and visible immediately

### Test 3: View License Details
- [ ] Click on the newly created license
- [ ] Detail page loads
- [ ] All information is displayed correctly
- [ ] Tabs are visible (Details, Assignments, History)
- [ ] Edit and Delete buttons are present

**Expected**: Complete license information with navigation tabs

### Test 4: Assign License to User
- [ ] Click "Assign to User" button
- [ ] Select a user from the list
- [ ] Click "Assign"
- [ ] Success message appears
- [ ] User appears in Assignments tab
- [ ] Available seats decrease by 1

**Expected**: User successfully assigned, seat count updated

### Test 5: Edit License
- [ ] Click "Edit" button
- [ ] Change expiration date to 6 months from now
- [ ] Click "Save"
- [ ] Success message appears
- [ ] Detail page updates with new date

**Expected**: License updated successfully

### Test 6: Filter Licenses
- [ ] Return to license list
- [ ] Click "Status" filter
- [ ] Select "Active"
- [ ] Only active licenses display
- [ ] Change to "All"
- [ ] All licenses display again

**Expected**: Filtering works correctly

## 🔍 Detailed Feature Testing (30 minutes)

### Search Functionality
- [ ] Enter license name in search box
- [ ] Results filter in real-time
- [ ] Clear search
- [ ] Results reset
- [ ] Search by license key
- [ ] Correct results display

### Expiration Alerts
- [ ] Check if alert banner displays (if licenses expiring soon)
- [ ] Click on alert
- [ ] Navigates to correct license
- [ ] Dismiss alert
- [ ] Alert disappears

### Assign to Asset
- [ ] Open license detail
- [ ] Click "Assign to Asset"
- [ ] Select an asset
- [ ] Click "Assign"
- [ ] Asset appears in assignments
- [ ] Available seats decrease

### Unassign Operations
- [ ] In Assignments tab, click "Unassign" on a user
- [ ] Confirm action
- [ ] User removed from list
- [ ] Available seats increase
- [ ] Repeat for asset assignment

### Delete License
- [ ] Click "Delete" button
- [ ] Warning dialog appears
- [ ] Type license name to confirm
- [ ] Click "Delete"
- [ ] Redirects to license list
- [ ] License no longer appears

### Pagination
- [ ] If > 10 licenses, pagination controls appear
- [ ] Click "Next"
- [ ] Next page loads
- [ ] Click "Previous"
- [ ] Previous page loads
- [ ] Change items per page
- [ ] Display updates

### Sorting
- [ ] Click column header to sort
- [ ] Sort order changes (A-Z)
- [ ] Click again
- [ ] Sort order reverses (Z-A)
- [ ] Try different columns

## 📱 Responsive Testing (10 minutes)

### Mobile View (< 768px)
- [ ] Open DevTools
- [ ] Set viewport to iPhone 12 (390x844)
- [ ] License cards stack vertically
- [ ] Buttons are touch-friendly
- [ ] Forms are usable
- [ ] Dialogs fit screen
- [ ] Navigation works

### Tablet View (768px - 1024px)
- [ ] Set viewport to iPad (768x1024)
- [ ] Layout adjusts appropriately
- [ ] Cards display in grid
- [ ] All features accessible

## ♿ Accessibility Testing (10 minutes)

### Keyboard Navigation
- [ ] Tab through page
- [ ] All interactive elements focusable
- [ ] Focus indicator visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes dialogs
- [ ] No keyboard traps

### Screen Reader (Optional)
- [ ] Enable screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate through page
- [ ] All content is announced
- [ ] Form labels are read
- [ ] Error messages are announced
- [ ] Status changes are announced

### Color Contrast
- [ ] Text is readable
- [ ] Status badges are distinguishable
- [ ] Links are identifiable
- [ ] Focus indicators are visible

## 🚨 Error Handling Testing (10 minutes)

### Validation Errors
- [ ] Try to create license without name
- [ ] Error message displays
- [ ] Try to create with invalid date (expiration before start)
- [ ] Error message displays
- [ ] Try to create with quantity 0
- [ ] Error message displays

### Network Errors
- [ ] Open DevTools Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to create license
- [ ] Error message displays
- [ ] Set back to "Online"
- [ ] Retry works

### Permission Errors
- [ ] Try to access another account's licenses (if possible)
- [ ] Access denied or redirected
- [ ] Try to edit license without permission
- [ ] Error message displays

## ⚡ Performance Testing (5 minutes)

### Page Load
- [ ] Open DevTools Performance tab
- [ ] Reload page
- [ ] Check metrics:
  - First Contentful Paint < 1s
  - Largest Contentful Paint < 2.5s
  - Time to Interactive < 3s

### Interaction Performance
- [ ] Open Performance tab
- [ ] Record interaction (e.g., filter change)
- [ ] Stop recording
- [ ] Check for long tasks (> 50ms)
- [ ] Verify smooth animations

## 🔐 Security Testing (5 minutes)

### Data Isolation
- [ ] Verify only your account's licenses are visible
- [ ] Try to access license ID from another account (if known)
- [ ] Should be denied or show 404

### Input Sanitization
- [ ] Try to enter `<script>alert('xss')</script>` in name field
- [ ] Should be escaped/sanitized
- [ ] Try SQL injection in search: `'; DROP TABLE licenses; --`
- [ ] Should be handled safely

## 📊 Test Results Summary

### Pass/Fail Counts
- Critical Path: __ / 6 passed
- Detailed Features: __ / __ passed
- Responsive: __ / __ passed
- Accessibility: __ / __ passed
- Error Handling: __ / __ passed
- Performance: __ / __ passed
- Security: __ / __ passed

### Overall Status
- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Minor issues documented
- [ ] Ready for production

### Issues Found
1. Issue: _______________
   Severity: Critical / High / Medium / Low
   Steps to reproduce: _______________

2. Issue: _______________
   Severity: Critical / High / Medium / Low
   Steps to reproduce: _______________

## 🎬 Next Steps

After completing this checklist:
1. Document all issues in issue tracker
2. Prioritize fixes (Critical > High > Medium > Low)
3. Retest after fixes
4. Get sign-off from stakeholders
5. Prepare for deployment

## 📝 Notes

Add any additional observations or comments here:
_______________________________________________
_______________________________________________
_______________________________________________
