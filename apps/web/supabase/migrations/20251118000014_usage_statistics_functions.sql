-- =============================================
-- Usage Statistics Functions Migration
-- =============================================
-- This migration adds database functions for platform usage statistics
-- and most active accounts tracking for the admin dashboard.

-- =============================================
-- FUNCTION: Get Platform Usage Statistics
-- =============================================

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
  v_current_period_end timestamp with time zone;
  v_previous_period_start timestamp with time zone;
  v_previous_period_end timestamp with time zone;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Calculate time periods
  v_current_period_end := now();
  v_current_period_start := now() - (p_days || ' days')::interval;
  v_previous_period_end := v_current_period_start;
  v_previous_period_start := v_previous_period_end - (p_days || ' days')::interval;

  -- Get total number of team accounts
  select count(*) into v_total_accounts
  from public.accounts
  where account_type = 'team';

  -- Return usage statistics for each feature
  return query
  with current_period_stats as (
    -- Asset Management usage
    select
      'Asset Management'::text as feature,
      count(distinct a.id)::bigint as usage_count,
      count(distinct a.account_id)::bigint as active_accounts
    from public.assets a
    where a.created_at between v_current_period_start and v_current_period_end
    
    union all
    
    -- User Management usage
    select
      'User Management'::text as feature,
      count(distinct am.id)::bigint as usage_count,
      count(distinct am.account_id)::bigint as active_accounts
    from public.accounts_memberships am
    where am.created_at between v_current_period_start and v_current_period_end
    
    union all
    
    -- License Tracking usage
    select
      'License Tracking'::text as feature,
      count(distinct sl.id)::bigint as usage_count,
      count(distinct sl.account_id)::bigint as active_accounts
    from public.software_licenses sl
    where sl.created_at between v_current_period_start and v_current_period_end
    
    union all
    
    -- Maintenance Scheduling usage
    select
      'Maintenance Scheduling'::text as feature,
      count(distinct m.id)::bigint as usage_count,
      count(distinct m.account_id)::bigint as active_accounts
    from public.asset_maintenance m
    where m.created_at between v_current_period_start and v_current_period_end
  ),
  previous_period_stats as (
    -- Asset Management usage (previous period)
    select
      'Asset Management'::text as feature,
      count(distinct a.id)::bigint as usage_count
    from public.assets a
    where a.created_at between v_previous_period_start and v_previous_period_end
    
    union all
    
    -- User Management usage (previous period)
    select
      'User Management'::text as feature,
      count(distinct am.id)::bigint as usage_count
    from public.accounts_memberships am
    where am.created_at between v_previous_period_start and v_previous_period_end
    
    union all
    
    -- License Tracking usage (previous period)
    select
      'License Tracking'::text as feature,
      count(distinct sl.id)::bigint as usage_count
    from public.software_licenses sl
    where sl.created_at between v_previous_period_start and v_previous_period_end
    
    union all
    
    -- Maintenance Scheduling usage (previous period)
    select
      'Maintenance Scheduling'::text as feature,
      count(distinct m.id)::bigint as usage_count
    from public.asset_maintenance m
    where m.created_at between v_previous_period_start and v_previous_period_end
  )
  select
    cps.feature::text as feature_name,
    cps.usage_count::bigint as total_usage_count,
    cps.active_accounts::bigint as active_accounts_count,
    case
      when v_total_accounts > 0 then
        round((cps.active_accounts::numeric / v_total_accounts) * 100, 2)
      else 0
    end as adoption_rate,
    case
      when pps.usage_count = 0 and cps.usage_count > 0 then 'up'
      when pps.usage_count > 0 and cps.usage_count = 0 then 'down'
      when pps.usage_count = 0 and cps.usage_count = 0 then 'stable'
      when cps.usage_count > pps.usage_count * 1.1 then 'up'
      when cps.usage_count < pps.usage_count * 0.9 then 'down'
      else 'stable'
    end::text as trend_direction,
    coalesce(pps.usage_count, 0)::bigint as previous_period_usage
  from current_period_stats cps
  left join previous_period_stats pps on pps.feature = cps.feature
  order by cps.usage_count desc;
end;
$$;

comment on function public.get_platform_usage_statistics is 'Returns platform-wide feature usage statistics with trend analysis';
grant execute on function public.get_platform_usage_statistics to authenticated;

-- =============================================
-- FUNCTION: Get Most Active Accounts
-- =============================================

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
  v_period_end timestamp with time zone;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  -- Calculate time period
  v_period_end := now();
  v_period_start := now() - (p_days || ' days')::interval;

  -- Return most active accounts based on feature usage
  return query
  with account_activity as (
    select
      a.id as acc_id,
      a.name as acc_name,
      a.slug as acc_slug,
      -- Count assets created in period
      coalesce(count(distinct case 
        when ast.created_at between v_period_start and v_period_end 
        then ast.id 
      end), 0)::bigint as assets_count,
      -- Count users added in period
      coalesce(count(distinct case 
        when am.created_at between v_period_start and v_period_end 
        then am.user_id 
      end), 0)::bigint as users_count,
      -- Count licenses registered in period
      coalesce(count(distinct case 
        when sl.created_at between v_period_start and v_period_end 
        then sl.id 
      end), 0)::bigint as licenses_count,
      -- Count maintenance scheduled in period
      coalesce(count(distinct case 
        when m.created_at between v_period_start and v_period_end 
        then m.id 
      end), 0)::bigint as maintenance_count
    from public.accounts a
    left join public.assets ast on ast.account_id = a.id
    left join public.accounts_memberships am on am.account_id = a.id
    left join public.software_licenses sl on sl.account_id = a.id
    left join public.asset_maintenance m on m.account_id = a.id
    where a.account_type = 'team'
    group by a.id, a.name, a.slug
  )
  select
    aa.acc_id as account_id,
    aa.acc_name::text as account_name,
    aa.acc_slug::text as account_slug,
    -- Calculate total activity score (weighted sum)
    (
      (aa.assets_count * 3) +      -- Assets weighted 3x
      (aa.users_count * 2) +        -- Users weighted 2x
      (aa.licenses_count * 2) +     -- Licenses weighted 2x
      (aa.maintenance_count * 1)    -- Maintenance weighted 1x
    )::bigint as total_activity_score,
    aa.assets_count as assets_created,
    aa.users_count as users_added,
    aa.licenses_count as licenses_registered,
    aa.maintenance_count as maintenance_scheduled
  from account_activity aa
  where (
    aa.assets_count > 0 or
    aa.users_count > 0 or
    aa.licenses_count > 0 or
    aa.maintenance_count > 0
  )
  order by total_activity_score desc
  limit p_limit;
end;
$$;

comment on function public.get_most_active_accounts is 'Returns most active team accounts based on feature usage';
grant execute on function public.get_most_active_accounts to authenticated;
