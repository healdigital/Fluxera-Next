# Implementation Plan

- [x] 1. Create database schema and migrations





  - Create migration file with assets table, asset_history table, enums (asset_category, asset_status, asset_event_type), indexes, and RLS policies
  - Implement database function for automatic history entry creation with trigger


  - Apply migration and generate TypeScript types using `pnpm supabase:web:typegen`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.2, 4.1, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 9.1, 9.2, 10.1_

- [x] 2. Create Zod validation schemas




  - Create `apps/web/app/home/[account]/assets/_lib/schemas/asset.schema.ts` with schemas for AssetCategory, AssetStatus, CreateAsset, UpdateAsset, AssignAsset, UnassignAsset, and DeleteAsset
  - Export all schemas for use in server actions and forms
  - _Requirements: 1.2, 1.5, 3.2, 3.5, 5.5, 6.3_





- [x] 3. Implement data loaders for server components






  - Create `apps/web/app/home/[account]/assets/_lib/server/assets-page.loader.ts` with function to load assets list with filtering by category and status, including assigned user information
  - Create `apps/web/app/home/[account]/assets/_lib/server/asset-detail.loader.ts` with function to load single asset with assigned user and complete history
  - Add proper error handling and type safety
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4_



-


- [x] 4. Implement server actions for mutations






  - Create `apps/web/app/home/[account]/assets/_lib/server/assets-server-actions.ts` with createAsset action using enhanceAction and CreateAssetSchema



  - Add updateAsset action with UpdateAssetSchema validation
  - Add deleteAsset action with DeleteAssetSchema validation and confirmation
  - Add assignAsset action with AssignAssetSchema that updates assigned_to and status
  - Add unassignAsset action with UnassignAssetSchema that clears assignment and resets status
  - Include revalidatePath calls after successful mutations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 5. Create assets list page




- [ ] 5. Create assets list page


  - Create `apps/web/app/home/[account]/assets/page.tsx` as RSC that calls assets-page.loader
  - Add page metadata with title and description
  - Export page component using withI18n utility
  - Pass loaded data to AssetsList client component



  - _Requirements: 2.1, 2.2_

- [x] 6. Build assets list client component





  - Create `apps/web/app/home/[account]/assets/_components/assets-list.tsx` with 'use client' directive



  - Display assets in a responsive grid or table layout
  - Show asset name, category, status, and assigned user for each asset
  - Add "New Asset" button linking to create page
  - Include LoadingSpinner for loading states
  - _Requirements: 2.1, 2.2, 7.4_
-

- [x] 7. Implement asset filters component




  - Create `apps/web/app/home/[account]/assets/_components/asset-filters.tsx` as client component




  - Add category filter dropdown with multi-select
  - Add status filter dropdown with multi-select
  - Add search input for filtering by name
  - Use URL search params to maintain filter state
  - _Requirements: 2.3, 2.4, 2.5_


-

- [x] 8. Create asset card component





  - Create `apps/web/app/home/[account]/assets/_components/asset-card.tsx` displaying asset information
  - Show asset name, category badge, status badge, and assigned user avatar/name
  - Add click handler to navigate to detail page
  - Include visual indicators for different statuses using appropriate colors
  - _Requirements: 2.2, 7.4_







- [x] 9. Build create asset page and form




  - Create `apps/web/app/home/[account]/assets/new/page.tsx` as RSC with page metadata
  - Create `apps/web/app/home/[account]/assets/_components/create-asset-form.tsx` using react-hook-form and @kit/ui/form
  - Add form fields for name (required), category (select), status (select with default 'available'), description (textarea), serial_number, purchase_date, warranty_expiry_date
  - Integrate CreateAssetSchema for validation



  - Call createAsset server action on submit
  - Handle isRedirectError in catch block
  - Redirect to assets list on success
  - Display field-level validation errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.5, 6.1, 6.2_

- [x] 10. Create asset detail page




  - Create `apps/web/app/home/[account]/assets/[id]/page.tsx` as RSC calling asset-detail.loader
  - Add page metadata with asset name
  - Display all asset properties including name, category, status, description, serial number, dates
  - Show assigned user information if asset is assigned


  - Add "Edit" and "Delete" buttons for administrators
  - Pass history data to AssetHistoryList component
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 11. Build asset history list component





  - Create `apps/web/app/home/[account]/assets/_components/asset-history-list.tsx` displaying history entries



  - Show entries in reverse chronological order (newest first)
  - Display event type, timestamp, user who performed action, and relevant event details
  - Format event_data based on event_type (e.g., show old/new status for status_changed)
  - Use appropriate icons for different event types



  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.4_

- [x] 12. Implement edit asset page and form





  - Create `apps/web/app/home/[account]/assets/[id]/edit/page.tsx` as RSC loading current asset data


  - Create `apps/web/app/home/[account]/assets/_components/edit-asset-form.tsx` using react-hook-form
  - Pre-populate form with current asset values
  - Use UpdateAssetSchema for validation
  - Call updateAsset server action on submit
  - Handle isRedirectError in catch block
  - Redirect to detail page on success
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.4, 6.3, 6.4_







- [x] 13. Create assign asset dialog




  - Create `apps/web/app/home/[account]/assets/_components/assign-asset-dialog.tsx` as dialog component
  - Load list of team members from accounts_memberships

  - Display user selection dropdown or list
  - Call assignAsset server action on confirmation
  - Update UI to show assigned user and new status
  - Close dialog on success
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
-

- [x] 14. Create unassign asset functionality





  - Add "Unassign" button to asset detail page (shown only when asset is assigned)
  - Call unassignAsset server action on click
  - Update asset status to 'available' and clear assigned_to
  - Show confirmation before unassigning
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
-

- [x] 15. Implement delete asset dialog





  - Create `apps/web/app/home/[account]/assets/_components/delete-asset-dialog.tsx` with confirmation dialog
  - Show warning if asset has active assignment
  - Call deleteAsset server action on confirmation
  - Redirect to assets list after successful deletion
  - Display error message if deletion fails
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
-

- [x] 16. Add navigation menu item





  - Update `apps/web/app/home/[account]/_components/team-account-navigation-menu.tsx` to include "Assets" menu item
  - Add appropriate icon (e.g., Package or HardDrive from lucide-react)
  - Link to `/home/[account]/assets` route
  - _Requirements: 2.1_



- [x] 17. Add loading and error states




  - Create loading.tsx files for assets pages showing LoadingSpinner
  - Create error.tsx files with error boundaries for graceful error handling
  - Add loading indicators to forms during submission
  - Display user-friendly error messages for common failures
  - _Requirements: 1.5, 3.5, 4.5_

- [x] 18. Implement E2E tests for critical flows






  - Write Playwright test for create asset flow (navigate, fill form, submit, verify in list)
  - Write test for assign asset flow (select asset, assign to user, verify status change)
  - Write test for view history flow (open detail page, verify history entries)
  - Write test for filter assets flow (apply filters, verify results)
  - Add data-test attributes to key elements
  - _Requirements: 1.1, 2.1, 2.3, 2.4, 7.1, 9.1_



- [x] 19. Performance optimization






  - Verify database indexes are properly created
  - Test RLS policy performance with large datasets
  - Implement pagination for asset list if needed
  - Add pagination for history entries (limit to recent 50)




  - Optimize queries to avoid N+1 problems




  - _Requirements: 2.1, 9.1_

- [x] 20. Accessibility improvements








  - Add proper ARIA labels to form fields and buttons
  - Ensure keyboard navigation works for all interactive elements
  - Add focus management for dialogs
  - Test with screen reader
  - Ensure color contrast meets WCAG standards for status badges
  - _Requirements: 2.1, 9.1, 10.1_
