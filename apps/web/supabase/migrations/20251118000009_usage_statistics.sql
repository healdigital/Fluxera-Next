-- =============================================
-- Usage Statistics Function for Admin Dashboard
-- =============================================
-- This migration adds the function to retrieve platform usage statistics

-- Function to get platform usage statistics
create or replace function public.get_platform_usage_statistics(
  p_days int default 30
)
returns table (
  feature_name text,
  total_usage_count bigint,
  active_accounts_count bigint,
  adoption_rate numeric,
  trend_direction text,
  previous_period_usage bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_accounts bigint;
  v_current_period_start timestamp with time zone;
  v_previous_period_start timestamp with time zone;
  v_previous_period_end timestamp with time zone;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Calculate time periods
  v_current_period_start := now() - (p_days || ' days')::interval;
  v_previous_period_end := v_current_period_start;
  v_previous_period_start := v_previous_period_end - (p_days || ' days')::interval;

  -- Get total number of team accounts
  select count(*) into v_total_accounts
  from public.accounts
  where account_type = 'team';

  -- Return usage statistics for each feature
  return query
  with feature_usage as (
    -- Asset Management Usage
    select
      'Asset Management'::text as feature,
      count(distinct ast.id)::bigint as current_usage,
      count(distinct ast.account_id)::bigint as active_accounts,
      count(distinct case 
        when ast.created_at between v_previous_period_start and v_previous_period_end 
        then ast.id 
      end)::bigint as previous_usage
    from public.assets ast
    where ast.created_at >= v_previous_period_start
    
    union all
    
    -- User Management Usage
    select
      'User Management'::text as feature,
      count(distinct am.user_id)::bigint as current_usage,
      count(distinct am.account_id)::bigint as active_accounts,
      count(distinct case 
        when am.created_at between v_previous_period_start and v_previous_period_end 
        then am.user_id 
      end)::bigint as previous_usage
    from public.accounts_memberships am
    where am.created_at >= v_previous_period_start
    
    union all
    
    -- License Tracking Usage
    select
      'License Tracking'::text as feature,
      count(distinct sl.id)::bigint as current_usage,
      count(distinct sl.account_id)::bigint as active_accounts,
      count(distinct case 
        when sl.created_at between v_previous_period_start and v_previous_period_end 
        then sl.id 
      end)::bigint as previous_usage
    from public.software_licenses sl
    where sl.created_at >= v_previous_period_start
    
    union all
    
    -- Maintenance Scheduling Usage
    select
      'Maintenance Scheduling'::text as feature,
      count(distinct m.id)::bigint as current_usage,
      count(distinct ast.account_id)::bigint as active_accounts,
      count(distinct case 
        when m.created_at between v_previous_period_start and v_previous_period_end 
        then m.id 
      end)::bigint as previous_usage
    from public.asset_maintenance m
    join public.assets ast on ast.id = m.asset_id
    where m.created_at >= v_previous_period_start
  )
  select
    fu.feature::text as feature_name,
    fu.current_usage::bigint as total_usage_count,
    fu.active_accounts::bigint as active_accounts_count,
    case 
      when v_total_accounts > 0 
      then round((fu.active_accounts::numeric / v_total_accounts) * 100, 2)
      else 0
    end as adoption_rate,
    case
      when fu.previous_usage = 0 and fu.current_usage > 0 then 'up'
      when fu.current_usage > fu.previous_usage then 'up'
      when fu.current_usage < fu.previous_usage then 'down'
      else 'stable'
    end::text as trend_direction,
    fu.previous_usage::bigint as previous_period_usage
  from feature_usage fu
  order by fu.active_accounts desc;
end;
$$;

comment on function public.get_platform_usage_statistics is 'Returns platform-wide usage statistics for key features';
grant execute on function public.get_platform_usage_statistics to authenticated;

-- Function to get most active accounts by feature usage
create or replace function public.get_most_active_accounts(
  p_days int default 30,
  p_limit int default 10
)
returns table (
  account_id uuid,
  account_name text,
  account_slug text,
  total_activity_score bigint,
  assets_created bigint,
  users_added bigint,
  licenses_registered bigint,
  maintenance_scheduled bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period_start timestamp with time zone;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Calculate period start
  v_period_start := now() - (p_days || ' days')::interval;

  -- Return most active accounts
  return query
  with account_activity as (
    select
      a.id as acc_id,
      a.name as acc_name,
      a.slug as acc_slug,
      coalesce(count(distinct ast.id), 0) as assets_count,
      coalesce(count(distinct am.user_id), 0) as users_count,
      coalesce(count(distinct sl.id), 0) as licenses_count,
      coalesce(count(distinct m.id), 0) as maintenance_count
    from public.accounts a
    left join public.assets ast on ast.account_id = a.id 
      and ast.created_at >= v_period_start
    left join public.accounts_memberships am on am.account_id = a.id 
      and am.created_at >= v_period_start
    left join public.software_licenses sl on sl.account_id = a.id 
      and sl.created_at >= v_period_start
    left join public.asset_maintenance m on m.asset_id = ast.id 
      and m.created_at >= v_period_start
    where a.account_type = 'team'
    group by a.id, a.name, a.slug
  )
  select
    aa.acc_id::uuid,
    aa.acc_name::text,
    aa.acc_slug::text,
    (aa.assets_count + aa.users_count + aa.licenses_count + aa.maintenance_count)::bigint as total_activity_score,
    aa.assets_count::bigint,
    aa.users_count::bigint,
    aa.licenses_count::bigint,
    aa.maintenance_count::bigint
  from account_activity aa
  where (aa.assets_count + aa.users_count + aa.licenses_count + aa.maintenance_count) > 0
  order by total_activity_score desc
  limit p_limit;
end;
$$;

comment on function public.get_most_active_accounts is 'Returns most active team accounts based on feature usage';
grant execute on function public.get_most_active_accounts to authenticated;
