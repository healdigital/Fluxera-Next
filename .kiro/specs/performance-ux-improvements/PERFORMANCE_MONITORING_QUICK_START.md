# Performance Monitoring Quick Start Guide

## Overview
Quick reference for using the performance monitoring utilities in the Fluxera application.

## Import Statement

```typescript
import {
  measurePerformance,
  measureAsync,
  withTimeout,
  PERFORMANCE_THRESHOLDS,
} from '@kit/shared/performance';
```

## Common Patterns

### 1. Page Loader with Multiple Operations

```typescript
export async function loadPageData(
  client: SupabaseClient<Database>,
  slug: string,
) {
  return measureAsync(
    'load-page-data',
    async () => {
      return Promise.all([
        measureAsync(
          'load-main-data',
          () => loadMainData(client, slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-workspace',
          () => loadTeamWorkspace(slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
      ]);
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD,
  );
}
```

### 2. Server Action with Timeout Protection

```typescript
export const createItem = enhanceAction(
  async (data) => {
    return measurePerformance('create-item', async () => {
      const client = getSupabaseServerClient();
      
      // Wrap database operations with timeout
      const { data: item, error } = await withTimeout(
        client.from('items').insert(data).select().single(),
        PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
      );
      
      if (error) throw error;
      
      revalidatePath(`/home/${data.accountSlug}/items`);
      return { success: true, data: item };
    });
  },
  { schema: CreateItemSchema }
);
```

### 3. Search Operation

```typescript
async function searchItems(query: string) {
  return measureAsync(
    'search-items',
    async () => {
      const client = getSupabaseServerClient();
      
      const { data, error } = await client
        .from('items')
        .select('*')
        .ilike('name', `%${query}%`);
      
      if (error) throw error;
      return data;
    },
    PERFORMANCE_THRESHOLDS.SEARCH, // 500ms timeout
  );
}
```

### 4. Complex Operation with Multiple Steps

```typescript
async function generateReport(accountSlug: string) {
  return measurePerformance('generate-report', async () => {
    // Step 1: Load data
    const data = await measureAsync(
      'report-load-data',
      () => loadReportData(accountSlug),
      PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
    );
    
    // Step 2: Process data (synchronous)
    const processed = measurePerformance('report-process', () => {
      return processReportData(data);
    });
    
    // Step 3: Save report
    const saved = await measureAsync(
      'report-save',
      () => saveReport(processed),
      PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
    );
    
    return saved;
  });
}
```

## Performance Thresholds

Use these predefined constants for consistent timeout values:

```typescript
PERFORMANCE_THRESHOLDS.DATABASE_QUERY  // 1000ms - Database operations
PERFORMANCE_THRESHOLDS.API_CALL        // 3000ms - External API calls
PERFORMANCE_THRESHOLDS.PAGE_LOAD       // 2000ms - Page data loading
PERFORMANCE_THRESHOLDS.SEARCH          // 500ms  - Search operations
PERFORMANCE_THRESHOLDS.FILTER          // 300ms  - Filter operations
```

## When to Use Each Utility

### `measurePerformance(name, fn)`
**Use for**: Any operation you want to measure
- ✅ Both sync and async operations
- ✅ When you want logging but no timeout
- ✅ Wrapping entire workflows

### `withTimeout(promise, timeoutMs, errorMessage?)`
**Use for**: Adding timeout protection
- ✅ Database queries
- ✅ External API calls
- ✅ Any operation that might hang

### `measureAsync(name, fn, timeoutMs?)`
**Use for**: Convenience - combines both
- ✅ Critical async operations
- ✅ When you want both measurement and timeout
- ✅ Most common use case

## What Gets Logged

### Development Mode
```
[Performance] load-assets-page: 245.67ms
[Performance] load-assets-paginated: 123.45ms
[Performance] load-team-workspace: 89.12ms
```

### Slow Operations (>1000ms)
```
[Performance Warning] load-large-dataset took 1234.56ms
```

### Timeout Errors
```
Error: load-assets-page timed out after 2000ms
```

## Best Practices

### ✅ DO
- Measure all page loaders
- Add timeout protection to database queries
- Use appropriate thresholds for operation types
- Measure both individual steps and overall operations
- Keep operation names descriptive and consistent

### ❌ DON'T
- Don't measure trivial operations (simple calculations)
- Don't use very short timeouts (<100ms)
- Don't ignore timeout errors
- Don't measure inside loops (measure the loop instead)
- Don't nest measurements unnecessarily

## Error Handling

### Timeout Errors
```typescript
try {
  const data = await measureAsync(
    'load-data',
    () => loadData(),
    1000
  );
} catch (error) {
  if (error.message.includes('timed out')) {
    // Handle timeout specifically
    console.error('Operation timed out, using cached data');
    return getCachedData();
  }
  throw error;
}
```

### Graceful Degradation
```typescript
async function loadOptionalData() {
  try {
    return await measureAsync(
      'load-optional-data',
      () => fetchOptionalData(),
      500
    );
  } catch (error) {
    // Return empty data if optional operation fails
    console.warn('Optional data load failed:', error);
    return [];
  }
}
```

## Integration with Web Vitals

Performance utilities work alongside Web Vitals tracking:

- **Web Vitals**: Tracks user-perceived performance (client-side)
- **Performance Utilities**: Tracks server-side and operation-level performance

Together they provide complete visibility into application performance.

## Monitoring in Production

### Google Analytics
Metrics are automatically sent to Google Analytics (if configured):
- Event Category: "Performance"
- Event Label: Operation name
- Value: Duration in milliseconds

### Console Warnings
Only slow operations (>1000ms) are logged in production to minimize noise.

## Troubleshooting

### Operation Timing Out
1. Check if timeout threshold is appropriate
2. Optimize the operation (add indexes, reduce complexity)
3. Consider pagination for large datasets
4. Increase timeout if operation is legitimately slow

### Missing Metrics
1. Verify operation is wrapped with measurement utility
2. Check console for errors
3. Ensure Google Analytics is configured (production)
4. Verify `window.gtag` is available

### Performance Warnings
1. Review the operation for optimization opportunities
2. Check for N+1 query problems
3. Consider caching frequently accessed data
4. Add indexes to database tables

## Examples in Codebase

See these files for real-world examples:
- `apps/web/app/home/[account]/assets/_lib/server/assets-page.loader.ts`
- `apps/web/app/home/[account]/licenses/_lib/server/licenses-page.loader.ts`
- `apps/web/app/home/[account]/users/_lib/server/users-page.loader.ts`
- `apps/web/app/home/[account]/dashboard/_lib/server/dashboard-page.loader.ts`
- `apps/web/app/home/[account]/assets/_lib/server/assets-server-actions.ts`

## Additional Resources

- **Full Usage Guide**: `packages/shared/src/lib/PERFORMANCE_USAGE.md`
- **Examples**: `packages/shared/src/lib/PERFORMANCE_EXAMPLES.md`
- **Implementation**: `packages/shared/src/lib/performance.ts`
