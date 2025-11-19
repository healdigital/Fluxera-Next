# Accessibility Testing Checklist

## Quick Reference Checklist

Use this checklist to verify accessibility compliance for each page and feature.

## Page-by-Page Checklist

### Dashboard Page

#### Screen Reader Testing
- [ ] Page title announced: "Dashboard - Fluxera"
- [ ] Main heading "Dashboard" announced
- [ ] All metric cards readable
- [ ] Metric values announced with labels
- [ ] All widgets accessible
- [ ] Chart data has text alternative
- [ ] All buttons have descriptive names
- [ ] All links have descriptive text

#### Keyboard Navigation
- [ ] Can Tab to all interactive elements
- [ ] Focus indicators visible on all elements
- [ ] Can activate all buttons with Enter/Space
- [ ] Can navigate widgets with keyboard
- [ ] No focus traps
- [ ] Logical tab order
- [ ] Skip navigation link works

#### ARIA and Semantics
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Landmark regions defined (header, nav, main)
- [ ] Live regions for dynamic content
- [ ] Proper ARIA labels on controls
- [ ] Status messages announced

---

### Assets List Page

#### Screen Reader Testing
- [ ] Page title announced correctly
- [ ] "Assets" heading announced
- [ ] Search field has label
- [ ] Filter controls have labels
- [ ] Each asset card content readable
- [ ] Asset status announced
- [ ] Asset category announced
- [ ] Action buttons have descriptive names
- [ ] Pagination controls accessible

#### Keyboard Navigation
- [ ] Can Tab to search field
- [ ] Can Tab to filter controls
- [ ] Can Tab through asset cards
- [ ] Can activate action buttons
- [ ] Can navigate pagination
- [ ] Focus indicators visible
- [ ] Logical tab order

#### Forms and Filters
- [ ] Search input has label
- [ ] Category filter has label
- [ ] Status filter has label
- [ ] Clear filters button accessible
- [ ] Filter changes announced

---

### Asset Detail Page

#### Screen Reader Testing
- [ ] Asset name announced as heading
- [ ] All property labels announced
- [ ] All property values announced
- [ ] Edit button accessible
- [ ] Delete button accessible
- [ ] Assignment button accessible
- [ ] History tab accessible
- [ ] History entries readable

#### Keyboard Navigation
- [ ] Can Tab to all controls
- [ ] Can activate edit button
- [ ] Can activate delete button
- [ ] Can switch between tabs
- [ ] Can navigate history entries
- [ ] Focus indicators visible

#### Dialogs
- [ ] Edit dialog accessible
- [ ] Delete confirmation accessible
- [ ] Assignment dialog accessible
- [ ] Focus trapped in dialogs
- [ ] Escape closes dialogs
- [ ] Focus returns after close

---

### Create Asset Form

#### Screen Reader Testing
- [ ] Dialog title announced
- [ ] All fields have labels
- [ ] Required fields indicated
- [ ] Field descriptions announced
- [ ] Error messages announced
- [ ] Success message announced
- [ ] Cancel button accessible
- [ ] Submit button accessible

#### Keyboard Navigation
- [ ] Can Tab through all fields
- [ ] Can fill all fields with keyboard
- [ ] Can select from dropdowns
- [ ] Can upload image with keyboard
- [ ] Can submit with Enter
- [ ] Can cancel with Escape
- [ ] Focus management correct

#### Validation
- [ ] Required field errors announced
- [ ] Format errors announced
- [ ] Error messages clear
- [ ] Errors associated with fields
- [ ] Can correct errors with keyboard

---

### Licenses List Page

#### Screen Reader Testing
- [ ] Page title announced
- [ ] "Licenses" heading announced
- [ ] Expiration warnings announced
- [ ] License status announced
- [ ] Filter controls accessible
- [ ] Search field has label
- [ ] Action buttons have names

#### Keyboard Navigation
- [ ] Can Tab to all controls
- [ ] Can navigate license cards
- [ ] Can activate actions
- [ ] Can use filters
- [ ] Focus indicators visible

#### Alerts
- [ ] Expiring soon alerts announced
- [ ] Expired alerts announced
- [ ] Alert severity indicated
- [ ] Alerts dismissible with keyboard

---

### License Detail Page

#### Screen Reader Testing
- [ ] License name announced
- [ ] All properties readable
- [ ] Expiration status announced
- [ ] Assignment info announced
- [ ] Action buttons accessible

#### Keyboard Navigation
- [ ] Can Tab to all controls
- [ ] Can edit license
- [ ] Can assign license
- [ ] Can delete license
- [ ] Focus indicators visible

---

### Users List Page

#### Screen Reader Testing
- [ ] Page title announced
- [ ] "Users" heading announced
- [ ] User roles announced
- [ ] User status announced
- [ ] Invite button accessible
- [ ] Filter controls accessible

#### Keyboard Navigation
- [ ] Can Tab to all controls
- [ ] Can navigate user cards
- [ ] Can activate invite button
- [ ] Can use filters
- [ ] Focus indicators visible

---

### User Detail Page

#### Screen Reader Testing
- [ ] User name announced
- [ ] User role announced
- [ ] User status announced
- [ ] All properties readable
- [ ] Action buttons accessible
- [ ] Activity log readable

#### Keyboard Navigation
- [ ] Can Tab to all controls
- [ ] Can edit user
- [ ] Can change role
- [ ] Can change status
- [ ] Can view activity
- [ ] Focus indicators visible

---

### Invite User Form

#### Screen Reader Testing
- [ ] Dialog title announced
- [ ] Email field has label
- [ ] Role field has label
- [ ] Required fields indicated
- [ ] Error messages announced
- [ ] Success message announced

#### Keyboard Navigation
- [ ] Can Tab through fields
- [ ] Can fill email field
- [ ] Can select role
- [ ] Can submit form
- [ ] Can cancel form
- [ ] Focus management correct

---

## Component-Level Checklist

### Buttons

- [ ] All buttons have accessible names
- [ ] Icon buttons have aria-label
- [ ] Button purpose is clear
- [ ] Disabled state announced
- [ ] Loading state announced
- [ ] Can activate with Enter/Space

### Links

- [ ] All links have descriptive text
- [ ] Link purpose is clear from text
- [ ] No "click here" or "read more"
- [ ] External links indicated
- [ ] Can activate with Enter

### Form Inputs

- [ ] All inputs have labels
- [ ] Labels associated with inputs
- [ ] Required fields indicated
- [ ] Field descriptions provided
- [ ] Error messages clear
- [ ] Placeholder text not sole label

### Dropdowns/Selects

- [ ] Select has label
- [ ] Options are readable
- [ ] Selected value announced
- [ ] Can navigate with arrows
- [ ] Can select with Enter/Space

### Checkboxes

- [ ] Checkbox has label
- [ ] Checked state announced
- [ ] Can toggle with Space
- [ ] Focus indicator visible

### Radio Buttons

- [ ] Group has label/legend
- [ ] Each option has label
- [ ] Selected option announced
- [ ] Can navigate with arrows
- [ ] Can select with Space

### Dialogs/Modals

- [ ] Dialog title announced
- [ ] Focus moves to dialog
- [ ] Focus trapped in dialog
- [ ] Can close with Escape
- [ ] Focus returns after close
- [ ] Backdrop doesn't receive focus

### Tables

- [ ] Table has caption/title
- [ ] Headers defined
- [ ] Headers associated with cells
- [ ] Can navigate with arrows
- [ ] Sortable columns indicated

### Tabs

- [ ] Tab list has label
- [ ] Selected tab announced
- [ ] Can navigate with arrows
- [ ] Can activate with Enter/Space
- [ ] Tab panel associated with tab

### Tooltips

- [ ] Tooltip content announced
- [ ] Appears on focus
- [ ] Appears on hover
- [ ] Dismissible with Escape
- [ ] Doesn't hide on hover

### Loading States

- [ ] Loading announced
- [ ] Loading indicator visible
- [ ] Loading text provided
- [ ] Can cancel if applicable

### Error States

- [ ] Error announced
- [ ] Error message clear
- [ ] Error associated with field
- [ ] Error dismissible
- [ ] Focus moves to error

### Success States

- [ ] Success announced
- [ ] Success message clear
- [ ] Success dismissible
- [ ] Auto-dismiss timeout appropriate

---

## WCAG 2.1 Level AA Checklist

### Perceivable

#### Text Alternatives (1.1)
- [ ] All images have alt text
- [ ] Decorative images have empty alt
- [ ] Complex images have long descriptions
- [ ] Icons have text alternatives

#### Time-based Media (1.2)
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] Media controls accessible

#### Adaptable (1.3)
- [ ] Semantic HTML used
- [ ] Heading hierarchy correct
- [ ] Lists marked up properly
- [ ] Tables have proper structure
- [ ] Form labels associated

#### Distinguishable (1.4)
- [ ] Color not sole indicator
- [ ] Text contrast ≥ 4.5:1
- [ ] Large text contrast ≥ 3:1
- [ ] Text resizable to 200%
- [ ] No horizontal scrolling at 320px
- [ ] Line height ≥ 1.5
- [ ] Paragraph spacing ≥ 2x font size

### Operable

#### Keyboard Accessible (2.1)
- [ ] All functionality keyboard accessible
- [ ] No keyboard traps
- [ ] Keyboard shortcuts documented
- [ ] Focus visible

#### Enough Time (2.2)
- [ ] Timeouts adjustable
- [ ] Auto-refresh pausable
- [ ] Timeouts warned

#### Seizures (2.3)
- [ ] No flashing content
- [ ] Animations pausable

#### Navigable (2.4)
- [ ] Skip navigation provided
- [ ] Page titles descriptive
- [ ] Focus order logical
- [ ] Link purpose clear
- [ ] Multiple navigation methods
- [ ] Headings and labels descriptive

#### Input Modalities (2.5)
- [ ] Touch targets ≥ 44x44px
- [ ] Pointer gestures have alternatives
- [ ] Motion actuation has alternatives

### Understandable

#### Readable (3.1)
- [ ] Language defined
- [ ] Language changes marked

#### Predictable (3.2)
- [ ] Focus doesn't trigger changes
- [ ] Input doesn't trigger changes
- [ ] Navigation consistent
- [ ] Identification consistent

#### Input Assistance (3.3)
- [ ] Errors identified
- [ ] Labels provided
- [ ] Error suggestions provided
- [ ] Error prevention for critical actions

### Robust

#### Compatible (4.1)
- [ ] Valid HTML
- [ ] ARIA used correctly
- [ ] Status messages announced

---

## Testing Tools Checklist

### Automated Tools Used
- [ ] axe-core Playwright tests
- [ ] Lighthouse accessibility audit
- [ ] Browser DevTools accessibility pane
- [ ] WAVE browser extension

### Manual Tools Used
- [ ] NVDA screen reader
- [ ] Keyboard only navigation
- [ ] Browser zoom to 200%
- [ ] High contrast mode
- [ ] Color blindness simulator

---

## Issue Severity Guide

### Critical (Must Fix)
- Functionality completely inaccessible
- Major WCAG violations
- Blocks core user tasks
- Legal compliance risk

### High (Should Fix)
- Significant accessibility barriers
- Important WCAG violations
- Impacts many users
- Workarounds difficult

### Medium (Fix Soon)
- Moderate accessibility issues
- Minor WCAG violations
- Impacts some users
- Workarounds available

### Low (Nice to Fix)
- Minor accessibility improvements
- Best practice recommendations
- Impacts few users
- Easy workarounds

---

## Sign-Off Checklist

### Before Marking Complete

- [ ] All automated tests passing
- [ ] All manual tests completed
- [ ] All critical issues fixed
- [ ] All high issues fixed
- [ ] Medium issues documented
- [ ] Low issues documented
- [ ] Retesting completed
- [ ] Documentation updated
- [ ] Team trained on findings

### Final Verification

- [ ] Lighthouse accessibility score = 100
- [ ] Zero axe-core violations
- [ ] All pages keyboard accessible
- [ ] All pages screen reader accessible
- [ ] All forms accessible
- [ ] All dialogs accessible
- [ ] All dynamic content accessible
- [ ] Focus management correct
- [ ] ARIA usage correct
- [ ] WCAG 2.1 Level AA compliant

---

## Notes Section

Use this space to document:
- Issues found
- Fixes applied
- Retesting results
- Outstanding items
- Recommendations

---

## Testing Completed By

**Name**: ___________________________

**Date**: ___________________________

**Signature**: ___________________________

---

## Review Completed By

**Name**: ___________________________

**Date**: ___________________________

**Signature**: ___________________________
