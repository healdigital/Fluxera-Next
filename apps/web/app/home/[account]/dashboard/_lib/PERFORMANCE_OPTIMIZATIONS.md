# Dashboard Performance Optimizations

This document describes the performance optimizations implemented for the Dashboards & Analytics system.

## Overview

The dashboard system implements multiple layers of performance optimization to ensure fast load times, smooth interactions, and efficient resource usage. These optimizations target:

1. **Initial Page Load** - Reduce time to first meaningful paint
2. **Data Fetching** - Minimize database queries and network requests
3. **Client-Side Performance** - Optimize rendering and interactions
4. **Database Performance** - Efficient queries with proper indexing

## Implemented Optimizations

### 1. Server-Side Caching with Next.js `unstable_cache`

**Location**: `dashboard-page.loader.ts`

**Implementation**:
```typescript
const getCachedMetrics = unstable_cache(
  async (slug: string) => {
    // Fetch metrics from database
  },
  [`dashboard-metrics-${accountSlug}`],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: [`dashboard-metrics-${accountSlug}`],
  },
);
```

**Benefits**:
- Reduces database load by caching frequently accessed data
- Provides consistent response times
- Automatic cache invalidation via tags
- Server-side caching reduces client-side processing

**Cache TTL Strategy**:
- **Metrics**: 30 seconds (frequently changing data)
- **Widgets**: 60 seconds (configuration changes less frequently)
- **Alerts**: 15 seconds (time-sensitive notifications)

### 2. Lazy Loading with Intersection Observer

**Location**: `lazy-widget-loader.tsx`

**Implementation**:
```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasLoaded) {
        setIsVisible(true);
        setHasLoaded(true);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '50px', // Start loading before widget enters viewport
  },
);
```

**Benefits**:
- Defers loading of widgets outside initial viewport
- Reduces initial JavaScript bundle size
- Improves Time to Interactive (TTI)
- Smooth user experience with preloading

**Widget Loading Strategy**:
- First 3 widgets: Load immediately
- Remaining widgets: Lazy load when near viewport

### 3. Asynchronous Widget Data Loading

**Location**: `dashboard-grid.tsx`

**Implementation**:
```typescript
<Suspense fallback={<DashboardWidgetSkeleton />}>
  <WidgetRenderer
    widgetType={widgetType}
    metrics={metrics}
    alerts={optimisticAlerts}
    accountSlug={accountSlug}
    onDismissAlert={handleDismissAlert}
  />
</Suspense>
```

**Benefits**:
- Dashboard structure renders before all data is available
- Non-blocking widget loading
- Progressive enhancement
- Better perceived performance

### 4. Database Query Optimization

**Location**: `20251118000000_dashboards_analytics.sql`

**Indexes Created**:
```sql
-- Dashboard Widgets
create index idx_dashboard_widgets_account_id on public.dashboard_widgets(account_id);
create index idx_dashboard_widgets_user_id on public.dashboard_widgets(user_id);
create index idx_dashboard_widgets_position on public.dashboard_widgets(position_order);

-- Dashboard Alerts
create index idx_dashboard_alerts_account_id on public.dashboard_alerts(account_id);
create index idx_dashboard_alerts_severity on public.dashboard_alerts(severity);
create index idx_dashboard_alerts_dismissed on public.dashboard_alerts(is_dismissed);
create index idx_dashboard_alerts_created_at on public.dashboard_alerts(created_at desc);
create index idx_dashboard_alerts_expires_at on public.dashboard_alerts(expires_at) where expires_at is not null;
```

**Benefits**:
- Faster query execution for filtered data
- Reduced database CPU usage
- Efficient sorting and filtering
- Optimized RLS policy checks

**Query Optimization Techniques**:
- Use of database functions for complex aggregations
- Materialized views for expensive platform-wide metrics
- Proper use of LEFT JOINs to avoid missing data
- COALESCE for handling NULL values

### 5. Loading Skeletons for Each Widget Type

**Location**: `dashboard-widget-skeleton.tsx`

**Implementations**:
- `DashboardWidgetSkeleton` - Generic widget skeleton
- `MetricsSummaryWidgetSkeleton` - Metrics-specific skeleton
- `ChartWidgetSkeleton` - Chart-specific skeleton
- `ListWidgetSkeleton` - List-specific skeleton
- `DashboardGridSkeleton` - Full grid skeleton

**Benefits**:
- Immediate visual feedback
- Reduces perceived loading time
- Maintains layout stability (no CLS)
- Better user experience

### 6. Real-Time Updates with Optimized Subscriptions

**Location**: `dashboard-grid.tsx`

**Implementation**:
```typescript
// Subscribe to specific tables with account filter
const assetsChannel = supabase
  .channel('dashboard_assets_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'assets',
    filter: `account_id=eq.${accountId}`,
  }, () => {
    refreshMetrics();
  })
  .subscribe();
```

**Benefits**:
- Only subscribes to relevant data changes
- Filtered subscriptions reduce network traffic
- Automatic metric refresh on data changes
- 30-second fallback refresh for reliability

### 7. Optimistic Updates

**Location**: `dashboard-grid.tsx`

**Implementation**:
```typescript
const [optimisticAlerts, setOptimisticAlerts] = useOptimistic(
  alerts,
  (currentAlerts, alertIdToRemove: string) => {
    return currentAlerts.filter((alert) => alert.id !== alertIdToRemove);
  },
);
```

**Benefits**:
- Instant UI feedback
- Better perceived performance
- Graceful error handling
- Improved user experience

### 8. Performance Monitoring

**Location**: `performance-monitor.ts`

**Features**:
- Operation timing
- Performance statistics (avg, min, max, p95)
- Slow operation detection
- Performance summary logging

**Usage**:
```typescript
const endTimer = performanceMonitor.startTimer('loadMetrics');
// ... perform operation
endTimer({ success: true });
```

## Performance Metrics

### Target Metrics

Based on requirements 12.1-12.5:

| Metric | Target | Implementation |
|--------|--------|----------------|
| Initial Dashboard Load | < 1.5s | Server-side caching, lazy loading |
| Widget Data Load | Asynchronous | Suspense boundaries, parallel loading |
| Automatic Updates | Background | Real-time subscriptions, no UI blocking |
| Cache Duration | 30s | unstable_cache with revalidation |
| Lazy Loading | > 10 widgets | Intersection Observer |

### Monitoring

Use the performance monitor to track actual metrics:

```typescript
// In development
performanceMonitor.logSummary();

// Get specific operation stats
const stats = performanceMonitor.getStats('loadMetrics');
console.log('Average load time:', stats.avgDuration);
```

## Cache Invalidation Strategy

### Automatic Invalidation

Cache tags are automatically revalidated when:

1. **Alert Dismissal**: `dashboard-alerts-${accountSlug}`
2. **Widget Configuration**: `dashboard-widgets-${accountSlug}-${userId}`
3. **Metric Refresh**: `dashboard-metrics-${accountSlug}`

### Manual Invalidation

Use `revalidateTag()` in server actions:

```typescript
revalidateTag(`dashboard-metrics-${accountSlug}`);
```

### Path Revalidation

Use `revalidatePath()` for full page refresh:

```typescript
revalidatePath(`/home/${accountSlug}/dashboard`);
```

## Best Practices

### 1. Data Fetching

- ✅ Use server-side caching for frequently accessed data
- ✅ Implement appropriate TTL based on data volatility
- ✅ Use database functions for complex aggregations
- ✅ Leverage materialized views for expensive queries
- ❌ Don't fetch data on every render
- ❌ Don't use client-side caching for sensitive data

### 2. Component Rendering

- ✅ Use Suspense boundaries for async components
- ✅ Implement loading skeletons for better UX
- ✅ Lazy load components outside initial viewport
- ✅ Use optimistic updates for instant feedback
- ❌ Don't block rendering waiting for all data
- ❌ Don't render large lists without virtualization

### 3. Real-Time Updates

- ✅ Filter subscriptions to relevant data only
- ✅ Implement fallback polling for reliability
- ✅ Debounce rapid updates
- ✅ Show visual indicators for live updates
- ❌ Don't subscribe to entire tables
- ❌ Don't update UI on every change

### 4. Database Queries

- ✅ Use indexes for filtered columns
- ✅ Use partial indexes for conditional queries
- ✅ Leverage RLS policies for security
- ✅ Use EXPLAIN ANALYZE to verify query plans
- ❌ Don't use SELECT * in production
- ❌ Don't perform N+1 queries

## Troubleshooting

### Slow Dashboard Load

1. Check server-side cache hit rate
2. Verify database query performance with EXPLAIN ANALYZE
3. Check network waterfall in browser DevTools
4. Review widget loading order

### High Database Load

1. Verify cache TTL is appropriate
2. Check for N+1 query patterns
3. Review materialized view refresh frequency
4. Optimize database functions

### Slow Widget Rendering

1. Use React DevTools Profiler
2. Check for unnecessary re-renders
3. Verify lazy loading is working
4. Review component complexity

## Future Optimizations

### Potential Improvements

1. **Service Worker Caching**: Cache static assets and API responses
2. **Prefetching**: Prefetch dashboard data on navigation
3. **Virtual Scrolling**: For large widget lists
4. **Web Workers**: Offload heavy computations
5. **Progressive Web App**: Enable offline functionality
6. **Edge Caching**: Use CDN for static dashboard components

### Monitoring Enhancements

1. **Real User Monitoring (RUM)**: Track actual user performance
2. **Synthetic Monitoring**: Automated performance tests
3. **Performance Budgets**: Set and enforce performance limits
4. **Custom Metrics**: Track business-specific KPIs

## References

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Web Vitals](https://web.dev/vitals/)
