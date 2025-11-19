-- User Management System Migration
-- This migration creates the complete schema for user management including:
-- - Enums for user status, action types, and result status
-- - User profiles table with extended information
-- - User account status table for team-specific status tracking
-- - User activity log table for audit trail
-- - RLS policies for multi-tenant access control
-- - Database functions for user management operations
-- - Triggers for automatic timestamp and user tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User status types
create type public.user_status as enum(
  'active',
  'inactive',
  'suspended',
  'pending_invitation'
);

comment on type public.user_status is 'Status of a user within a team account';

-- User action types for activity logging
create type public.user_action_type as enum(
  'user_created',
  'user_updated',
  'user_deleted',
  'role_changed',
  'status_changed',
  'asset_assigned',
  'asset_unassigned',
  'login',
  'logout',
  'password_changed',
  'profile_updated'
);

comment on type public.user_action_type is 'Types of actions that can be logged in user activity';

-- Action result status
create type public.action_result_status as enum(
  'success',
  'failure',
  'partial'
);

comment on type public.action_result_status is 'Result status of an action in the activity log';

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Profiles table - extends auth.users with additional profile information
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(255),
  phone_number varchar(50),
  job_title varchar(255),
  department varchar(255),
  location varchar(255),
  bio text,
  avatar_url varchar(1000),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

comment on table public.user_profiles is 'Extended user profile information beyond auth.users';
comment on column public.user_profiles.id is 'User ID matching auth.users.id';
comment on column public.user_profiles.display_name is 'Display name for the user';
comment on column public.user_profiles.phone_number is 'Contact phone number';
comment on column public.user_profiles.job_title is 'Job title or position';
comment on column public.user_profiles.department is 'Department or team';
comment on column public.user_profiles.location is 'Physical location or office';
comment on column public.user_profiles.bio is 'User biography or description';
comment on column public.user_profiles.avatar_url is 'URL to user avatar image';
comment on column public.user_profiles.metadata is 'Additional custom profile data';

-- User Account Status table - tracks user status within specific team accounts
create table public.user_account_status (
  user_id uuid references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  status public.user_status not null default 'active',
  status_reason text,
  status_changed_at timestamp with time zone default now(),
  status_changed_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (user_id, account_id)
);

comment on table public.user_account_status is 'Track user status within specific team accounts';
comment on column public.user_account_status.user_id is 'User whose status is being tracked';
comment on column public.user_account_status.account_id is 'Team account context for the status';
comment on column public.user_account_status.status is 'Current status of the user in this account';
comment on column public.user_account_status.status_reason is 'Reason for the current status';
comment on column public.user_account_status.status_changed_at is 'When the status was last changed';
comment on column public.user_account_status.status_changed_by is 'Who changed the status';

-- User Activity Log table - immutable audit log of user actions
create table public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete cascade not null,
  action_type public.user_action_type not null,
  resource_type varchar(100),
  resource_id uuid,
  action_details jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  result_status public.action_result_status not null,
  created_at timestamp with time zone default now()
);

comment on table public.user_activity_log is 'Audit log of user actions within team accounts';
comment on column public.user_activity_log.user_id is 'User who performed the action';
comment on column public.user_activity_log.account_id is 'Team account context for the action';
comment on column public.user_activity_log.action_type is 'Type of action performed';
comment on column public.user_activity_log.resource_type is 'Type of resource affected by the action';
comment on column public.user_activity_log.resource_id is 'ID of the resource affected';
comment on column public.user_activity_log.action_details is 'Additional details about the action';
comment on column public.user_activity_log.ip_address is 'IP address from which the action was performed';
comment on column public.user_activity_log.user_agent is 'User agent string of the client';
comment on column public.user_activity_log.result_status is 'Whether the action succeeded or failed';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User Profiles indexes
create index idx_user_profiles_display_name on public.user_profiles(display_name);
create index idx_user_profiles_department on public.user_profiles(department);

-- User Account Status indexes
create index idx_user_account_status_account_id on public.user_account_status(account_id);
create index idx_user_account_status_status on public.user_account_status(status);
create index idx_user_account_status_user_id on public.user_account_status(user_id);

-- User Activity Log indexes for performance
create index idx_user_activity_log_user_id on public.user_activity_log(user_id);
create index idx_user_activity_log_account_id on public.user_activity_log(account_id);
create index idx_user_activity_log_created_at on public.user_activity_log(created_at desc);
create index idx_user_activity_log_action_type on public.user_activity_log(action_type);
create index idx_user_activity_log_resource on public.user_activity_log(resource_type, resource_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for automatic timestamp updates on user_profiles
create trigger set_user_profiles_timestamps
  before insert or update on public.user_profiles
  for each row execute function public.trigger_set_timestamps();

-- Trigger for automatic user tracking on user_profiles
create trigger set_user_profiles_user_tracking
  before insert or update on public.user_profiles
  for each row execute function public.trigger_set_user_tracking();

-- Trigger for automatic timestamp updates on user_account_status
create trigger set_user_account_status_timestamps
  before insert or update on public.user_account_status
  for each row execute function public.trigger_set_timestamps();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to log user activity
create or replace function public.log_user_activity(
  p_user_id uuid,
  p_account_id uuid,
  p_action_type public.user_action_type,
  p_resource_type varchar default null,
  p_resource_id uuid default null,
  p_action_details jsonb default '{}'::jsonb,
  p_result_status public.action_result_status default 'success'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_activity_log (
    user_id,
    account_id,
    action_type,
    resource_type,
    resource_id,
    action_details,
    ip_address,
    result_status
  ) values (
    p_user_id,
    p_account_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_action_details,
    inet_client_addr(),
    p_result_status
  );
end;
$$;

comment on function public.log_user_activity is 'Log a user activity event to the audit log';

grant execute on function public.log_user_activity to authenticated;

-- Function to get team members with profiles and status
create or replace function public.get_team_members(
  p_account_slug text,
  p_search text default null,
  p_role text default null,
  p_status text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  role_name text,
  status text,
  last_sign_in_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  -- Verify caller has access to this account
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  return query
  select
    u.id as user_id,
    u.email::text,
    coalesce(up.display_name, u.email)::text as display_name,
    up.avatar_url::text,
    m.account_role::text as role_name,
    coalesce(us.status::text, 'active') as status,
    u.last_sign_in_at,
    m.created_at
  from auth.users u
  inner join public.accounts_memberships m on m.user_id = u.id
  left join public.user_profiles up on up.id = u.id
  left join public.user_account_status us on us.user_id = u.id and us.account_id = m.account_id
  where m.account_id = v_account_id
    and (p_search is null or up.display_name ilike '%' || p_search || '%' or u.email ilike '%' || p_search || '%')
    and (p_role is null or m.account_role = p_role)
    and (p_status is null or coalesce(us.status::text, 'active') = p_status)
  order by m.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

comment on function public.get_team_members is 'Get team members with profiles, roles, and status for a specific account';

grant execute on function public.get_team_members to authenticated;

-- Function to update user status
create or replace function public.update_user_status(
  p_user_id uuid,
  p_account_id uuid,
  p_status public.user_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify caller has permission
  if not public.has_permission(auth.uid(), p_account_id, 'members.manage'::public.app_permissions) then
    raise exception 'Access denied';
  end if;

  -- Prevent self-deactivation
  if p_user_id = auth.uid() and p_status = 'inactive' then
    raise exception 'You cannot deactivate your own account';
  end if;

  -- Insert or update status
  insert into public.user_account_status (
    user_id,
    account_id,
    status,
    status_reason,
    status_changed_by
  ) values (
    p_user_id,
    p_account_id,
    p_status,
    p_reason,
    auth.uid()
  )
  on conflict (user_id, account_id)
  do update set
    status = excluded.status,
    status_reason = excluded.status_reason,
    status_changed_at = now(),
    status_changed_by = auth.uid();

  -- Log the activity
  perform public.log_user_activity(
    p_user_id,
    p_account_id,
    'status_changed'::public.user_action_type,
    'user',
    p_user_id,
    jsonb_build_object('new_status', p_status, 'reason', p_reason)
  );
end;
$$;

comment on function public.update_user_status is 'Update user status within a team account with permission checks';

grant execute on function public.update_user_status to authenticated;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.user_account_status enable row level security;
alter table public.user_activity_log enable row level security;

-- User Profiles: Users can view their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  to authenticated
  using (id = auth.uid());

-- User Profiles: Team members can view profiles of users in their team
create policy "Team members can view team user profiles"
  on public.user_profiles for select
  to authenticated
  using (
    id in (
      select m1.user_id
      from public.accounts_memberships m1
      where m1.account_id in (
        select m2.account_id
        from public.accounts_memberships m2
        where m2.user_id = auth.uid()
      )
    )
  );

-- User Profiles: Users can insert their own profile
create policy "Users can insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check (id = auth.uid());

-- User Profiles: Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- User Profiles: Admins with members.manage permission can update team member profiles
create policy "Admins can update team member profiles"
  on public.user_profiles for update
  to authenticated
  using (
    exists (
      select 1
      from public.accounts_memberships m
      where m.user_id = auth.uid()
        and public.has_permission(auth.uid(), m.account_id, 'members.manage'::public.app_permissions)
        and m.account_id in (
          select account_id
          from public.accounts_memberships
          where user_id = user_profiles.id
        )
    )
  );

-- User Account Status: Team members can view status of users in their team
create policy "Team members can view user status"
  on public.user_account_status for select
  to authenticated
  using (
    account_id in (
      select account_id
      from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- User Account Status: Admins can manage user status
create policy "Admins can manage user status"
  on public.user_account_status for all
  to authenticated
  using (
    public.has_permission(auth.uid(), account_id, 'members.manage'::public.app_permissions)
  )
  with check (
    public.has_permission(auth.uid(), account_id, 'members.manage'::public.app_permissions)
  );

-- User Activity Log: Users can view their own activity
create policy "Users can view own activity"
  on public.user_activity_log for select
  to authenticated
  using (user_id = auth.uid());

-- User Activity Log: Admins can view team activity
create policy "Admins can view team activity"
  on public.user_activity_log for select
  to authenticated
  using (
    public.has_permission(auth.uid(), account_id, 'members.manage'::public.app_permissions)
  );

-- User Activity Log: System can insert activity logs
create policy "System can insert activity logs"
  on public.user_activity_log for insert
  to authenticated
  with check (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to tables for authenticated users
grant select, insert, update on table public.user_profiles to authenticated;
grant select, insert, update, delete on table public.user_account_status to authenticated;
grant select, insert on table public.user_activity_log to authenticated;
