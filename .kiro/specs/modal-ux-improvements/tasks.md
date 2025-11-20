# Implementation Plan

- [x] 1. Create base modal infrastructure




  - [x] 1.1 Create modal hooks in packages/ui/src/hooks

    - Implement useModalState hook for state management
    - Implement useUnsavedChanges hook for dirty form detection
    - Implement useKeyboardNavigation hook for arrow key navigation
    - Implement useContextPreservation hook for list state management
    - _Requirements: 1.2, 1.3, 2.4, 4.5, 7.5_
  
  - [ ] 1.2 Write property tests for modal hooks
    - **Property 1: Context Preservation Round Trip**
    - **Validates: Requirements 1.2, 1.3, 7.5**
  
  - [ ] 1.3 Write property tests for unsaved changes detection
    - **Property 7: Unsaved Changes Warning**
    - **Validates: Requirements 2.4, 3.4**
  
  - [ ] 1.4 Write property tests for keyboard navigation
    - **Property 12: Keyboard Navigation Between Entities**
    - **Validates: Requirements 4.5**
-

- [ ] 2. Create specialized modal components

  - [x] 2.1 Create QuickViewModal component


    - Implement QuickViewModal in packages/ui/src/modal/
    - Add size variants (sm, md, lg, xl)
    - Add quick action buttons support
    - Add keyboard navigation support (arrow keys, escape)
    - Add loading states
    - _Requirements: 1.1, 1.4, 1.5, 4.1, 4.2, 4.4, 4.5_
  
  - [ ] 2.2 Write property tests for QuickViewModal
    - **Property 2: Modal Opens with Complete Data**
    - **Validates: Requirements 1.1, 1.4, 4.1, 4.2**
    - **Property 3: Quick Actions Present**
    - **Validates: Requirements 1.5, 4.4**
  
  - [x] 2.3 Create FormSheet component


    - Implement FormSheet in packages/ui/src/modal/
    - Add side variants (left, right, top, bottom)
    - Add size variants (sm, md, lg, xl)
    - Integrate unsaved changes warning
    - Add sticky header and footer
    - _Requirements: 2.1, 2.2, 2.4, 3.1, 6.1, 6.3_
  
  - [ ] 2.4 Write property tests for FormSheet
    - **Property 4: Sheet Opens on Action**
    - **Validates: Requirements 2.1, 3.1, 6.1, 6.3**
    - **Property 5: Background Dimming**
    - **Validates: Requirements 2.2**
    - **Property 31: Sheet Direction Variants**
    - **Validates: Requirements 11.2**
  
  - [x] 2.5 Create AssignmentModal component


    - Implement AssignmentModal in packages/ui/src/modal/
    - Add searchable user list with debouncing
    - Display current assignment status
    - Add unassignment option
    - Add reassignment warning
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  
  - [ ] 2.6 Write property tests for AssignmentModal
    - **Property 13: Assignment Modal with Search**
    - **Validates: Requirements 5.1, 5.2**
    - **Property 14: Current Assignment Display**
    - **Validates: Requirements 5.5**
  
  - [x] 2.7 Create BulkActionModal component


    - Implement BulkActionModal in packages/ui/src/modal/
    - Add confirmation with item preview
    - Add progress tracking
    - Add results summary
    - Add cancellation support
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 2.8 Write property tests for BulkActionModal
    - **Property 17: Bulk Action Confirmation**
    - **Validates: Requirements 8.1**
    - **Property 18: Bulk Action Progress Tracking**
    - **Validates: Requirements 8.2**
    - **Property 19: Bulk Action Results Summary**
    - **Validates: Requirements 8.3, 8.4**
    - **Property 20: Bulk Action Cancellation**
    - **Validates: Requirements 8.5**
  
  - [x] 2.9 Create ExpandedWidgetModal component



    - Implement ExpandedWidgetModal in packages/ui/src/modal/
    - Add filter controls
    - Add date range selection
    - Add export functionality (CSV, PDF)
    - Add responsive charts
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 2.10 Write property tests for ExpandedWidgetModal
    - **Property 15: Dashboard Widget Expansion**
    - **Validates: Requirements 7.1, 7.2, 7.4**
    - **Property 16: Real-time Filter Updates**
    - **Validates: Requirements 7.3**
-

- [ ] 3. Implement asset management modals

  - [x] 3.1 Create AssetQuickViewModal component


    - Create asset-quick-view-modal.tsx in apps/web/app/home/[account]/assets/_components/
    - Display all asset fields (name, category, status, serial, dates, assignee, history)
    - Add quick actions (Edit, Assign, Delete)
    - Integrate with keyboard navigation
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [x] 3.2 Write property tests for asset quick view


    - **Property 2: Modal Opens with Complete Data**
    - **Validates: Requirements 1.1, 1.4**
  
  - [x] 3.3 Convert CreateAssetForm to use FormSheet


    - Create create-asset-sheet.tsx wrapping existing CreateAssetForm
    - Add to assets page with trigger button
    - Implement unsaved changes warning
    - Handle success with optimistic UI update
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 3.4 Write property tests for asset creation
    - **Property 6: Success Sequence Completion**
    - **Validates: Requirements 2.3**
    - **Property 8: Real-time Validation Feedback**
    - **Validates: Requirements 2.5**
  
  - [x] 3.5 Create EditAssetSheet component


    - Create edit-asset-sheet.tsx with pre-filled form
    - Integrate with QuickViewModal actions
    - Implement validation and error handling
    - Handle success with list update
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 3.6 Write property tests for asset editing
    - **Property 6: Success Sequence Completion**
    - **Validates: Requirements 3.3**
    - **Property 8: Real-time Validation Feedback**
    - **Validates: Requirements 3.2, 3.5**
  
  - [x] 3.7 Create AssignAssetModal component


    - Create assign-asset-modal.tsx using AssignmentModal
    - Integrate with asset server actions
    - Handle reassignment warnings
    - Update asset list on success
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 3.8 Write property tests for asset assignment
    - **Property 13: Assignment Modal with Search**
    - **Validates: Requirements 5.1, 5.2**
  
  - [x] 3.9 Update assets page to use modals


    - Modify assets list to open QuickViewModal on row click
    - Replace "Create Asset" page navigation with FormSheet
    - Integrate all modal components
    - Implement context preservation
    - _Requirements: 1.1, 1.2, 1.3, 2.1_
  
  - [ ] 3.10 Write property tests for context preservation
    - **Property 1: Context Preservation Round Trip**
    - **Validates: Requirements 1.2, 1.3**

- [-] 4. Implement license management modals


  - [x] 4.1 Create LicenseQuickViewModal component


    - Create license-quick-view-modal.tsx
    - Display all license fields (key, software, dates, assignee, status)
    - Highlight expiring licenses (within 30 days)
    - Add quick actions (Assign, Renew, Edit)
    - Integrate keyboard navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.2 Write property tests for license quick view
    - **Property 11: Expiring License Highlighting**
    - **Validates: Requirements 4.3**
  
  - [x] 4.3 Create CreateLicenseSheet component


    - Create create-license-sheet.tsx with license form
    - Add validation for dates and license key
    - Implement duplicate key prevention
    - Handle success with list update
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.4 Create EditLicenseSheet component


    - Create edit-license-sheet.tsx with pre-filled form
    - Integrate with QuickViewModal actions
    - Implement validation
    - Handle success with list update
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.5 Create AssignLicenseModal component


    - Create assign-license-modal.tsx using AssignmentModal
    - Support assignment to users and assets
    - Handle reassignment warnings
    - Update license list on success
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 4.6 Update licenses page to use modals



    - Modify licenses list to open QuickViewModal on row click
    - Replace "Create License" page navigation with FormSheet
    - Integrate all modal components
    - Implement context preservation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
-

- [ ] 5. Implement user management modals

  - [x] 5.1 Create InviteUserModal component


    - Create invite-user-modal.tsx with invitation form
    - Implement email validation
    - Check for existing users
    - Add role selection
    - Handle success with user list update
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ] 5.2 Write property tests for user invitation



    - **Property 9: Email Validation and Duplicate Check**
    - **Validates: Requirements 6.2**
  
  - [x] 5.3 Create EditUserModal component


    - Create edit-user-modal.tsx with user form
    - Add role change confirmation dialog
    - Display permission changes explanation
    - Handle success with user list update
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 5.4 Write property tests for role changes




    - **Property 10: Role Change Confirmation**
    - **Validates: Requirements 6.4**
  
  - [x] 5.5 Update users page to use modals








    - Replace "Invite User" page navigation with modal
    - Replace "Edit User" page navigation with modal
    - Integrate all modal components
    - Implement context preservation
    - _Requirements: 6.1, 6.3_

- [x] 6. Implement dashboard widget modals






  - [x] 6.1 Create dashboard widget expansion modals


    - Create expanded-metrics-modal.tsx for metrics widgets
    - Create expanded-chart-modal.tsx for chart widgets
    - Add filter controls within modals
    - Add date range selection
    - Implement real-time updates on filter changes
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 6.2 Write property tests for widget expansion

    - **Property 15: Dashboard Widget Expansion**
    - **Validates: Requirements 7.1, 7.2, 7.4**
    - **Property 16: Real-time Filter Updates**
    - **Validates: Requirements 7.3**
  
  - [x] 6.3 Add export functionality to widget modals


    - Implement CSV export for data tables
    - Implement PDF export for charts
    - Add export buttons to modal headers
    - _Requirements: 7.4_
  
  - [x] 6.4 Update dashboard page to use modals



    - Add click handlers to all widgets
    - Integrate expanded modals
    - Implement context preservation
    - _Requirements: 7.1, 7.5_

- [x] 7. Implement bulk action modals






  - [x] 7.1 Create bulk delete modal for assets


    - Create bulk-delete-assets-modal.tsx using BulkActionModal
    - Add confirmation with item preview
    - Implement progress tracking
    - Display results summary
    - Add error handling for failed deletions
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 7.2 Create bulk assign modal for assets


    - Create bulk-assign-assets-modal.tsx
    - Add user selection
    - Implement progress tracking
    - Display results summary
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 7.3 Create bulk action modals for licenses


    - Create bulk-delete-licenses-modal.tsx
    - Create bulk-renew-licenses-modal.tsx
    - Implement progress tracking and results
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 7.4 Update list pages with bulk action support



    - Add bulk selection checkboxes to asset list
    - Add bulk selection checkboxes to license list
    - Add bulk action buttons
    - Integrate bulk action modals
    - _Requirements: 8.1_
-

- [ ] 8. Implement accessibility features



- [ ] 8. Implement accessibility features


  - [x] 8.1 Add focus trap to all modals


    - Implement focus trap in base modal components
    - Test tab cycling within modals
    - Ensure focus returns to trigger on close
    - _Requirements: 9.2_
  
  - [x] 8.2 Write property tests for focus trap


    - **Property 22: Modal Focus Trap**
    - **Validates: Requirements 9.2**
  
  - [x] 8.3 Add ARIA labels and announcements


    - Add aria-labelledby and aria-describedby to all modals
    - Add role="dialog" and aria-modal="true"
    - Implement screen reader announcements on modal open
    - Add aria-labels to all interactive elements
    - _Requirements: 9.4, 9.5_
  
  - [x] 8.4 Write property tests for accessibility


    - **Property 24: Screen Reader Announcements**
    - **Validates: Requirements 9.4**
    - **Property 25: Form Keyboard Accessibility**
    - **Validates: Requirements 9.5**
  
  - [x] 8.5 Implement keyboard shortcuts


    - Add Escape key to close modals
    - Add click outside to close (for non-critical modals)
    - Add arrow keys for entity navigation
    - Document keyboard shortcuts
    - _Requirements: 9.3, 4.5_
  
  - [x] 8.6 Write property tests for keyboard shortcuts


    - **Property 23: Multiple Close Methods**
    - **Validates: Requirements 9.3**
  
  - [x] 8.7 Ensure responsive behavior


    - Test all modals on mobile viewports
    - Implement full-screen modals on small screens where appropriate
    - Ensure touch-friendly close buttons
    - Test with different zoom levels
    - _Requirements: 9.1_
  
  - [x] 8.8 Write property tests for responsive behavior



    - **Property 21: Responsive Layout Adaptation**

    - **Validates: Requirements 9.1**


- [x] 9. Implement performance optimizations





  - [x] 9.1 Add animation timing


    - Configure modal animations to 200-300ms
    - Use CSS transitions for smooth animations
    - Test animation performance
    - _Requirements: 10.1_
  
  - [x] 9.2 Write property tests for animation timing


    - **Property 26: Animation Timing Consistency**
    - **Validates: Requirements 10.1**
  
  - [x] 9.3 Implement loading states


    - Add loading spinners to modal content areas
    - Add skeleton loaders for data-heavy modals
    - Implement lazy loading for images
    - _Requirements: 10.2, 10.3_
  
  - [x] 9.4 Write property tests for loading states


    - **Property 27: Loading State Display**
    - **Validates: Requirements 10.2**
  
  - [x] 9.5 Implement body scroll lock


    - Prevent body scroll when modal is open
    - Preserve scroll position on modal close
    - Handle nested modals correctly
    - _Requirements: 10.5_
  
  - [x] 9.6 Write property tests for scroll lock


    - **Property 29: Body Scroll Lock with Position Preservation**
    - **Validates: Requirements 10.5**
  
  - [x] 9.7 Implement z-index management


    - Create z-index stack manager
    - Ensure proper layering for nested modals
    - Test with multiple modals open
    - _Requirements: 10.4_
  
  - [x] 9.8 Write property tests for z-index stacking


    - **Property 28: Modal Z-Index Stacking**
    - **Validates: Requirements 10.4**


-

- [x] 10. Add help and documentation features



  - [x] 10.1 Create help tooltip component


    - Create FormFieldHelp component with 500ms delay
    - Add to complex form fields
    - Ensure keyboard accessibility
    - _Requirements: 12.1, 12.2_
  
  - [x] 10.2 Write property tests for help tooltips


    - **Property 32: Help Tooltips with Delay**
    - **Validates: Requirements 12.1, 12.2**
  
  - [x] 10.3 Add multi-step progress indicators


    - Create StepIndicator component
    - Add to multi-step modals
    - Display current step and total steps
    - _Requirements: 12.3_
  
  - [x] 10.4 Write property tests for progress indicators


    - **Property 33: Multi-step Progress Indicators**
    - **Validates: Requirements 12.3**
  
  - [x] 10.5 Improve error messages


    - Review all validation error messages
    - Ensure messages are actionable
    - Add suggestions for correction
    - Test with various error scenarios
    - _Requirements: 12.4_
  
  - [x] 10.6 Write property tests for error messages


    - **Property 34: Actionable Error Messages**
    - **Validates: Requirements 12.4**
  
  - [x] 10.7 Add inline documentation


    - Add help links to advanced features
    - Create inline documentation for complex workflows
    - Link to detailed help pages
    - _Requirements: 12.5_



- [-] 11. Write E2E tests




  - [x] 11.1 Write E2E tests for asset modals


    - Test opening asset detail modal from list
    - Test creating asset with FormSheet
    - Test editing asset
    - Test assigning asset
    - Test context preservation
    - Test keyboard navigation
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 3.1, 3.3, 5.1, 5.3_
  
  - [x] 11.2 Write E2E tests for license modals


    - Test opening license detail modal
    - Test creating license
    - Test editing license
    - Test assigning license
    - Test expiring license highlighting
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.3_
  
  - [x] 11.3 Write E2E tests for user modals


    - Test inviting user
    - Test editing user
    - Test role change confirmation
    - Test email validation
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 11.4 Write E2E tests for dashboard modals


    - Test expanding dashboard widgets
    - Test applying filters in expanded view
    - Test exporting data
    - Test context preservation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 11.5 Write E2E tests for bulk actions


    - Test bulk delete with confirmation
    - Test bulk assign with progress
    - Test bulk action results summary
    - Test bulk action cancellation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 11.6 Write E2E accessibility tests


    - Test keyboard navigation
    - Test focus trap
    - Test screen reader announcements
    - Test responsive behavior

    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


- [ ] 12. Documentation and cleanup

  - [ ] 12.1 Create modal component documentation
    - Document all modal components with examples
    - Create usage guide for developers
    - Document props and APIs
    - Add code examples
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 12.2 Create user documentation
    - Document keyboard shortcuts for users
    - Create help articles for modal interactions
    - Add tooltips and inline help
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 12.3 Remove old page-based navigation
    - Remove unused create/edit pages
    - Update navigation links
    - Clean up unused components
    - Update routing configuration
  
  - [ ] 12.4 Run final verification
    - Run all tests (unit, integration, E2E)
    - Test on multiple browsers
    - Test on mobile devices
    - Verify accessibility with screen readers
    - Check performance metrics
