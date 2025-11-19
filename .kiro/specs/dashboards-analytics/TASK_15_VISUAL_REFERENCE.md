# Task 15: Account Activity List Widget - Visual Reference

## Component Overview

The Account Activity List Widget displays team accounts with their activity metrics in a sortable, paginated table format.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Account Activity                                                    │
│ Monitor team account activity and access team dashboards           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ Account Name │ Users │ Assets │ Last Activity │ Created │ →    ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ Acme Corp    │   45  │  234   │ 2 hours ago   │ Jan 15  │ [→] ││
│ │ acme-corp    │       │        │ Nov 18, 2025  │ 2025    │     ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ TechStart    │   12  │   89   │ Yesterday     │ Feb 3   │ [→] ││
│ │ techstart    │       │        │ Nov 17, 2025  │ 2025    │     ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │ Global Inc   │   78  │  456   │ 3 days ago    │ Dec 1   │ [→] ││
│ │ global-inc   │       │        │ Nov 15, 2025  │ 2024    │     ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ Rows per page: [50 ▼]    Page 1 of 5 (234 total)  [<] [>]        │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AccountActivityListWrapper (Client Component)
├── State Management
│   ├── accounts: AccountActivity[]
│   ├── totalCount: number
│   ├── currentPage: number
│   ├── pageSize: number
│   └── isPending: boolean
│
├── Event Handlers
│   ├── handlePageChange(newPage)
│   └── handlePageSizeChange(newPageSize)
│
└── Renders
    ├── AccountActivityListSkeleton (when isPending)
    └── AccountActivityList (when loaded)
        ├── Card
        │   ├── CardHeader
        │   │   ├── CardTitle
        │   │   └── CardDescription
        │   └── CardContent
        │       ├── Table
        │       │   ├── TableHeader
        │       │   │   └── TableRow (headers)
        │       │   └── TableBody
        │       │       └── TableRow[] (data rows)
        │       │           ├── Account Name Cell (clickable)
        │       │           ├── User Count Cell
        │       │           ├── Asset Count Cell
        │       │           ├── Last Activity Cell
        │       │           ├── Created Date Cell
        │       │           └── Action Button Cell
        │       └── Pagination Controls
        │           ├── Page Size Selector
        │           └── Navigation Buttons
```

## Data Display Format

### Account Name Column
```
┌──────────────┐
│ Acme Corp    │  ← Primary name (bold, hover effect)
│ acme-corp    │  ← Slug (muted, smaller)
└──────────────┘
```

### Metrics Columns
```
┌───────┬────────┐
│ Users │ Assets │
├───────┼────────┤
│   45  │  234   │  ← Right-aligned, formatted numbers
└───────┴────────┘
```

### Last Activity Column
```
┌──────────────┐
│ 2 hours ago  │  ← Relative time (bold)
│ Nov 18, 2025 │  ← Absolute date (muted)
└──────────────┘
```

### Action Column
```
┌───┐
│ → │  ← External link icon (appears on hover)
└───┘
```

## Interactive States

### Default State
- Clean table layout with alternating row colors
- All data visible and readable
- Pagination controls at bottom

### Hover State
```
┌─────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓ Acme Corp (highlighted)  │  45  │  234  │ 2 hours ago │ [→] ▓ │
│ ▓ acme-corp                │      │       │ Nov 18      │     ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────────────────────────────────┘
```
- Background color changes to muted
- Account name changes to primary color
- External link icon becomes visible
- Cursor changes to pointer

### Loading State (Skeleton)
```
┌─────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░                                                        │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░ │ ░░░░ │ ░░░░ │ ░░░░░░░░░░░░ │ ░░░░░░ │ ░░░░       │
│ ░░░░░░░░░░░░ │ ░░░░ │ ░░░░ │ ░░░░░░░░░░░░ │ ░░░░░░ │ ░░░░       │
│ ░░░░░░░░░░░░ │ ░░░░ │ ░░░░ │ ░░░░░░░░░░░░ │ ░░░░░░ │ ░░░░       │
└─────────────────────────────────────────────────────────────────────┘
```
- Animated skeleton placeholders
- Maintains layout structure
- Shows 5 skeleton rows

### Empty State
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                      No accounts found                              │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Pagination Controls

### Page Size Selector
```
┌──────────────────────────────────────┐
│ Rows per page: [50 ▼]               │
│                                      │
│ Options:                             │
│ ┌────────┐                          │
│ │   25   │                          │
│ │   50   │ ← Selected               │
│ │  100   │                          │
│ └────────┘                          │
└──────────────────────────────────────┘
```

### Navigation Controls
```
┌────────────────────────────────────────────────────┐
│ Page 2 of 5 (234 total)    [<]  [>]              │
│                             ↑    ↑                 │
│                          Previous Next             │
│                          (enabled) (enabled)       │
└────────────────────────────────────────────────────┘

At first page:
│ Page 1 of 5 (234 total)    [<]  [>]              │
│                          (disabled) (enabled)      │

At last page:
│ Page 5 of 5 (234 total)    [<]  [>]              │
│                          (enabled) (disabled)      │
```

## Responsive Behavior

### Desktop (>1024px)
- Full table layout with all columns visible
- Comfortable spacing between columns
- Hover effects fully functional

### Tablet (768px - 1024px)
- Horizontal scroll enabled
- All columns remain visible
- Slightly reduced padding

### Mobile (<768px)
- Horizontal scroll required
- Table maintains structure
- Touch-friendly row height
- Pagination controls stack vertically

## Color Scheme

### Light Mode
- Background: White (#FFFFFF)
- Border: Gray-200 (#E5E7EB)
- Text Primary: Gray-900 (#111827)
- Text Muted: Gray-500 (#6B7280)
- Hover Background: Gray-50 (#F9FAFB)
- Primary Color: Blue-600 (#2563EB)

### Dark Mode
- Background: Gray-900 (#111827)
- Border: Gray-700 (#374151)
- Text Primary: Gray-50 (#F9FAFB)
- Text Muted: Gray-400 (#9CA3AF)
- Hover Background: Gray-800 (#1F2937)
- Primary Color: Blue-500 (#3B82F6)

## Accessibility Features

### Keyboard Navigation
- Tab through table rows
- Enter/Space to navigate to dashboard
- Arrow keys for pagination
- Focus indicators visible

### Screen Reader Support
- Table headers properly labeled
- Row data associated with headers
- Button labels descriptive
- Status updates announced

### ARIA Attributes
```html
<button aria-label="Previous page" disabled={!hasPreviousPage}>
<button aria-label="Next page" disabled={!hasNextPage}>
<button aria-label="View Acme Corp dashboard">
```

## Performance Characteristics

### Initial Load
- Server-side rendering of first page
- ~100-200ms to display initial data
- No layout shift

### Pagination
- Client-side state management
- Server action for data fetching
- ~200-400ms transition time
- Smooth loading state

### Data Volume
- Efficiently handles 1000+ accounts
- Pagination prevents performance issues
- Lazy loading of pages

## Integration Points

### Navigation
```typescript
// Clicking row navigates to:
/home/{account_slug}/dashboard

// Example:
/home/acme-corp/dashboard
/home/techstart/dashboard
```

### Data Source
```typescript
// Server action:
loadAccountActivityPage(page, pageSize)

// Database function:
get_account_activity_list(p_limit, p_offset)
```

### State Management
```typescript
// React state:
- accounts: AccountActivity[]
- totalCount: number
- currentPage: number
- pageSize: number
- isPending: boolean
```

## Usage Example

```typescript
// In admin dashboard page
<AccountActivityListWrapper
  initialAccounts={accountActivity}
  initialTotalCount={totalAccountCount}
  initialPage={1}
  initialPageSize={50}
/>
```

## Future Enhancements

1. **Filtering**
   - By subscription tier
   - By activity date range
   - By account status

2. **Sorting**
   - By any column
   - Ascending/descending toggle

3. **Search**
   - Search by account name
   - Search by slug

4. **Export**
   - Export to CSV
   - Export to Excel

5. **Bulk Actions**
   - Select multiple accounts
   - Perform bulk operations
