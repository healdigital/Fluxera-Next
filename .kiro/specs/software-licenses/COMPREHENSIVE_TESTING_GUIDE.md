# Comprehensive License Management System Testing Guide

## Overview
This guide provides a complete testing plan for the license management system at `http://localhost:3000/home/makerkit/licenses`.

## Prerequisites
- Development server running (`pnpm dev`)
- Supabase local instance running (`pnpm supabase:web:start`)
- Test account with slug `makerkit` exists
- Sample data loaded (assets, users)

## Testing Checklist

### 1. Database Layer Testing

#### 1.1 Verify Migrations
```bash
# Check if all license migrations are applied
pnpm --filter web supabase migrations list
```

Expected migrations:
- `20251117000006_software_licenses.sql` - Core tables and RLS
- `20251118000003_license_expiration_cron.sql` - Cron job for expiration checks
- `20251118000010_fix_license_functions.sql` - Function fixes

#### 1.2 Test RLS Policies
```bash
# Run RLS tests
pnpm --filter web supabase test db
```

Expected: All tests in `software-licenses-rls.test.sql` should pass.

#### 1.3 Verify Database Functions
```sql
-- Test get_account_licenses function
SELECT * FROM get_account_licenses('makerkit-account-id');

-- Test get_license_detail function
SELECT * FROM get_license_detail('license-id', 'makerkit-account-id');

-- Test check_license_expiration function
SELECT check_license_expiration();
```

### 2. E2E Testing

#### 2.1 Run License E2E Tests
```bash
# Run all license tests
pnpm --filter e2e test tests/licenses/licenses.spec.ts

# Run with UI for debugging
pnpm --filter e2e test:ui tests/licenses/licenses.spec.ts
```

Expected test coverage:
- ✓ License listing page loads
- ✓ Create new license
- ✓ Edit license
- ✓ Delete license
- ✓ Assign license to user
- ✓ Assign license to asset
- ✓ Filter licenses by status
- ✓ Search licenses
- ✓ View license details
- ✓ Expiration alerts display

### 3. Frontend Component Testing

#### 3.1 License Listing Page
**URL**: `http://localhost:3000/home/makerkit/licenses`

**Test Cases**:
1. **Page Load**
   - [ ] Page loads without errors
   - [ ] Loading skeleton displays initially
   - [ ] License cards render correctly
   - [ ] Empty state shows when no licenses

2. **Filtering**
   - [ ] Status filter works (Active, Expiring Soon, Expired, All)
   - [ ] Type filter works (if implemented)
   - [ ] Filters persist on page refresh

3. **Search**
   - [ ] Search by license name works
   - [ ] Search by license key works
   - [ ] Search by software name works
   - [ ] Search results update in real-time

4. **Sorting**
   - [ ] Sort by name (A-Z, Z-A)
   - [ ] Sort by expiration date
   - [ ] Sort by status

5. **Pagination**
   - [ ] Pagination controls display when > 10 licenses
   - [ ] Page navigation works
   - [ ] Items per page selector works

6. **Expiration Alerts**
   - [ ] Alert banner shows for expiring licenses
   - [ ] Alert count is accurate
   - [ ] Clicking alert navigates to license detail

#### 3.2 Create License Form
**Action**: Click "Create License" button

**Test Cases**:
1. **Form Validation**
   - [ ] Required fields show error when empty
   - [ ] License key format validation works
   - [ ] Date validation (expiration > start date)
   - [ ] Quantity validation (> 0)

2. **Form Submission**
   - [ ] Success message displays
   - [ ] New license appears in list
   - [ ] Form resets after submission
   - [ ] Dialog closes automatically

3. **Error Handling**
   - [ ] Duplicate license key shows error
   - [ ] Network errors display user-friendly message
   - [ ] Form stays open on error

#### 3.3 License Detail View
**Action**: Click on a license card

**Test Cases**:
1. **Information Display**
   - [ ] All license details visible
   - [ ] Status badge shows correct color
   - [ ] Expiration countdown accurate
   - [ ] Usage statistics display

2. **Assignments Tab**
   - [ ] User assignments list loads
   - [ ] Asset assignments list loads
   - [ ] Assignment counts are accurate
   - [ ] Unassign actions work

3. **History Tab**
   - [ ] Activity history displays
   - [ ] Events are chronological
   - [ ] Event details are complete

#### 3.4 Edit License Form
**Action**: Click "Edit" on license detail page

**Test Cases**:
1. **Form Pre-population**
   - [ ] All fields pre-filled with current values
   - [ ] Dates formatted correctly
   - [ ] Dropdown selections correct

2. **Form Submission**
   - [ ] Changes save successfully
   - [ ] Detail view updates immediately
   - [ ] Success notification displays

3. **Validation**
   - [ ] Cannot set expiration before start date
   - [ ] Cannot reduce quantity below assigned count
   - [ ] License key uniqueness validated

#### 3.5 Delete License
**Action**: Click "Delete" on license detail page

**Test Cases**:
1. **Confirmation Dialog**
   - [ ] Warning message displays
   - [ ] Shows count of assignments
   - [ ] Cancel button works
   - [ ] Confirm button requires typing license name

2. **Deletion**
   - [ ] License removed from database
   - [ ] Redirects to license list
   - [ ] Success message displays
   - [ ] Assignments are cleaned up

#### 3.6 Assign to User
**Action**: Click "Assign to User" button

**Test Cases**:
1. **User Selection**
   - [ ] User list loads
   - [ ] Search users works
   - [ ] Shows only unassigned users
   - [ ] Displays user details (name, email, role)

2. **Assignment**
   - [ ] Assignment creates successfully
   - [ ] User appears in assignments list
   - [ ] Available seats decrease
   - [ ] Notification sent to user (if enabled)

3. **Validation**
   - [ ] Cannot assign if no seats available
   - [ ] Cannot assign same user twice
   - [ ] Error handling for failed assignments

#### 3.7 Assign to Asset
**Action**: Click "Assign to Asset" button

**Test Cases**:
1. **Asset Selection**
   - [ ] Asset list loads
   - [ ] Search assets works
   - [ ] Shows only unassigned assets
   - [ ] Displays asset details (name, type, serial)

2. **Assignment**
   - [ ] Assignment creates successfully
   - [ ] Asset appears in assignments list
   - [ ] Available seats decrease
   - [ ] Asset detail page updates

### 4. Backend Testing

#### 4.1 Server Actions
Test file: `apps/web/app/home/[account]/licenses/_lib/server/licenses-server-actions.ts`

**Test Cases**:
1. **createLicense**
   - [ ] Creates license with valid data
   - [ ] Validates schema
   - [ ] Enforces RLS
   - [ ] Returns success response

2. **updateLicense**
   - [ ] Updates license fields
   - [ ] Validates ownership
   - [ ] Handles partial updates
   - [ ] Returns updated data

3. **deleteLicense**
   - [ ] Deletes license and assignments
   - [ ] Validates ownership
   - [ ] Handles cascade deletes
   - [ ] Returns success

4. **assignLicenseToUser**
   - [ ] Creates user assignment
   - [ ] Validates seat availability
   - [ ] Prevents duplicate assignments
   - [ ] Updates license usage

5. **assignLicenseToAsset**
   - [ ] Creates asset assignment
   - [ ] Validates seat availability
   - [ ] Prevents duplicate assignments
   - [ ] Updates license usage

#### 4.2 Loaders
Test file: `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts`

**Test Cases**:
1. **loadLicensesPageData**
   - [ ] Returns licenses for account
   - [ ] Applies filters correctly
   - [ ] Handles pagination
   - [ ] Returns alerts

2. **loadLicenseDetail**
   - [ ] Returns complete license data
   - [ ] Includes assignments
   - [ ] Includes history
   - [ ] Validates access

### 5. Notification System Testing

#### 5.1 Expiration Alerts
**Test Cases**:
1. **Alert Generation**
   - [ ] Alerts created for licenses expiring in 30 days
   - [ ] Alerts created for licenses expiring in 7 days
   - [ ] Alerts created for expired licenses
   - [ ] No duplicate alerts

2. **Alert Display**
   - [ ] Alert banner shows on license list page
   - [ ] Alert count is accurate
   - [ ] Alerts are dismissible
   - [ ] Dismissed alerts don't reappear

3. **Email Notifications**
   - [ ] Emails sent to account admins
   - [ ] Email content is correct
   - [ ] Email links work
   - [ ] Unsubscribe link works

#### 5.2 Cron Job
**Test Cases**:
1. **Manual Execution**
```bash
# Run the expiration check script
pnpm --filter web tsx scripts/run-license-alerts.ts
```
   - [ ] Script runs without errors
   - [ ] Alerts are created
   - [ ] Emails are queued
   - [ ] Logs are generated

2. **Scheduled Execution**
   - [ ] Cron job runs daily at configured time
   - [ ] Job logs are accessible
   - [ ] Failed jobs are retried
   - [ ] Monitoring alerts work

### 6. Performance Testing

#### 6.1 Page Load Performance
**Test Cases**:
1. **Initial Load**
   - [ ] Time to First Byte < 200ms
   - [ ] First Contentful Paint < 1s
   - [ ] Largest Contentful Paint < 2.5s
   - [ ] Time to Interactive < 3s

2. **Data Loading**
   - [ ] License list loads in < 500ms (10 items)
   - [ ] License detail loads in < 300ms
   - [ ] Filters apply in < 100ms
   - [ ] Search results in < 200ms

3. **Large Datasets**
   - [ ] 100 licenses load without lag
   - [ ] 1000 licenses paginate correctly
   - [ ] Filtering remains fast
   - [ ] No memory leaks

#### 6.2 Database Performance
**Test Cases**:
1. **Query Performance**
```sql
-- Test query execution time
EXPLAIN ANALYZE SELECT * FROM get_account_licenses('account-id');
```
   - [ ] Query execution < 50ms
   - [ ] Indexes are used
   - [ ] No sequential scans on large tables

2. **Concurrent Operations**
   - [ ] Multiple users can create licenses simultaneously
   - [ ] No deadlocks occur
   - [ ] Transactions are isolated

### 7. Accessibility Testing

#### 7.1 Keyboard Navigation
**Test Cases**:
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes dialogs
- [ ] Arrow keys navigate lists
- [ ] Focus visible on all elements

#### 7.2 Screen Reader
**Test Cases**:
- [ ] All images have alt text
- [ ] Form labels are associated
- [ ] Error messages are announced
- [ ] Status changes are announced
- [ ] ARIA labels are present

#### 7.3 Color Contrast
**Test Cases**:
- [ ] Text meets WCAG AA (4.5:1)
- [ ] Interactive elements meet WCAG AA
- [ ] Status badges are distinguishable
- [ ] Focus indicators are visible

### 8. Security Testing

#### 8.1 Authorization
**Test Cases**:
1. **RLS Enforcement**
   - [ ] Users can only see their account's licenses
   - [ ] Cannot access other accounts' licenses
   - [ ] Cannot modify other accounts' licenses
   - [ ] Admin bypass works correctly

2. **API Security**
   - [ ] Server actions validate ownership
   - [ ] CSRF protection enabled
   - [ ] Rate limiting works
   - [ ] Input sanitization applied

#### 8.2 Data Validation
**Test Cases**:
- [ ] SQL injection prevented
- [ ] XSS attacks blocked
- [ ] File upload validation (if applicable)
- [ ] URL parameter validation

### 9. Error Handling Testing

#### 9.1 Network Errors
**Test Cases**:
- [ ] Offline mode shows appropriate message
- [ ] Failed requests can be retried
- [ ] Partial failures handled gracefully
- [ ] Loading states clear on error

#### 9.2 Validation Errors
**Test Cases**:
- [ ] Field-level errors display
- [ ] Form-level errors display
- [ ] Error messages are clear
- [ ] Errors are dismissible

#### 9.3 Server Errors
**Test Cases**:
- [ ] 500 errors show user-friendly message
- [ ] Error boundaries catch React errors
- [ ] Errors are logged
- [ ] Recovery options provided

### 10. Mobile Responsiveness

#### 10.1 Layout
**Test Cases**:
- [ ] License cards stack on mobile
- [ ] Forms are usable on small screens
- [ ] Tables scroll horizontally
- [ ] Buttons are touch-friendly (44x44px min)

#### 10.2 Touch Interactions
**Test Cases**:
- [ ] Swipe gestures work (if implemented)
- [ ] Pull to refresh works (if implemented)
- [ ] Touch targets are adequate
- [ ] No hover-only interactions

## Test Execution Order

1. **Setup Phase**
   - Start development server
   - Start Supabase
   - Verify migrations
   - Load test data

2. **Automated Tests**
   - Run E2E tests
   - Run RLS tests
   - Run performance tests

3. **Manual Tests**
   - Frontend component testing
   - User flow testing
   - Accessibility testing
   - Mobile testing

4. **Verification Phase**
   - Check logs for errors
   - Verify data integrity
   - Review performance metrics
   - Document issues

## Test Data Setup

### Sample Licenses
```sql
-- Insert test licenses
INSERT INTO software_licenses (account_id, name, software_name, license_key, license_type, quantity, start_date, expiration_date, status)
VALUES
  ('account-id', 'Adobe Creative Cloud', 'Adobe CC', 'ADOBE-CC-2024-XXXX', 'subscription', 10, NOW(), NOW() + INTERVAL '365 days', 'active'),
  ('account-id', 'Microsoft Office 365', 'Office 365', 'MS-O365-2024-XXXX', 'subscription', 50, NOW(), NOW() + INTERVAL '30 days', 'active'),
  ('account-id', 'Expired License', 'Old Software', 'EXPIRED-2023-XXXX', 'perpetual', 5, NOW() - INTERVAL '400 days', NOW() - INTERVAL '30 days', 'expired');
```

## Reporting Issues

When reporting issues, include:
1. Test case that failed
2. Expected behavior
3. Actual behavior
4. Steps to reproduce
5. Screenshots/videos
6. Browser/device info
7. Console errors
8. Network logs

## Success Criteria

All tests must pass with:
- ✅ 0 critical bugs
- ✅ < 5 minor bugs
- ✅ 100% E2E test pass rate
- ✅ < 2s page load time
- ✅ WCAG AA compliance
- ✅ No RLS violations
- ✅ No console errors

## Next Steps

After testing:
1. Document all findings
2. Create bug tickets
3. Prioritize fixes
4. Retest after fixes
5. Sign off for production
