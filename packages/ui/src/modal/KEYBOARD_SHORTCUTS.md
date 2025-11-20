# Modal Keyboard Shortcuts

This document describes the keyboard shortcuts available in all modal components.

## Universal Shortcuts (All Modals)

### Escape Key
- **Action**: Close the modal
- **Applies to**: All modals (QuickViewModal, FormSheet, AssignmentModal, BulkActionModal, ExpandedWidgetModal)
- **Note**: For FormSheet with unsaved changes, a confirmation dialog will appear first

### Tab / Shift+Tab
- **Action**: Navigate forward/backward through focusable elements
- **Applies to**: All modals
- **Behavior**: Focus is trapped within the modal and cycles through all interactive elements

### Click Outside
- **Action**: Close the modal (for non-critical modals)
- **Applies to**: QuickViewModal, ExpandedWidgetModal
- **Note**: FormSheet and modals with unsaved changes will show a confirmation dialog

## QuickViewModal Specific

### Arrow Left / Arrow Up
- **Action**: Navigate to the previous item in the list
- **Applies to**: QuickViewModal with `onNavigate` prop
- **Example**: When viewing asset details, navigate to the previous asset

### Arrow Right / Arrow Down
- **Action**: Navigate to the next item in the list
- **Applies to**: QuickViewModal with `onNavigate` prop
- **Example**: When viewing asset details, navigate to the next asset

## FormSheet Specific

### Enter (on Submit Button)
- **Action**: Submit the form
- **Applies to**: FormSheet with `onSubmit` prop
- **Note**: Only works when the submit button has focus

## AssignmentModal Specific

### Type to Search
- **Action**: Filter the user list in real-time
- **Applies to**: AssignmentModal search input
- **Behavior**: Focus automatically moves to the search input when modal opens

## Accessibility Features

### Screen Reader Support
- All modals announce their opening with title and description
- Interactive elements have proper ARIA labels
- Form validation errors are announced
- Progress updates are announced in real-time

### Focus Management
- Focus automatically moves into the modal when it opens
- Focus is trapped within the modal (cannot tab outside)
- Focus returns to the trigger element when the modal closes
- First focusable element receives focus on open

## Implementation Details

### For Developers

To enable keyboard navigation in QuickViewModal:

```tsx
<QuickViewModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Asset Details"
  onNavigate={(direction) => {
    if (direction === 'prev') {
      // Navigate to previous item
    } else {
      // Navigate to next item
    }
  }}
>
  {/* Content */}
</QuickViewModal>
```

### Disabling Click Outside

For critical modals where accidental closure should be prevented:

```tsx
// This is handled automatically by Radix UI
// FormSheet with dirty state will show confirmation
// AlertDialog cannot be closed by clicking outside
```

## Testing Keyboard Shortcuts

### Manual Testing Checklist

- [ ] Escape key closes all modals
- [ ] Tab cycles through all focusable elements
- [ ] Shift+Tab cycles backwards
- [ ] Focus returns to trigger on close
- [ ] Arrow keys navigate between items (QuickViewModal)
- [ ] Click outside closes non-critical modals
- [ ] Unsaved changes show confirmation
- [ ] Screen reader announces modal opening
- [ ] All buttons have accessible labels

### Automated Testing

Property-based tests are available in:
- `packages/ui/src/modal/__tests__/focus-trap.property.test.tsx`
- `packages/ui/src/modal/__tests__/accessibility.property.test.tsx`
- `packages/ui/src/modal/__tests__/keyboard-shortcuts.property.test.tsx`

## Browser Support

Keyboard shortcuts work in all modern browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (touch events are converted to appropriate actions)

## Related Documentation

- [Radix UI Dialog Documentation](https://www.radix-ui.com/docs/primitives/components/dialog)
- [ARIA Authoring Practices - Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WebAIM - Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
