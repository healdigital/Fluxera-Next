# Accessibility Audit Guide

This guide provides comprehensive instructions for running automated accessibility tests and interpreting the results.

## Overview

The accessibility audit ensures WCAG 2.1 Level AA compliance across all main pages of the Fluxera application. We use two complementary tools:

1. **axe-core** - Automated accessibility testing integrated with Playwright
2. **Lighthouse** - Google's accessibility audit tool

## Requirements

- **Requirement 6.1**: WCAG 2.1 Level AA accessibility standards
- **Target**: 100% accessibility score on Lighthouse
- **Coverage**: All main pages (Dashboard, Assets, Licenses, Users)

## Running Automated Accessibility Tests

### 1. Playwright + axe-core Tests

These tests run as part of the E2E test suite and check for accessibility violations on all pages.

```bash
# Run all accessibility tests
pnpm --filter web-e2e test tests/accessibility/

# Run with UI mode for debugging
pnpm --filter web-e2e test:ui tests/accessibility/

# Run specific test
pnpm --filter web-e2e test tests/accessibility/accessibility.spec.ts
```

**What it checks:**
- WCAG 2.0 Level A and AA compliance
- WCAG 2.1 Level A and AA compliance
- Color contrast ratios
- Form labels and error messages
- Interactive element names
- Image alt text
- Heading hierarchy
- Landmark regions
- Keyboard navigation support

**Test Coverage:**
- ✅ Dashboard page
- ✅ Assets list page
- ✅ Asset detail page
- ✅ Licenses list page
- ✅ License detail page
- ✅ Users list page
- ✅ User detail page
- ✅ Create asset form
- ✅ Create license form
- ✅ Invite user form
- ✅ Navigation and header
- ✅ Form accessibility
- ✅ Color contrast
- ✅ Interactive elements
- ✅ Images
- ✅ Heading hierarchy
- ✅ Landmark regions

### 2. Lighthouse Accessibility Audit

Lighthouse provides a comprehensive accessibility score and detailed recommendations.

```bash
# Start the development server
pnpm dev

# In another terminal, run the Lighthouse audit
pnpm --filter web lighthouse:accessibility
```

**What it checks:**
- All WCAG 2.0 and 2.1 guidelines
- Best practices for accessibility
- ARIA usage
- Semantic HTML
- Screen reader compatibility
- Keyboard navigation
- Focus management

**Output:**
- JSON report saved to `apps/web/lighthouse-reports/`
- Console summary with scores for each page
- Detailed violation descriptions

## Interpreting Results

### axe-core Test Results

**Success:**
```
✓ Dashboard page should not have accessibility violations
✓ Assets list page should not have accessibility violations
```

**Failure:**
```
✗ Dashboard page should not have accessibility violations
  Expected: []
  Received: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
      nodes: [...]
    }
  ]
```

**Common Violations:**

1. **color-contrast**: Text doesn't have sufficient contrast
   - Fix: Adjust text or background colors
   - Minimum ratio: 4.5:1 for normal text, 3:1 for large text

2. **button-name**: Button doesn't have accessible name
   - Fix: Add `aria-label` or visible text

3. **label**: Form input missing label
   - Fix: Add `<label>` element or `aria-label`

4. **image-alt**: Image missing alt text
   - Fix: Add descriptive `alt` attribute

5. **heading-order**: Heading levels skip (e.g., h1 to h3)
   - Fix: Use proper heading hierarchy

### Lighthouse Results

**Score Interpretation:**
- **100**: Perfect - No accessibility issues
- **90-99**: Good - Minor issues that should be addressed
- **80-89**: Fair - Several issues need attention
- **< 80**: Poor - Significant accessibility problems

**Example Report:**
```json
{
  "summary": {
    "totalPages": 4,
    "averageScore": 95.5,
    "allPassed": true,
    "timestamp": "2024-11-18T10:30:00.000Z"
  },
  "results": [
    {
      "url": "http://localhost:3000/home/test-account",
      "accessibilityScore": 100,
      "violations": [],
      "timestamp": "2024-11-18T10:30:00.000Z"
    }
  ]
}
```

## Common Accessibility Issues and Fixes

### 1. Color Contrast

**Issue**: Text color doesn't have sufficient contrast with background

**Fix:**
```tsx
// Before (insufficient contrast)
<p className="text-gray-400 bg-gray-300">Low contrast text</p>

// After (sufficient contrast)
<p className="text-gray-900 bg-gray-100">High contrast text</p>
```

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools > Elements > Accessibility pane

### 2. Missing Form Labels

**Issue**: Input fields don't have associated labels

**Fix:**
```tsx
// Before
<input type="text" name="email" />

// After
<label htmlFor="email">Email Address</label>
<input type="text" id="email" name="email" />

// Or with aria-label
<input type="text" name="email" aria-label="Email Address" />
```

### 3. Missing Button Names

**Issue**: Icon buttons don't have accessible names

**Fix:**
```tsx
// Before
<button>
  <TrashIcon />
</button>

// After
<button aria-label="Delete asset">
  <TrashIcon />
</button>

// Or with Tooltip component
<Tooltip content="Delete asset">
  <button aria-label="Delete asset">
    <TrashIcon />
  </button>
</Tooltip>
```

### 4. Missing Alt Text

**Issue**: Images don't have descriptive alt text

**Fix:**
```tsx
// Before
<img src="/asset.jpg" />

// After
<img src="/asset.jpg" alt="Dell Laptop - Model XPS 15" />

// For decorative images
<img src="/decoration.svg" alt="" role="presentation" />
```

### 5. Improper Heading Hierarchy

**Issue**: Heading levels skip (e.g., h1 to h3)

**Fix:**
```tsx
// Before
<h1>Dashboard</h1>
<h3>Assets Overview</h3>

// After
<h1>Dashboard</h1>
<h2>Assets Overview</h2>
```

### 6. Missing Landmark Regions

**Issue**: Page doesn't have proper semantic structure

**Fix:**
```tsx
// Before
<div className="header">...</div>
<div className="content">...</div>
<div className="footer">...</div>

// After
<header>...</header>
<main id="main-content">...</main>
<footer>...</footer>
```

### 7. Keyboard Navigation Issues

**Issue**: Interactive elements can't be accessed via keyboard

**Fix:**
```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<button onClick={handleClick}>Click me</button>

// Or for custom interactive elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

## Best Practices

### 1. Use Semantic HTML

Always use the appropriate HTML element for the job:
- `<button>` for buttons
- `<a>` for links
- `<nav>` for navigation
- `<main>` for main content
- `<header>` and `<footer>` for page sections

### 2. Provide Text Alternatives

- Add `alt` text to all images
- Use `aria-label` for icon buttons
- Provide captions for videos
- Include transcripts for audio

### 3. Ensure Keyboard Accessibility

- All interactive elements must be keyboard accessible
- Provide visible focus indicators
- Support standard keyboard shortcuts (Tab, Enter, Space, Escape)
- Implement skip navigation links

### 4. Use ARIA Appropriately

- Use ARIA attributes to enhance accessibility
- Don't override native semantics
- Test with screen readers
- Follow ARIA authoring practices

### 5. Test with Real Users

- Test with keyboard only
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with browser zoom (200%)
- Test with high contrast mode

## Continuous Monitoring

### In Development

Run accessibility tests before committing:
```bash
# Quick check
pnpm --filter web-e2e test tests/accessibility/accessibility.spec.ts

# Full audit
pnpm --filter web lighthouse:accessibility
```

### In CI/CD

Accessibility tests run automatically on every pull request:
- Playwright accessibility tests in E2E suite
- Lighthouse accessibility audit (optional)

### Regular Audits

Schedule regular accessibility audits:
- Weekly: Run automated tests
- Monthly: Manual testing with screen readers
- Quarterly: Full accessibility review

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Automated auditing
- [NVDA](https://www.nvaccess.org/) - Free screen reader

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - ARIA patterns and widgets
- [WebAIM](https://webaim.org/) - Web accessibility resources

### Testing
- [Accessibility Testing Guide](https://www.a11yproject.com/checklist/)
- [Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Keyboard Testing](https://webaim.org/articles/keyboard/)

## Troubleshooting

### Tests Failing Locally

1. **Clear browser cache**: Old styles may cause false positives
2. **Update dependencies**: Ensure axe-core is up to date
3. **Check for dynamic content**: Wait for content to load before testing
4. **Review recent changes**: New components may introduce violations

### Lighthouse Not Running

1. **Check Chrome installation**: Lighthouse requires Chrome
2. **Verify server is running**: Start dev server first
3. **Check port availability**: Ensure port 3000 is not blocked
4. **Review firewall settings**: Allow Chrome to access localhost

### False Positives

Some violations may be false positives:
1. **Review the violation**: Understand what's being flagged
2. **Check the context**: Some patterns are acceptable in specific contexts
3. **Consult guidelines**: Verify against WCAG documentation
4. **Use exclusions carefully**: Only exclude if truly not applicable

## Next Steps

After running automated tests, proceed to manual accessibility testing:
- Test with screen readers (Task 18.2)
- Test keyboard navigation on all pages
- Verify all functionality is accessible
- Document any remaining issues

## Summary

Automated accessibility testing is the first line of defense for ensuring WCAG compliance. By running these tests regularly and addressing violations promptly, we maintain a high standard of accessibility for all users.

**Key Metrics:**
- ✅ Target: 100% Lighthouse accessibility score
- ✅ Target: Zero axe-core violations
- ✅ Coverage: All main pages and forms
- ✅ Compliance: WCAG 2.1 Level AA
