-- ============================================================================
-- Platform Metrics Refresh Verification Script
-- ============================================================================
-- This script verifies that the platform metrics refresh cron job is properly
-- configured and functioning.

\echo '================================================'
\echo 'Platform Metrics Refresh Verification'
\echo '================================================'
\echo ''

-- 1. Verify pg_cron extension is enabled
\echo '1. Checking pg_cron extension...'
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ pg_cron extension is enabled'
    ELSE '❌ pg_cron extension is NOT enabled'
  END as status
FROM pg_extension 
WHERE extname = 'pg_cron';

\echo ''

-- 2. Verify cron jobs are scheduled
\echo '2. Checking scheduled cron jobs...'
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  CASE 
    WHEN active THEN '✅ Active'
    ELSE '❌ Inactive'
  END as status
FROM cron.job 
WHERE jobname LIKE '%metrics%'
ORDER BY jobname;

\echo ''

-- 3. Verify functions exist
\echo '3. Checking platform metrics functions...'
SELECT 
  proname as function_name,
  '✅ Exists' as status
FROM pg_proc 
WHERE proname LIKE '%platform_metrics%'
ORDER BY proname;

\echo ''

-- 4. Verify logging table exists and is accessible
\echo '4. Checking metrics_refresh_log table...'
SELECT 
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Table exists and is accessible'
    ELSE '❌ Table not accessible'
  END as status,
  COUNT(*) as total_logs
FROM metrics_refresh_log;

\echo ''

-- 5. View recent refresh logs
\echo '5. Recent refresh logs (last 10)...'
SELECT 
  started_at,
  CASE 
    WHEN status = 'success' THEN '✅ Success'
    ELSE '❌ Error'
  END as status,
  ROUND(duration_ms::numeric / 1000, 2) as duration_seconds,
  COALESCE(error_message, 'No error') as error_message
FROM metrics_refresh_log
ORDER BY started_at DESC
LIMIT 10;

\echo ''

-- 6. View refresh statistics (last 24 hours)
\echo '6. Refresh statistics (last 24 hours)...'
SELECT 
  total_refreshes,
  successful_refreshes,
  failed_refreshes,
  success_rate || '%' as success_rate,
  ROUND(avg_duration_ms::numeric / 1000, 2) || 's' as avg_duration,
  ROUND(max_duration_ms::numeric / 1000, 2) || 's' as max_duration,
  ROUND(min_duration_ms::numeric / 1000, 2) || 's' as min_duration,
  last_refresh_at,
  COALESCE(last_error, 'No errors') as last_error
FROM (
  SELECT
    COUNT(*)::bigint as total_refreshes,
    COUNT(*) FILTER (WHERE status = 'success')::bigint as successful_refreshes,
    COUNT(*) FILTER (WHERE status = 'error')::bigint as failed_refreshes,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*)) * 100, 2)
      ELSE 0
    END as success_rate,
    COALESCE(ROUND(AVG(duration_ms), 2), 0) as avg_duration_ms,
    COALESCE(MAX(duration_ms), 0) as max_duration_ms,
    COALESCE(MIN(duration_ms), 0) as min_duration_ms,
    MAX(started_at) as last_refresh_at,
    (
      SELECT error_message 
      FROM metrics_refresh_log 
      WHERE status = 'error' 
        AND started_at >= NOW() - INTERVAL '24 hours'
      ORDER BY started_at DESC 
      LIMIT 1
    ) as last_error
  FROM metrics_refresh_log
  WHERE started_at >= NOW() - INTERVAL '24 hours'
) stats;

\echo ''

-- 7. Check materialized view data
\echo '7. Platform metrics materialized view data...'
SELECT 
  total_accounts,
  total_users,
  total_assets,
  total_licenses,
  new_accounts_30d,
  new_users_30d,
  new_assets_30d,
  last_updated
FROM platform_metrics;

\echo ''
\echo '================================================'
\echo 'Verification Complete'
\echo '================================================'
\echo ''
\echo 'Next Steps:'
\echo '1. Verify all cron jobs are active'
\echo '2. Check that refresh logs show successful executions'
\echo '3. Monitor success rate (should be > 95%)'
\echo '4. Ensure average duration is reasonable (< 1s typically)'
\echo ''
\echo 'Manual Commands:'
\echo '- Trigger refresh: SELECT public.refresh_platform_metrics_with_logging();'
\echo '- View stats: SELECT * FROM get_metrics_refresh_stats(24);'
\echo '- View logs: SELECT * FROM metrics_refresh_log ORDER BY started_at DESC LIMIT 10;'
\echo ''
