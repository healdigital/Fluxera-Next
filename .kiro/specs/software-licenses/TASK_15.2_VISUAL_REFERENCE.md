# Task 15.2: Export Button UI - Visual Reference

## Component Location

The export button is located in the licenses list page, positioned to the left of the "New License" button in the top-right corner of the list.

## Visual States

### 1. Initial State (Ready to Export)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [🔍 Search] [Vendor ▼] [Type ▼] [Status ▼]           │
│                                                         │
│                    [📥 Export] [+ New License]         │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   License    │ │   License    │ │   License    │  │
│  │    Card      │ │    Card      │ │    Card      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Button Appearance:**
- Variant: `outline`
- Icon: Download (📥) from lucide-react
- Text: "Export"
- State: Enabled, clickable

### 2. Loading State (During Export)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [🔍 Search] [Vendor ▼] [Type ▼] [Status ▼]           │
│                                                         │
│                    [💫 Exporting...] [+ New License]   │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   License    │ │   License    │ │   License    │  │
│  │    Card      │ │    Card      │ │    Card      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Button Appearance:**
- Variant: `outline`
- Icon: Download with `animate-pulse` class (pulsing animation)
- Text: "Exporting..."
- State: Disabled, not clickable
- Cursor: not-allowed

### 3. Success State (After Export)
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Successfully exported 15 licenses                   │
│  [Dismiss]                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [🔍 Search] [Vendor ▼] [Type ▼] [Status ▼]           │
│                                                         │
│                    [📥 Export] [+ New License]         │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   License    │ │   License    │ │   License    │  │
│  │    Card      │ │    Card      │ │    Card      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Toast Notification:**
- Type: Success (green)
- Icon: Checkmark
- Message: "Successfully exported X license(s)"
- Auto-dismiss after a few seconds

**Button State:**
- Returns to initial state (enabled)

### 4. Error State (Export Failed)
```
┌─────────────────────────────────────────────────────────┐
│  ❌ Failed to export licenses                           │
│  [Dismiss]                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [🔍 Search] [Vendor ▼] [Type ▼] [Status ▼]           │
│                                                         │
│                    [📥 Export] [+ New License]         │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   License    │ │   License    │ │   License    │  │
│  │    Card      │ │    Card      │ │    Card      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Toast Notification:**
- Type: Error (red)
- Icon: X or Alert
- Message: Error message from server or "An unexpected error occurred while exporting"
- Auto-dismiss after a few seconds

**Button State:**
- Returns to initial state (enabled)

## Code Structure

### Component Hierarchy
```
LicensesList (licenses-list.tsx)
├── LicenseFilters
├── Action Buttons Container
│   ├── ExportLicensesButton ← Export functionality
│   └── New License Button
├── License Cards Grid
│   └── LicenseCard (multiple)
└── LicensesPagination
```

### Export Button Component
```typescript
ExportLicensesButton
├── Props
│   ├── accountSlug: string
│   └── filters?: FilterObject
├── State
│   └── isExporting: boolean
├── Handler
│   └── handleExport()
│       ├── Call exportLicenses server action
│       ├── Create blob from CSV
│       ├── Trigger download
│       └── Show toast notification
└── Render
    └── Button with Download icon
```

## User Interaction Flow

```
User clicks "Export" button
         ↓
Button enters loading state
(disabled, "Exporting...", pulsing icon)
         ↓
Server action executes
(fetch licenses, apply filters, generate CSV)
         ↓
    ┌────┴────┐
    ↓         ↓
 Success    Error
    ↓         ↓
Create blob  Show error toast
    ↓         ↓
Trigger     Button returns
download    to initial state
    ↓
Show success toast
    ↓
Button returns to initial state
```

## Responsive Behavior

### Desktop (≥1024px)
- Export button and New License button side by side
- Full button text visible
- Icons with text labels

### Tablet (768px - 1023px)
- Buttons may wrap to new line if needed
- Full button text visible
- Icons with text labels

### Mobile (<768px)
- Buttons stack vertically or wrap
- Full button text visible
- Icons with text labels

## Accessibility Features

### Keyboard Navigation
- Tab to focus on Export button
- Enter or Space to activate
- Focus visible indicator

### Screen Reader Support
```html
<Button
  aria-label="Export licenses to CSV"
  disabled={isExporting}
>
  <Download aria-hidden="true" />
  {isExporting ? 'Exporting...' : 'Export'}
</Button>
```

### Visual Indicators
- Disabled state clearly visible
- Loading animation provides feedback
- Toast notifications for success/error
- Color contrast meets WCAG standards

## File Download Behavior

### Filename Format
```
licenses-export-YYYY-MM-DD.csv
```

Example: `licenses-export-2025-11-18.csv`

### Browser Behavior
- Automatic download (no dialog)
- File saved to default downloads folder
- Browser shows download progress in toolbar
- User can open or show in folder

### CSV Content
```csv
Name,Vendor,License Key,License Type,Purchase Date,Expiration Date,Days Until Expiry,Status,Cost,Total Assignments,User Assignments,Asset Assignments,Notes
Microsoft Office 365,Microsoft,XXXXX-XXXXX-XXXXX,subscription,2024-01-15,2025-01-15,58,Active,299.99,5,3,2,Annual subscription
Adobe Creative Cloud,Adobe,YYYYY-YYYYY-YYYYY,subscription,2024-06-01,2024-12-01,-17,Expired,599.99,2,2,0,Needs renewal
```

## Integration with Filters

The export button respects all active filters:

### Example: Filtered Export
```
Active Filters:
- Search: "Microsoft"
- Vendor: "Microsoft"
- Status: "Active"

Result: Only Microsoft active licenses are exported
Toast: "Successfully exported 3 licenses"
```

### Example: No Filters
```
Active Filters: None

Result: All licenses are exported
Toast: "Successfully exported 15 licenses"
```

## Testing Checklist

- [ ] Button renders correctly
- [ ] Button is clickable when enabled
- [ ] Loading state appears on click
- [ ] Button is disabled during export
- [ ] CSV file downloads successfully
- [ ] Filename includes current date
- [ ] Success toast appears with correct count
- [ ] Error toast appears on failure
- [ ] Button returns to initial state after export
- [ ] Filters are applied to export
- [ ] Keyboard navigation works
- [ ] Screen reader announces button state
- [ ] Works on mobile devices
- [ ] Works on different browsers

## Browser Compatibility

Tested and working on:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Export is asynchronous (doesn't block UI)
- Large exports (1000+ licenses) may take a few seconds
- Loading state provides feedback during processing
- CSV generation happens server-side (efficient)
- Blob creation and download are fast client-side operations
