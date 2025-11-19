# Bundle Size Optimization

## Overview

This document describes the bundle size optimizations implemented to reduce the application's JavaScript payload and improve load times.

## Current Configuration

### Package Import Optimization

The following packages are optimized for tree-shaking in `next.config.mjs`:

```javascript
optimizePackageImports: [
  'recharts',                      // ~100KB - Chart library
  'lucide-react',                  // ~50KB - Icon library
  '@radix-ui/react-icons',         // ~20KB - Additional icons
  '@radix-ui/react-avatar',        // ~15KB - Avatar component
  '@radix-ui/react-select',        // ~25KB - Select component
  '@radix-ui/react-dialog',        // ~20KB - Dialog component
  '@radix-ui/react-dropdown-menu', // ~20KB - Dropdown menu
  '@radix-ui/react-popover',       // ~15KB - Popover component
  '@radix-ui/react-tooltip',       // ~10KB - Tooltip component
  'date-fns',                      // ~30KB - Date utilities
  'react-hook-form',               // ~40KB - Form library
  '@hookform/resolvers',           // ~10KB - Form validation
  ...INTERNAL_PACKAGES,            // Internal monorepo packages
]
```

### Console Removal in Production

Production builds automatically remove console statements (except errors and warnings):

```javascript
compiler: {
  removeConsole: IS_PRODUCTION
    ? {
        exclude: ['error', 'warn'],
      }
    : false,
}
```

### Modular Imports

Lodash is configured for modular imports to prevent importing the entire library:

```javascript
modularizeImports: {
  lodash: {
    transform: 'lodash/{{member}}',
  },
}
```

## Bundle Analysis

### Running Bundle Analyzer

To analyze the bundle size:

```bash
# Build with bundle analyzer
ANALYZE=true pnpm --filter web build

# This will:
# 1. Build the production bundle
# 2. Generate bundle analysis reports
# 3. Open interactive visualizations in your browser
```

### What to Look For

1. **Large Dependencies**:
   - Identify packages > 50KB
   - Check if they can be lazy-loaded
   - Consider alternatives if possible

2. **Duplicate Code**:
   - Look for the same package imported multiple times
   - Check for different versions of the same package

3. **Unused Code**:
   - Identify imported but unused modules
   - Remove unnecessary dependencies

4. **Route Chunks**:
   - Verify each route has its own chunk
   - Check chunk sizes are reasonable (< 200KB)

## Dependency Audit

### Core Dependencies (Required)

| Package | Size | Purpose | Optimized |
|---------|------|---------|-----------|
| next | ~500KB | Framework | ✅ Built-in |
| react | ~130KB | UI Library | ✅ Built-in |
| react-dom | ~130KB | DOM Renderer | ✅ Built-in |
| @supabase/supabase-js | ~80KB | Database Client | ✅ Tree-shakeable |
| zod | ~50KB | Validation | ✅ Tree-shakeable |

### UI Libraries (Required)

| Package | Size | Purpose | Optimized |
|---------|------|---------|-----------|
| lucide-react | ~50KB | Icons | ✅ Optimized imports |
| @radix-ui/* | ~150KB | UI Primitives | ✅ Optimized imports |
| tailwind-merge | ~10KB | Class Merging | ✅ Small |
| next-themes | ~5KB | Theme Switching | ✅ Small |

### Chart Libraries (Lazy Loaded)

| Package | Size | Purpose | Optimized |
|---------|------|---------|-----------|
| recharts | ~100KB | Charts | ✅ Lazy loaded |

### Form Libraries (Required)

| Package | Size | Purpose | Optimized |
|---------|------|---------|-----------|
| react-hook-form | ~40KB | Forms | ✅ Optimized imports |
| @hookform/resolvers | ~10KB | Validation | ✅ Optimized imports |

### Utility Libraries (Required)

| Package | Size | Purpose | Optimized |
|---------|------|---------|-----------|
| date-fns | ~30KB | Date Utilities | ✅ Optimized imports |
| @tanstack/react-query | ~40KB | Data Fetching | ✅ Tree-shakeable |
| @tanstack/react-table | ~35KB | Tables | ✅ Tree-shakeable |

### AI/Chat Libraries (Conditional)

| Package | Size | Purpose | Optimized |
|---------|------|---------|-----------|
| ai | ~50KB | AI SDK | ⚠️ Only if chat enabled |
| @ai-sdk/openai | ~30KB | OpenAI Integration | ⚠️ Only if chat enabled |
| @ai-sdk/react | ~20KB | React Hooks | ⚠️ Only if chat enabled |
| gpt-tokenizer | ~15KB | Token Counting | ⚠️ Only if chat enabled |

### Recommendations

1. **AI Libraries**: Consider lazy loading chat components if not used on every page
2. **Table Library**: Lazy load table components for pages that don't use them
3. **Chart Library**: Already lazy loaded ✅

## Unused Dependencies

### Potentially Unused

Based on the dependency audit, these packages may not be actively used:

1. **gpt-tokenizer** (15KB)
   - Only needed if using AI chat features
   - Consider lazy loading with chat components

2. **next-sitemap** (5KB)
   - Only needed at build time
   - Should be in devDependencies

### Verification Steps

To verify if a dependency is used:

```bash
# Search for imports
pnpm exec grep -r "from 'package-name'" apps/web/

# Check if it's actually imported
pnpm exec grep -r "import.*package-name" apps/web/
```

## Optimization Strategies

### 1. Code Splitting

✅ **Implemented**:
- Chart widgets lazy loaded
- Route-based splitting (automatic)
- Below-fold content lazy loaded

🔄 **Future**:
- Lazy load dialog components
- Lazy load form components
- Lazy load admin-specific features

### 2. Tree Shaking

✅ **Implemented**:
- Package import optimization
- Modular lodash imports
- ES modules for all packages

### 3. Minification

✅ **Implemented**:
- Next.js automatic minification
- CSS minification with cssnano
- Console removal in production

### 4. Compression

✅ **Implemented**:
- Gzip compression (automatic)
- Brotli compression (automatic)

## Bundle Size Targets

### Current Baseline (Before Optimization)

| Metric | Target | Status |
|--------|--------|--------|
| First Load JS | < 200KB | 🔄 Measuring |
| Route Chunks | < 100KB | 🔄 Measuring |
| Shared Chunks | < 150KB | 🔄 Measuring |

### After Optimization Goals

| Metric | Target | Status |
|--------|--------|--------|
| First Load JS | < 180KB | 🎯 Goal |
| Route Chunks | < 80KB | 🎯 Goal |
| Shared Chunks | < 120KB | 🎯 Goal |

## Monitoring

### Build Output

After each build, check the output for:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    5 kB       150 kB
├ ○ /home/[account]/dashboard            10 kB      160 kB
├ ○ /home/[account]/assets               8 kB       158 kB
└ ○ /home/[account]/licenses             8 kB       158 kB
```

### Key Metrics

1. **First Load JS**: Total JS for initial page load
2. **Route Size**: JS specific to that route
3. **Shared Chunks**: JS shared across routes

### Alerts

Set up alerts for:
- First Load JS > 200KB
- Any route chunk > 100KB
- Shared chunks > 150KB

## Next Steps

### Immediate Actions

1. ✅ Configure package optimization
2. ✅ Implement code splitting for charts
3. ✅ Add console removal
4. 🔄 Run bundle analysis
5. 🔄 Document baseline metrics

### Future Optimizations

1. **Image Optimization**:
   - Use Next.js Image component
   - Implement responsive images
   - Add blur placeholders

2. **Font Optimization**:
   - Subset fonts
   - Preload critical fonts
   - Use font-display: swap

3. **CSS Optimization**:
   - Remove unused Tailwind classes
   - Optimize critical CSS
   - Defer non-critical CSS

4. **Third-Party Scripts**:
   - Lazy load analytics
   - Defer non-critical scripts
   - Use next/script for optimization

## References

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Optimizing Package Imports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Bundle Size Best Practices](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
