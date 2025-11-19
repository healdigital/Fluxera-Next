# Task 20 Visual Reference: Platform Metrics Refresh System

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Platform Metrics Refresh System              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   pg_cron        │         │  Admin Dashboard │
│   Extension      │         │   Components     │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ Every 5 minutes            │ Manual Trigger
         │                            │ View Stats/Logs
         ▼                            ▼
┌─────────────────────────────────────────────────┐
│  refresh_platform_metrics_with_logging()        │
│  - Wraps base refresh function                  │
│  - Adds logging and error handling              │
│  - Records timing metrics                       │
└────────┬────────────────────────────────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Materialized │ │ Logging      │ │ Error        │
│ View Refresh │ │ Success      │ │ Handling     │
└──────────────┘ └──────────────┘ └──────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────┐
│         metrics_refresh_log Table               │
│  - Execution history                            │
│  - Performance metrics                          │
│  - Error messages                               │
└─────────────────────────────────────────────────┘
```

## Data Flow

```
1. Scheduled Execution (Every 5 Minutes)
   ┌─────────────┐
   │  pg_cron    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────────────────┐
   │ refresh_platform_metrics_with_      │
   │ logging()                           │
   └──────┬──────────────────────────────┘
          │
          ├─── Start Time Recorded
          │
          ▼
   ┌─────────────────────────────────────┐
   │ REFRESH MATERIALIZED VIEW           │
   │ CONCURRENTLY platform_metrics       │
   └──────┬──────────────────────────────┘
          │
          ├─── Success ──┐
          │              │
          └─── Error ────┤
                         │
                         ▼
   ┌─────────────────────────────────────┐
   │ INSERT INTO metrics_refresh_log     │
   │ - status (success/error)            │
   │ - duration_ms                       │
   │ - error_message (if any)            │
   └─────────────────────────────────────┘

2. Manual Trigger (Admin Action)
   ┌─────────────┐
   │ Admin User  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────────────────┐
   │ trigger_platform_metrics_refresh()  │
   │ (Requires super admin)              │
   └──────┬──────────────────────────────┘
          │
          ▼
   [Same flow as scheduled execution]
          │
          ▼
   ┌─────────────────────────────────────┐
   │ Return JSONB Response               │
   │ - success: true/false               │
   │ - duration_ms                       │
   │ - message                           │
   └─────────────────────────────────────┘
```

## Admin Dashboard Integration

```
┌────────────────────────────────────────────────────────┐
│              Admin Dashboard Page                      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Metrics Refresh Monitor Component               │ │
│  │                                                  │ │
│  │  Status: ● Healthy                              │ │
│  │  Last Refresh: 2 minutes ago                    │ │
│  │  Success Rate: 100% (288/288)                   │ │
│  │  Avg Duration: 0.45s                            │ │
│  │                                                  │ │
│  │  [Refresh Now] [View Logs]                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Platform Metrics Overview                       │ │
│  │  (Data from platform_metrics view)               │ │
│  │                                                  │ │
│  │  Total Accounts: 150                            │ │
│  │  Total Users: 1,234                             │ │
│  │  Total Assets: 5,678                            │ │
│  │  Last Updated: 2 minutes ago                    │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Monitoring Dashboard

```
┌────────────────────────────────────────────────────────┐
│         Metrics Refresh Performance (24h)              │
│                                                        │
│  Success Rate: ████████████████████████ 100%          │
│                                                        │
│  Execution Duration:                                   │
│  ┌────────────────────────────────────────────────┐   │
│  │ 1.0s ┤                                         │   │
│  │ 0.8s ┤                                         │   │
│  │ 0.6s ┤     ▄▄                                  │   │
│  │ 0.4s ┤  ▄▄▀  ▀▄▄                               │   │
│  │ 0.2s ┤▄▀        ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ │   │
│  │ 0.0s └────────────────────────────────────────┘   │
│  │      0h    6h    12h   18h   24h                   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Statistics:                                           │
│  - Total Refreshes: 288                                │
│  - Successful: 288                                     │
│  - Failed: 0                                           │
│  - Avg Duration: 0.45s                                 │
│  - Max Duration: 0.89s                                 │
│  - Min Duration: 0.21s                                 │
└────────────────────────────────────────────────────────┘
```

## Conclusion

Task 20 has been successfully implemented with:
- Automated refresh every 5 minutes using pg_cron
- Comprehensive logging and error handling
- Performance monitoring capabilities
- Manual trigger functionality
- Integration with admin dashboard
- Verification script for testing

The system is production-ready and fully operational.
