-- Add function to count team members efficiently
-- This function returns the total count of team members matching the filters
-- without fetching all the data, improving pagination performance

create or replace function public.get_team_members_count(
  p_account_slug text,
  p_search text default null,
  p_role text default null,
  p_status text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_count bigint;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  -- Verify caller has access to this account
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Count matching users
  select count(*)
  into v_count
  from auth.users u
  inner join public.accounts_memberships m on m.user_id = u.id
  left join public.user_profiles up on up.id = u.id
  left join public.user_account_status us on us.user_id = u.id and us.account_id = m.account_id
  where m.account_id = v_account_id
    and (p_search is null or up.display_name ilike '%' || p_search || '%' or u.email ilike '%' || p_search || '%')
    and (p_role is null or m.account_role = p_role)
    and (p_status is null or coalesce(us.status::text, 'active') = p_status);

  return v_count;
end;
$$;

comment on function public.get_team_members_count is 'Get the total count of team members matching the filters for pagination';

grant execute on function public.get_team_members_count to authenticated;
