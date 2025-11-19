# Performance Monitoring - Practical Examples

This document provides real-world examples of using the performance monitoring utilities in the Fluxera application.

## Quick Start

```typescript
import {
  measurePerformance,
  withTimeout,
  measureAsync,
  PERFORMANCE_THRESHOLDS,
} from '@kit/shared/performance';
```

## Example 1: Basic Loader with Performance Monitoring

```typescript
// apps/web/app/home/[account]/assets/_lib/server/assets-page.loader.ts
import 'server-only';
import { SupabaseClient } from '@supabase/supabase-js';
import { measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

export async function loadAssetsPageData(
  client: SupabaseClient,
  slug: string,
) {
  // Wrap the entire page load with performance monitoring
  return measureAsync(
    'load-assets-page',
    async () => {
      return Promise.all([
        loadAssets(client, slug),
        loadCategories(client),
        loadStats(client, slug),
      ]);
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD, // 2 second timeout
  );
}

async function loadAssets(client: SupabaseClient, slug: string) {
  // Monitor individual database query
  return measureAsync(
    'load-assets-query',
    async () => {
      const { data, error } = await client
        .from('assets')
        .select('*')
        .eq('account_slug', slug);
      
      if (error) throw error;
      return data;
    },
    PERFORMANCE_THRESHOLDS.DATABASE_QUERY, // 1 second timeout
  );
}
```

**Console Output (Development):**
```
[Performance] load-assets-query: 234.56ms
[Performance] load-assets-page: 456.78ms
```

## Example 2: Server Action with Error Handling

```typescript
// apps/web/app/home/[account]/assets/_lib/server/assets-server-actions.ts
'use server';

import { enhanceAction } from '@kit/next/actions';
import { measurePerformance } from '@kit/shared/performance';
import { CreateAssetSchema } from '../schemas/asset.schema';

export const createAsset = enhanceAction(
  async (data) => {
    return measurePerformance('create-asset', async () => {
      const client = getSupabaseServerClient();
      
      try {
        const { data: asset, error } = await client
          .from('assets')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        
        revalidatePath(`/home/${data.accountSlug}/assets`);
        
        return {
          success: true,
          data: asset,
        };
      } catch (error) {
        console.error('Failed to create asset:', error);
        throw error;
      }
    });
  },
  { schema: CreateAssetSchema }
);
```

**Console Output (Development):**
```
[Performance] create-asset: 123.45ms
```

## Example 3: API Route with Timeout Protection

```typescript
// apps/web/app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const data = await measureAsync(
      'api-assets-list',
      async () => {
        const client = getSupabaseServerClient();
        const { data, error } = await client
          .from('assets')
          .select('*')
          .limit(100);
        
        if (error) throw error;
        return data;
      },
      PERFORMANCE_THRESHOLDS.API_CALL, // 3 second timeout
    );
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to load assets' },
      { status: 500 }
    );
  }
}
```

**Console Output (Development):**
```
[Performance] api-assets-list: 345.67ms
```

## Example 4: Search with Fast Timeout

```typescript
// apps/web/app/home/[account]/assets/_lib/server/search-assets.ts
import 'server-only';
import { measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

export async function searchAssets(
  client: SupabaseClient,
  accountSlug: string,
  query: string,
) {
  return measureAsync(
    'search-assets',
    async () => {
      const { data, error } = await client
        .from('assets')
        .select('*')
        .eq('account_slug', accountSlug)
        .ilike('name', `%${query}%`)
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    PERFORMANCE_THRESHOLDS.SEARCH, // 500ms timeout - search should be fast!
  );
}
```

**Console Output (Development):**
```
[Performance] search-assets: 89.12ms
```

## Example 5: Complex Operation with Multiple Steps

```typescript
// apps/web/app/home/[account]/reports/_lib/server/generate-report.ts
import 'server-only';
import { measurePerformance, measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

export async function generateAssetReport(
  client: SupabaseClient,
  accountSlug: string,
) {
  // Measure the entire report generation
  return measurePerformance('generate-asset-report', async () => {
    // Step 1: Load assets (with timeout)
    const assets = await measureAsync(
      'report-load-assets',
      async () => {
        const { data, error } = await client
          .from('assets')
          .select('*')
          .eq('account_slug', accountSlug);
        
        if (error) throw error;
        return data;
      },
      PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
    );
    
    // Step 2: Load licenses (with timeout)
    const licenses = await measureAsync(
      'report-load-licenses',
      async () => {
        const { data, error } = await client
          .from('licenses')
          .select('*')
          .eq('account_slug', accountSlug);
        
        if (error) throw error;
        return data;
      },
      PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
    );
    
    // Step 3: Process data (synchronous, no timeout needed)
    const report = measurePerformance('report-process-data', () => {
      return {
        totalAssets: assets.length,
        totalLicenses: licenses.length,
        assignedAssets: assets.filter(a => a.assigned_to).length,
        availableAssets: assets.filter(a => a.status === 'available').length,
        expiringLicenses: licenses.filter(l => isExpiringSoon(l)).length,
      };
    });
    
    return report;
  });
}

function isExpiringSoon(license: any): boolean {
  // Implementation...
  return false;
}
```

**Console Output (Development):**
```
[Performance] report-load-assets: 234.56ms
[Performance] report-load-licenses: 123.45ms
[Performance] report-process-data: 12.34ms
[Performance] generate-asset-report: 370.35ms
```

## Example 6: Handling Slow Operations

```typescript
// apps/web/app/home/[account]/exports/_lib/server/export-data.ts
import 'server-only';
import { measureAsync } from '@kit/shared/performance';

export async function exportAssetsToCSV(
  client: SupabaseClient,
  accountSlug: string,
) {
  try {
    // Large export might take longer, use custom timeout
    return await measureAsync(
      'export-assets-csv',
      async () => {
        const { data, error } = await client
          .from('assets')
          .select('*')
          .eq('account_slug', accountSlug);
        
        if (error) throw error;
        
        // Convert to CSV (might be slow for large datasets)
        const csv = convertToCSV(data);
        return csv;
      },
      10000, // 10 second timeout for large exports
    );
  } catch (error) {
    if (error.message.includes('timed out')) {
      throw new Error('Export is taking too long. Please try exporting fewer items.');
    }
    throw error;
  }
}

function convertToCSV(data: any[]): string {
  // Implementation...
  return '';
}
```

**Console Output (Development):**
```
[Performance] export-assets-csv: 2345.67ms
[Performance Warning] export-assets-csv took 2345.67ms
```

## Example 7: Filter Operation

```typescript
// apps/web/app/home/[account]/assets/_lib/server/filter-assets.ts
import 'server-only';
import { measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

export async function filterAssets(
  client: SupabaseClient,
  accountSlug: string,
  filters: {
    category?: string;
    status?: string;
    assignedTo?: string;
  },
) {
  return measureAsync(
    'filter-assets',
    async () => {
      let query = client
        .from('assets')
        .select('*')
        .eq('account_slug', accountSlug);
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    PERFORMANCE_THRESHOLDS.FILTER, // 300ms timeout - filters should be instant!
  );
}
```

**Console Output (Development):**
```
[Performance] filter-assets: 45.67ms
```

## Example 8: Timeout Error Handling

```typescript
// apps/web/app/home/[account]/sync/_lib/server/sync-external-data.ts
import 'server-only';
import { withTimeout } from '@kit/shared/performance';

export async function syncExternalAssets(apiUrl: string, apiKey: string) {
  try {
    // External API might be slow or unresponsive
    const response = await withTimeout(
      fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }),
      5000, // 5 second timeout
      'External API request timed out'
    );
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.error('External API is not responding');
      throw new Error('Unable to sync data. The external service is not responding.');
    }
    throw error;
  }
}
```

## Example 9: Parallel Operations

```typescript
// apps/web/app/home/[account]/dashboard/_lib/server/dashboard-loader.ts
import 'server-only';
import { measureAsync, PERFORMANCE_THRESHOLDS } from '@kit/shared/performance';

export async function loadDashboardData(
  client: SupabaseClient,
  accountSlug: string,
) {
  return measureAsync(
    'load-dashboard',
    async () => {
      // Load all data in parallel for better performance
      const [assets, licenses, users, activity] = await Promise.all([
        measureAsync(
          'dashboard-load-assets',
          () => client.from('assets').select('*').eq('account_slug', accountSlug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'dashboard-load-licenses',
          () => client.from('licenses').select('*').eq('account_slug', accountSlug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'dashboard-load-users',
          () => client.from('users').select('*').eq('account_slug', accountSlug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'dashboard-load-activity',
          () => client.from('activity').select('*').eq('account_slug', accountSlug).limit(10),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
      ]);
      
      return {
        assets: assets.data || [],
        licenses: licenses.data || [],
        users: users.data || [],
        activity: activity.data || [],
      };
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD,
  );
}
```

**Console Output (Development):**
```
[Performance] dashboard-load-assets: 123.45ms
[Performance] dashboard-load-licenses: 134.56ms
[Performance] dashboard-load-users: 98.76ms
[Performance] dashboard-load-activity: 87.65ms
[Performance] load-dashboard: 145.67ms  // Parallel execution is faster!
```

## Example 10: Conditional Performance Monitoring

```typescript
// apps/web/app/home/[account]/assets/_lib/server/conditional-monitoring.ts
import 'server-only';
import { measurePerformance } from '@kit/shared/performance';

export async function loadAssets(
  client: SupabaseClient,
  accountSlug: string,
  enableMonitoring = true,
) {
  const loadFn = async () => {
    const { data, error } = await client
      .from('assets')
      .select('*')
      .eq('account_slug', accountSlug);
    
    if (error) throw error;
    return data;
  };
  
  // Only monitor in development or when explicitly enabled
  if (enableMonitoring || process.env.NODE_ENV === 'development') {
    return measurePerformance('load-assets', loadFn);
  }
  
  return loadFn();
}
```

## Performance Monitoring Best Practices

### 1. Use Appropriate Thresholds
```typescript
// ✅ Good - Use predefined thresholds
measureAsync('query', fn, PERFORMANCE_THRESHOLDS.DATABASE_QUERY);

// ❌ Bad - Arbitrary timeout
measureAsync('query', fn, 5000);
```

### 2. Name Operations Clearly
```typescript
// ✅ Good - Clear, descriptive names
measurePerformance('load-assets-with-users', fn);

// ❌ Bad - Vague names
measurePerformance('query1', fn);
```

### 3. Monitor Critical Paths
```typescript
// ✅ Good - Monitor user-facing operations
export async function loadUserDashboard() {
  return measureAsync('load-dashboard', ...);
}

// ⚠️ Optional - Internal utilities might not need monitoring
function formatDate(date: Date) {
  // No need to monitor simple formatting
  return date.toISOString();
}
```

### 4. Handle Timeout Errors
```typescript
// ✅ Good - Provide user-friendly error messages
try {
  await measureAsync('operation', fn, 1000);
} catch (error) {
  if (error.message.includes('timed out')) {
    throw new Error('This operation is taking longer than expected. Please try again.');
  }
  throw error;
}
```

### 5. Combine with Logging
```typescript
// ✅ Good - Combine performance monitoring with logging
const logger = await getLogger();

return measurePerformance('create-asset', async () => {
  logger.info({ name: 'assets.create' }, 'Creating asset...');
  
  const result = await createAssetInDB(data);
  
  logger.info({ name: 'assets.create' }, 'Asset created successfully');
  
  return result;
});
```

## Troubleshooting

### Operation Timing Out
```typescript
// If operations are timing out, increase the timeout
measureAsync('slow-operation', fn, 10000); // 10 seconds

// Or optimize the operation
measureAsync('optimized-operation', async () => {
  // Add indexes, reduce data, optimize query
  return await optimizedQuery();
}, PERFORMANCE_THRESHOLDS.DATABASE_QUERY);
```

### Performance Warnings
```typescript
// If you see warnings like:
// [Performance Warning] load-data took 1234.56ms

// 1. Check if the operation can be optimized
// 2. Consider caching
// 3. Add pagination
// 4. Optimize database queries
```

### Missing Metrics
```typescript
// Ensure operations are wrapped in performance monitoring
// ❌ Bad
const data = await client.from('assets').select('*');

// ✅ Good
const data = await measureAsync(
  'load-assets',
  () => client.from('assets').select('*'),
  PERFORMANCE_THRESHOLDS.DATABASE_QUERY
);
```

## Summary

These examples demonstrate how to use the performance monitoring utilities throughout the Fluxera application. Key takeaways:

1. **Use `measureAsync`** for most async operations (combines monitoring + timeout)
2. **Use `measurePerformance`** for sync operations or when you don't need timeout
3. **Use `withTimeout`** when you only need timeout protection
4. **Use appropriate thresholds** from `PERFORMANCE_THRESHOLDS`
5. **Handle timeout errors** gracefully with user-friendly messages
6. **Monitor critical paths** that affect user experience
7. **Name operations clearly** for easy debugging

The performance monitoring system helps identify bottlenecks, prevent hanging operations, and ensure a fast, responsive application.
