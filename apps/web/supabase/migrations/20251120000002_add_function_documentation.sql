-- Migration: Add Comprehensive SQL Function Documentation
-- Description: Adds detailed comments to all SQL functions explaining security model
-- Author: Security Fixes Implementation
-- Date: 2025-11-20

-- ============================================================================
-- LICENSE FUNCTIONS DOCUMENTATION
-- ============================================================================

comment on function public.check_license_expirations() is 
'Checks for expiring licenses and generates renewal alerts.

Security Model: SECURITY DEFINER
- Runs with elevated privileges to insert alerts regardless of user permissions
- Uses set search_path = public to prevent SQL injection
- Called by automated cron job to check all licenses system-wide

Parameters: None

Returns: void

Usage: Typically called by pg_cron job daily
  SELECT check_license_expirations();

Performance: Scans all licenses with expiration_date >= current_date
  - Uses index on expiration_date for efficient filtering
  - Inserts alerts with ON CONFLICT DO NOTHING to avoid duplicates

Security Considerations:
  - Function needs DEFINER to bypass RLS on license_renewal_alerts
  - Only inserts alerts, does not expose sensitive data
  - search_path set to prevent malicious schema injection';

comment on function public.get_license_stats(uuid) is 
'Returns license statistics for a specific account.

Security Model: SECURITY DEFINER
- Runs with elevated privileges to aggregate data across tables
- Uses set search_path = public to prevent SQL injection
- Results are filtered by account_id parameter

Parameters:
  - p_account_id (uuid): The account ID to get statistics for

Returns: TABLE with columns:
  - total_licenses (bigint): Total number of licenses for the account
  - expiring_soon (bigint): Licenses expiring within 30 days
  - expired (bigint): Licenses that have already expired
  - total_assignments (bigint): Total license assignments

Usage Example:
  SELECT * FROM get_license_stats(''123e4567-e89b-12d3-a456-426614174000'');

Performance:
  - Uses indexes on account_id and expiration_date
  - Efficient aggregation with FILTER clauses
  - Left join to count assignments

Security Considerations:
  - Caller must have access to the account (enforced by application layer)
  - Function bypasses RLS for aggregation efficiency
  - Does not expose individual license details';

comment on function public.get_licenses_with_assignments(uuid) is 
'Returns detailed license information with assignment counts for an account.

Security Model: SECURITY DEFINER
- Runs with elevated privileges to join across tables
- Uses set search_path = public to prevent SQL injection
- Results are filtered by account_id parameter

Parameters:
  - p_account_id (uuid): The account ID to get licenses for

Returns: TABLE with columns:
  - id (uuid): License ID
  - name (varchar): License name
  - vendor (varchar): Software vendor
  - license_type (license_type): Type of license
  - expiration_date (date): When license expires
  - days_until_expiry (integer): Days remaining until expiration
  - assignment_count (bigint): Number of assignments for this license
  - is_expired (boolean): Whether license has expired

Usage Example:
  SELECT * FROM get_licenses_with_assignments(''123e4567-e89b-12d3-a456-426614174000'')
  WHERE is_expired = false
  ORDER BY days_until_expiry ASC;

Performance:
  - Uses indexes on account_id for efficient filtering
  - Groups by license to count assignments
  - Ordered by expiration_date for priority view

Security Considerations:
  - Caller must have licenses.view permission (enforced by application layer)
  - Function bypasses RLS for join efficiency
  - Returns full license details for the specified account';

-- ============================================================================
-- ASSET FUNCTIONS DOCUMENTATION
-- ============================================================================

comment on function public.create_asset_history_entry() is 
'Trigger function that automatically creates audit trail entries for asset changes.

Security Model: SECURITY DEFINER
- Runs with elevated privileges to insert history regardless of user permissions
- Uses set search_path = public to prevent SQL injection
- Triggered automatically on INSERT, UPDATE, DELETE of assets table

Parameters: None (trigger function uses NEW/OLD records)

Returns: TRIGGER

Trigger Events:
  - INSERT: Creates ''created'' event with initial asset data
  - UPDATE: Creates event based on what changed:
    * Status change → ''status_changed'' event
    * Assignment change → ''assigned'' or ''unassigned'' event
    * Other changes → ''updated'' event with change details
  - DELETE: Creates ''deleted'' event with final asset state

Usage: Automatically triggered, no manual invocation needed

Performance:
  - Minimal overhead, only inserts one history record per change
  - Uses JSONB for flexible event data storage
  - Indexed on asset_id and created_at for efficient history queries

Security Considerations:
  - Function needs DEFINER to bypass RLS on asset_history table
  - Captures auth.uid() as created_by for audit trail
  - Preserves complete change history for compliance';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify documentation was added:
--
-- 1. Check function comments:
--    SELECT 
--      p.proname as function_name,
--      pg_catalog.obj_description(p.oid, 'pg_proc') as description
--    FROM pg_catalog.pg_proc p
--    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname = 'public'
--      AND p.proname IN ('check_license_expirations', 'get_license_stats', 
--                        'get_licenses_with_assignments', 'create_asset_history_entry')
--    ORDER BY p.proname;
