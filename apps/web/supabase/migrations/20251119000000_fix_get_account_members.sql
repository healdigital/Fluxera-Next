-- Migration: Fix get_account_members function to include all required fields
-- This adds role, hierarchy, timestamps, and account information

-- Drop the existing function
drop function if exists public.get_account_members(text);

-- Recreate function with all required fields
create or replace function public.get_account_members(account_slug text)
returns table (
  user_id uuid,
  name text,
  email text,
  picture_url text,
  role text,
  role_hierarchy_level int,
  account_id uuid,
  primary_owner_user_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    am.user_id,
    coalesce(u.raw_user_meta_data->>'display_name', u.email) as name,
    u.email,
    u.raw_user_meta_data->>'picture_url' as picture_url,
    am.account_role as role,
    r.hierarchy_level as role_hierarchy_level,
    am.account_id,
    a.primary_owner_user_id,
    am.created_at
  from
    public.accounts_memberships am
    inner join public.accounts a on a.id = am.account_id
    inner join auth.users u on u.id = am.user_id
    left join public.roles r on r.name = am.account_role
  where
    a.slug = account_slug
    and a.is_personal_account = false
  order by
    r.hierarchy_level,
    name;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_account_members(text) to authenticated;

-- Add comment
comment on function public.get_account_members(text) is 'Returns all members of a team account with complete user and role information';
