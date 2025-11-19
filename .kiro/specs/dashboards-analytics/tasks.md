# Implementation Plan - Dashboards & Analytics

- [x] 1. Set up database schema and functions








  - Create migration for dashboard_widgets table with RLS policies
  - Create migration for dashboard_alerts table with RLS policies
  - Create materialized view for platform_metrics with refresh function
  - Implement database functions: get_team_dashboard_metrics, get_asset_status_distribution, get_dashboard_trends
  - Implement database functions: create_dashboard_alert, get_admin_platform_metrics, get_account_activity_list
  - Run typegen to generate TypeScript types for new tables and functions
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 8.1, 9.1_
-

- [x] 2. Create shared dashboard schemas and types





  - Create dashboard.schema.ts with Zod schemas for widget configuration, alert dismissal, and trend queries
  - Create admin-dashboard.schema.ts with Zod schemas for admin-specific operations
  - Define TypeScript interfaces for dashboard metrics, widgets, alerts, and platform metrics
  - _Requirements: 1.1, 2.1, 7.1_

- [x] 3. Implement team dashboard data loader




- [ ] 3. Implement team dashboard data loader


  - Create dashboard-page.loader.ts to fetch team metrics using get_team_dashboard_metrics function
  - Implement loader function to fetch user's widget configuration from dashboard_widgets table
  - Implement loader function to fetch active alerts for the team from dashboard_alerts table
  - Add error handling for database queries
  - _Requirements: 1.1, 1.2, 1.3, 4.1_
-


- [x] 4. Build team dashboard page and layout




  - Create apps/web/app/home/[account]/dashboard/page.tsx as RSC
  - Implement dashboard-grid.tsx component for responsive widget layout
  - Create dashboard-header.tsx with title and configuration button
  - Add loading states with skeleton components
  - Export page component using withI18n utility
  - Add page metadata for SEO
  - _Requirements: 1.1, 12.1, 12.2_

- [x] 5. Implement metrics summary widget






  - Create metrics-summary-widget.tsx displaying key metrics (assets, users, licenses)
  - Display current values with comparison to previous period
  - Show percentage change indicators with up/down arrows
  - Add loading skeleton for metrics
  - Style using Shadcn UI Card components
  - _Requirements: 1.1, 1.4_
-

- [x] 6. Build asset status distribution widget





  - Create asset-status-widget.tsx with pie chart using Recharts
  - Fetch data using get_asset_status_distribution function
  - Display status breakdown with percentages
  - Add click handler to navigate to filtered asset list
  - Implement responsive chart sizing
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Implement trend chart widget






  - Create trend-chart-widget.tsx with line chart using Recharts
  - Add time range selector (7d, 30d, 90d, 1y)
  - Fetch trend data using get_dashboard_trends function
  - Display tooltip on hover with exact values and timestamps
  - Handle insufficient data scenarios with appropriate messaging
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Create alerts widget






  - Create alerts-widget.tsx to display active alerts
  - Create alert-card.tsx component for individual alert display
  - Show alert severity with color coding (info: blue, warning: yellow, critical: red)
  - Display alert title, description, timestamp, and action button
  - Sort alerts by severity (critical first)
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 9. Implement alert dismissal functionality






  - Create dashboard-server-actions.ts with dismissAlert server action
  - Use enhanceAction with DismissAlertSchema for validation
  - Update dashboard_alerts table setting is_dismissed, dismissed_by, and dismissed_at
  - Add optimistic update in alert-card.tsx
  - Revalidate dashboard path after dismissal
  - _Requirements: 4.4_
-

- [x] 10. Build quick actions widget





  - Create quick-actions-widget.tsx with action buttons
  - Add buttons for: create asset, add user, register license, schedule maintenance
  - Filter actions based on user's role permissions
  - Navigate to appropriate forms on button click
  - Style using Shadcn UI Button components
  - _Requirements: 5.1, 5.2, 5.3_
-


- [x] 11. Implement widget configuration dialog




  - Create configure-widgets-dialog.tsx with drag-and-drop interface
  - Display all available widget types with show/hide toggles
  - Implement reordering using position_order field
  - Create updateWidgetConfig server action in dashboard-server-actions.ts
  - Save configuration to dashboard_widgets table
  - Revalidate dashboard after configuration changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
-

- [x] 12. Add real-time metric updates










  - Implement Supabase Realtime subscription in dashboard-grid.tsx
  - Subscribe to changes on assets, accounts_memberships, and software_licenses tables
  - Trigger metric refresh on relevant table changes
  - Update metrics automatically every 30 seconds
  - Add visual indicator for live updates
  - _Requirements: 1.2, 3.2, 6.4, 12.3_





- [x] 13. Create admin dashboard page








  - Create apps/web/app/admin/dashboard/page.tsx as RSC
  - Implement admin-dashboard.loader.ts to fetch platform metrics
  - Verify user has super admin role before displaying dashboard
  - Display authorization error for non-admin users
  - Add page metadata and export with withI18n

  --_Requirements: 7.1, 7.2, 7.3, 7.4_









- [x] 14. Build admin metrics overview widget








  - Create admin-metrics-overview.tsx displaying platform-wide metrics
  - Show total accounts, users, assets, and licenses



  - Display growth metrics (new accounts, users, assets in last 30 days)




  - Add last updated timestamp from mater
ialized view
  - Style using Shadcn UI Card components



  - _Requirements: 8.1, 8.4_

- [x] 15. Implement account activity list widget





  - Create account-activity-list.tsx displaying team accounts
  - Fetch data using get_account_activity_list function
  - Display account name, user count, asset count, and last activity timestamp
  - Sort by activity level (most recent first)







  - Add click handler to navigate to specific team dashboard
  - Implement pagination for large account lists




  - _Requirements: 8.2, 8.3, 8.5_



- [ ] 16. Build system health monitoring widget











  - Create system-health-widget.tsx displaying health indicators
  - Display metrics for database performance, API response times, storage utilization
  - Update metrics every 15 seconds
  - Color code metrics: green (normal), yellow (warning), red (critical)


  - Create alerts for critical thresholds
  - Display 24-hour trend graphs for each m
etric
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_



- [x] 17. Implement subscription overview widget








  - Create subscription-overview-widget.tsx showing subscription metrics
  - Display count of accounts by subscription tier
  - Highlight accounts with expiring subscriptions (within 30 days)
  - Show accounts exceeding usage limits with warning indicators
  - Add click handler to view detailed subscription information
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

-





- [x] 18. Build usage statistics widget




  - Create usage-statistics-widget.tsx displaying feature usage
  - Show usage stats for asset management, user management, license tracking, maintenance scheduling
  - Display most active team accounts based on feature usage
  - Add time range selector for usage statistics





  - Calculate and display feature adoption rates

  - Highlight features with declining engagement
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_


- [x] 19. Add dashboard performance optimizations











  - Implement lazy loading for widgets outside initial viewport
  - Add caching for frequently accessed dashboard data (30 second TTL)
  - Optimize database queries with proper indexes
  - Implement asynchronous widget data loading
  - Add loading skeletons for each widget type
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 20. Create scheduled job for platform metrics refresh





  - Implement cron job or scheduled function to refresh platform_metrics materialized view
  - Schedule refresh every 5 minutes
  - Add error handling and logging for refresh failures
  - Monitor refresh performance
  - _Requirements: 8.1, 9.1_

- [ ]* 21. Write E2E tests for dashboard features
  - [ ]* 21.1 Write test for viewing team dashboard with all widgets
    - Navigate to dashboard page
    - Verify all default widgets are displayed
    - Check that metrics load and display correctly
    - _Requirements: 1.1, 1.2_
  - [ ]* 21.2 Write test for configuring dashboard widgets
    - Open widget configuration dialog
    - Reorder widgets using drag-and-drop
    - Hide and show widgets
    - Save configuration and verify persistence
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ]* 21.3 Write test for dismissing alerts
    - View alert in alerts widget
    - Click dismiss button
    - Verify alert is removed from list
    - _Requirements: 4.4_
  - [ ]* 21.4 Write test for viewing trend charts
    - Select different time ranges
    - Verify chart updates with correct data
    - Hover over data points and check tooltips
    - _Requirements: 3.3, 3.4_
  - [ ]* 21.5 Write test for admin dashboard access
    - Attempt to access admin dashboard as regular user (verify denied)
    - Access admin dashboard as super admin (verify success)
    - Verify platform metrics are displayed
    - _Requirements: 7.1, 7.2_

