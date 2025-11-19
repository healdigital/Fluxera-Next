# Accessibility Quick Reference Guide

## Overview

This guide provides quick examples for implementing accessibility features in the Fluxera application.

## Tooltips

### Basic Tooltip
```typescript
import { SimpleTooltip } from '@kit/ui/tooltip';

<SimpleTooltip content="Delete this item">
  <Button variant="ghost" size="icon">
    <Trash2 className="h-4 w-4" />
  </Button>
</SimpleTooltip>
```

### Advanced Tooltip with Provider
```typescript
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@kit/ui/tooltip';

<TooltipProvider delayDuration={500}>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent side="right">
      Helpful information appears here
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Keyboard Navigation

### Basic Keyboard Events
```typescript
import { useKeyboardNavigation } from '@kit/shared/hooks';

function MyComponent() {
  useKeyboardNavigation({
    onEscape: () => closeDialog(),
    onEnter: () => submitForm(),
    onArrowDown: () => selectNext(),
    onArrowUp: () => selectPrevious(),
  });
  
  return <div>...</div>;
}
```

### Keyboard Shortcuts
```typescript
import { useKeyboardShortcuts } from '@kit/shared/hooks';

function MyComponent() {
  useKeyboardShortcuts([
    { key: 's', ctrl: true, callback: () => save() },
    { key: 'k', ctrl: true, callback: () => openSearch() },
    { key: 'n', ctrl: true, shift: true, callback: () => createNew() },
  ]);
  
  return <div>...</div>;
}
```

### Focus Trap for Modals
```typescript
import { useFocusTrap } from '@kit/shared/hooks';
import { useRef } from 'react';

function Modal({ isOpen }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);
  
  return (
    <div ref={modalRef}>
      <h2>Modal Title</h2>
      <button>Close</button>
    </div>
  );
}
```

## ARIA Labels

### Buttons with Icons
```typescript
// Icon-only button
<Button 
  variant="ghost" 
  size="icon"
  aria-label="Delete asset"
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>

// Button with text and icon
<Button aria-label="Create new asset">
  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
  New Asset
</Button>
```

### Links
```typescript
<Link 
  href="/assets/new"
  aria-label="Create new asset"
>
  <Plus className="h-4 w-4" aria-hidden="true" />
</Link>
```

### Loading States
```typescript
<div 
  role="status" 
  aria-live="polite"
  aria-busy="true"
>
  <Spinner className="h-8 w-8" aria-hidden="true" />
  <p>Loading assets...</p>
</div>
```

### Dialogs
```typescript
<Dialog>
  <DialogContent
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">
        Delete Asset
      </DialogTitle>
      <DialogDescription id="dialog-description">
        Are you sure you want to delete this asset?
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Semantic HTML

### Page Structure
```typescript
import { PageBody, PageHeader } from '@kit/ui/page';

function MyPage() {
  return (
    <>
      <PageHeader
        title="Assets"
        description="Manage your assets"
      />
      
      <PageBody>
        {/* Main content goes here */}
      </PageBody>
    </>
  );
}
```

### Navigation
```typescript
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/assets">Assets</a></li>
    <li><a href="/licenses">Licenses</a></li>
    <li><a href="/users">Users</a></li>
  </ul>
</nav>
```

### Skip Navigation
```typescript
// Already included in root layout
// Users can press Tab to see "Skip to main content" link
```

## Form Accessibility

### Input with Label
```typescript
<div>
  <Label htmlFor="asset-name">Asset Name</Label>
  <Input 
    id="asset-name"
    name="name"
    aria-required="true"
    aria-describedby="name-help"
  />
  <p id="name-help" className="text-sm text-muted-foreground">
    Enter a unique name for this asset
  </p>
</div>
```

### Error Messages
```typescript
<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    name="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      Please enter a valid email address
    </p>
  )}
</div>
```

### Select with Label
```typescript
<div>
  <Label htmlFor="category">Category</Label>
  <Select name="category">
    <SelectTrigger id="category" aria-label="Select asset category">
      <SelectValue placeholder="Select category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="laptop">Laptop</SelectItem>
      <SelectItem value="desktop">Desktop</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Interactive Elements

### Card as Button
```typescript
<Card
  className="cursor-pointer"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  role="button"
  aria-label={`View details for ${asset.name}`}
>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

### Toggle Button
```typescript
<Button
  variant={isActive ? "default" : "outline"}
  onClick={toggle}
  aria-pressed={isActive}
  aria-label={isActive ? "Deactivate" : "Activate"}
>
  {isActive ? "Active" : "Inactive"}
</Button>
```

## Status Indicators

### Badge with ARIA
```typescript
<Badge 
  variant="outline"
  aria-label={`Status: ${status}`}
>
  {status}
</Badge>
```

### Alert
```typescript
<Alert role="alert" aria-live="polite">
  <AlertCircle className="h-4 w-4" aria-hidden="true" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    This action cannot be undone.
  </AlertDescription>
</Alert>
```

## Color Contrast

### Status Colors (Pre-approved)
```typescript
// These colors meet WCAG AA standards
const statusColors = {
  available: 'text-green-800 bg-green-50 border-green-700',
  assigned: 'text-blue-800 bg-blue-50 border-blue-700',
  maintenance: 'text-orange-800 bg-orange-50 border-orange-700',
  retired: 'text-gray-800 bg-gray-50 border-gray-700',
  lost: 'text-red-800 bg-red-50 border-red-700',
};

// Dark mode variants
const darkStatusColors = {
  available: 'dark:text-green-300 dark:bg-green-950 dark:border-green-600',
  assigned: 'dark:text-blue-300 dark:bg-blue-950 dark:border-blue-600',
  maintenance: 'dark:text-orange-300 dark:bg-orange-950 dark:border-orange-600',
  retired: 'dark:text-gray-300 dark:bg-gray-950 dark:border-gray-600',
  lost: 'dark:text-red-300 dark:bg-red-950 dark:border-red-600',
};
```

## Testing Checklist

### Before Committing
- [ ] All buttons have descriptive labels
- [ ] Icons are marked with `aria-hidden="true"`
- [ ] Loading states have `role="status"`
- [ ] Dialogs have proper ARIA attributes
- [ ] Forms have associated labels
- [ ] Interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets 4.5:1 ratio

### Manual Testing
- [ ] Tab through the page - order makes sense
- [ ] Press Tab on page load - skip link appears
- [ ] Press Escape in dialogs - they close
- [ ] Press Enter on buttons - they activate
- [ ] Hover over icons - tooltips appear after 500ms

## Common Mistakes to Avoid

### ❌ Don't Do This
```typescript
// Missing ARIA label
<Button variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>

// Icon not hidden from screen readers
<Button aria-label="Delete">
  <Trash2 className="h-4 w-4" />
</Button>

// Non-semantic div as button
<div onClick={handleClick}>Click me</div>

// Missing label association
<Label>Name</Label>
<Input name="name" />
```

### ✅ Do This Instead
```typescript
// Proper ARIA label
<Button variant="ghost" size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>

// Icon hidden from screen readers
<Button aria-label="Delete">
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>

// Semantic button element
<Button onClick={handleClick}>Click me</Button>

// Proper label association
<Label htmlFor="name">Name</Label>
<Input id="name" name="name" />
```

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

### Testing Tools
- Chrome DevTools Accessibility Inspector
- axe DevTools Browser Extension
- WAVE Browser Extension
- Lighthouse Accessibility Audit

### Screen Readers
- NVDA (Windows) - Free
- JAWS (Windows) - Commercial
- VoiceOver (macOS) - Built-in
- TalkBack (Android) - Built-in

## Getting Help

If you're unsure about accessibility implementation:
1. Check this guide for examples
2. Review existing accessible components
3. Run automated accessibility tests
4. Test with keyboard navigation
5. Ask the team for review

Remember: Accessibility is not optional - it's a requirement for all new features!
