-- =============================================
-- Dashboards & Analytics System Migration
-- =============================================
-- This migration creates the database schema for the dashboards and analytics system
-- including widget configurations, alerts, platform metrics, and related functions.

-- =============================================
-- ENUMS
-- =============================================

-- Alert severity levels
create type public.alert_severity as enum(
  'info',
  'warning',
  'critical'
);

-- Dashboard alert types (different from license alert_type)
create type public.dashboard_alert_type as enum(
  'low_asset_availability',
  'expiring_licenses',
  'pending_maintenance',
  'unusual_activity',
  'system_health',
  'subscription_expiring',
  'usage_limit_approaching'
);

-- =============================================
-- TABLES
-- =============================================

-- Dashboard Widgets Configuration Table
create table public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  widget_type varchar(100) not null,
  widget_config jsonb not null default '{}'::jsonb,
  position_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table public.dashboard_widgets is 'User-configurable dashboard widget preferences';
comment on column public.dashboard_widgets.widget_type is 'Type of widget: metrics_summary, asset_status, trend_chart, alerts, quick_actions, recent_activity, license_expiry, maintenance_schedule';
comment on column public.dashboard_widgets.widget_config is 'JSON configuration specific to the widget type';
comment on column public.dashboard_widgets.position_order is 'Display order of the widget on the dashboard';

-- Indexes for dashboard_widgets
create index idx_dashboard_widgets_account_id on public.dashboard_widgets(account_id);
create index idx_dashboard_widgets_user_id on public.dashboard_widgets(user_id);
create index idx_dashboard_widgets_position on public.dashboard_widgets(position_order);

-- Unique constraint: one config per user per widget type
create unique index idx_dashboard_widgets_unique 
  on public.dashboard_widgets(account_id, coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), widget_type);

-- Dashboard Alerts Table
create table public.dashboard_alerts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  alert_type public.dashboard_alert_type not null,
  severity public.alert_severity not null,
  title varchar(255) not null,
  description text not null,
  action_url varchar(1000),
  action_label varchar(100),
  metadata jsonb default '{}'::jsonb,
  is_dismissed boolean not null default false,
  dismissed_by uuid references auth.users(id),
  dismissed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

comment on table public.dashboard_alerts is 'Dashboard alerts and notifications';
comment on column public.dashboard_alerts.alert_type is 'Type of alert that was triggered';
comment on column public.dashboard_alerts.severity is 'Severity level: info, warning, critical';
comment on column public.dashboard_alerts.action_url is 'Optional URL for the action button';
comment on column public.dashboard_alerts.metadata is 'Additional alert-specific data';

-- Indexes for dashboard_alerts
create index idx_dashboard_alerts_account_id on public.dashboard_alerts(account_id);
create index idx_dashboard_alerts_severity on public.dashboard_alerts(severity);
create index idx_dashboard_alerts_dismissed on public.dashboard_alerts(is_dismissed);
create index idx_dashboard_alerts_created_at on public.dashboard_alerts(created_at desc);
create index idx_dashboard_alerts_expires_at on public.dashboard_alerts(expires_at) where expires_at is not null;

-- =============================================
-- MATERIALIZED VIEW FOR PLATFORM METRICS
-- =============================================

-- Platform-wide metrics for admin dashboard
create materialized view public.platform_metrics as
select
  count(distinct a.id) as total_accounts,
  count(distinct am.user_id) as total_users,
  count(distinct ast.id) as total_assets,
  count(distinct sl.id) as total_licenses,
  count(distinct case when a.created_at >= now() - interval '30 days' then a.id end) as new_accounts_30d,
  count(distinct case when am.created_at >= now() - interval '30 days' then am.user_id end) as new_users_30d,
  count(distinct case when ast.created_at >= now() - interval '30 days' then ast.id end) as new_assets_30d,
  now() as last_updated
from public.accounts a
left join public.accounts_memberships am on am.account_id = a.id
left join public.assets ast on ast.account_id = a.id
left join public.software_licenses sl on sl.account_id = a.id;

comment on materialized view public.platform_metrics is 'Cached platform-wide metrics for admin dashboard';

-- Index for fast access
create unique index idx_platform_metrics_singleton on public.platform_metrics((true));

-- =============================================
-- TRIGGERS
-- =============================================

-- Timestamps trigger for dashboard_widgets
create trigger set_dashboard_widgets_timestamps
  before insert or update on public.dashboard_widgets
  for each row execute function public.trigger_set_timestamps();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
alter table public.dashboard_widgets enable row level security;
alter table public.dashboard_alerts enable row level security;

-- Dashboard Widgets: Users can view their own widget configs
create policy "Users can view own widget configs"
  on public.dashboard_widgets for select
  to authenticated
  using (
    user_id = auth.uid() and
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- Dashboard Widgets: Users can manage their own widget configs
create policy "Users can manage own widget configs"
  on public.dashboard_widgets for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Dashboard Alerts: Team members can view team alerts
create policy "Team members can view team alerts"
  on public.dashboard_alerts for select
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
    and is_dismissed = false
    and (expires_at is null or expires_at > now())
  );

-- Dashboard Alerts: Users can dismiss alerts
create policy "Users can dismiss alerts"
  on public.dashboard_alerts for update
  to authenticated
  using (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  )
  with check (is_dismissed = true and dismissed_by = auth.uid());

-- Dashboard Alerts: System can create alerts (authenticated users with proper permissions)
create policy "System can create alerts"
  on public.dashboard_alerts for insert
  to authenticated
  with check (
    account_id in (
      select account_id from public.accounts_memberships
      where user_id = auth.uid()
    )
  );

-- =============================================
-- DATABASE FUNCTIONS
-- =============================================

-- Function to refresh platform metrics materialized view
create or replace function public.refresh_platform_metrics()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.platform_metrics;
end;
$$;

comment on function public.refresh_platform_metrics is 'Refreshes the platform_metrics materialized view';
grant execute on function public.refresh_platform_metrics to authenticated;

-- Function to get team dashboard metrics
create or replace function public.get_team_dashboard_metrics(
  p_account_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_metrics jsonb;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  if v_account_id is null then
    raise exception 'Account not found';
  end if;

  -- Verify caller has access
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Calculate metrics
  select jsonb_build_object(
    'total_assets', coalesce(count(distinct ast.id), 0),
    'available_assets', coalesce(count(distinct case when ast.status = 'available' then ast.id end), 0),
    'assigned_assets', coalesce(count(distinct case when ast.status = 'assigned' then ast.id end), 0),
    'maintenance_assets', coalesce(count(distinct case when ast.status = 'in_maintenance' then ast.id end), 0),
    'total_users', coalesce(count(distinct am.user_id), 0),
    'active_users', coalesce(count(distinct case when uas.status = 'active' then am.user_id end), 0),
    'total_licenses', coalesce(count(distinct sl.id), 0),
    'active_licenses', coalesce(count(distinct case when sl.status = 'active' then sl.id end), 0),
    'expiring_licenses_30d', coalesce(count(distinct case when sl.expiry_date between now() and now() + interval '30 days' then sl.id end), 0),
    'pending_maintenance', coalesce(count(distinct m.id), 0),
    'assets_growth_30d', (
      select coalesce(count(*), 0) from public.assets
      where account_id = v_account_id
      and created_at >= now() - interval '30 days'
    ),
    'users_growth_30d', (
      select coalesce(count(*), 0) from public.accounts_memberships
      where account_id = v_account_id
      and created_at >= now() - interval '30 days'
    )
  ) into v_metrics
  from public.accounts a
  left join public.assets ast on ast.account_id = a.id
  left join public.accounts_memberships am on am.account_id = a.id
  left join public.user_account_status uas on uas.user_id = am.user_id and uas.account_id = a.id
  left join public.software_licenses sl on sl.account_id = a.id
  left join public.asset_maintenance m on m.asset_id = ast.id and m.status = 'pending'
  where a.id = v_account_id;

  return v_metrics;
end;
$$;

comment on function public.get_team_dashboard_metrics is 'Returns dashboard metrics for a team account';
grant execute on function public.get_team_dashboard_metrics to authenticated;

-- Function to get asset status distribution
create or replace function public.get_asset_status_distribution(
  p_account_slug text
)
returns table (
  status text,
  count bigint,
  percentage numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_total_assets bigint;
begin
  -- Get account ID from slug
  select id into v_account_id
  from public.accounts
  where slug = p_account_slug;

  if v_account_id is null then
    raise exception 'Account not found';
  end if;

  -- Verify caller has access
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Get total assets
  select coalesce(count(*), 0) into v_total_assets
  from public.assets
  where account_id = v_account_id;

  -- Return distribution
  return query
  select
    ast.status::text,
    count(*)::bigint,
    case when v_total_assets > 0 
      then round((count(*)::numeric / v_total_assets) * 100, 2)
      else 0
    end as percentage
  from public.assets ast
  where ast.account_id = v_account_id
  group by ast.status
  order by count(*) desc;
end;
$$;

comment on function public.get_asset_status_distribution is 'Returns asset status distribution for a team account';
grant execute on function public.get_asset_status_distribution to authenticated;

-- Function to get dashboard trends
create or replace function public.get_dashboard_trends(
  p_account_slug text,
  p_metric_type text,
  p_days int default 30
)
returns table (
  date date,
  value bigint
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

  if v_account_id is null then
    raise exception 'Account not found';
  end if;

  -- Verify caller has access
  if not public.has_role_on_account(v_account_id) then
    raise exception 'Access denied';
  end if;

  -- Return trend data based on metric type
  if p_metric_type = 'assets' then
    return query
    select
      d.date::date,
      coalesce(count(ast.id), 0)::bigint as value
    from generate_series(
      current_date - (p_days || ' days')::interval,
      current_date,
      '1 day'::interval
    ) d(date)
    left join public.assets ast on ast.account_id = v_account_id
      and ast.created_at::date <= d.date
    group by d.date
    order by d.date;
  elsif p_metric_type = 'users' then
    return query
    select
      d.date::date,
      coalesce(count(am.user_id), 0)::bigint as value
    from generate_series(
      current_date - (p_days || ' days')::interval,
      current_date,
      '1 day'::interval
    ) d(date)
    left join public.accounts_memberships am on am.account_id = v_account_id
      and am.created_at::date <= d.date
    group by d.date
    order by d.date;
  elsif p_metric_type = 'licenses' then
    return query
    select
      d.date::date,
      coalesce(count(sl.id), 0)::bigint as value
    from generate_series(
      current_date - (p_days || ' days')::interval,
      current_date,
      '1 day'::interval
    ) d(date)
    left join public.software_licenses sl on sl.account_id = v_account_id
      and sl.created_at::date <= d.date
    group by d.date
    order by d.date;
  else
    raise exception 'Invalid metric type. Must be: assets, users, or licenses';
  end if;
end;
$$;

comment on function public.get_dashboard_trends is 'Returns trend data for dashboard charts';
grant execute on function public.get_dashboard_trends to authenticated;

-- Function to create dashboard alert
create or replace function public.create_dashboard_alert(
  p_account_id uuid,
  p_alert_type public.dashboard_alert_type,
  p_severity public.alert_severity,
  p_title varchar,
  p_description text,
  p_action_url varchar default null,
  p_action_label varchar default null,
  p_metadata jsonb default '{}'::jsonb,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alert_id uuid;
begin
  insert into public.dashboard_alerts (
    account_id,
    alert_type,
    severity,
    title,
    description,
    action_url,
    action_label,
    metadata,
    expires_at
  ) values (
    p_account_id,
    p_alert_type,
    p_severity,
    p_title,
    p_description,
    p_action_url,
    p_action_label,
    p_metadata,
    p_expires_at
  )
  returning id into v_alert_id;

  return v_alert_id;
end;
$$;

comment on function public.create_dashboard_alert is 'Creates a new dashboard alert';
grant execute on function public.create_dashboard_alert to authenticated;

-- Function to get admin platform metrics
create or replace function public.get_admin_platform_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_metrics jsonb;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Get cached metrics
  select jsonb_build_object(
    'total_accounts', coalesce(total_accounts, 0),
    'total_users', coalesce(total_users, 0),
    'total_assets', coalesce(total_assets, 0),
    'total_licenses', coalesce(total_licenses, 0),
    'new_accounts_30d', coalesce(new_accounts_30d, 0),
    'new_users_30d', coalesce(new_users_30d, 0),
    'new_assets_30d', coalesce(new_assets_30d, 0),
    'last_updated', last_updated
  ) into v_metrics
  from public.platform_metrics;

  return coalesce(v_metrics, '{}'::jsonb);
end;
$$;

comment on function public.get_admin_platform_metrics is 'Returns platform-wide metrics for admin dashboard';
grant execute on function public.get_admin_platform_metrics to authenticated;

-- Function to get account activity list for admin
create or replace function public.get_account_activity_list(
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  account_id uuid,
  account_name text,
  account_slug text,
  user_count bigint,
  asset_count bigint,
  last_activity_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  return query
  select
    a.id as account_id,
    a.name::text as account_name,
    a.slug::text as account_slug,
    coalesce(count(distinct am.user_id), 0)::bigint as user_count,
    coalesce(count(distinct ast.id), 0)::bigint as asset_count,
    coalesce(
      greatest(
        max(ast.updated_at),
        max(am.created_at),
        a.created_at
      ),
      a.created_at
    ) as last_activity_at,
    a.created_at
  from public.accounts a
  left join public.accounts_memberships am on am.account_id = a.id
  left join public.assets ast on ast.account_id = a.id
  group by a.id, a.name, a.slug, a.created_at
  order by last_activity_at desc nulls last
  limit p_limit
  offset p_offset;
end;
$$;

comment on function public.get_account_activity_list is 'Returns list of team accounts with activity metrics for admin dashboard';
grant execute on function public.get_account_activity_list to authenticated;

-- Function to get subscription overview for admin dashboard
create or replace function public.get_subscription_overview()
returns table (
  tier text,
  account_count bigint,
  total_revenue numeric,
  expiring_soon_count bigint,
  over_limit_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expiry_threshold timestamp with time zone;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Calculate expiry threshold (30 days from now)
  v_expiry_threshold := now() + interval '30 days';

  -- Return subscription overview grouped by tier
  return query
  with subscription_data as (
    select
      s.account_id,
      si.product_id,
      s.status,
      s.period_ends_at,
      si.price_amount,
      -- Count users and assets per account
      (select count(*) from public.accounts_memberships am where am.account_id = s.account_id) as user_count,
      (select count(*) from public.assets ast where ast.account_id = s.account_id) as asset_count
    from public.subscriptions s
    left join public.subscription_items si on si.subscription_id = s.id
    where s.active = true
      and s.status in ('active', 'trialing', 'past_due')
  ),
  tier_mapping as (
    select
      sd.account_id,
      sd.product_id,
      sd.status,
      sd.period_ends_at,
      sd.price_amount,
      sd.user_count,
      sd.asset_count,
      -- Map product_id to tier name (you may need to adjust this based on your product IDs)
      case
        when sd.product_id like '%enterprise%' or sd.product_id like '%premium%' then 'Enterprise'
        when sd.product_id like '%pro%' or sd.product_id like '%professional%' then 'Professional'
        when sd.product_id like '%basic%' or sd.product_id like '%starter%' then 'Basic'
        when sd.product_id like '%free%' or sd.product_id like '%trial%' then 'Free'
        else 'Standard'
      end as tier_name,
      -- Check if expiring soon
      case when sd.period_ends_at <= v_expiry_threshold then 1 else 0 end as is_expiring_soon,
      -- Check if over limit (simplified - you may need to adjust based on your tier limits)
      case
        when sd.user_count > 100 or sd.asset_count > 500 then 1
        else 0
      end as is_over_limit
    from subscription_data sd
  )
  select
    tm.tier_name::text as tier,
    count(distinct tm.account_id)::bigint as account_count,
    coalesce(sum(tm.price_amount), 0)::numeric as total_revenue,
    sum(tm.is_expiring_soon)::bigint as expiring_soon_count,
    sum(tm.is_over_limit)::bigint as over_limit_count
  from tier_mapping tm
  group by tm.tier_name
  order by
    case tm.tier_name
      when 'Enterprise' then 1
      when 'Professional' then 2
      when 'Standard' then 3
      when 'Basic' then 4
      when 'Free' then 5
      else 6
    end;
end;
$$;

comment on function public.get_subscription_overview is 'Returns subscription overview grouped by tier for admin dashboard';
grant execute on function public.get_subscription_overview to authenticated;
