# Task 17: Navigation and Routing - Visual Reference

## Navigation Menu

The Licenses link appears in the team account navigation menu:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard  Chat  Assets  Licenses  Users      │
│                                    ^^^^^^^^              │
│                                    NEW LINK              │
└─────────────────────────────────────────────────────────┘
```

### Navigation Icon
- **Icon**: FileKey (🔑) from lucide-react
- **Position**: Between "Assets" and "Users"
- **Label**: "Licenses" (translated in 7 languages)

## Page Layouts

### 1. Licenses List Page

```
┌──────────────────────────────────────────────────────────────┐
│ Licenses                                    [+ New License]  │
│ Home > Team Name > Licenses                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Statistics Cards]                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │  Total   │ │ Expiring │ │ Expired  │ │Assignments│       │
│ │    12    │ │    3     │ │    1     │ │    45     │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ [Filters and Search]                                         │
│                                                              │
│ [License Cards Grid]                                         │
│ ┌─────────────────┐ ┌─────────────────┐                    │
│ │ Microsoft 365   │ │ Adobe Creative  │                    │
│ │ Expires: 30 days│ │ Expires: 7 days │                    │
│ │ 5 assignments   │ │ 3 assignments   │                    │
│ └─────────────────┘ └─────────────────┘                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2. New License Page

```
┌──────────────────────────────────────────────────────────────┐
│ Create License                                               │
│ Home > Team Name > Licenses > New                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [< Back to Licenses]                                         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                        │  │
│ │  License Name: [________________]                      │  │
│ │                                                        │  │
│ │  Vendor: [________________]                            │  │
│ │                                                        │  │
│ │  License Key: [________________]                       │  │
│ │                                                        │  │
│ │  Type: [Dropdown ▼]                                    │  │
│ │                                                        │  │
│ │  Purchase Date: [Date Picker]                          │  │
│ │                                                        │  │
│ │  Expiration Date: [Date Picker]                        │  │
│ │                                                        │  │
│ │  Cost: [________________]                              │  │
│ │                                                        │  │
│ │  Notes: [________________]                             │  │
│ │         [________________]                             │  │
│ │                                                        │  │
│ │  [Cancel]  [Create License]                            │  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3. License Detail Page

```
┌──────────────────────────────────────────────────────────────┐
│ Microsoft 365 Enterprise                                     │
│ Home > Team Name > Licenses > Microsoft 365 Enterprise       │
│                                                              │
│ [Assign to User] [Assign to Asset] [Edit] [Delete]          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [< Back to Licenses]                                         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ License Details                                        │  │
│ │                                                        │  │
│ │ Vendor: Microsoft                                      │  │
│ │ License Key: XXXXX-XXXXX-XXXXX-XXXXX                   │  │
│ │ Type: Subscription                                     │  │
│ │ Purchase Date: Jan 1, 2024                             │  │
│ │ Expiration Date: Dec 31, 2024 (30 days remaining)     │  │
│ │ Cost: $1,200.00                                        │  │
│ │ Notes: Annual subscription for 10 users                │  │
│ │                                                        │  │
│ │ Created: Jan 1, 2024 by John Doe                       │  │
│ │ Updated: Nov 15, 2024 by Jane Smith                    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Assignments (5)                                        │  │
│ │                                                        │  │
│ │ Users (3):                                             │  │
│ │ • John Doe (john@example.com) [Unassign]              │  │
│ │ • Jane Smith (jane@example.com) [Unassign]            │  │
│ │ • Bob Johnson (bob@example.com) [Unassign]            │  │
│ │                                                        │  │
│ │ Assets (2):                                            │  │
│ │ • MacBook Pro #12345 [Unassign]                        │  │
│ │ • Dell Laptop #67890 [Unassign]                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4. Edit License Page

```
┌──────────────────────────────────────────────────────────────┐
│ Edit License - Microsoft 365 Enterprise                      │
│ Home > Team Name > Licenses > Microsoft 365 > Edit           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [< Back to Licenses]                                         │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                        │  │
│ │  License Name: [Microsoft 365 Enterprise]              │  │
│ │                                                        │  │
│ │  Vendor: [Microsoft]                                   │  │
│ │                                                        │  │
│ │  License Key: [XXXXX-XXXXX-XXXXX-XXXXX]                │  │
│ │                                                        │  │
│ │  Type: [Subscription ▼]                                │  │
│ │                                                        │  │
│ │  Purchase Date: [01/01/2024]                           │  │
│ │                                                        │  │
│ │  Expiration Date: [12/31/2024]                         │  │
│ │                                                        │  │
│ │  Cost: [1200.00]                                       │  │
│ │                                                        │  │
│ │  Notes: [Annual subscription for 10 users]             │  │
│ │         [                                ]             │  │
│ │                                                        │  │
│ │  [Cancel]  [Update License]                            │  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Navigation Patterns

### Back Navigation Component

```typescript
// Visual representation of the back button
┌─────────────────────────┐
│ ← Back to Licenses      │
└─────────────────────────┘

// Appears at the top of:
// - New license page
// - License detail page
// - Edit license page
```

### Breadcrumb Navigation

```
Home > Team Name > Licenses
Home > Team Name > Licenses > New
Home > Team Name > Licenses > [License Name]
Home > Team Name > Licenses > [License Name] > Edit
```

## Responsive Behavior

### Desktop (> 1024px)
- Full navigation menu with text labels
- Breadcrumbs displayed in full
- Back button with icon and text

### Tablet (768px - 1024px)
- Condensed navigation menu
- Breadcrumbs may wrap
- Back button with icon and text

### Mobile (< 768px)
- Hamburger menu for navigation
- Breadcrumbs may be truncated
- Back button with icon only (text hidden)

## Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. Navigation menu items
2. Page action buttons
3. Back to Licenses button
4. Form fields / Content
5. Footer links
```

### Screen Reader Announcements
- "Licenses navigation link"
- "Back to licenses list"
- "Breadcrumb navigation: Home, Team Name, Licenses"
- "Current page: [Page Title]"

## Color Coding

### Navigation States
- **Active**: Blue highlight (current page)
- **Hover**: Light gray background
- **Focus**: Blue outline (keyboard navigation)

### Expiration Status
- **Active**: Green badge (> 30 days)
- **Warning**: Yellow badge (7-30 days)
- **Critical**: Red badge (< 7 days)
- **Expired**: Gray badge (past expiration)

## Multi-Language Support

The navigation link displays in the user's selected language:

| Language | Translation |
|----------|-------------|
| English  | Licenses    |
| German   | Lizenzen    |
| Spanish  | Licencias   |
| French   | Licences    |
| Italian  | Licenze     |
| Japanese | ライセンス  |
| Chinese  | 许可证      |

## Integration with Existing Features

The Licenses navigation follows the same patterns as:

### Assets Feature
- Similar navigation structure
- Consistent breadcrumb format
- Same back button style
- Matching page layouts

### Users Feature
- Identical navigation patterns
- Same header structure
- Consistent action button placement
- Matching filter/search layout

This ensures a cohesive user experience across all features.
