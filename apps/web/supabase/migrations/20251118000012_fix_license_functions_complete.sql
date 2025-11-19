-- Complete fix for license functions
-- This migration ensures all required functions exist with proper security

-- Drop existing functions if they exist
drop function if exists public.get_licenses_with_assignments(uuid);
drop function if exists public.get_license_stats(uuid);

-- ============================================================================
-- FUNCTION: get_licenses_with_assignments
-- ============================================================================
-- Returns licenses with assignment counts and expiration status
-- Includes license_key field required by the frontend

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
stable
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
    coalesce(count(la.id), 0)::bigint as assignment_count,
    (sl.expiration_date < current_date) as is_expired
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id
  group by sl.id, sl.name, sl.vendor, sl.license_key, sl.license_type, sl.expiration_date
  order by sl.expiration_date asc;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_licenses_with_assignments(uuid) to authenticated;

-- Add comment
comment on function public.get_licenses_with_assignments(uuid) is 
  'Returns all licenses for an account with assignment counts and expiration status';

-- ============================================================================
-- FUNCTION: get_license_stats
-- ============================================================================
-- Returns aggregate statistics for licenses in an account

create or replace function public.get_license_stats(p_account_id uuid)
returns table(
  total_licenses bigint,
  expiring_soon bigint,
  expired bigint,
  total_assignments bigint
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return query
  select
    count(distinct sl.id)::bigint as total_licenses,
    count(distinct case 
      when sl.expiration_date >= current_date 
        and sl.expiration_date <= current_date + interval '30 days'
      then sl.id 
    end)::bigint as expiring_soon,
    count(distinct case 
      when sl.expiration_date < current_date 
      then sl.id 
    end)::bigint as expired,
    count(la.id)::bigint as total_assignments
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_license_stats(uuid) to authenticated;

-- Add comment
comment on function public.get_license_stats(uuid) is 
  'Returns aggregate statistics for licenses in an account including total, expiring soon, expired, and total assignments';
