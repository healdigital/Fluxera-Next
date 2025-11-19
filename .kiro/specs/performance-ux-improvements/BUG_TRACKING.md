# Bug Tracking Document

## Overview

This document tracks all identified bugs in the Fluxera asset management system, categorized by severity and feature area. Each bug includes reproduction steps, affected features, and priority for fixing.

**Last Updated:** November 18, 2025  
**Status:** Initial Audit Complete

---

## Bug Categories

- **Critical**: Prevents core functionality from working
- **High**: Significantly impacts user experience
- **Medium**: Noticeable issue but has workarounds
- **Low**: Minor cosmetic or edge case issues

---

## Critical Bugs

### BUG-001: CSRF Protection Disabled
**Severity:** Critical  
**Status:** Open  
**Affected Features:** All mutating requests (POST, PUT, DELETE)  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
CSRF protection middleware is commented out in the proxy configuration, leaving the application vulnerable to Cross-Site Request Forgery attacks.

**Location:**
- File: `apps/web/_proxy.ts`
- Line: 36-38

**Reproduction Steps:**
1. Review the `_proxy.ts` file
2. Note that `_withCsrfMiddleware` is commented out with "TODO: uncomment this when package is fixed"
3. All mutating requests are currently unprotected

**Impact:**
Attackers could potentially execute unauthorized actions on behalf of authenticated users.

**Recommended Fix:**
1. Investigate the package issue mentioned in the TODO comment
2. Either fix the package or implement alternative CSRF protection
3. Enable CSRF middleware for all mutating requests
4. Add tests to verify CSRF protection is working

**Requirements:** 4.1, 4.2

---

## High Priority Bugs

### BUG-002: Memory Leak in Dashboard Real-time Subscriptions
**Severity:** High  
**Status:** Open  
**Affected Features:** Dashboard real-time updates  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
The dashboard grid component sets up multiple Supabase real-time subscriptions and a 30-second refresh interval, but the cleanup function has a dependency issue that could cause memory leaks.

**Location:**
- File: `apps/web/app/home/[account]/dashboard/_components/dashboard-grid.tsx`
- Lines: 91-157

**Reproduction Steps:**
1. Navigate to the dashboard
2. Leave the dashboard open for an extended period
3. Navigate away and back to the dashboard multiple times
4. Monitor browser memory usage - it may increase over time

**Technical Details:**
The `useEffect` cleanup function depends on `accountId` and `accountSlug`, but the `refreshMetrics` function is not memoized and captures these values in its closure. This could lead to stale closures or multiple subscriptions not being properly cleaned up.

**Impact:**
- Increased memory usage over time
- Potential performance degradation
- Multiple redundant subscriptions firing simultaneously

**Recommended Fix:**
```typescript
useEffect(() => {
  const supabase = getSupabaseBrowserClient();
  
  // Memoize the refresh function to avoid stale closures
  const handleRefresh = () => {
    refreshMetrics();
  };

  // ... rest of subscription setup
  
  return () => {
    clearInterval(refreshInterval);
    void supabase.removeChannel(assetsChannel);
    void supabase.removeChannel(membershipsChannel);
    void supabase.removeChannel(licensesChannel);
  };
}, [accountId]); // Remove accountSlug from dependencies if not needed
```

**Requirements:** 4.2, 1.2

---

### BUG-003: Navigation Using window.location.href Instead of Next.js Router
**Severity:** High  
**Status:** Open  
**Affected Features:** Assets list, Licenses list, Users list, Pagination  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
Multiple list components use `window.location.href` for navigation instead of Next.js's router, causing full page reloads and losing client-side navigation benefits.

**Locations:**
- `apps/web/app/home/[account]/assets/_components/assets-list.tsx` (lines 115, 121, 195)
- `apps/web/app/home/[account]/licenses/_components/licenses-list.tsx` (line 157)
- `apps/web/app/home/[account]/users/_components/users-list.tsx` (line 113)
- `apps/web/app/home/[account]/users/_components/users-pagination.tsx`

**Reproduction Steps:**
1. Navigate to any list page (assets, licenses, or users)
2. Click on a row to view details
3. Observe full page reload instead of smooth client-side navigation
4. Click pagination buttons
5. Observe full page reload

**Impact:**
- Poor user experience with full page reloads
- Loss of client-side state
- Slower navigation
- Increased server load
- Loss of Next.js optimizations (prefetching, etc.)

**Recommended Fix:**
Replace `window.location.href` with Next.js `useRouter`:

```typescript
import { useRouter } from 'next/navigation';

// In component:
const router = useRouter();

// Replace:
window.location.href = `/home/${accountSlug}/assets/${asset.id}`;

// With:
router.push(`/home/${accountSlug}/assets/${asset.id}`);
```

**Requirements:** 2.1, 4.2

---

### BUG-004: Inconsistent Error Handling in Loaders
**Severity:** High  
**Status:** Open  
**Affected Features:** All data loading operations  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
Error handling is inconsistent across loader functions. Some throw errors, some log and throw, some return empty arrays, and some use `notFound()`. This makes error handling unpredictable.

**Locations:**
- `apps/web/app/home/[account]/users/_lib/server/users-page.loader.ts`
- `apps/web/app/home/[account]/users/_lib/server/user-detail.loader.ts`
- `apps/web/app/home/[account]/licenses/_lib/server/license-detail.loader.ts`
- `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts`

**Examples:**
```typescript
// Pattern 1: Log and throw
if (usersResult.error) {
  console.error('Error loading team members:', usersResult.error);
  throw new Error(`Failed to load team members: ${usersResult.error.message}`);
}

// Pattern 2: Log and continue
if (countResult.error) {
  console.error('Error getting user count:', countResult.error);
  // Continue with current page data even if count fails
}

// Pattern 3: Log and return empty
if (error) {
  console.error('Error loading assigned assets:', error);
  return [];
}

// Pattern 4: Log and notFound
if (error || !data) {
  console.error('Error loading license:', error);
  notFound();
}
```

**Impact:**
- Unpredictable error behavior
- Difficult to debug issues
- Inconsistent user experience
- Some errors silently fail

**Recommended Fix:**
1. Establish consistent error handling patterns:
   - Critical data (required for page): throw error
   - Optional data (enhancements): return empty/null with logging
   - Not found scenarios: use `notFound()`
2. Create error handling utilities
3. Document error handling patterns
4. Update all loaders to follow the pattern

**Requirements:** 2.3, 4.1, 4.2

---

### BUG-005: Missing Error Boundaries
**Severity:** High  
**Status:** Open  
**Affected Features:** All pages  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
While some pages have error.tsx files, many components lack error boundaries, meaning errors in child components can crash the entire page.

**Locations:**
- Most client components lack error boundaries
- Only some routes have error.tsx files:
  - `apps/web/app/home/[account]/assets/error.tsx`
  - `apps/web/app/home/[account]/assets/[id]/error.tsx`
  - `apps/web/app/home/[account]/assets/[id]/edit/error.tsx`
  - `apps/web/app/home/[account]/licenses/error.tsx`
  - `apps/web/app/home/[account]/licenses/[id]/edit/error.tsx`
  - `apps/web/app/home/[account]/users/error.tsx`

**Reproduction Steps:**
1. Trigger an error in a component without an error boundary
2. Observe the entire page crashes
3. User sees blank screen or error message

**Impact:**
- Poor error recovery
- Entire page crashes instead of graceful degradation
- Poor user experience

**Recommended Fix:**
1. Add error.tsx files to all route segments
2. Create reusable error boundary components
3. Wrap critical sections in error boundaries
4. Implement fallback UI for error states

**Requirements:** 2.3, 4.2

---

## Medium Priority Bugs

### BUG-006: React Compiler Warnings for TanStack Table
**Severity:** Medium  
**Status:** Open  
**Affected Features:** Data tables  
**Reported By:** ESLint  
**Assigned To:** TBD

**Description:**
React Compiler warns about TanStack Table's `useReactTable()` API returning functions that cannot be memoized safely.

**Locations:**
- `packages/ui/src/makerkit/data-table.tsx` (line 152)
- `packages/ui/src/shadcn/data-table.tsx` (line 32)

**Reproduction Steps:**
1. Run `pnpm lint`
2. Observe warnings about incompatible library usage

**Impact:**
- Potential performance issues with table re-renders
- React Compiler cannot optimize these components
- May cause stale UI if values are passed to memoized components

**Recommended Fix:**
1. Review TanStack Table documentation for React 19 compatibility
2. Consider using 'use no memo' directive (already applied in shadcn version)
3. Apply same directive to makerkit version
4. Monitor for any UI staleness issues

**Requirements:** 1.1, 7.1

---

### BUG-007: Pagination Calculation Hardcoded to 50 Items
**Severity:** Medium  
**Status:** Open  
**Affected Features:** Assets pagination  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
The assets pagination component hardcodes the page size to 50 instead of using the actual pageSize from pagination props.

**Location:**
- `apps/web/app/home/[account]/assets/_components/assets-list.tsx`
- Lines: 189-190

**Code:**
```typescript
const startItem = (currentPage - 1) * 50 + 1;
const endItem = Math.min(currentPage * 50, totalCount);
```

**Reproduction Steps:**
1. Navigate to assets list
2. If page size is changed from 50, pagination display will be incorrect
3. "Showing X to Y of Z" will show wrong numbers

**Impact:**
- Incorrect pagination display if page size changes
- Confusing user experience
- Inconsistent with licenses and users pagination

**Recommended Fix:**
```typescript
const startItem = (currentPage - 1) * pageSize + 1;
const endItem = Math.min(currentPage * pageSize, totalCount);
```

Add pageSize to the pagination props and use it consistently.

**Requirements:** 1.3, 4.2

---

### BUG-008: Console.error Statements in Production Code
**Severity:** Medium  
**Status:** Open  
**Affected Features:** All error handling  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
Multiple console.error statements are present in production code, which should be removed or replaced with proper logging.

**Locations:**
- Found in 20+ files across the application
- Primarily in loader functions and error handlers

**Reproduction Steps:**
1. Trigger any error in the application
2. Open browser console
3. See console.error output

**Impact:**
- Exposes internal error details to users
- Can leak sensitive information
- Not suitable for production monitoring
- Performance impact in production

**Recommended Fix:**
1. Replace console.error with proper logging service
2. Use environment-aware logging (only in development)
3. Implement structured logging for production
4. Remove or guard console statements:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.error('Error:', error);
}
// Use proper logging service for production
logger.error('Error loading data', { error, context });
```

**Requirements:** 4.2, 7.1

---

### BUG-009: Missing Loading States in Async Operations
**Severity:** Medium  
**Status:** Open  
**Affected Features:** Various dialogs and forms  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
Some async operations in dialogs and forms don't show loading states, leaving users uncertain if their action is processing.

**Locations:**
- `apps/web/app/home/[account]/users/_components/user-detail-view.tsx` (unassign asset)
- `apps/web/app/home/[account]/users/_components/assign-assets-dialog.tsx`
- `apps/web/app/home/[account]/licenses/_components/delete-license-dialog.tsx`
- `apps/web/app/home/[account]/licenses/_components/unassign-license-dialog.tsx`

**Reproduction Steps:**
1. Open any affected dialog
2. Perform an action (assign, unassign, delete)
3. On slow connections, no loading indicator appears
4. User may click multiple times

**Impact:**
- Poor user experience
- Users may submit forms multiple times
- Uncertainty about action status

**Recommended Fix:**
1. Add loading states to all async operations
2. Disable buttons during processing
3. Show loading spinners
4. Prevent duplicate submissions

**Requirements:** 2.1, 4.2

---

## Low Priority Bugs

### BUG-010: Accessibility - Missing aria-busy Attributes
**Severity:** Low  
**Status:** Open  
**Affected Features:** Loading states  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
Loading states use aria-live but don't include aria-busy attributes to indicate loading state to screen readers.

**Locations:**
- All list components with loading states

**Reproduction Steps:**
1. Use screen reader
2. Navigate to a page while it's loading
3. Screen reader doesn't announce busy state

**Impact:**
- Reduced accessibility for screen reader users
- Users may not know content is loading

**Recommended Fix:**
Add aria-busy="true" to loading containers:

```typescript
<div
  role="status"
  aria-live="polite"
  aria-busy="true"
>
  <Spinner />
  <p>Loading...</p>
</div>
```

**Requirements:** 6.2, 6.5

---

### BUG-011: Inconsistent Date Formatting
**Severity:** Low  
**Status:** Open  
**Affected Features:** Date displays across the application  
**Reported By:** System Audit  
**Assigned To:** TBD

**Description:**
Dates are formatted inconsistently across the application using different methods and formats.

**Locations:**
- Various components use `toLocaleDateString()`
- Some use `toLocaleTimeString()`
- No consistent format or timezone handling

**Reproduction Steps:**
1. View dates in different parts of the application
2. Notice inconsistent formatting
3. Dates may show in different formats based on user locale

**Impact:**
- Inconsistent user experience
- Potential timezone confusion
- Difficult to compare dates

**Recommended Fix:**
1. Create date formatting utilities
2. Use consistent format across application
3. Handle timezones properly
4. Consider using date-fns or similar library

**Requirements:** 7.1, 7.4

---

## Bug Statistics

**Total Bugs:** 11
- Critical: 1
- High: 5
- Medium: 4
- Low: 2

**By Feature Area:**
- Security: 1
- Performance: 1
- Navigation: 1
- Error Handling: 3
- UI/UX: 3
- Accessibility: 1
- Code Quality: 1

**Status:**
- Open: 11
- In Progress: 0
- Resolved: 0
- Closed: 0

---

## Next Steps

1. **Immediate Action Required:**
   - BUG-001: CSRF Protection (Critical)
   - BUG-002: Memory Leak (High)
   - BUG-003: Navigation Issues (High)

2. **High Priority:**
   - BUG-004: Error Handling Consistency
   - BUG-005: Error Boundaries

3. **Medium Priority:**
   - Address remaining medium priority bugs in order

4. **Low Priority:**
   - Address during regular maintenance cycles

---

## Testing Requirements

For each bug fix:
1. Add regression test to prevent recurrence
2. Verify fix doesn't introduce new issues
3. Test across different browsers and devices
4. Update documentation if needed

---

## Related Documents

- [Requirements Document](./requirements.md)
- [Design Document](./design.md)
- [Implementation Tasks](./tasks.md)
- [Bug Fixes Summary](./BUG_FIXES_SUMMARY.md) (to be created after fixes)
