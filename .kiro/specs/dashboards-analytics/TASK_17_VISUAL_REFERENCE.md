# Task 17: Subscription Overview Widget - Visual Reference

## Widget Layout

The Subscription Overview Widget displays subscription metrics in a clean, organized layout with visual indicators for important information.

## Component Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Subscription Overview Widget                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ 💳 Total     │  │ 📈 Total     │  │ ⚠️  Expiring │  │ ⚠️  Over     ││
│  │ Subscriptions│  │ Revenue      │  │ Soon         │  │ Usage Limit  ││
│  │              │  │              │  │              │  │              ││
│  │    1,234     │  │  $45,678     │  │     23       │  │      5       ││
│  │              │  │              │  │ Within 30    │  │ Requires     ││
│  │              │  │              │  │ days         │  │ attention    ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    Subscriptions by Tier                            ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │                                                                       ││
│  │  ┌──┐  Enterprise                                    $25,000        ││
│  │  │💜│  450 accounts                                                  ││
│  │  └──┘                                                                ││
│  │                                                                       ││
│  │  ┌──┐  Professional                  ⚠️ 15 expiring   $15,000       ││
│  │  │💙│  600 accounts                                                  ││
│  │  └──┘                                                                ││
│  │                                                                       ││
│  │  ┌──┐  Basic                         ⚠️ 5 over limit  $4,500        ││
│  │  │💚│  150 accounts                  ⚠️ 8 expiring                  ││
│  │  └──┘                                                                ││
│  │                                                                       ││
│  │  ┌──┐  Free                                           $0             ││
│  │  │⚪│  34 accounts                                                   ││
│  │  └──┘                                                                ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Summary Cards

### 1. Total Subscriptions Card
- **Icon**: Credit Card (💳) in blue
- **Label**: "Total Subscriptions"
- **Value**: Large number showing total count
- **Color**: Blue theme

### 2. Total Revenue Card
- **Icon**: Trending Up (📈) in green
- **Label**: "Total Revenue"
- **Value**: Currency formatted (e.g., $45,678)
- **Color**: Green theme

### 3. Expiring Soon Card
- **Icon**: Alert Triangle (⚠️) in yellow
- **Label**: "Expiring Soon"
- **Value**: Count of expiring subscriptions
- **Subtitle**: "Within 30 days"
- **Color**: Yellow/warning theme

### 4. Over Usage Limit Card
- **Icon**: Alert Triangle (⚠️) in red
- **Label**: "Over Usage Limit"
- **Value**: Count of accounts over limit
- **Subtitle**: "Requires attention"
- **Color**: Red/critical theme

## Tier Breakdown Section

### Tier Row Components

Each tier displays:

1. **Tier Icon** (left side)
   - Color-coded square with credit card icon
   - Enterprise/Premium: Purple (💜)
   - Professional/Pro: Blue (💙)
   - Basic/Starter: Green (💚)
   - Free/Trial: Gray (⚪)

2. **Tier Information** (center-left)
   - Tier name (capitalized)
   - Account count with "account" or "accounts" label
   - Check mark (✓) if no warnings

3. **Revenue** (center-right)
   - Currency formatted amount
   - "Revenue" label below

4. **Warning Badges** (right side)
   - **Expiring Badge**: Yellow background
     - Alert triangle icon
     - "X expiring" text
     - Clickable link
   - **Over Limit Badge**: Red background
     - Alert triangle icon
     - "X over limit" text
     - Clickable link

### Visual States

#### Normal State (No Warnings)
```
┌──┐  Enterprise  ✓                                        $25,000
│💜│  450 accounts
└──┘
```

#### With Expiring Subscriptions
```
┌──┐  Professional                    ⚠️ 15 expiring      $15,000
│💙│  600 accounts
└──┘
```

#### With Multiple Warnings
```
┌──┐  Basic                           ⚠️ 5 over limit     $4,500
│💚│  150 accounts                    ⚠️ 8 expiring
└──┘
```

## Color Scheme

### Light Mode
- **Background**: White cards with subtle shadows
- **Text**: Dark gray for primary text
- **Muted Text**: Light gray for secondary text
- **Borders**: Light gray borders
- **Icons**: Colored backgrounds with white icons

### Dark Mode
- **Background**: Dark cards with subtle borders
- **Text**: Light gray for primary text
- **Muted Text**: Medium gray for secondary text
- **Borders**: Dark gray borders
- **Icons**: Darker colored backgrounds with lighter icons

## Interactive Elements

### Clickable Warning Badges
When clicked, badges navigate to filtered subscription management pages:

1. **Expiring Badge Click**:
   - URL: `/admin/subscriptions?filter=expiring&tier={tier_name}`
   - Shows only accounts with expiring subscriptions for that tier

2. **Over Limit Badge Click**:
   - URL: `/admin/subscriptions?filter=over-limit&tier={tier_name}`
   - Shows only accounts exceeding usage limits for that tier

### Hover States
- Warning badges: Slightly darker background on hover
- Smooth transition animations
- Cursor changes to pointer

## Responsive Behavior

### Desktop (≥1024px)
- Summary cards: 4 columns
- Full tier information visible
- All badges displayed inline

### Tablet (768px - 1023px)
- Summary cards: 2 columns
- Tier rows stack vertically
- Badges may wrap to new line

### Mobile (<768px)
- Summary cards: 1 column
- Tier information stacks
- Badges stack vertically
- Reduced padding for compact view

## Loading State

### Skeleton Components
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ ░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░ ││
│  │ ░░░░░░░░     │  │ ░░░░░░░░     │  │ ░░░░░░░░     │  │ ░░░░░░░░     ││
│  │ ░░░░░░       │  │ ░░░░░░       │  │ ░░░░░░       │  │ ░░░░░░       ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  │                                                                       ││
│  │  ░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ││
│  │  ░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Empty State

When no subscription data is available:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Subscriptions by Tier                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│                     No subscription data available                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Accessibility Features

1. **Semantic HTML**: Proper heading hierarchy and structure
2. **ARIA Labels**: Descriptive labels for screen readers
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Color Contrast**: Meets WCAG AA standards
5. **Focus Indicators**: Clear focus states for keyboard navigation
6. **Alt Text**: Descriptive text for icons

## Usage Context

The Subscription Overview Widget appears on the Admin Dashboard page:

1. **Location**: Below System Health and Metrics Refresh sections
2. **Access**: Super administrators only
3. **Update Frequency**: Real-time data from database
4. **Section Heading**: "Subscription Overview"

## Integration with Other Features

- **Account Activity List**: Click tier badges to filter accounts
- **Subscription Management**: Navigate to detailed subscription pages
- **Platform Metrics**: Complements overall platform statistics
- **System Health**: Part of comprehensive admin monitoring

---

This visual reference provides a complete picture of how the Subscription Overview Widget appears and functions within the admin dashboard.
