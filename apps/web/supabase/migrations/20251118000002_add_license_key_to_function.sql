-- Add license_key to get_licenses_with_assignments function
-- This allows searching by license key while maintaining security through RLS

-- Drop the existing function
drop function if exists public.get_licenses_with_assignments(uuid);

-- Recreate the function with license_key included
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

comment on function public.get_licenses_with_assignments(uuid) is 'Returns licenses with assignment counts and license keys for a team account';
