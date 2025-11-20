# Modal Help and Documentation Guide

This guide provides comprehensive documentation for implementing help features and inline documentation in modal components.

## Overview

The modal system includes several components and utilities for providing contextual help to users:

1. **FormFieldHelp** - Tooltips for form fields
2. **StepIndicator** - Progress indicators for multi-step processes
3. **ActionableError** - Error messages with suggestions
4. **InlineHelp** - General-purpose help tooltips

## FormFieldHelp Component

### Purpose
Provides contextual help for complex form fields through tooltips that appear after a 500ms delay.

### Usage

```tsx
import { FormFieldHelp } from '@kit/ui/modal';

// Basic usage
<FormFieldHelp
  content="Enter the asset's unique serial number as printed on the device"
  title="Serial Number"
/>

// With FormFieldLabel
import { FormFieldLabel } from '@kit/ui/modal';

<FormFieldLabel
  label="Serial Number"
  helpContent="The serial number can be found on the bottom or back of the device"
  required
  htmlFor="serial-number"
/>
```

### When to Use

Use FormFieldHelp when:
- A field requires explanation beyond its label
- Users might not understand what data to enter
- There are specific format requirements
- The field has business logic that needs explanation

### Best Practices

1. **Be Concise**: Keep help text under 200 characters when possible
2. **Be Specific**: Provide concrete examples (e.g., "Enter email like user@example.com")
3. **Be Actionable**: Tell users what to do, not just what's wrong
4. **Use Consistent Language**: Match the tone of your application

### Examples

```tsx
// Good: Specific and actionable
<FormFieldHelp
  content="Enter the 12-digit serial number found on the device label (e.g., ABC123456789)"
  title="Serial Number"
/>

// Bad: Vague and unhelpful
<FormFieldHelp
  content="Enter the serial number"
  title="Serial Number"
/>

// Good: Explains business logic
<FormFieldHelp
  content="Warranty expiry date determines when extended coverage options become available. The system will alert you 30 days before expiration."
  title="Warranty Expiry"
/>

// Good: Provides context for complex fields
<FormFieldHelp
  content="Select the category that best describes this asset. This affects depreciation calculations, maintenance schedules, and reporting."
  title="Asset Category"
/>
```

## StepIndicator Component

### Purpose
Shows users their progress through multi-step processes in modals.

### Usage

```tsx
import { StepIndicator, StepProgress, MultiStepModal } from '@kit/ui/modal';

// Basic step indicator
<StepIndicator
  steps={[
    { label: 'Basic Info', description: 'Enter asset details' },
    { label: 'Assignment', description: 'Assign to user' },
    { label: 'Review', description: 'Confirm details' }
  ]}
  currentStep={1}
/>

// Simple progress bar
<StepProgress
  currentStep={2}
  totalSteps={5}
  label="Asset Creation"
/>

// Complete multi-step modal
<MultiStepModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Create Asset"
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
>
  {currentStepContent}
</MultiStepModal>
```

### When to Use

Use StepIndicator when:
- A process has 3 or more distinct steps
- Users need to understand where they are in the workflow
- Steps can be completed in sequence
- Users might want to navigate back to previous steps

### Best Practices

1. **Clear Labels**: Use short, descriptive labels (1-3 words)
2. **Helpful Descriptions**: Add descriptions to explain what happens in each step
3. **Logical Progression**: Ensure steps follow a natural order
4. **Allow Navigation**: Let users click on completed steps to go back

### Examples

```tsx
// Good: Clear progression with descriptions
const steps = [
  { 
    label: 'Details', 
    description: 'Enter basic asset information' 
  },
  { 
    label: 'Assignment', 
    description: 'Assign to a user or department' 
  },
  { 
    label: 'Review', 
    description: 'Confirm and submit' 
  }
];

// Good: Compact variant for limited space
<StepIndicator
  steps={steps}
  currentStep={1}
  variant="compact"
/>

// Good: Vertical layout for side panels
<StepIndicator
  steps={steps}
  currentStep={1}
  orientation="vertical"
/>
```

## ActionableError Component

### Purpose
Displays error messages with clear suggestions for how to fix them.

### Usage

```tsx
import { 
  ActionableError, 
  FieldError, 
  ErrorList,
  ValidationErrors 
} from '@kit/ui/modal';

// Single error with suggestion
<ActionableError
  error={{
    message: 'Invalid email address',
    suggestion: 'Please enter a valid email address (e.g., user@example.com)'
  }}
/>

// Field-specific error
<FieldError
  error={ValidationErrors.required('Asset Name')}
/>

// Multiple errors
<ErrorList
  errors={[
    ValidationErrors.required('Name'),
    ValidationErrors.email('Email'),
    ValidationErrors.minLength('Description', 10)
  ]}
/>

// Bulk operation errors
<BulkErrorSummary
  total={10}
  succeeded={7}
  failed={3}
  errors={[
    { id: 'asset-1', error: 'Permission denied' },
    { id: 'asset-2', error: 'Not found' },
    { id: 'asset-3', error: 'Validation failed' }
  ]}
  onRetry={handleRetry}
/>
```

### When to Use

Use ActionableError when:
- Validation fails
- API requests fail
- User input is incorrect
- Operations cannot be completed

### Best Practices

1. **Always Provide Suggestions**: Tell users how to fix the error
2. **Be Specific**: Explain exactly what's wrong
3. **Avoid Technical Jargon**: Use plain language
4. **Provide Examples**: Show correct format when relevant

### Error Message Helpers

```tsx
import { ValidationErrors, createApiErrorMessage } from '@kit/ui/modal';

// Common validation errors
ValidationErrors.required('Email')
ValidationErrors.email('Email')
ValidationErrors.minLength('Password', 8)
ValidationErrors.maxLength('Description', 500)
ValidationErrors.pattern('Phone', '(555) 555-5555')
ValidationErrors.duplicate('Serial Number')

// API errors
const error = createApiErrorMessage(apiError, 'update the asset');

// Custom errors
const customError = {
  message: 'Asset is currently in use',
  suggestion: 'Please unassign the asset before deleting it',
  helpLink: {
    text: 'Learn more about asset deletion',
    url: '/docs/assets/deletion'
  }
};
```

## InlineHelp Component

### Purpose
General-purpose help tooltips for any UI element.

### Usage

```tsx
import { InlineHelp, InlineHelpText } from '@kit/ui/inline-help';

// Icon only
<InlineHelp
  content="This feature is only available to administrators"
  title="Admin Only"
/>

// With text label
<InlineHelpText
  label="Learn more"
  content="Detailed explanation of this feature..."
/>

// Different variants
<InlineHelp
  content="Important information"
  variant="info"
  size="md"
  side="right"
/>
```

### When to Use

Use InlineHelp when:
- Providing context for UI elements
- Explaining features or functionality
- Clarifying terminology
- Offering additional information without cluttering the UI

## Accessibility Guidelines

All help components follow accessibility best practices:

### Keyboard Navigation
- All help icons are keyboard focusable
- Tooltips appear on focus as well as hover
- Press Tab to move between help elements
- Press Escape to close tooltips

### Screen Readers
- Help icons have descriptive ARIA labels
- Tooltips are announced when opened
- Error messages use role="alert" for immediate announcement
- Step indicators use proper navigation landmarks

### Visual Design
- Help icons use consistent styling
- Tooltips have sufficient contrast
- Error messages are clearly distinguished
- Progress indicators are visually clear

## Integration Examples

### Complete Form with Help

```tsx
import { FormFieldLabel, ActionableError, ValidationErrors } from '@kit/ui/modal';

function AssetForm() {
  return (
    <form>
      {error && <ActionableError error={error} />}
      
      <div>
        <FormFieldLabel
          label="Asset Name"
          helpContent="Use a consistent naming convention like 'Device Type - Model - Identifier'"
          required
          htmlFor="name"
        />
        <Input id="name" {...register('name')} />
        {errors.name && <FieldError error={errors.name} />}
      </div>
      
      <div>
        <FormFieldLabel
          label="Serial Number"
          helpContent="The serial number can be found on the device label, usually on the bottom or back"
          htmlFor="serial"
        />
        <Input id="serial" {...register('serial')} />
        {errors.serial && <FieldError error={errors.serial} />}
      </div>
    </form>
  );
}
```

### Multi-Step Modal with Help

```tsx
import { MultiStepModal, FormFieldLabel } from '@kit/ui/modal';

function CreateAssetModal() {
  const steps = [
    { label: 'Details', description: 'Basic information' },
    { label: 'Assignment', description: 'Assign to user' },
    { label: 'Review', description: 'Confirm details' }
  ];

  return (
    <MultiStepModal
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Create Asset"
      steps={steps}
      currentStep={currentStep}
    >
      {currentStep === 0 && (
        <div>
          <FormFieldLabel
            label="Asset Category"
            helpContent="Select the category that best describes this asset for proper tracking and reporting"
            required
          />
          {/* Form fields */}
        </div>
      )}
      {/* Other steps */}
    </MultiStepModal>
  );
}
```

## Testing

All help components include comprehensive property-based tests:

```bash
# Run help tooltip tests
pnpm --filter @kit/ui test inline-help.property.test

# Run step indicator tests
pnpm --filter @kit/ui test step-indicator.property.test

# Run error message tests
pnpm --filter @kit/ui test error-messages.property.test
```

## Further Reading

- [Accessibility Implementation Guide](./ACCESSIBILITY_IMPLEMENTATION.md)
- [Modal Component Documentation](./README.md)
- [Form Best Practices](../makerkit/README.md)

## Support

For questions or issues:
1. Check the component documentation in the source files
2. Review the test files for usage examples
3. Consult the design document at `.kiro/specs/modal-ux-improvements/design.md`
