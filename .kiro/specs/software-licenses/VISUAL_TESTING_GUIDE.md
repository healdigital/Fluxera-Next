# License Management System - Visual Testing Guide

## Overview
This guide provides visual references for testing the license management system UI.

## 1. License List Page

### URL
`http://localhost:3000/home/makerkit/licenses`

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Fluxera                                    [User Menu]       │
├─────────────────────────────────────────────────────────────┤
│ Home > Licenses                                             │
├─────────────────────────────────────────────────────────────┤
│ [!] 3 licenses expiring in the next 30 days [View] [Dismiss]│
├─────────────────────────────────────────────────────────────┤
│ Licenses                                [+ Create License]  │
│                                                             │
│ [Search...] [Status: All ▼] [Type: All ▼] [Sort: Name ▼]  │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ Adobe CC        │ │ Office 365      │ │ Windows 11      ││
│ │ [Active]        │ │ [Expiring Soon] │ │ [Expired]       ││
│ │ 8/10 seats used │ │ 45/50 seats     │ │ 0/5 seats       ││
│ │ Expires: 365d   │ │ Expires: 7d     │ │ Expired: 30d ago││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
│ [< Previous] Page 1 of 3 [Next >]                          │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Header**: Logo, navigation, user menu visible
- [ ] **Breadcrumbs**: "Home > Licenses" displayed
- [ ] **Alert Banner**: Shows if licenses expiring (orange/yellow background)
- [ ] **Page Title**: "Licenses" with create button
- [ ] **Filters**: Search box, status dropdown, type dropdown, sort dropdown
- [ ] **License Cards**: Grid layout (3 columns on desktop)
- [ ] **Status Badges**: 
  - Active: Green
  - Expiring Soon: Orange
  - Expired: Red
- [ ] **Pagination**: Controls at bottom if > 10 licenses
- [ ] **Empty State**: Shows when no licenses (friendly message + create button)

### Responsive Checks
- [ ] **Desktop (> 1024px)**: 3 columns
- [ ] **Tablet (768-1024px)**: 2 columns
- [ ] **Mobile (< 768px)**: 1 column, stacked filters

## 2. Create License Dialog

### Trigger
Click "Create License" button

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Create New License                                    [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ License Name *                                              │
│ [_____________________________]                             │
│                                                             │
│ Software Name *                                             │
│ [_____________________________]                             │
│                                                             │
│ License Key *                                               │
│ [_____________________________]                             │
│                                                             │
│ License Type *                                              │
│ [Subscription ▼]                                            │
│                                                             │
│ Quantity *                                                  │
│ [____]                                                      │
│                                                             │
│ Start Date *                                                │
│ [📅 MM/DD/YYYY]                                             │
│                                                             │
│ Expiration Date *                                           │
│ [📅 MM/DD/YYYY]                                             │
│                                                             │
│ Notes (optional)                                            │
│ [_____________________________]                             │
│ [_____________________________]                             │
│                                                             │
│                              [Cancel] [Create License]      │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Dialog**: Centered, modal overlay
- [ ] **Title**: "Create New License"
- [ ] **Close Button**: X in top right
- [ ] **Required Fields**: Marked with asterisk (*)
- [ ] **Form Fields**: All inputs visible and accessible
- [ ] **Date Pickers**: Calendar icon, proper format
- [ ] **Dropdowns**: Show options on click
- [ ] **Buttons**: Cancel (secondary), Create (primary/blue)
- [ ] **Validation**: Red error messages below invalid fields
- [ ] **Loading State**: Spinner on submit button when saving

## 3. License Detail Page

### URL
`http://localhost:3000/home/makerkit/licenses/[id]`

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Home > Licenses > Adobe Creative Cloud                     │
├─────────────────────────────────────────────────────────────┤
│ Adobe Creative Cloud                    [Edit] [Delete]    │
│ [Active] • Expires in 365 days                              │
│                                                             │
│ [Details] [Assignments] [History]                           │
├─────────────────────────────────────────────────────────────┤
│ License Information                                         │
│                                                             │
│ Software Name:    Adobe Creative Cloud                      │
│ License Key:      ADOBE-CC-2024-XXXX                        │
│ License Type:     Subscription                              │
│ Quantity:         10 seats                                  │
│ Used:             8 seats (80%)                             │
│ Available:        2 seats                                   │
│ Start Date:       Jan 1, 2024                               │
│ Expiration Date:  Dec 31, 2024                              │
│ Status:           Active                                    │
│                                                             │
│ [Assign to User] [Assign to Asset]                         │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Breadcrumbs**: Full path visible
- [ ] **Title**: License name with status badge
- [ ] **Action Buttons**: Edit, Delete in top right
- [ ] **Tabs**: Details, Assignments, History
- [ ] **Active Tab**: Highlighted/underlined
- [ ] **Information Grid**: Label-value pairs, well-spaced
- [ ] **Progress Bar**: Visual representation of seat usage
- [ ] **Assignment Buttons**: Prominent, easy to find

## 4. Assignments Tab

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Details] [Assignments] [History]                           │
├─────────────────────────────────────────────────────────────┤
│ User Assignments (5)                                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 John Doe                              [Unassign]     ││
│ │    john.doe@company.com                                 ││
│ │    Assigned: Jan 15, 2024                               ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Jane Smith                            [Unassign]     ││
│ │    jane.smith@company.com                               ││
│ │    Assigned: Jan 20, 2024                               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Asset Assignments (3)                                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 💻 MacBook Pro 16"                       [Unassign]     ││
│ │    Serial: MBP-2024-001                                 ││
│ │    Assigned: Jan 10, 2024                               ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Section Headers**: Clear separation between users and assets
- [ ] **Assignment Cards**: User/asset info with unassign button
- [ ] **Icons**: User icon for users, laptop icon for assets
- [ ] **Dates**: Assignment dates displayed
- [ ] **Empty State**: Shows when no assignments
- [ ] **Unassign Button**: Secondary style, right-aligned

## 5. History Tab

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Details] [Assignments] [History]                           │
├─────────────────────────────────────────────────────────────┤
│ Activity History                                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ● License created                                       ││
│ │   Jan 1, 2024 at 10:00 AM by Admin User                ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ● Assigned to John Doe                                  ││
│ │   Jan 15, 2024 at 2:30 PM by Admin User                ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ● License updated                                       ││
│ │   Feb 1, 2024 at 9:15 AM by Admin User                 ││
│ │   Changed: Expiration date                              ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Timeline**: Chronological order (newest first)
- [ ] **Event Cards**: Clear event description
- [ ] **Timestamps**: Date and time displayed
- [ ] **User Attribution**: Who performed the action
- [ ] **Change Details**: What was changed (for updates)
- [ ] **Icons**: Bullet points or timeline markers

## 6. Expiration Alert Banner

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ 3 licenses expiring in the next 30 days                  │
│ [View Expiring Licenses] [Dismiss]                         │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Background**: Orange/yellow warning color
- [ ] **Icon**: Warning triangle icon
- [ ] **Message**: Clear, concise text
- [ ] **Buttons**: View (primary), Dismiss (secondary)
- [ ] **Dismissible**: X button or dismiss action
- [ ] **Positioning**: Top of page, below header

## 7. Delete Confirmation Dialog

### Expected Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Delete License                                        [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠️ Warning: This action cannot be undone                    │
│                                                             │
│ You are about to delete:                                    │
│ • License: Adobe Creative Cloud                             │
│ • 8 user assignments will be removed                        │
│ • 3 asset assignments will be removed                       │
│                                                             │
│ To confirm, type the license name:                          │
│ [_____________________________]                             │
│                                                             │
│                              [Cancel] [Delete License]      │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Warning Icon**: Red/orange triangle
- [ ] **Warning Message**: Prominent, clear
- [ ] **Impact Summary**: Lists what will be affected
- [ ] **Confirmation Input**: Requires typing license name
- [ ] **Delete Button**: Red/destructive color
- [ ] **Delete Button**: Disabled until name matches

## 8. Loading States

### License List Loading
```
┌─────────────────────────────────────────────────────────────┐
│ Licenses                                [+ Create License]  │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Skeleton Screens**: Gray placeholder blocks
- [ ] **Animation**: Subtle shimmer/pulse effect
- [ ] **Layout**: Matches final content layout
- [ ] **No Flash**: Smooth transition to content

## 9. Empty States

### No Licenses
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    📄                                        │
│                                                             │
│              No licenses yet                                │
│                                                             │
│     Get started by creating your first license             │
│                                                             │
│              [+ Create License]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Icon**: Relevant, friendly icon
- [ ] **Message**: Clear, helpful text
- [ ] **Call to Action**: Prominent create button
- [ ] **Centered**: Content centered in viewport

## 10. Error States

### Error Message
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Error: Failed to load licenses                           │
│ Please try again or contact support if the problem persists │
│ [Retry]                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Visual Checks
- [ ] **Error Icon**: Red X or alert icon
- [ ] **Error Message**: Clear, actionable
- [ ] **Retry Button**: Allows user to retry
- [ ] **Support Link**: Contact info if needed

## Color Reference

### Status Colors
- **Active**: `#10B981` (Green)
- **Expiring Soon**: `#F59E0B` (Orange)
- **Expired**: `#EF4444` (Red)
- **Inactive**: `#6B7280` (Gray)

### UI Colors
- **Primary**: `#3B82F6` (Blue)
- **Secondary**: `#6B7280` (Gray)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Orange)
- **Error**: `#EF4444` (Red)
- **Background**: `#FFFFFF` (White)
- **Border**: `#E5E7EB` (Light Gray)

## Typography

### Font Sizes
- **Page Title**: 24px, Bold
- **Section Header**: 18px, Semibold
- **Body Text**: 14px, Regular
- **Small Text**: 12px, Regular
- **Button Text**: 14px, Medium

### Font Family
- Primary: Inter, system-ui, sans-serif

## Spacing

### Padding
- **Card**: 16px
- **Dialog**: 24px
- **Button**: 12px 24px

### Margins
- **Section**: 24px bottom
- **Card**: 16px between cards
- **Form Field**: 16px bottom

## Accessibility Checks

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Focus indicators visible (blue outline)
- [ ] All interactive elements focusable
- [ ] Escape closes dialogs
- [ ] Enter submits forms

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels associated
- [ ] ARIA labels present
- [ ] Status changes announced

### Color Contrast
- [ ] Text contrast ≥ 4.5:1
- [ ] Interactive elements ≥ 3:1
- [ ] Status badges distinguishable

## Testing Checklist

- [ ] All layouts match expected design
- [ ] Colors are correct
- [ ] Typography is consistent
- [ ] Spacing is uniform
- [ ] Loading states work
- [ ] Empty states display
- [ ] Error states display
- [ ] Responsive design works
- [ ] Accessibility standards met
- [ ] No visual bugs or glitches

---

**Visual Testing Status**: ☐ PASS ☐ FAIL
**Issues Found**: _____________
**Tested By**: _____________
**Date**: _____________
