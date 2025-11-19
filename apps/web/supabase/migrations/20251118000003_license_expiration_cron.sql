-- License Expiration Check Background Job Migration
-- This migration sets up automated license expiration checking using pg_cron
-- It includes:
-- - Logging table for execution tracking
-- - Enhanced function with logging wrapper
-- - Scheduled cron job for daily execution
-- - Statistics function for monitoring
-- - Cleanup job for log maintenance

-- ============================================================================
-- LOGGING TABLE
-- ============================================================================

-- Table to track license expiration check executions
create table if not exists public.license_expiration_check_logs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone not null,
  duration_ms numeric(10, 2) not null,
  alerts_created integer not null default 0,
  status varchar(20) not null check (status in ('success', 'error')),
  error_message text,
  created_at timestamp with time zone default now()
);

-- Index for querying logs
create index if not exists idx_license_expiration_check_logs_started_at 
  on public.license_expiration_check_logs(started_at desc);
create index if not exists idx_license_expiration_check_logs_status 
  on public.license_expiration_check_logs(status);

-- Comment
comment on table public.license_expiration_check_logs is 
  'Execution logs for license expiration check background job';

-- ============================================================================
-- ENHANCED FUNCTION WITH LOGGING
-- ============================================================================

-- Wrapper function that adds logging to check_license_expirations()
create or replace function public.check_license_expirations_with_logging()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_time timestamp with time zone;
  v_end_time timestamp with time zone;
  v_duration_ms numeric(10, 2);
  v_alerts_before bigint;
  v_alerts_after bigint;
  v_alerts_created integer;
  v_error_message text;
begin
  -- Record start time
  v_start_time := clock_timestamp();
  
  -- Count alerts before execution
  select count(*) into v_alerts_before from public.license_renewal_alerts;
  
  begin
    -- Call the main expiration check function
    perform public.check_license_expirations();
    
    -- Count alerts after execution
    select count(*) into v_alerts_after from public.license_renewal_alerts;
    v_alerts_created := (v_alerts_after - v_alerts_before)::integer;
    
    -- Record end time and calculate duration
    v_end_time := clock_timestamp();
    v_duration_ms := extract(epoch from (v_end_time - v_start_time)) * 1000;
    
    -- Log successful execution
    insert into public.license_expiration_check_logs (
      started_at,
      completed_at,
      duration_ms,
      alerts_created,
      status
    ) values (
      v_start_time,
      v_end_time,
      v_duration_ms,
      v_alerts_created,
      'success'
    );
    
  exception when others then
    -- Capture error details
    v_error_message := SQLERRM;
    v_end_time := clock_timestamp();
    v_duration_ms := extract(epoch from (v_end_time - v_start_time)) * 1000;
    
    -- Log failed execution
    insert into public.license_expiration_check_logs (
      started_at,
      completed_at,
      duration_ms,
      alerts_created,
      status,
      error_message
    ) values (
      v_start_time,
      v_end_time,
      v_duration_ms,
      0,
      'error',
      v_error_message
    );
    
    -- Re-raise the exception
    raise;
  end;
end;
$$;

comment on function public.check_license_expirations_with_logging() is 
  'Wrapper function that logs execution of license expiration checks';

-- ============================================================================
-- STATISTICS FUNCTION
-- ============================================================================

-- Function to get license expiration check statistics
create or replace function public.get_license_expiration_check_stats()
returns table(
  total_checks bigint,
  successful_checks bigint,
  failed_checks bigint,
  total_alerts_created bigint,
  average_duration_ms numeric,
  last_check_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    count(*)::bigint as total_checks,
    count(*) filter (where status = 'success')::bigint as successful_checks,
    count(*) filter (where status = 'error')::bigint as failed_checks,
    coalesce(sum(alerts_created), 0)::bigint as total_alerts_created,
    coalesce(avg(duration_ms), 0)::numeric as average_duration_ms,
    max(started_at) as last_check_at
  from public.license_expiration_check_logs;
end;
$$;

comment on function public.get_license_expiration_check_stats() is 
  'Returns statistics about license expiration check executions';

-- ============================================================================
-- SCHEDULED JOBS (pg_cron)
-- ============================================================================

-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Unschedule existing job if it exists (for idempotent migrations)
select cron.unschedule('check-license-expirations') 
where exists (
  select 1 from cron.job where jobname = 'check-license-expirations'
);

-- Schedule daily license expiration check at 9:00 AM UTC
select cron.schedule(
  'check-license-expirations',
  '0 9 * * *',
  'select public.check_license_expirations_with_logging();'
);

-- Unschedule existing cleanup job if it exists
select cron.unschedule('cleanup-license-expiration-logs')
where exists (
  select 1 from cron.job where jobname = 'cleanup-license-expiration-logs'
);

-- Schedule weekly cleanup of old logs (runs Sunday at 3:00 AM UTC)
select cron.schedule(
  'cleanup-license-expiration-logs',
  '0 3 * * 0',
  $$
    delete from public.license_expiration_check_logs
    where started_at < now() - interval '90 days';
  $$
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on extension pg_cron is 'PostgreSQL job scheduler for running periodic tasks';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify scheduled jobs are created
-- Run: SELECT jobid, jobname, schedule, command, active FROM cron.job;

-- Verify function exists
-- Run: SELECT proname FROM pg_proc WHERE proname = 'check_license_expirations_with_logging';

-- Test manual execution
-- Run: SELECT public.check_license_expirations_with_logging();

-- View execution logs
-- Run: SELECT * FROM license_expiration_check_logs ORDER BY started_at DESC LIMIT 10;

-- View statistics
-- Run: SELECT * FROM get_license_expiration_check_stats();
