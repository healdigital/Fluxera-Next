# Modal Components

A comprehensive collection of modal components for building modern, accessible user interfaces.

## Overview

This package provides specialized modal components for common UI patterns:

- **QuickViewModal** - View entity details without navigation
- **FormSheet** - Slide-in panels for create/edit forms
- **AssignmentModal** - Assign assets/licenses to users
- **BulkActionModal** - Handle bulk operations with progress tracking
- **ExpandedWidgetModal** - Display dashboard widgets in expanded view

## Help and Documentation Features

- **FormFieldHelp** - Contextual help tooltips for form fields
- **StepIndicator** - Progress indicators for multi-step processes
- **ActionableError** - Error messages with actionable suggestions
- **InlineHelp** - General-purpose help tooltips

## Quick Start

```tsx
import {
  QuickViewModal,
  FormSheet,
  FormFieldHelp,
  StepIndicator,
  ActionableError,
} from '@kit/ui/modal';

// View details in a modal
<QuickViewModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Asset Details"
  data={asset}
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete, variant: 'destructive' }
  ]}
>
  <AssetDetailsContent asset={asset} />
</QuickViewModal>

// Create/edit form in a sheet
<FormSheet
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Create Asset"
  dirty={form.formState.isDirty}
>
  <CreateAssetForm />
</FormSheet>

// Add help to form fields
<FormFieldLabel
  label="Serial Number"
  helpContent="The serial number can be found on the device label"
  required
/>

// Show progress in multi-step forms
<StepIndicator
  steps={[
    { label: 'Details', description: 'Enter basic information' },
    { label: 'Assignment', description: 'Assign to user' },
    { label: 'Review', description: 'Confirm details' }
  ]}
  currentStep={1}
/>

// Display actionable errors
<ActionableError
  error={{
    message: 'Invalid email address',
    suggestion: 'Please enter a valid email (e.g., user@example.com)'
  }}
/>
```

## Documentation

- [Help and Documentation Guide](./HELP_DOCUMENTATION.md) - Complete guide for help features
- [Accessibility Implementation](./ACCESSIBILITY_IMPLEMENTATION.md) - Accessibility guidelines
- [Keyboard Shortcuts](./KEYBOARD_SHORTCUTS.md) - Keyboard navigation reference
- [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md) - Performance best practices

## Features

### Accessibility
- Full keyboard navigation support
- Screen reader friendly with proper ARIA labels
- Focus trap within modals
- Escape key to close
- Focus restoration on close

### Performance
- Lazy loading support
- Optimized animations (200-300ms)
- Body scroll lock with position preservation
- Z-index stack management

### User Experience
- Context preservation (scroll position, filters, selections)
- Unsaved changes warnings
- Loading states
- Responsive layouts
- Smooth animations

## Components

### QuickViewModal

Display entity details in a modal without navigating away from the current page.

```tsx
<QuickViewModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Asset Details"
  data={asset}
  loading={isLoading}
  actions={quickActions}
  onNavigate={handleNavigate}
>
  <AssetDetailsContent asset={asset} />
</QuickViewModal>
```

### FormSheet

Slide-in panel for create/edit forms with unsaved changes detection.

```tsx
<FormSheet
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Create Asset"
  description="Add a new asset to your inventory"
  side="right"
  size="lg"
  dirty={form.formState.isDirty}
>
  <CreateAssetForm onSuccess={() => setIsOpen(false)} />
</FormSheet>
```

### AssignmentModal

Specialized modal for assigning assets/licenses to users with search.

```tsx
<AssignmentModal
  open={isOpen}
  onOpenChange={setIsOpen}
  entityType="asset"
  entityId={assetId}
  entityName={assetName}
  currentAssignee={currentAssignee}
  onAssign={handleAssign}
  onUnassign={handleUnassign}
/>
```

### BulkActionModal

Handle bulk operations with progress tracking and results summary.

```tsx
<BulkActionModal
  open={isOpen}
  onOpenChange={setIsOpen}
  action="Delete"
  itemCount={selectedItems.length}
  items={selectedItems}
  onConfirm={handleBulkDelete}
  destructive
/>
```

### ExpandedWidgetModal

Display dashboard widgets in expanded view with filters and export.

```tsx
<ExpandedWidgetModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Asset Distribution"
  widget={widgetConfig}
  data={widgetData}
  filters={filters}
  onExport={handleExport}
/>
```

### FormFieldHelp

Add contextual help tooltips to form fields.

```tsx
<FormFieldHelp
  content="Enter the asset's unique serial number as printed on the device"
  title="Serial Number"
/>

// Or use with FormFieldLabel
<FormFieldLabel
  label="Serial Number"
  helpContent="The serial number can be found on the device label"
  required
  htmlFor="serial-number"
/>
```

### StepIndicator

Show progress through multi-step processes.

```tsx
<StepIndicator
  steps={[
    { label: 'Details', description: 'Enter basic information' },
    { label: 'Assignment', description: 'Assign to user' },
    { label: 'Review', description: 'Confirm details' }
  ]}
  currentStep={1}
  onStepClick={handleStepClick}
/>

// Or use simple progress bar
<StepProgress
  currentStep={2}
  totalSteps={5}
  label="Asset Creation"
/>
```

### ActionableError

Display error messages with actionable suggestions.

```tsx
<ActionableError
  error={{
    message: 'Invalid email address',
    suggestion: 'Please enter a valid email address (e.g., user@example.com)',
    helpLink: {
      text: 'Learn more about email validation',
      url: '/docs/validation'
    }
  }}
/>

// Use validation error helpers
import { ValidationErrors } from '@kit/ui/modal';

<FieldError error={ValidationErrors.required('Asset Name')} />
<FieldError error={ValidationErrors.email('Email')} />
<FieldError error={ValidationErrors.minLength('Password', 8)} />
```

## Hooks

### useModalState

Manage modal open/close state.

```tsx
import { useModalState } from '@kit/ui/hooks';

const { isOpen, entityId, open, close } = useModalState();

// Open modal with entity ID
open('asset-123');

// Close modal
close();
```

### useUnsavedChanges

Handle unsaved changes warnings.

```tsx
import { useUnsavedChanges } from '@kit/ui/hooks';

const { showWarning, handleClose, confirmClose, cancelClose } = 
  useUnsavedChanges(form.formState.isDirty);

// Attempt to close
if (handleClose()) {
  // Can close safely
}

// Show confirmation dialog if showWarning is true
```

### useKeyboardNavigation

Navigate between entities with arrow keys.

```tsx
import { useKeyboardNavigation } from '@kit/ui/hooks';

useKeyboardNavigation(items, currentId, (id) => {
  // Navigate to entity with id
});
```

## Error Handling

The package includes comprehensive error handling utilities:

```tsx
import {
  ValidationErrors,
  createApiErrorMessage,
  formatErrorMessage,
  summarizeErrors,
} from '@kit/ui/modal';

// Common validation errors
const requiredError = ValidationErrors.required('Email');
const emailError = ValidationErrors.email('Email');
const lengthError = ValidationErrors.minLength('Password', 8);

// API error handling
try {
  await api.updateAsset(data);
} catch (error) {
  const errorMessage = createApiErrorMessage(error, 'update the asset');
  setError(errorMessage);
}

// Multiple errors
const summary = summarizeErrors([error1, error2, error3]);
```

## Testing

All components include comprehensive property-based tests:

```bash
# Run all modal tests
pnpm --filter @kit/ui test

# Run specific test suites
pnpm --filter @kit/ui test inline-help.property.test
pnpm --filter @kit/ui test step-indicator.property.test
pnpm --filter @kit/ui test error-messages.property.test
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Mobile: Latest version

## Dependencies

Built on top of:
- Radix UI primitives
- Tailwind CSS
- Lucide React icons

## Contributing

When adding new modal components:

1. Follow the existing component patterns
2. Include comprehensive TypeScript types
3. Add accessibility features (ARIA labels, keyboard navigation)
4. Write property-based tests
5. Document usage with examples
6. Update this README

## License

Part of the Fluxera application.
