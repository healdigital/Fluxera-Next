# Performance Monitoring Usage Guide

This guide demonstrates how to use the performance monitoring utilities in critical operations throughout the application.

## Available Utilities

### 1. `measurePerformance<T>(name, fn)`

Measures the execution time of any function (sync or async).

**Features:**
- Logs duration to console in development
- Warns if operation takes >1000ms
- Sends metrics to analytics in production
- Works with both sync and async functions

### 2. `withTimeout<T>(promise, timeoutMs, errorMessage?)`

Wraps a promise with a timeout to prevent hanging operations.

**Features:**
- Prevents operations from hanging indefinitely
- Throws error with custom message on timeout
- Useful for API calls and database queries

### 3. `measureAsync<T>(name, fn, timeoutMs?)`

Combines `measurePerformance` and `withTimeout` for convenience.

**Features:**
- Measures performance AND adds timeout protection
- Default timeout: 10 seconds
- Ideal for critical async operations

## Usage Examples

### Database Queries

```typescript
import { measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

// In a loader function
export async function loadAssets(client: SupabaseClient, accountSlug: string) {
  return measureAsync(
    'load-assets',
    async () => {
      const { data, error } = await client
        .from('assets')
        .select('*')
        .eq('account_slug', accountSlug);
      
      if (error) throw error;
      return data;
    },
    PERFORMANCE_THRESHOLDS.DATABASE_QUERY
  );
}
```

### Server Actions

```typescript
import { measurePerformance } from '@kit/shared/performance';

export const createAsset = enhanceAction(
  async (data) => {
    return measurePerformance('create-asset', async () => {
      const client = getSupabaseServerClient();
      
      // Your creation logic here
      const { data: asset, error } = await client
        .from('assets')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data: asset };
    });
  },
  { schema: CreateAssetSchema }
);
```

### API Routes

```typescript
import { measureAsync, withTimeout } from '@kit/shared/performance';

export async function GET(request: Request) {
  try {
    const data = await measureAsync(
      'api-assets-list',
      async () => {
        const client = getSupabaseServerClient();
        return await client.from('assets').select('*');
      },
      3000 // 3 second timeout for API calls
    );
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to load assets' }, { status: 500 });
  }
}
```

### Search Operations

```typescript
import { measurePerformance, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

async function searchAssets(query: string) {
  return measurePerformance('search-assets', async () => {
    const client = getSupabaseServerClient();
    
    const { data, error } = await withTimeout(
      client
        .from('assets')
        .select('*')
        .ilike('name', `%${query}%`),
      PERFORMANCE_THRESHOLDS.SEARCH
    );
    
    if (error) throw error;
    return data;
  });
}
```

### Complex Operations

```typescript
import { measurePerformance } from '@kit/shared/performance';

async function generateReport(accountSlug: string) {
  return measurePerformance('generate-report', async () => {
    // Step 1: Load assets
    const assets = await measurePerformance('report-load-assets', async () => {
      return await loadAssets(client, accountSlug);
    });
    
    // Step 2: Load licenses
    const licenses = await measurePerformance('report-load-licenses', async () => {
      return await loadLicenses(client, accountSlug);
    });
    
    // Step 3: Process data
    const report = measurePerformance('report-process-data', () => {
      return processReportData(assets, licenses);
    });
    
    return report;
  });
}
```

## Performance Thresholds

Use the predefined thresholds for consistent timeout values:

```typescript
import { PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

// Database queries: 1000ms
PERFORMANCE_THRESHOLDS.DATABASE_QUERY

// API calls: 3000ms
PERFORMANCE_THRESHOLDS.API_CALL

// Page loads: 2000ms
PERFORMANCE_THRESHOLDS.PAGE_LOAD

// Search operations: 500ms
PERFORMANCE_THRESHOLDS.SEARCH

// Filter operations: 300ms
PERFORMANCE_THRESHOLDS.FILTER
```

## Best Practices

1. **Always measure critical operations**: Database queries, API calls, complex calculations
2. **Use appropriate timeouts**: Match timeout to operation type using `PERFORMANCE_THRESHOLDS`
3. **Measure at the right level**: Measure both individual steps and overall operations
4. **Handle timeout errors**: Always wrap timeout operations in try-catch
5. **Monitor in production**: Performance metrics are sent to analytics automatically

## Integration with Web Vitals

The performance utilities work alongside the Web Vitals tracking:

- **Web Vitals**: Tracks user-perceived performance (FCP, LCP, CLS, etc.)
- **Performance Utilities**: Tracks server-side and operation-level performance

Together, they provide complete visibility into application performance.

## Monitoring Performance

### Development
- All measurements logged to console
- Warnings for operations >1000ms
- Detailed timing information

### Production
- Metrics sent to Google Analytics (if configured)
- Only warnings logged to console
- Aggregated performance data available in analytics dashboard

## Example: Complete Feature Implementation

```typescript
// Loader with performance monitoring
export async function loadAssetsPageData(
  client: SupabaseClient,
  accountSlug: string,
) {
  return measureAsync(
    'load-assets-page',
    async () => {
      return Promise.all([
        measureAsync('load-assets-list', () => loadAssets(client, accountSlug)),
        measureAsync('load-asset-stats', () => loadAssetStats(client, accountSlug)),
        measureAsync('load-categories', () => loadCategories(client)),
      ]);
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD
  );
}

// Server action with performance monitoring
export const updateAsset = enhanceAction(
  async (data) => {
    return measurePerformance('update-asset', async () => {
      const client = getSupabaseServerClient();
      
      const { data: asset, error } = await withTimeout(
        client
          .from('assets')
          .update(data)
          .eq('id', data.id)
          .select()
          .single(),
        PERFORMANCE_THRESHOLDS.DATABASE_QUERY
      );
      
      if (error) throw error;
      
      revalidatePath(`/home/${data.accountSlug}/assets`);
      return { success: true, data: asset };
    });
  },
  { schema: UpdateAssetSchema }
);
```

## Troubleshooting

### Operation timing out
- Check if timeout threshold is appropriate
- Optimize database queries (add indexes, reduce joins)
- Consider pagination for large datasets

### Performance warnings
- Review query complexity
- Check for N+1 query problems
- Consider caching frequently accessed data

### Missing metrics in production
- Verify Google Analytics is configured
- Check that `window.gtag` is available
- Ensure proper environment variables are set
