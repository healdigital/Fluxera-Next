# Code Splitting Implementation

## Overview

This document describes the code splitting optimizations implemented to reduce initial bundle size and improve page load performance.

## Implementation Strategy

### 1. Dynamic Imports for Heavy Components

Heavy components that use large libraries (like recharts) are now lazy-loaded using Next.js dynamic imports:

```typescript
// Before
import { TrendChartWidget } from './widgets/trend-chart-widget';

// After
import { TrendChartWidget } from './widgets/trend-chart-widget.lazy';
```

### 2. Lazy-Loaded Components

#### Chart Widgets

**TrendChartWidget** (`trend-chart-widget.lazy.tsx`)
- Uses recharts library (~100KB)
- Lazy loaded with skeleton fallback
- SSR disabled for client-only rendering

**AssetStatusWidget** (`asset-status-widget.lazy.tsx`)
- Uses recharts PieChart
- Lazy loaded with custom skeleton
- SSR disabled for client-only rendering

### 3. Package Import Optimization

Updated `next.config.mjs` to optimize package imports:

```javascript
optimizePackageImports: [
  'recharts',              // Chart library
  'lucide-react',          // Icon library
  '@radix-ui/react-icons', // Additional icons
  '@radix-ui/react-avatar',
  '@radix-ui/react-select',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-tooltip',
  'date-fns',              // Date utilities
  'react-hook-form',       // Form library
  '@hookform/resolvers',   // Form validation
  ...INTERNAL_PACKAGES,
]
```

### 4. Console Removal in Production

Added compiler configuration to remove console statements in production:

```javascript
compiler: {
  removeConsole: IS_PRODUCTION
    ? {
        exclude: ['error', 'warn'],
      }
    : false,
}
```

## Route-Based Code Splitting

Next.js automatically implements route-based code splitting. Each page is a separate chunk:

- `/home/[account]/dashboard` - Dashboard page chunk
- `/home/[account]/assets` - Assets page chunk
- `/home/[account]/licenses` - Licenses page chunk
- `/home/[account]/users` - Users page chunk
- `/admin/dashboard` - Admin dashboard chunk

## Below-Fold Content Lazy Loading

Dashboard widgets are lazy loaded based on their position:

```typescript
// First 3 widgets load immediately
// Widgets 4+ are lazy loaded
const shouldLazyLoad = index >= 3;

return shouldLazyLoad ? (
  <LazyWidgetLoader key={`${widgetType}-${index}`}>
    <Suspense fallback={<DashboardWidgetSkeleton />}>
      <WidgetRenderer {...props} />
    </Suspense>
  </LazyWidgetLoader>
) : (
  <Suspense key={`${widgetType}-${index}`} fallback={<DashboardWidgetSkeleton />}>
    <WidgetRenderer {...props} />
  </Suspense>
);
```

## Benefits

### Bundle Size Reduction

- **Recharts library**: ~100KB moved to separate chunk
- **Chart widgets**: Only loaded when needed
- **Dialog components**: Can be lazy loaded on interaction
- **Form components**: Loaded on demand

### Performance Improvements

- **Faster initial page load**: Smaller main bundle
- **Better Time to Interactive (TTI)**: Less JavaScript to parse
- **Improved First Contentful Paint (FCP)**: Critical content loads first
- **Better Largest Contentful Paint (LCP)**: Above-fold content prioritized

### User Experience

- **Skeleton loaders**: Provide visual feedback during loading
- **Progressive enhancement**: Core functionality loads first
- **Smooth transitions**: No layout shifts during lazy loading

## Files Modified

1. `apps/web/next.config.mjs` - Added package optimization and console removal
2. `apps/web/app/home/[account]/dashboard/_components/widgets/trend-chart-widget.lazy.tsx` - Created lazy wrapper
3. `apps/web/app/home/[account]/dashboard/_components/widgets/asset-status-widget.lazy.tsx` - Created lazy wrapper
4. `apps/web/app/home/[account]/dashboard/_components/dashboard-grid.tsx` - Updated imports to use lazy versions

## Testing

To verify code splitting is working:

1. **Build the application**:
   ```bash
   pnpm --filter web build
   ```

2. **Check bundle analysis**:
   ```bash
   ANALYZE=true pnpm --filter web build
   ```

3. **Verify in browser DevTools**:
   - Open Network tab
   - Navigate to dashboard
   - Verify chart widgets load as separate chunks
   - Check that chunks load only when needed

## Future Optimizations

### Additional Components to Lazy Load

1. **Dialog Components**:
   - Create lazy wrappers for all dialog components
   - Load on button click instead of page load

2. **Form Components**:
   - Lazy load complex forms (asset creation, license creation)
   - Load on dialog open

3. **Admin Dashboard**:
   - Lazy load admin-specific widgets
   - Implement similar strategy as team dashboard

### Image Optimization

1. **Next.js Image Component**:
   - Replace `<img>` tags with `<Image />`
   - Enable automatic optimization
   - Use blur placeholders

2. **Responsive Images**:
   - Generate multiple sizes
   - Use srcset for different viewports

### Font Optimization

1. **Font Subsetting**:
   - Load only required character sets
   - Use font-display: swap

2. **Preload Critical Fonts**:
   - Add preload links for above-fold fonts

## Monitoring

Track these metrics to measure impact:

- **Bundle size**: Check .next/analyze output
- **Page load time**: Use Lighthouse
- **Time to Interactive**: Monitor Web Vitals
- **Chunk loading**: Check Network waterfall

## References

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Next.js Optimizing Package Imports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports)
- [React.lazy](https://react.dev/reference/react/lazy)
- [Code Splitting Best Practices](https://web.dev/code-splitting-suspense/)
