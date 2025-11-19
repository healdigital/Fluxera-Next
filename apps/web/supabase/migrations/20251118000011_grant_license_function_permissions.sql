-- Grant EXECUTE permissions on license functions to authenticated users
-- This migration ensures that authenticated users can execute the license-related functions
-- which are defined with SECURITY DEFINER

-- Grant EXECUTE on get_licenses_with_assignments function
grant execute on function public.get_licenses_with_assignments(uuid) to authenticated;

-- Grant EXECUTE on get_license_stats function
grant execute on function public.get_license_stats(uuid) to authenticated;

-- Grant EXECUTE on check_license_expirations function
grant execute on function public.check_license_expirations() to authenticated;

-- Verify the grants were applied
comment on function public.get_licenses_with_assignments(uuid) is 'Returns licenses with assignment counts for a team account. Granted to authenticated users.';
comment on function public.get_license_stats(uuid) is 'Returns license statistics for a team account. Granted to authenticated users.';
comment on function public.check_license_expirations() is 'Checks for expiring licenses and generates renewal alerts. Granted to authenticated users.';
