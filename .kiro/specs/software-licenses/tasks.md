# Implementation Plan

- [x] 1. Set up database schema and migrations







  - Create migration file for software_licenses, license_assignments, and license_renewal_alerts tables
  - Define license_type and alert_type enums
  - Add indexes for performance optimization
  - Create unique constraints for license keys and assignments
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement database functions and triggers






  - [x] 2.1 Create timestamp and user tracking triggers


    - Wire up trigger_set_timestamps for software_licenses table
    - Wire up trigger_set_user_tracking for software_licenses table
    - _Requirements: 1.5, 3.4_

  - [x] 2.2 Implement expiration checking function


    - Write check_license_expirations() function to identify expiring licenses
    - Implement 30-day and 7-day alert generation logic
    - Add upsert logic to prevent duplicate alerts
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 2.3 Create license statistics function


    - Write get_license_stats() function for dashboard metrics
    - Calculate total licenses, expiring soon, expired, and assignment counts
    - _Requirements: 2.1, 2.2_

  - [x] 2.4 Create licenses with assignments function


    - Write get_licenses_with_assignments() function for list view
    - Include assignment counts and expiration calculations
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 3. Implement RLS policies





  - Create SELECT, INSERT, UPDATE, DELETE policies for software_licenses table
  - Create SELECT, INSERT, DELETE policies for license_assignments table
  - Create SELECT, INSERT policies for license_renewal_alerts table
  - Verify policies enforce team membership checks
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.4_

- [x] 4. Generate TypeScript types






  - Run pnpm supabase:web:typegen to generate database types
  - Verify SoftwareLicense, LicenseAssignment, and LicenseRenewalAlert types
  - _Requirements: All_
-

- [x] 5. Create Zod validation schemas





  - Define LicenseTypeSchema enum
  - Write CreateLicenseSchema with date validation
  - Write UpdateLicenseSchema extending CreateLicenseSchema
  - Write AssignLicenseToUserSchema and AssignLicenseToAssetSchema
  - Write UnassignLicenseSchema and DeleteLicenseSchema
  - Add custom validation for expiration date after purchase date
  - _Requirements: 1.3, 1.4, 3.2, 3.3, 4.2, 5.3, 6.3, 7.2_

- [x] 6. Implement license list page and loader






  - [x] 6.1 Create licenses page loader function


    - Write loadLicensesPageData() to fetch licenses using get_licenses_with_assignments()
    - Fetch license statistics using get_license_stats()
    - Handle errors and return structured data
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.2 Create licenses list page component


    - Build page.tsx as RSC calling loader function
    - Pass data to client components
    - Add page metadata
    - _Requirements: 2.1_

  - [x] 6.3 Build licenses list client component


    - Create licenses-list.tsx to display license cards
    - Implement pagination for large lists
    - Add empty state when no licenses exist
    - _Requirements: 2.1, 2.2_

  - [x] 6.4 Create license card component


    - Build license-card.tsx showing key license information
    - Display vendor, expiration date, assignment count
    - Add expiration badge for visual status
    - Include action buttons (view, edit, delete)
    - _Requirements: 2.2, 2.5_

  - [x] 6.5 Implement expiration badge component


    - Create expiration-badge.tsx with color-coded status
    - Show "Expired", "Expires in X days", or "Active" status
    - Use warning colors for 30-day and 7-day thresholds
    - _Requirements: 2.5, 8.5_

  - [x] 6.6 Build license statistics cards


    - Create license-stats-cards.tsx displaying metrics
    - Show total licenses, expiring soon, expired, and assignments
    - Add visual indicators and icons
    - _Requirements: 2.1, 2.2_


- [x] 7. Implement license creation functionality






  - [x] 7.1 Create license creation server action


    - Write createLicense server action with enhanceAction wrapper
    - Validate input using CreateLicenseSchema
    - Insert license record with account_id from context
    - Handle duplicate license key errors
    - Return success/error response
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 7.2 Build license creation form component


    - Create create-license-form.tsx using react-hook-form
    - Add fields for name, vendor, license key, type, dates, cost, notes
    - Implement client-side validation with Zod
    - Handle form submission and display success/error messages
    - Redirect to license detail page on success
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 7.3 Create new license page


    - Build new/page.tsx as container for creation form
    - Add page header and breadcrumbs
    - Include cancel navigation
    - _Requirements: 1.1_



- [x] 8. Implement license detail page and loader




  - [x] 8.1 Create license detail loader function


    - Write loadLicenseDetailData() to fetch single license
    - Join with assignments including user and asset details
    - Calculate days until expiry
    - Handle not found errors
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 8.2 Create license detail page component


    - Build [id]/page.tsx as RSC calling loader function
    - Display comprehensive license information
    - Show assignments list
    - Add action buttons (edit, delete, assign)
    - _Requirements: 9.1, 9.2_

  - [x] 8.3 Build license detail view component


    - Create license-detail-view.tsx displaying all license fields
    - Show purchase and expiration dates with formatting
    - Display cost and notes if present
    - Include audit information (created/updated by and timestamps)
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 8.4 Create license assignments list component


    - Build license-assignments-list.tsx showing all assignments
    - Display user assignments with user details (name, email, avatar)
    - Display asset assignments with asset details (name, category, serial)
    - Add unassign button for each assignment
    - Show assignment date and notes
    - _Requirements: 9.3, 9.4_

- [x] 9. Implement license update functionality






  - [x] 9.1 Create license update server action


    - Write updateLicense server action with enhanceAction wrapper
    - Validate input using UpdateLicenseSchema
    - Update license record with RLS enforcement
    - Handle duplicate license key errors
    - Record updated_by and updated_at
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.2 Build license edit form component


    - Create edit-license-form.tsx using react-hook-form
    - Pre-populate form with existing license data
    - Implement client-side validation with Zod
    - Handle form submission and display success/error messages
    - Redirect to detail page on success
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 9.3 Create edit license page


    - Build [id]/edit/page.tsx loading existing license data
    - Pass data to edit form component


    - Add page header and breadcrumbs
    - Include cancel navigation
    - _Requirements: 3.1_

- [x] 10. Implement license deletion functionality






  - [x] 10.1 Create license deletion server action


    - Write deleteLicense server action with enhanceAction wrapper
    - Validate input using DeleteLicenseSchema
    - Check for existing assignments and include in response
    - Delete license record (cascade deletes assignments)
    - Log deletion action
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 10.2 Build delete confirmation dialog


    - Create delete-license-dialog.tsx with confirmation UI
    - Display warning if license has assignments
    - List all assignments that will be removed
    - Require explicit confirmation
    - Call delete server action on confirm
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 11. Implement license assignment to users





  - [x] 11.1 Create assign to user server action


    - Write assignLicenseToUser server action with enhanceAction wrapper
    - Validate input using AssignLicenseToUserSchema
    - Check for duplicate assignments
    - Insert assignment record with assigned_to_user
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 11.2 Build assign to user dialog component


    - Create assign-license-dialog.tsx for user assignment
    - Display searchable list of team members


    - Filter out users already assigned to the license
    - Add optional notes field
    - Handle assignment submission
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 12. Implement license assignment to assets





  - [x] 12.1 Create assign to asset server action


    - Write assignLicenseToAsset server action with enhanceAction wrapper
    - Validate input using AssignLicenseToAssetSchema
    - Check for duplicate assignments
    - Insert assignment record with assigned_to_asset
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 12.2 Build assign to asset dialog component


    - Create assign-to-asset-dialog.tsx for asset assignment
    - Display searchable list of team assets
    - Filter out assets already assigned to the license
    - Add optional notes field
    - Handle assignment submission
    - _Requirements: 6.1, 6.2, 6.3_
-

- [x] 13. Implement license unassignment functionality





  - [x] 13.1 Create unassign server action


    - Write unassignLicense server action with enhanceAction wrapper
    - Validate input using UnassignLicenseSchema
    - Delete assignment record
    - Record unassignment action
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 13.2 Wire up unassign functionality in UI


    - Add unassign button to each assignment in list
    - Show confirmation dialog before unassignment
    - Refresh data after successful unassignment
    - _Requirements: 7.1, 7.2_




- [x] 14. Implement filtering and search







  - [x] 14.1 Create license filters component

    - Build license-filters.tsx with filter controls
    - Add vendor filter (dropdown or autocomplete)
    - Add license type filter (multi-select)
    - Add expiration status filter (all, active, expiring, expired)

    - Add search input for name and license key
    - _Requirements: 2.3, 2.4_





  - [x] 14.2 Implement filter logic in loader





    - Update loader to accept filter parameters


    - Apply filters to database query
    - Maintain filter state in URL search params
    - _Requirements: 2.3, 2.4_

- [x] 15. Implement export functionality




  - [x] 15.1 Create export server action



    - Write exportLicenses server action
    - Fetch filtered licenses based on current view


    - Generate CSV format with all license fields and assignments
    - Return CSV data for download
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_







  - [x] 15.2 Add export button to UI





    - Add export button to licenses list page
    - Trigger CSV download on click


    - Show loading state during export
    - Display success/error messages


    - _Requirements: 10.1, 10.5_

-
-

- [ ] 16. Set up background job for expiration alerts








  - [x] 16.1 Create alert generation script






    - Write script to call check_license_expirations() function
    - Schedule to run daily (via cron or similar)
    - Log execution results
    - _Requirements: 8.1, 8.2_




  - [x] 16.2 Implement email notification integration


    - Create email template for license expiration alerts
    - Write function to send alerts to team administrators
    - Include license details and renewal link in email
    - Handle 30-day and 7-day alert types differently



    - _Requirements: 8.2, 8.3, 8.5_


  - [x] 16.3 Build in-app notifications display



    - Create notifications section in UI
    - Display recent renewal alerts




    - Add alert count badge to navigation
    - Allow dismissing notifications
    - _Requirements: 8.4_
-


- [x] 17. Add navigation and routing















  - Update team account navigation to include "Licenses" link
  - Ensure proper breadcrumbs on all license pages
  - Add back navigation from detail pages


  - _Requirements: 2.1, 9.1_

- [x] 18. Implement error boundaries and loading states


  - [x] Add error boundaries to license pages
  - [x] Create loading skeletons for list and detail views
  - [x] Handle not found states gracefully
  - [x] Display user-friendly error messages
  - [x] **BUG FIX**: Fixed `get_licenses_with_assignments` function missing `license_key` field
    - Migration `20251118000002_add_license_key_to_function.sql` already existed
    - Created redundant migration `20251118000010_fix_license_functions.sql` (can be removed)
    - Performed database reset to apply all migrations
    - Regenerated TypeScript types
    - Function now properly returns `license_key` field
    - **Status**: Fix applied, requires manual testing with logged-in user
  - _Requirements: All_










- [ ] 19. Write E2E tests for critical flows










  - [ ] 19.1 Test license creation flow

    - Navigate to licenses page
    - Click "New License" button


    - Fill form with valid data
    - Submit and verify license appears in list



    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 19.2 Test license assignment flows



    - Test assigning license to user






    - Test assigning license to asset
    - Test unassigning license
    - Verify assignment counts update
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

  - [x] 19.3 Test license update and deletion


    - Test editing license information
    - Test deleting license without assignments
    - Test deleting license with assignments (warning)
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_

  - [ ] 19.4 Test filtering and export

    - Apply various filters
    - Verify filtered results
    - Test export functionality
    - Verify CSV content
    - _Requirements: 2.3, 2.4, 10.1, 10.2, 10.3, 10.4, 10.5_
