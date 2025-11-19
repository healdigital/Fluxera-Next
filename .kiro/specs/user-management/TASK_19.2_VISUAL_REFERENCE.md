# Task 19.2: Role Change Flow Tests - Visual Reference

## Test Flow Visualization

### Test 1: Basic Role Change Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Start: Users List Page                                   │
│    - Click "Invite User" button                             │
│    - Create new member with role: "member"                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Navigate to User Detail Page                             │
│    - Click on user row in list                              │
│    - Verify initial role display shows "member"             │
│    ✓ data-test="user-role-display" contains "member"        │
│    ✓ data-test="user-role-badge" contains "Member"          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Open Role Change Dialog                                  │
│    - Click "Change Role" button                             │
│    - Dialog appears with current role                       │
│    ✓ data-test="assign-role-dialog" is visible              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Select New Role                                          │
│    - Click role dropdown                                    │
│    - Select "owner" from options                            │
│    ✓ data-test="new-role-select" shows "owner"              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Confirm Role Change                                      │
│    - Click "Confirm" button                                 │
│    - Wait for dialog to close                               │
│    - Page refreshes with new data                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Verify Role Updated                                      │
│    ✓ data-test="user-role-display" contains "owner"         │
│    ✓ data-test="user-role-badge" contains "Owner"           │
└─────────────────────────────────────────────────────────────┘
```

### Test 2: Dialog Functionality

```
┌─────────────────────────────────────────────────────────────┐
│ User Detail Page                                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [User Avatar]  John Doe                             │   │
│  │                john@example.com                     │   │
│  │                                    [Active] [Member]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Account Information                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🛡️ Role: member  ← data-test="user-role-display"    │   │
│  │ 📅 Member Since: Jan 1, 2024                        │   │
│  │ 🕐 Last Sign In: 2 hours ago                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [View Activity] [Change Role] [Change Status]              │
│                       ↓ Click                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Role Change Dialog (data-test="assign-role-dialog")        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Assign Role                                    [X]      │ │
│ │ Change the role for John Doe                           │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🛡️ Current Role: member                            │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ New Role                                                │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [Select role ▼] ← data-test="new-role-select"      │ │ │
│ │ │   • member                                          │ │ │
│ │ │   • owner    ← Click this                          │ │ │
│ │ │   • admin                                           │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ ⚠️ Confirm Role Change                                  │ │
│ │ You are about to change John Doe's role from           │ │
│ │ member to owner. This will update their permissions.   │ │
│ │                                                         │ │
│ │              [Cancel] [Confirm] ← Enabled when changed │ │
│ │                        ↑                                │ │
│ │         data-test="confirm-assign-role-button"         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Test 3: List View Update

```
Before Role Change:
┌─────────────────────────────────────────────────────────────┐
│ Users List                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name          Email              Role      Status       │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ John Doe      john@example.com   member    Active      │ │
│ │                                    ↑                    │ │
│ │                              Shows "member"             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

After Role Change:
┌─────────────────────────────────────────────────────────────┐
│ Users List                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name          Email              Role      Status       │ │
│ │ ─────────────────────────────────────────────────────── │ │
│ │ John Doe      john@example.com   owner     Active      │ │
│ │                                    ↑                    │ │
│ │                              Shows "owner"              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Test 4: Validation - Cannot Change to Same Role

```
┌─────────────────────────────────────────────────────────────┐
│ Role Change Dialog                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Current Role: member                                    │ │
│ │                                                         │ │
│ │ New Role: [member ▼]  ← Same as current                │ │
│ │                                                         │ │
│ │              [Cancel] [Confirm]                         │ │
│ │                          ↑                              │ │
│ │                      DISABLED                           │ │
│ │                  (no change made)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Test Assertions

### 1. Initial State Verification
```typescript
// Verify initial role is displayed
const roleDisplay = page.locator('[data-test="user-role-display"]');
await expect(roleDisplay).toContainText('member');

const roleBadge = page.locator('[data-test="user-role-badge"]');
await expect(roleBadge).toContainText('Member');
```

### 2. Dialog Interaction
```typescript
// Open dialog
await users.openAssignRoleDialog();
const dialog = page.locator('[data-test="assign-role-dialog"]');
await expect(dialog).toBeVisible();

// Verify current role shown
await expect(page.locator('text=Current Role')).toBeVisible();
await expect(dialog.locator('text=member')).toBeVisible();
```

### 3. Role Selection
```typescript
// Select new role
await users.selectNewRole('owner');
const roleSelect = page.locator('[data-test="new-role-select"]');
await expect(roleSelect).toContainText('owner');

// Verify confirm button enabled
const confirmButton = page.locator('[data-test="confirm-assign-role-button"]');
await expect(confirmButton).toBeEnabled();
```

### 4. Post-Change Verification
```typescript
// Verify role updated in detail view
await expect(roleDisplay).toContainText('owner');
await expect(roleBadge).toContainText('Owner');

// Verify role updated in list view
await users.navigateToUsers(slug);
const userRow = await users.getUserByEmail(memberEmail);
await expect(userRow).toContainText('owner');
```

### 5. Validation Check
```typescript
// Verify button disabled when no change
const confirmButton = page.locator('[data-test="confirm-assign-role-button"]');
await expect(confirmButton).toBeDisabled();

// Select same role
await users.selectNewRole('member');
await expect(confirmButton).toBeDisabled();
```

## Data-Test Attributes Reference

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `assign-role-button` | Button | Opens role change dialog |
| `assign-role-dialog` | Dialog | Role assignment modal |
| `new-role-select` | Select | Role dropdown |
| `role-option-{role}` | Option | Individual role options |
| `confirm-assign-role-button` | Button | Confirms role change |
| `cancel-assign-role-button` | Button | Cancels role change |
| `user-role-display` | Text | Role in account info section |
| `user-role-badge` | Badge | Role badge at top of page |
| `user-row-{email}` | Row | User row in list |

## Test Execution Flow

```
Setup Phase:
1. Authenticate as owner user
2. Create team account
3. Navigate to users page

Test Phase:
1. Invite new user with initial role
2. Navigate to user detail page
3. Verify initial role display
4. Open role change dialog
5. Select new role
6. Confirm change
7. Verify role updated in detail view
8. Navigate to users list
9. Verify role updated in list view

Cleanup Phase:
1. Test data automatically cleaned up
2. Session cleared
```

## Expected Behavior

### Success Scenario
1. ✅ Dialog opens with current role displayed
2. ✅ New role can be selected from dropdown
3. ✅ Confirmation warning appears
4. ✅ Confirm button enables when role changes
5. ✅ Role updates in database
6. ✅ Page refreshes with new role
7. ✅ Role displays correctly in detail view
8. ✅ Role displays correctly in list view
9. ✅ Success toast notification appears

### Validation Scenario
1. ✅ Confirm button disabled initially
2. ✅ Confirm button disabled when same role selected
3. ✅ Cannot submit without making a change
4. ✅ Dialog can be cancelled without changes

## Integration Points

The tests verify integration with:
- **Database**: Role changes persist in `accounts_memberships` table
- **RLS Policies**: Only authorized users can change roles
- **Activity Log**: Role changes are logged
- **UI Components**: All UI elements update correctly
- **Navigation**: Changes persist across page navigation

## Performance Considerations

- Tests wait for page refresh after role change (1.5s timeout)
- Dialog animations are accounted for (1s timeout)
- Network requests are awaited properly
- No race conditions in assertions
