# Implementation Plan - User Management System

- [x] 1. Set up database schema and migrations







  - Create migration file for user_profiles, user_account_status, and user_activity_log tables
  - Define enums for user_status, user_action_type, and action_result_status
  - Add indexes for performance optimization
  - Create triggers for timestamps and user tracking
  - _Requirements: 1, 2, 3, 6, 7_


- [x] 2. Implement Row Level Security policies









  - [x] 2.1 Create RLS policies for user_profiles table





    - Write policy for users to view their own profile
    - Write policy for team members to view team user profiles
    - Write policy for users to update their own profile
    - Write policy for admins to update team member profiles
    - _Requirements: 3_

-

  - [x] 2.2 Create RLS policies for user_account_status table



    - Write policy for team members to view user status
    - Write policy for admins to manage user status

    - _Requirements: 6_

  - [x] 2.3 Create RLS policies for user_activity_log table



    - Write policy for users to view their own activity
    - Write policy for admins to view team activity
    - Write policy for system to insert activity logs
    - _Requirements: 7_





- [x] 3. Create database functions for user management





  - [x] 3.1 Implement log_user_activity function


    - Write function to insert activity log entries
    - Include IP address and result status tracking
    - Grant execute permission to authenticated users
    - _Requirements: 7_



  - [x] 3.2 Implement get_team_members function


    - Write function to fetch team members with profiles and status
    - Add support for search, role filter, and status filter parameters
    - Implement pagination with limit and offset


    - Verify caller has access to the account
    - _Requirements: 1, 2_

  - [x] 3.3 Implement update_user_status function

    - Write function to update user status with reason
    - Add permission verification

    - Prevent self-deactivation
    - Log status changes to activity log
    - _Requirements: 6, 7_

- [x] 4. Generate TypeScript types and create schemas







  - Run `pnpm supabase:web:typegen` to generate database types
  - Create Zod schemas in `apps/web/app/home/[account]/users/_lib/schemas/user.schema.ts`
  - Define UserStatusSchema, InviteUserSchema, UpdateUserProfileSchema, UpdateUserRoleSchema, UpdateUserStatusSchema, AssignAssetsSchema, and UserActivityFilterSchema
  - _Requirements: 1, 2, 3, 5, 6_
-

- [x] 5. Implement users list page with data loader





  - [x] 5.1 Create users page loader function


    - Write loader in `apps/web/app/home/[account]/users/_lib/server/users-page.loader.ts`
    - Call get_team_members database function
    - Handle errors and return formatted data
    - _Requirements: 1, 2_

  - [x] 5.2 Create users list page component


    - Create RSC page component at `apps/web/app/home/[account]/users/page.tsx`
    - Call loader function to fetch team members
    - Pass data to client components
    - Add page metadata
    - _Requirements: 1, 2_

  - [x] 5.3 Build users list client component


    - Create `users-list.tsx` component to display team members
    - Implement table or grid layout with user cards
    - Display user name, email, role, status, and last sign-in
    - Add loading states
    - _Requirements: 1, 2_










  - [x] 5.4 Create user card component


    - Build `user-card.tsx` component for individual user display
    - Show avatar, name, email, role badge, and status indicator
    - Add click handler to navigate to user detail page
    - _Requirements: 1, 2_

-

- [x] 6. Implement search and filtering functionality




  - [x] 6.1 Create user filters component

    - Build `user-filters.tsx` client component with search input
    - Add role filter dropdown
    - Add status filter dropdown
    - Implement URL-based state management for filters
    - _Requirements: 1, 2_


  - [ ] 6.2 Integrate filters with users list





    - Update users list page to accept search params
    - Pass filter values to loader function
    - Update loader to use filter parameters in database query
    - _Requirements: 1, 2_
-

- [x] 7. Implement user invitation flow





  - [x] 7.1 Create invite user form component


    - Build `invite-user-form.tsx` with email and role fields
    - Use react-hook-form with InviteUserSchema validation
    - Add role selection dropdown
    - Include send invitation checkbox
    - _Requirements: 2_












  - [x] 7.2 Create invite user page


    - Create page at `apps/web/app/home/[account]/users/new/page.tsx`
    - Render invite user form
    - Add page metadata and navigation
    - _Requirements: 2_

  - [x] 7.3 Implement invite user server action


    - Create server action in `users-server-actions.ts`
    - Use enhanceAction with InviteUserSchema
    - Create accounts_memberships record
    - Send invitation email if requested
    - Log activity

    - Redirect to users list on success
    - _Requirements: 2, 7_


- [x] 8. Implement user detail page





  - [x] 8.1 Create user detail loader function


    - Write loader in `user-detail.loader.ts`
    - Fetch user profile, membership, status, and assigned assets
    - Join data from multiple tables
    - Verify caller has access
    - _Requirements: 3, 4_

  - [x] 8.2 Create user detail page component


    - Create RSC page at `apps/web/app/home/[account]/users/[id]/page.tsx`
    - Call loader function
    - Display user information in sections
    - Add navigation to edit page
    - _Requirements: 3_

  - [x] 8.3 Build user detail view component


    - Create `user-detail-view.tsx` component



    - Display profile information (name, email, phone, job title, department, location, bio)
    - Show account metadata (created date, last sign-in, status)
    - Display assigned assets list
    - Add action buttons for role change, status change, and asset assignment
    - _Requirements: 3, 4_

- [x] 9. Implement user profile editing







  - [x] 9.1 Create edit user profile form component

    - Build `edit-user-profile-form.tsx` with profile fields
    - Use react-hook-form with UpdateUserProfileSchema
    - Pre-populate form with existing profile data
    - _Requirements: 3_


  - [x] 9.2 Create edit user profile page



    - Create page at `apps/web/app/home/[account]/users/[id]/edit/page.tsx`
    - Fetch user profile data
    - Render edit form
    - _Requirements: 3_

  - [x] 9.3 Implement update user profile server action


    - Create server action for profile updates
    - Use enhanceAction with UpdateUserProfileSchema
    - Update user_profiles table
    - Log activity
    - Revalidate user detail page
    - _Requirements: 3, 7_


- [x] 10. Implement role management





  - [x] 10.1 Create assign role dialog component


    - Build `assign-role-dialog.tsx` with role selection
    - Fetch available roles from database
    - Show current role and new role selection
    - Add confirmation step
    - _Requirements: 5_

  - [x] 10.2 Implement update user role server action


    - Create server action for role updates
    - Use enhanceAction with UpdateUserRoleSchema
    - Verify caller has members.manage permission
    - Update accounts_memberships table
    - Log activity
    - Revalidate user detail page
    - _Requirements: 5, 7_
-

- [x] 11. Implement user status management




  - [x] 11.1 Create change status dialog component


    - Build `change-status-dialog.tsx` with status selection
    - Add reason text field for status changes
    - Show current status and new status selection
    - Add confirmation for deactivation
    - _Requirements: 6_


  - [x] 11.2 Implement update user status server action

    - Create server action for status updates
    - Use enhanceAction with UpdateUserStatusSchema

    - Call update_user_status database function
    - Handle self-deactivation prevention
    - Revalidate user detail page
    - _Requirements: 6, 7_
-


- [x] 12. Implement user activity logging





  - [x] 12.1 Create user activity loader function

    - Write loader in `user-activity.loader.ts`
    - Fetch activity logs for specific user
    - Support filtering by action type and date range
    - Implement pagination
    - _Requirements: 7_


  - [x] 12.2 Create user activity page

    - Create page at `apps/web/app/home/[account]/users/[id]/activity/page.tsx`
    - Call activity loader
    - Display activity log entries
    - _Requirements: 7_

-


  - [x] 12.3 Build user activity list component







    - Create `user-activity-list.tsx` component
    - Display activity entries in chronological order
    - Show action type, timestamp, resource, and result status
    - Format action details in readable way
    - Add filtering controls


    - _Requirements: 7_




-



  - [x] 12.4 Integrate activity logging into server actions


    - Update all user management server actions to log activities


    - Call log_user_activity function after successful operations

   - Include relevant action details in logs
    - _Requirements: 7_



- [x] 13. Implement asset assignment integration





  - [x] 13.1 Display assigned assets on user detail page


    - Update user detail view to show assigned assets


    - Display asset name, category, serial number, and assignment date
    - Add link to asset detail page
    - _Requirements: 4_

  - [x] 13.2 Create assign assets dialog component

    - Build `assign-assets-dialog.tsx` with asset selection


    - Fetch available assets from database
    - Show multi-select for assets
    - Display currently assigned assets
    - _Requirements: 4_


  - [x] 13.3 Implement assign assets server action

    - Create server action for asset assignment


    - Use enhanceAction with AssignAssetsSchema
    - Update assets table with assigned_to and assigned_at
    - Log activity for each asset assignment
    - Revalidate user detail page
    - _Requirements: 4, 7_



  - [x] 13.4 Implement unassign asset functionality





    - Add unassign button to assigned assets list
    - Create server action to remove asset assignment


    - Update asset status to available
    - Log unassignment activity
    - _Requirements: 4, 7_


-

- [x] 14. Implement permissions display





  - [x] 14.1 Create user permissions view component


    - Build `user-permissions-view.tsx` component

    - Fetch user's role and associated permissions
    - Display permissions in organized groups
    - Show both role-based and custom permissions
    - _Requirements: 5_

  - [x] 14.2 Integrate permissions view into user detail page


    - Add permissions section to user detail page
    - Display permissions view component
    - Add visual indicators for permission types
    - _Requirements: 5_

- [ ] 15. Add pagination to users list


  - [ ] 15.1 Implement pagination controls
    - Create pagination component with page navigation
    - Add page size selector
    - Update URL with page parameters
    - _Requirements: 1_

  - [ ] 15.2 Update loader to support pagination
    - Modify users page loader to accept page and page size parameters
    - Pass pagination values to get_team_members function
    - Return total count for pagination controls
    - _Requirements: 1_

- [x] 16. Implement activity log export




  - [x] 16.1 Create export activity server action

    - Write server action to export activity logs
    - Support CSV and JSON formats
    - Apply current filters to export
    - Generate downloadable file
    - _Requirements: 7_

  - [x] 16.2 Add export button to activity page


    - Add export button to activity log page
    - Show format selection dialog
    - Trigger download on export completion
    - _Requirements: 7_

- [x] 17. Add loading states and error handling




  - Create loading skeletons for users list
  - Add loading indicators for dialogs and forms
  - Implement error boundaries for user pages
  - Add toast notifications for success and error messages
  - Handle network errors gracefully


  - _Requirements: All_





- [x] 18. Implement navigation and breadcrumbs







  - Add users section to team account navigation config


  - Create breadcrumb navigation for user pages
  - Add back navigation from detail pages


  - Update navigation to highlight active section
  - _Requirements: All_

- [x] 19. Write E2E tests for critical flows





  - [x] 19.1 Write test for user invitation flow

    - Test navigating to invite page

    - Test filling and submitting invitation form
    - Verify invitation appears in users list



    - _Requirements: 2_


  - [x] 19.2 Write test for role change flow











    - Test opening role change dialog
    - Test selecting new role






    - Verify role updated in user detail
    - _Requirements: 5_








  - [ ] 19.3 Write test for status change flow



    - Test opening status change dialog
    - Test changing status with reason


    - Verify status updated in users list

    - _Requirements: 6_

  - [ ] 19.4 Write test for activity log viewing



    - Test navigating to activity page
    - Test filtering activity by date range
    - Verify activity entries displayed correctly
    - _Requirements: 7_

- [x] 20. Performance optimization and accessibility






  - Add proper ARIA labels to all interactive elements
  - Ensure keyboard navigation works throughout
  - Optimize database queries with proper indexes
  - Add data-test attributes for E2E testing
  - Implement proper focus management in dialogs
  - Test with screen readers
  - _Requirements: All_
