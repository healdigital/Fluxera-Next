# Task 18: Usage Statistics Widget - Visual Reference

## Widget Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Usage Statistics                                    [Last 30 days ▼]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Feature Usage Statistics                                                 │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Feature              │ Total Usage │ Active Accounts │ Adoption │ Trend │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ Asset Management     │ 1,234       │ 45              │ 75.0% ✓  │ ↑ Increasing │
│ │ User Management      │ 987         │ 38              │ 63.3% ●  │ − Stable     │
│ │ License Tracking     │ 456         │ 25              │ 41.7% ⚠  │ ↑ Increasing │
│ │ Maintenance Sched... │ 234         │ 15              │ 25.0% ⚠  │ ↓ Declining  │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ⚠ Declining Engagement                                                  │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 1 feature showing declining engagement: Maintenance Scheduling      │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Most Active Accounts                                                     │
│ Based on feature usage over the selected time period                    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Account Name    │ Total Activity │ Assets │ Users │ Licenses │ Maint │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │ #1 Acme Corp    │ 1,250         │ 150    │ 45    │ 30       │ 25    │
│ │ #2 TechStart    │ 980           │ 120    │ 35    │ 25       │ 20    │
│ │ #3 Global Inc   │ 750           │ 90     │ 28    │ 20       │ 15    │
│ │ #4 StartupXYZ   │ 620           │ 75     │ 22    │ 18       │ 12    │
│ │ #5 Enterprise   │ 540           │ 65     │ 20    │ 15       │ 10    │
│ └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ Usage Statistics                        [Last 30 days ▼]    │
└─────────────────────────────────────────────────────────────┘
```
- **Title**: "Usage Statistics" (i18n: `admin:dashboard.usageStatistics`)
- **Time Range Selector**: Dropdown with options:
  - Last 7 days
  - Last 30 days (default)
  - Last 90 days

### 2. Feature Usage Statistics Table
```
┌──────────────────────────────────────────────────────────────────┐
│ Feature              │ Total Usage │ Active Accounts │ Adoption │ Trend │
├──────────────────────────────────────────────────────────────────┤
│ Asset Management     │ 1,234       │ 45              │ 75.0% ✓  │ ↑ Increasing │
│ User Management      │ 987         │ 38              │ 63.3% ●  │ − Stable     │
│ License Tracking     │ 456         │ 25              │ 41.7% ⚠  │ ↑ Increasing │
│ Maintenance Sched... │ 234         │ 15              │ 25.0% ⚠  │ ↓ Declining  │
└──────────────────────────────────────────────────────────────────┘
```

**Columns**:
1. **Feature**: Name of the feature
   - Asset Management
   - User Management
   - License Tracking
   - Maintenance Scheduling

2. **Total Usage**: Number of usage events
   - Formatted with thousands separator (1,234)

3. **Active Accounts**: Number of accounts using the feature
   - Formatted with thousands separator

4. **Adoption Rate**: Percentage with colored badge
   - ✓ Green badge: ≥75% (success)
   - ● Gray badge: 50-74% (default)
   - ⚠ Yellow badge: 25-49% (warning)
   - ⚠ Red badge: <25% (destructive)

5. **Trend**: Direction indicator
   - ↑ Increasing (green text + icon)
   - − Stable (gray text + icon)
   - ↓ Declining (red text + icon)

**Special Styling**:
- Declining features have light red background
- TrendingDown icon appears next to feature name for declining features

### 3. Declining Features Alert
```
┌────────────────────────────────────────────────────────────┐
│ ⚠ Declining Engagement                                     │
│ 1 feature showing declining engagement:                    │
│ Maintenance Scheduling                                     │
└────────────────────────────────────────────────────────────┘
```

**Appearance**:
- Red/pink background (`bg-red-50`)
- Red border (`border-red-200`)
- TrendingDown icon (red)
- Bold title: "Declining Engagement"
- Lists all declining features by name

**Visibility**:
- Only appears if at least one feature has "down" trend
- Hidden if all features are "up" or "stable"

### 4. Most Active Accounts Table
```
┌──────────────────────────────────────────────────────────────────┐
│ Most Active Accounts                                             │
│ Based on feature usage over the selected time period            │
├──────────────────────────────────────────────────────────────────┤
│ Account Name    │ Total Activity │ Assets │ Users │ Licenses │ Maint │
├──────────────────────────────────────────────────────────────────┤
│ #1 Acme Corp    │ 1,250         │ 150    │ 45    │ 30       │ 25    │
│ #2 TechStart    │ 980           │ 120    │ 35    │ 25       │ 20    │
│ #3 Global Inc   │ 750           │ 90     │ 28    │ 20       │ 15    │
└──────────────────────────────────────────────────────────────────┘
```

**Columns**:
1. **Account Name**: With rank badge (#1, #2, etc.)
   - Badge has outline style
   - Rank number in small text

2. **Total Activity**: Weighted activity score
   - Bold font weight
   - Calculated as: (assets×3) + (users×2) + (licenses×2) + (maintenance×1)

3. **Assets Created**: Number of assets created in period

4. **Users Added**: Number of users added in period

5. **Licenses Registered**: Number of licenses registered in period

6. **Maintenance Scheduled**: Number of maintenance tasks scheduled in period

**Features**:
- Shows up to 10 accounts
- Sorted by total activity score (highest first)
- All numbers formatted with thousands separator

## Color Scheme

### Adoption Rate Badges
```
┌─────────────────────────────────────────────────────────┐
│ 85.5% │ Green background, white text (≥75%)             │
│ 62.3% │ Gray background, dark text (50-74%)             │
│ 38.7% │ Yellow background, dark text (25-49%)           │
│ 15.2% │ Red background, white text (<25%)               │
└─────────────────────────────────────────────────────────┘
```

### Trend Indicators
```
┌─────────────────────────────────────────────────────────┐
│ ↑ Increasing │ Green text (#16a34a)                     │
│ − Stable     │ Gray text (#6b7280)                      │
│ ↓ Declining  │ Red text (#dc2626)                       │
└─────────────────────────────────────────────────────────┘
```

### Declining Feature Highlight
```
┌─────────────────────────────────────────────────────────┐
│ Row Background: bg-red-50/50 (light red tint)           │
│ Alert Box: bg-red-50 with border-red-200                │
│ Icons: text-red-600                                     │
│ Text: text-red-700 (description), text-red-900 (title) │
└─────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥1024px)
- Full table layout
- All columns visible
- Time range selector on right side of header

### Tablet (768px - 1023px)
- Table scrolls horizontally if needed
- All columns remain visible
- Slightly reduced padding

### Mobile (<768px)
- Tables become scrollable horizontally
- Consider stacking cards instead of table (future enhancement)
- Time range selector moves below title

## Empty States

### No Usage Data
```
┌────────────────────────────────────────────────────────┐
│ Feature Usage Statistics                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│              No usage data available                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### No Active Accounts
```
┌────────────────────────────────────────────────────────┐
│ Most Active Accounts                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│              No active accounts                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Interaction States

### Time Range Selector
```
Default:  [Last 30 days ▼]
Hover:    [Last 30 days ▼] (slightly darker background)
Focus:    [Last 30 days ▼] (blue outline)
Open:     [Last 30 days ▼]
          ├─ Last 7 days
          ├─ Last 30 days ✓
          └─ Last 90 days
```

### Table Rows
```
Default:  Normal background
Hover:    Slightly darker background (except declining rows)
Declining: Red tint background (always)
```

## Icons Used

- **ArrowUpIcon**: Increasing trend (↑)
- **ArrowDownIcon**: Declining trend (↓)
- **MinusIcon**: Stable trend (−)
- **TrendingDownIcon**: Declining feature indicator (📉)

## Typography

- **Widget Title**: text-2xl font-semibold
- **Table Headers**: font-medium
- **Table Cells**: Regular weight
- **Activity Score**: font-semibold (bold)
- **Alert Title**: font-semibold text-red-900
- **Alert Description**: text-sm text-red-700

## Spacing

- **Widget Padding**: p-6 (24px)
- **Table Cell Padding**: px-4 py-2
- **Section Gap**: space-y-6 (24px between sections)
- **Alert Box Padding**: p-4 (16px)

## Accessibility Features

1. **Semantic HTML**: Uses proper table structure
2. **ARIA Labels**: Screen reader friendly
3. **Color + Text**: Trends use both color and text labels
4. **Keyboard Navigation**: All interactive elements accessible
5. **Focus Indicators**: Visible focus states
6. **Contrast**: Meets WCAG AA standards

## Example Data Scenarios

### Scenario 1: Healthy Platform
- All features show "up" or "stable" trends
- High adoption rates (>50%)
- No declining features alert
- Multiple active accounts

### Scenario 2: Declining Engagement
- One or more features show "down" trend
- Declining features alert appears
- Lower adoption rates for some features
- Fewer active accounts

### Scenario 3: New Platform
- Low usage counts
- Low adoption rates
- All trends "stable" (no previous data)
- Few active accounts

### Scenario 4: Mature Platform
- High usage counts (thousands)
- High adoption rates (>75%)
- Mix of "up" and "stable" trends
- Many active accounts (10+)

## Future Enhancements

1. **Interactive Charts**: Add visual charts for trends
2. **Drill-down**: Click account to see detailed activity
3. **Export**: Download usage statistics as CSV/PDF
4. **Custom Date Range**: Date picker for custom periods
5. **Real-time Updates**: Auto-refresh data periodically
6. **Filters**: Filter by feature type or account
7. **Comparison**: Compare multiple time periods
8. **Alerts**: Set up alerts for declining features

## Related Components

- **AdminMetricsOverview**: Platform-wide metrics
- **SystemHealthWidget**: System health monitoring
- **SubscriptionOverviewWidget**: Subscription metrics
- **AccountActivityList**: Account activity details

## Integration Points

- **Data Source**: `get_platform_usage_statistics()` and `get_most_active_accounts()` database functions
- **Loader**: `loadAdminDashboardPageData()` in admin-dashboard.loader.ts
- **Page**: Rendered in `/admin/dashboard` page
- **Authorization**: Requires super admin role
