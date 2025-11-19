-- Migration: Add get_account_members function
-- This function retrieves all members of a team account with their user information
-- Used by the assign asset dialog to display available team members

-- Drop the function if it exists with any signature
drop function if exists public.get_account_members(text);

-- Function to get all members of an account
create or replace function public.get_account_members(account_slug text)
returns table (
  user_id uuid,
  name text,
  email text,
  picture_url text
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
    u.raw_user_meta_data->>'picture_url' as picture_url
  from
    public.accounts_memberships am
    inner join public.accounts a on a.id = am.account_id
    inner join auth.users u on u.id = am.user_id
  where
    a.slug = account_slug
    and a.is_personal_account = false
  order by
    name;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_account_members(text) to authenticated;

-- Add comment
comment on function public.get_account_members(text) is 'Returns all members of a team account with their user information';
