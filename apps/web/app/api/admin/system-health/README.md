# System Health API Endpoints

## Overview
These API endpoints provide real-time system health monitoring data for the admin dashboard. Both endpoints are protected and require super administrator authentication.

## Endpoints

### 1. Get Current System Health
**Endpoint:** `GET /api/admin/system-health`

**Description:** Returns the current system health status with all monitored metrics.

**Authentication:** Required (Super Admin only)

**Response:**
```typescript
{
  overall_status: 'healthy' | 'degraded' | 'critical',
  metrics: [
    {
      metric_type: 'database_performance' | 'api_response_time' | 'storage_utilization' | 'active_connections' | 'error_rate',
      current_value: number,
      unit: string,
      status: 'normal' | 'warning' | 'critical',
      warning_threshold: number,
      critical_threshold: number,
      last_updated: string (ISO 8601)
    }
  ],
  last_checked: string (ISO 8601)
}
```

**Example Response:**
```json
{
  "overall_status": "healthy",
  "metrics": [
    {
      "metric_type": "database_performance",
      "current_value": 45,
      "unit": "ms",
      "status": "normal",
      "warning_threshold": 100,
      "critical_threshold": 500,
      "last_updated": "2025-11-18T10:30:00.000Z"
    },
    {
      "metric_type": "api_response_time",
      "current_value": 120,
      "unit": "ms",
      "status": "warning",
      "warning_threshold": 200,
      "critical_threshold": 1000,
      "last_updated": "2025-11-18T10:30:00.000Z"
    }
  ],
  "last_checked": "2025-11-18T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - User is not authenticated
- `403 Forbidden` - User is not a super administrator
- `500 Internal Server Error` - Failed to fetch system health

**Usage:**
```typescript
const response = await fetch('/api/admin/system-health');
const systemHealth = await response.json();
```

---

### 2. Get System Health Trends
**Endpoint:** `GET /api/admin/system-health/trends?metric=<metric_type>`

**Description:** Returns 24-hour historical trend data for a specific system health metric.

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `metric` (required): The metric type to retrieve trends for

**Valid Metric Types:**
- `database_performance`
- `api_response_time`
- `storage_utilization`
- `active_connections`
- `error_rate`

**Response:**
```typescript
{
  metric_type: string,
  data_points: [
    {
      timestamp: string (ISO 8601),
      value: number,
      status: 'normal' | 'warning' | 'critical'
    }
  ],
  time_range: '24h'
}
```

**Example Response:**
```json
{
  "metric_type": "database_performance",
  "data_points": [
    {
      "timestamp": "2025-11-17T10:00:00.000Z",
      "value": 42,
      "status": "normal"
    },
    {
      "timestamp": "2025-11-17T11:00:00.000Z",
      "value": 55,
      "status": "normal"
    },
    {
      "timestamp": "2025-11-17T12:00:00.000Z",
      "value": 110,
      "status": "warning"
    }
  ],
  "time_range": "24h"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid metric parameter
- `401 Unauthorized` - User is not authenticated
- `403 Forbidden` - User is not a super administrator
- `500 Internal Server Error` - Failed to fetch trend data

**Usage:**
```typescript
const response = await fetch('/api/admin/system-health/trends?metric=database_performance');
const trend = await response.json();
```

---

## Monitored Metrics

### Database Performance
- **Description:** Database query response time
- **Unit:** milliseconds (ms)
- **Warning Threshold:** 100ms
- **Critical Threshold:** 500ms
- **Measurement:** Time to execute a simple query

### API Response Time
- **Description:** API endpoint response time
- **Unit:** milliseconds (ms)
- **Warning Threshold:** 200ms
- **Critical Threshold:** 1000ms
- **Measurement:** Time to execute RPC function

### Storage Utilization
- **Description:** Database storage usage percentage
- **Unit:** percentage (%)
- **Warning Threshold:** 75%
- **Critical Threshold:** 90%
- **Measurement:** Estimated based on data volume

### Active Connections
- **Description:** Database connection pool utilization
- **Unit:** percentage (%)
- **Warning Threshold:** 80%
- **Critical Threshold:** 95%
- **Measurement:** Active connections as percentage of max

### Error Rate
- **Description:** Application error rate
- **Unit:** percentage (%)
- **Warning Threshold:** 1%
- **Critical Threshold:** 5%
- **Measurement:** Errors as percentage of total requests

---

## Auto-Refresh Behavior

The system health widget automatically refreshes data every 15 seconds by calling the `/api/admin/system-health` endpoint. This provides near real-time monitoring without requiring manual page refreshes.

**Implementation:**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/admin/system-health');
    if (response.ok) {
      const data = await response.json();
      setCurrentHealth(data);
    }
  }, 15000); // 15 seconds

  return () => clearInterval(interval);
}, []);
```

---

## Alert Creation

When a metric exceeds its critical threshold, the system automatically creates a dashboard alert:

**Alert Properties:**
- **Type:** `system_health`
- **Severity:** `critical`
- **Title:** "Critical: [Metric Name]"
- **Description:** Details about the threshold breach
- **Action URL:** `/admin/dashboard`
- **Action Label:** "View System Health"
- **Expiration:** 1 hour

**Database Function Used:**
```sql
create_dashboard_alert(
  p_account_id,
  p_alert_type: 'system_health',
  p_severity: 'critical',
  p_title,
  p_description,
  p_action_url: '/admin/dashboard',
  p_action_label: 'View System Health',
  p_metadata: { metric details },
  p_expires_at: now() + interval '1 hour'
)
```

---

## Security

### Authentication
Both endpoints require authentication via Supabase Auth. Unauthenticated requests receive a `401 Unauthorized` response.

### Authorization
Both endpoints verify super administrator privileges using the `isSuperAdmin()` function. Non-admin users receive a `403 Forbidden` response.

### Rate Limiting
Consider implementing rate limiting in production to prevent abuse:
- Recommended: 60 requests per minute per user
- Use middleware or API gateway for enforcement

---

## Production Considerations

### Real Metrics Integration
The current implementation uses simulated data for some metrics. For production:

1. **Database Performance:** Query actual `pg_stat_statements` or Supabase metrics API
2. **Storage Utilization:** Query Supabase storage API for actual usage
3. **Active Connections:** Query `pg_stat_activity` for real connection counts
4. **Error Rate:** Integrate with error tracking service (e.g., Sentry)

### Metric Storage
Consider storing historical metrics in a time-series database:
- PostgreSQL with TimescaleDB extension
- InfluxDB for dedicated time-series storage
- Prometheus for metrics collection and storage

### Monitoring Integration
Integrate with existing monitoring infrastructure:
- Export metrics to Prometheus
- Send alerts to PagerDuty or similar
- Create Grafana dashboards for visualization
- Set up automated health checks

---

## Testing

### Manual Testing
```bash
# Test current health endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/admin/system-health

# Test trends endpoint
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/admin/system-health/trends?metric=database_performance"
```

### Integration Testing
```typescript
describe('System Health API', () => {
  it('should return current health status', async () => {
    const response = await fetch('/api/admin/system-health', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.overall_status).toBeDefined();
    expect(data.metrics).toBeInstanceOf(Array);
  });

  it('should return trend data for valid metric', async () => {
    const response = await fetch(
      '/api/admin/system-health/trends?metric=database_performance',
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.metric_type).toBe('database_performance');
    expect(data.data_points).toBeInstanceOf(Array);
  });

  it('should reject non-admin users', async () => {
    const response = await fetch('/api/admin/system-health', {
      headers: { Authorization: `Bearer ${regularUserToken}` }
    });
    expect(response.status).toBe(403);
  });
});
```

---

## Related Files

- **Service:** `apps/web/app/admin/dashboard/_lib/server/system-health.service.ts`
- **Widget:** `apps/web/app/admin/dashboard/_components/system-health-widget.tsx`
- **Types:** `apps/web/app/admin/dashboard/_lib/types/admin-dashboard.types.ts`
- **Schemas:** `apps/web/app/admin/dashboard/_lib/schemas/admin-dashboard.schema.ts`
- **Loader:** `apps/web/app/admin/dashboard/_lib/server/admin-dashboard.loader.ts`

