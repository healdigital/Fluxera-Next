-- =============================================
-- Platform Metrics Refresh Scheduled Job
-- =============================================
-- This migration creates a scheduled job using pg_cron to refresh
-- the platform_metrics materialized view every 5 minutes.

-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Create a function to refresh platform metrics with error handling and logging
create or replace function public.refresh_platform_metrics_with_logging()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_time timestamp with time zone;
  v_end_time timestamp with time zone;
  v_duration interval;
  v_error_message text;
begin
  -- Record start time
  v_start_time := clock_timestamp();
  
  begin
    -- Refresh the materialized view
    refresh materialized view concurrently public.platform_metrics;
    
    -- Record end time and calculate duration
    v_end_time := clock_timestamp();
    v_duration := v_end_time - v_start_time;
    
    -- Log successful refresh
    raise notice 'Platform metrics refresh completed successfully in %', v_duration;
    
    -- Insert success log into metrics_refresh_log table
    insert into public.metrics_refresh_log (
      refresh_type,
      status,
      duration_ms,
      started_at,
      completed_at
    ) values (
      'platform_metrics',
      'success',
      extract(epoch from v_duration) * 1000,
      v_start_time,
      v_end_time
    );
    
  exception when others then
    -- Capture error details
    get stacked diagnostics v_error_message = message_text;
    
    -- Record end time
    v_end_time := clock_timestamp();
    v_duration := v_end_time - v_start_time;
    
    -- Log error
    raise warning 'Platform metrics refresh failed: %', v_error_message;
    
    -- Insert error log into metrics_refresh_log table
    insert into public.metrics_refresh_log (
      refresh_type,
      status,
      duration_ms,
      error_message,
      started_at,
      completed_at
    ) values (
      'platform_metrics',
      'error',
      extract(epoch from v_duration) * 1000,
      v_error_message,
      v_start_time,
      v_end_time
    );
    
    -- Re-raise the exception
    raise;
  end;
end;
$$;

comment on function public.refresh_platform_metrics_with_logging is 'Refreshes platform_metrics materialized view with error handling and performance logging';

-- Create a table to log refresh operations
create table if not exists public.metrics_refresh_log (
  id uuid primary key default gen_random_uuid(),
  refresh_type varchar(100) not null,
  status varchar(20) not null check (status in ('success', 'error')),
  duration_ms numeric not null,
  error_message text,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

comment on table public.metrics_refresh_log is 'Log of platform metrics refresh operations for monitoring and debugging';
comment on column public.metrics_refresh_log.refresh_type is 'Type of metrics being refreshed (e.g., platform_metrics)';
comment on column public.metrics_refresh_log.status is 'Status of the refresh operation: success or error';
comment on column public.metrics_refresh_log.duration_ms is 'Duration of the refresh operation in milliseconds';
comment on column public.metrics_refresh_log.error_message is 'Error message if the refresh failed';

-- Create indexes for the log table
create index if not exists idx_metrics_refresh_log_type on public.metrics_refresh_log(refresh_type);
create index if not exists idx_metrics_refresh_log_status on public.metrics_refresh_log(status);
create index if not exists idx_metrics_refresh_log_created_at on public.metrics_refresh_log(created_at desc);

-- Enable RLS on the log table
alter table public.metrics_refresh_log enable row level security;

-- Policy: Allow authenticated users to view refresh logs
-- TODO: Restrict to super admins once is_super_admin function is available
create policy "Authenticated users can view refresh logs"
  on public.metrics_refresh_log for select
  to authenticated
  using (true);

-- Schedule the refresh job to run every 5 minutes
-- Note: pg_cron uses cron syntax: minute hour day month weekday
select cron.schedule(
  'refresh-platform-metrics',           -- job name
  '*/5 * * * *',                        -- every 5 minutes
  $$ select public.refresh_platform_metrics_with_logging(); $$
);

-- Grant necessary permissions
grant execute on function public.refresh_platform_metrics_with_logging to postgres;

-- Create a function to get refresh log statistics (for monitoring)
create or replace function public.get_metrics_refresh_stats(
  p_hours int default 24
)
returns table (
  total_refreshes bigint,
  successful_refreshes bigint,
  failed_refreshes bigint,
  success_rate numeric,
  avg_duration_ms numeric,
  max_duration_ms numeric,
  min_duration_ms numeric,
  last_refresh_at timestamp with time zone,
  last_error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_time_threshold timestamp with time zone;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  v_time_threshold := now() - (p_hours || ' hours')::interval;

  return query
  select
    count(*)::bigint as total_refreshes,
    count(*) filter (where status = 'success')::bigint as successful_refreshes,
    count(*) filter (where status = 'error')::bigint as failed_refreshes,
    case 
      when count(*) > 0 then 
        round((count(*) filter (where status = 'success')::numeric / count(*)) * 100, 2)
      else 0
    end as success_rate,
    round(avg(duration_ms), 2) as avg_duration_ms,
    max(duration_ms) as max_duration_ms,
    min(duration_ms) as min_duration_ms,
    max(completed_at) as last_refresh_at,
    (
      select error_message 
      from public.metrics_refresh_log 
      where status = 'error' 
        and created_at >= v_time_threshold
      order by created_at desc 
      limit 1
    ) as last_error
  from public.metrics_refresh_log
  where created_at >= v_time_threshold;
end;
$$;

comment on function public.get_metrics_refresh_stats is 'Returns statistics about platform metrics refresh operations for monitoring';
grant execute on function public.get_metrics_refresh_stats to authenticated;

-- Create a function to manually trigger a refresh (for testing or emergency use)
create or replace function public.trigger_platform_metrics_refresh()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_start_time timestamp with time zone;
  v_end_time timestamp with time zone;
  v_duration interval;
begin
  -- Verify caller is super admin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Access denied: Super admin privileges required';
  end if;

  v_start_time := clock_timestamp();
  
  -- Trigger the refresh
  perform public.refresh_platform_metrics_with_logging();
  
  v_end_time := clock_timestamp();
  v_duration := v_end_time - v_start_time;

  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'duration_ms', extract(epoch from v_duration) * 1000,
    'started_at', v_start_time,
    'completed_at', v_end_time,
    'message', 'Platform metrics refreshed successfully'
  );

  return v_result;
end;
$$;

comment on function public.trigger_platform_metrics_refresh is 'Manually triggers a platform metrics refresh (admin only)';
grant execute on function public.trigger_platform_metrics_refresh to authenticated;

-- Create a cleanup function to remove old logs (keep last 30 days)
create or replace function public.cleanup_old_metrics_logs()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_count int;
begin
  -- Delete logs older than 30 days
  delete from public.metrics_refresh_log
  where created_at < now() - interval '30 days';
  
  get diagnostics v_deleted_count = row_count;
  
  raise notice 'Cleaned up % old metrics refresh log entries', v_deleted_count;
end;
$$;

comment on function public.cleanup_old_metrics_logs is 'Removes metrics refresh logs older than 30 days';

-- Schedule cleanup job to run daily at 2 AM
select cron.schedule(
  'cleanup-metrics-logs',
  '0 2 * * *',                          -- daily at 2 AM
  $$ select public.cleanup_old_metrics_logs(); $$
);

grant execute on function public.cleanup_old_metrics_logs to postgres;
