# Manual Accessibility Testing Guide

## Overview

This guide provides comprehensive instructions for manual accessibility testing to complement automated tests. Manual testing is essential because automated tools can only catch about 30-40% of accessibility issues.

## Requirements

- **Requirement 6.2**: Screen reader navigation support
- **Requirement 6.4**: Keyboard navigation for all functionality
- **Target**: All functionality accessible without a mouse

## Prerequisites

### Tools Required

1. **Screen Readers**:
   - **NVDA** (Windows) - Free, recommended
   - **JAWS** (Windows) - Commercial, industry standard
   - **VoiceOver** (macOS) - Built-in
   - **TalkBack** (Android) - Built-in
   - **Narrator** (Windows) - Built-in

2. **Browsers**:
   - Chrome/Edge (recommended for testing)
   - Firefox (good NVDA compatibility)
   - Safari (for VoiceOver on macOS)

3. **Testing Environment**:
   - Development server running
   - Test account with sample data
   - Clean browser profile (no extensions)

## Screen Reader Testing

### Installing NVDA (Windows)

1. Download from: https://www.nvaccess.org/download/
2. Install and restart computer
3. NVDA will start automatically

**Basic NVDA Commands**:
- `Ctrl` - Stop reading
- `Insert + Down Arrow` - Read from current position
- `Insert + Space` - Toggle browse/focus mode
- `H` - Next heading
- `Shift + H` - Previous heading
- `K` - Next link
- `Shift + K` - Previous link
- `B` - Next button
- `Shift + B` - Previous button
- `F` - Next form field
- `Shift + F` - Previous form field
- `T` - Next table
- `Insert + F7` - List all elements

### Screen Reader Testing Checklist

#### Dashboard Page

**Test Steps**:
1. Navigate to dashboard with screen reader active
2. Verify page title is announced
3. Navigate through all headings (H key)
4. Navigate through all links (K key)
5. Navigate through all buttons (B key)
6. Verify all metrics are announced with values
7. Test widget interactions

**Expected Results**:
- [ ] Page title announced: "Dashboard - Fluxera"
- [ ] All headings announced in logical order
- [ ] All metrics announced with labels and values
- [ ] All buttons have descriptive names
- [ ] All links have descriptive text
- [ ] Charts have text alternatives
- [ ] No "unlabeled" or "button" announcements

**Common Issues**:
- Icon buttons without labels
- Charts without text descriptions
- Missing heading hierarchy
- Unlabeled form controls

#### Assets List Page

**Test Steps**:
1. Navigate to assets list
2. Use heading navigation to find "Assets" section
3. Navigate through filter controls
4. Navigate through asset cards
5. Test search functionality
6. Test pagination controls

**Expected Results**:
- [ ] Page title announced correctly
- [ ] Filter controls have labels
- [ ] Search input has label
- [ ] Each asset card content is readable
- [ ] Asset status announced
- [ ] Action buttons have descriptive names
- [ ] Pagination controls are accessible

**Test Script**:
```
1. Press H until "Assets" heading
2. Press F to navigate to search field
3. Type "laptop" and press Enter
4. Press B to navigate through action buttons
5. Verify each button name is descriptive
6. Navigate to pagination with Tab
7. Verify page numbers are announced
```

#### Asset Detail Page

**Test Steps**:
1. Open an asset detail page
2. Navigate through all sections
3. Test edit functionality
4. Test assignment dialog
5. Test history tab

**Expected Results**:
- [ ] Asset name announced as heading
- [ ] All property labels announced
- [ ] All property values announced
- [ ] Edit button accessible
- [ ] Assignment dialog accessible
- [ ] History entries readable
- [ ] Tab navigation works correctly

#### Create Asset Form

**Test Steps**:
1. Open create asset dialog
2. Navigate through all form fields
3. Test field validation
4. Test error messages
5. Test form submission

**Expected Results**:
- [ ] Dialog title announced
- [ ] All fields have labels
- [ ] Required fields indicated
- [ ] Error messages announced
- [ ] Success message announced
- [ ] Focus management correct

**Validation Test**:
```
1. Open create asset form
2. Tab to Name field
3. Leave empty and Tab away
4. Verify error message announced
5. Fill in Name
6. Verify error cleared
7. Submit form
8. Verify success message
```

#### Licenses List Page

**Test Steps**:
1. Navigate to licenses list
2. Test filter controls
3. Navigate through license cards
4. Test expiration warnings
5. Test assignment functionality

**Expected Results**:
- [ ] Page title announced
- [ ] Expiration warnings announced
- [ ] License status announced
- [ ] All controls accessible
- [ ] Assignment dialogs accessible

#### Users List Page

**Test Steps**:
1. Navigate to users list
2. Test invite user form
3. Navigate through user cards
4. Test role management
5. Test status changes

**Expected Results**:
- [ ] Page title announced
- [ ] User roles announced
- [ ] User status announced
- [ ] All actions accessible
- [ ] Confirmation dialogs accessible

### Screen Reader Testing Tips

1. **Listen Completely**: Don't skip ahead, listen to full announcements
2. **Test Navigation**: Use both Tab and screen reader navigation
3. **Test Forms**: Verify all fields, labels, and errors
4. **Test Dialogs**: Verify focus management and announcements
5. **Test Tables**: Verify headers and cell associations
6. **Test Dynamic Content**: Verify live regions announce updates

## Keyboard Navigation Testing

### Keyboard Testing Checklist

#### Basic Navigation

**Keys to Test**:
- `Tab` - Move forward through interactive elements
- `Shift + Tab` - Move backward through interactive elements
- `Enter` - Activate buttons and links
- `Space` - Activate buttons and checkboxes
- `Escape` - Close dialogs and cancel actions
- `Arrow Keys` - Navigate within components

**Test All Pages**:
- [ ] Dashboard
- [ ] Assets list
- [ ] Asset detail
- [ ] Licenses list
- [ ] License detail
- [ ] Users list
- [ ] User detail

#### Focus Indicators

**Test Steps**:
1. Tab through all interactive elements
2. Verify visible focus indicator on each
3. Check focus indicator contrast
4. Verify focus order is logical

**Expected Results**:
- [ ] All interactive elements receive focus
- [ ] Focus indicator is clearly visible
- [ ] Focus indicator has sufficient contrast
- [ ] Focus order follows visual order
- [ ] No focus traps (can always escape)

**Focus Indicator Checklist**:
```
Element Type          | Has Focus | Visible | Contrast OK
---------------------|-----------|---------|------------
Links                | [ ]       | [ ]     | [ ]
Buttons              | [ ]       | [ ]     | [ ]
Form inputs          | [ ]       | [ ]     | [ ]
Checkboxes           | [ ]       | [ ]     | [ ]
Radio buttons        | [ ]       | [ ]     | [ ]
Select dropdowns     | [ ]       | [ ]     | [ ]
Custom components    | [ ]       | [ ]     | [ ]
```

#### Form Navigation

**Test Steps**:
1. Open create asset form
2. Tab through all fields
3. Test field validation with keyboard only
4. Submit form with Enter key
5. Verify error handling

**Expected Results**:
- [ ] Can reach all form fields with Tab
- [ ] Can fill all fields with keyboard
- [ ] Can trigger validation with keyboard
- [ ] Can submit form with Enter
- [ ] Can cancel with Escape
- [ ] Error messages receive focus

**Form Testing Script**:
```
1. Tab to Name field
2. Type "Test Laptop"
3. Tab to Category dropdown
4. Use Arrow keys to select
5. Tab to Status dropdown
6. Use Arrow keys to select
7. Tab to Serial Number
8. Type "SN123456"
9. Tab to Submit button
10. Press Enter
11. Verify success message
```

#### Dialog Navigation

**Test Steps**:
1. Open a dialog (e.g., create asset)
2. Verify focus moves to dialog
3. Tab through dialog controls
4. Try to Tab outside dialog (should trap focus)
5. Press Escape to close
6. Verify focus returns to trigger

**Expected Results**:
- [ ] Focus moves to dialog on open
- [ ] Focus trapped within dialog
- [ ] Can navigate all dialog controls
- [ ] Escape closes dialog
- [ ] Focus returns to trigger on close

#### Skip Navigation

**Test Steps**:
1. Load any page
2. Press Tab once
3. Verify skip link appears
4. Press Enter on skip link
5. Verify focus moves to main content

**Expected Results**:
- [ ] Skip link appears on first Tab
- [ ] Skip link is visible
- [ ] Skip link text is clear
- [ ] Activating skip link moves focus
- [ ] Focus moves to main content

#### Custom Components

**Components to Test**:
- [ ] Date pickers
- [ ] Autocomplete inputs
- [ ] Custom dropdowns
- [ ] Tabs
- [ ] Accordions
- [ ] Modals/Dialogs
- [ ] Tooltips
- [ ] Menus

**For Each Component**:
1. Can reach with Tab
2. Can operate with keyboard
3. Has visible focus indicator
4. Announces state changes
5. Follows ARIA patterns

### Keyboard Navigation Tips

1. **Unplug Mouse**: Force yourself to use keyboard only
2. **Test Tab Order**: Verify logical flow
3. **Test All Actions**: Every mouse action should have keyboard equivalent
4. **Test Focus Management**: Verify focus moves appropriately
5. **Test Escape Routes**: Always provide way to cancel/close

## Testing Procedures

### Complete Page Test

For each main page, complete this checklist:

#### 1. Initial Load
- [ ] Page title announced by screen reader
- [ ] Main heading announced
- [ ] Skip navigation link available
- [ ] Focus starts at appropriate location

#### 2. Heading Structure
- [ ] Navigate through all headings with H key
- [ ] Headings in logical order (h1, h2, h3)
- [ ] No heading levels skipped
- [ ] Headings describe content accurately

#### 3. Landmark Regions
- [ ] Navigate landmarks with D key (NVDA)
- [ ] Header landmark present
- [ ] Navigation landmark present
- [ ] Main landmark present
- [ ] Footer landmark present (if applicable)

#### 4. Interactive Elements
- [ ] All buttons accessible with B key
- [ ] All links accessible with K key
- [ ] All form fields accessible with F key
- [ ] All elements have descriptive names
- [ ] No "unlabeled" announcements

#### 5. Forms
- [ ] All fields have labels
- [ ] Required fields indicated
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Can complete form with keyboard only

#### 6. Dynamic Content
- [ ] Loading states announced
- [ ] Error states announced
- [ ] Success states announced
- [ ] Live regions update appropriately

#### 7. Images
- [ ] All images have alt text
- [ ] Decorative images have empty alt
- [ ] Alt text is descriptive
- [ ] No "image" or "graphic" in alt text

### Complete Feature Test

For each major feature, test:

#### Create Flow
1. Navigate to create button
2. Activate with Enter or Space
3. Verify dialog opens
4. Complete form with keyboard
5. Submit form
6. Verify success message
7. Verify focus management

#### Edit Flow
1. Navigate to item
2. Activate edit button
3. Verify form populated
4. Edit fields with keyboard
5. Submit changes
6. Verify success message

#### Delete Flow
1. Navigate to item
2. Activate delete button
3. Verify confirmation dialog
4. Confirm with keyboard
5. Verify success message

#### Search/Filter Flow
1. Navigate to search field
2. Enter search term
3. Verify results update
4. Navigate through results
5. Clear search
6. Verify results reset

## Common Issues and Solutions

### Issue 1: Unlabeled Buttons

**Problem**: Screen reader announces "button" without description

**Solution**:
```tsx
// Before
<button><TrashIcon /></button>

// After
<button aria-label="Delete asset">
  <TrashIcon />
</button>
```

### Issue 2: Missing Form Labels

**Problem**: Screen reader doesn't announce field purpose

**Solution**:
```tsx
// Before
<input type="text" name="name" />

// After
<label htmlFor="name">Asset Name</label>
<input type="text" id="name" name="name" />
```

### Issue 3: Focus Not Visible

**Problem**: Can't see which element has focus

**Solution**:
```css
/* Add visible focus indicator */
*:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### Issue 4: Focus Trap in Dialog

**Problem**: Can Tab outside of dialog

**Solution**:
```tsx
// Use Radix UI Dialog which handles focus trap
<Dialog.Root>
  <Dialog.Content>
    {/* Content */}
  </Dialog.Content>
</Dialog.Root>
```

### Issue 5: Dynamic Content Not Announced

**Problem**: Loading/error states not announced

**Solution**:
```tsx
// Add live region
<div role="status" aria-live="polite">
  {isLoading && "Loading assets..."}
  {error && `Error: ${error.message}`}
</div>
```

## Testing Schedule

### Daily Testing (During Development)
- Keyboard navigation for new features
- Screen reader testing for new components
- Focus management verification

### Weekly Testing
- Complete page keyboard navigation
- Screen reader testing of main flows
- Focus indicator verification

### Pre-Release Testing
- Complete manual accessibility audit
- All pages with screen reader
- All features with keyboard only
- Documentation of any issues

## Documentation

### Recording Issues

For each issue found, document:

1. **Page/Component**: Where the issue occurs
2. **Issue Type**: Keyboard, screen reader, focus, etc.
3. **Severity**: Critical, high, medium, low
4. **Description**: What's wrong
5. **Steps to Reproduce**: How to find the issue
6. **Expected Behavior**: What should happen
7. **Actual Behavior**: What actually happens
8. **Solution**: How to fix it

**Example Issue Report**:
```markdown
## Issue: Unlabeled Delete Button

**Page**: Assets List
**Type**: Screen Reader
**Severity**: High

**Description**: Delete button on asset cards is not labeled

**Steps to Reproduce**:
1. Navigate to assets list with NVDA
2. Press B to navigate to buttons
3. Hear "button" without description

**Expected**: Should announce "Delete asset" or similar
**Actual**: Announces only "button"

**Solution**: Add aria-label="Delete asset" to button
```

## Success Criteria

### All Tests Pass When:

1. **Screen Reader**:
   - All content is readable
   - All controls are operable
   - All states are announced
   - Navigation is logical

2. **Keyboard**:
   - All functionality accessible
   - Focus indicators visible
   - Focus order logical
   - No focus traps

3. **Overall**:
   - No critical issues
   - No high-priority issues
   - Medium issues documented
   - Low issues documented

## Resources

### Screen Reader Guides
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [JAWS Commands](https://www.freedomscientific.com/training/jaws/hotkeys/)
- [VoiceOver Guide](https://support.apple.com/guide/voiceover/welcome/mac)

### Testing Guides
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Tools
- [NVDA Download](https://www.nvaccess.org/download/)
- [Accessibility Insights](https://accessibilityinsights.io/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Next Steps

After completing manual testing:
1. Document all issues found
2. Prioritize issues by severity
3. Create tickets for fixes
4. Retest after fixes
5. Update documentation
6. Train team on accessibility

## Summary

Manual accessibility testing is essential for ensuring true accessibility compliance. This guide provides comprehensive procedures for:

- Screen reader testing with NVDA/JAWS
- Keyboard navigation testing
- Focus management verification
- Form accessibility testing
- Dynamic content testing

Complete all checklists and document any issues found for remediation.
