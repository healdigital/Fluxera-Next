-- Fix get_licenses_with_assignments function to include license_key
-- This migration updates the function to return the license_key field
-- which is required by the frontend loader
-- Also grants EXECUTE permissions to authenticated users

-- Drop and recreate the function with the license_key field
create or replace function public.get_licenses_with_assignments(p_account_id uuid)
returns table(
  id uuid,
  name varchar,
  vendor varchar,
  license_key text,
  license_type public.license_type,
  expiration_date date,
  days_until_expiry integer,
  assignment_count bigint,
  is_expired boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    sl.id,
    sl.name,
    sl.vendor,
    sl.license_key,
    sl.license_type,
    sl.expiration_date,
    (sl.expiration_date - current_date)::integer as days_until_expiry,
    count(la.id) as assignment_count,
    (sl.expiration_date < current_date) as is_expired
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id
  group by sl.id, sl.name, sl.vendor, sl.license_key, sl.license_type, sl.expiration_date
  order by sl.expiration_date asc;
end;
$$;

-- Grant EXECUTE permissions to authenticated users for all license functions
grant execute on function public.get_licenses_with_assignments(uuid) to authenticated;
grant execute on function public.get_license_stats(uuid) to authenticated;
grant execute on function public.check_license_expirations() to authenticated;
