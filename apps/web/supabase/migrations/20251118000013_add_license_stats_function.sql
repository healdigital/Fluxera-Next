-- Add missing get_license_stats function
-- This function calculates license statistics for an account
-- Returns total licenses, expiring soon, expired, and total assignments

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
as $$
begin
  return query
  select
    count(distinct sl.id) as total_licenses,
    count(distinct case 
      when sl.expiration_date >= current_date 
        and sl.expiration_date <= current_date + interval '30 days'
      then sl.id 
    end) as expiring_soon,
    count(distinct case 
      when sl.expiration_date < current_date 
      then sl.id 
    end) as expired,
    count(la.id) as total_assignments
  from public.software_licenses sl
  left join public.license_assignments la on la.license_id = sl.id
  where sl.account_id = p_account_id;
end;
$$;

-- Grant EXECUTE permissions to authenticated users
grant execute on function public.get_license_stats(uuid) to authenticated;

-- Add comment for documentation
comment on function public.get_license_stats(uuid) is 
  'Returns license statistics for an account including total licenses, expiring soon (within 30 days), expired, and total assignments';
