-- Verify cron jobs are set up
SELECT jobid, jobname, schedule, command, active 
FROM cron.job 
WHERE jobname LIKE '%metrics%';

-- Verify functions exist
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%platform_metrics%';

-- View recent execution logs
SELECT * FROM metrics_refresh_log 
ORDER BY started_at DESC 
LIMIT 10;

-- View statistics for last 24 hours
SELECT * FROM get_metrics_refresh_stats(24);

-- Check materialized view data
SELECT * FROM platform_metrics;
