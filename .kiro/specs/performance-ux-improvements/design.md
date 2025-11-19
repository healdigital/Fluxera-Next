# Performance & UX Improvements - Design Document

## Overview

This specification defines the design for optimizing performance, enhancing user experience, implementing comprehensive end-to-end testing, resolving bugs, and creating user documentation for the Fluxera asset management system. The design focuses on making the application production-ready with excellent performance characteristics, intuitive user interactions, comprehensive test coverage, and thorough documentation.

The implementation leverages Next.js 16 performance features, React 19 optimizations, Playwright for E2E testing, and follows established accessibility standards. All improvements maintain compatibility with the existing Makerkit architecture and multi-tenant model.

## Architecture

### Technology Stack

- **Performance Monitoring**: Lighthouse, Web Vitals, Next.js Analytics
- **Testing**: Playwright for E2E tests, existing test infrastructure
- **Image Optimization**: Next.js Image component, Sharp for server-side processing
- **Documentation**: Markdown-based user guides, inline help components
- **Accessibility**: WCAG 2.1 Level AA compliance tools, ARIA attributes
- **Code Quality**: TypeScript strict mode, ESLint, Prettier

### Performance Optimization Strategy

```
Performance Audit → Identify Bottlenecks → Implement Optimizations → Measure Impact → Iterate
```

### Testing Strategy

```
Critical User Flows → E2E Test Scenarios → Test Implementation → CI Integration → Continuous Monitoring
```

## Components and Interfaces

### Performance Optimization Components

#### Image Optimization Service

```typescript
// packages/shared/src/lib/image-optimization.ts
import 'server-only';
import sharp from 'sharp';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  let pipeline = sharp(buffer);

  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, progressive: true });
      break;
  }

  return pipeline.toBuffer();
}

export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions
): string {
  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  return `/api/images/optimize?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
}
```

#### Loading State Components

```typescript
// packages/ui/src/loading-spinner.tsx
'use client';

import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// packages/ui/src/skeleton.tsx
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
```

#### Toast Notification System

```typescript
// packages/ui/src/toast.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-600 text-black',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg',
        'animate-in slide-in-from-bottom-5',
        typeStyles[type]
      )}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

// Toast context and hook
import { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextValue {
  showToast: (message: string, type?: ToastProps['type']) => void;
}

const ToastContext = createContext<ToastContextContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

#### Tooltip Component

```typescript
// packages/ui/src/tooltip.tsx
'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../lib/utils';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={500}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          className={cn(
            'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
          sideOffset={5}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
```

### E2E Testing Infrastructure

#### Test Utilities

```typescript
// apps/e2e/tests/utils/asset-helpers.ts
import { Page, expect } from '@playwright/test';

export async function createAsset(
  page: Page,
  data: {
    name: string;
    category: string;
    status: string;
    serialNumber?: string;
  }
) {
  await page.getByTestId('create-asset-button').click();
  
  await page.getByLabel('Name').fill(data.name);
  await page.getByLabel('Category').selectOption(data.category);
  await page.getByLabel('Status').selectOption(data.status);
  
  if (data.serialNumber) {
    await page.getByLabel('Serial Number').fill(data.serialNumber);
  }
  
  await page.getByTestId('submit-asset-form').click();
  
  // Wait for success toast
  await expect(page.getByRole('alert')).toContainText('Asset created successfully');
}

export async function assignAsset(
  page: Page,
  assetName: string,
  userName: string
) {
  await page.getByText(assetName).click();
  await page.getByTestId('assign-asset-button').click();
  await page.getByLabel('Assign to').selectOption(userName);
  await page.getByTestId('confirm-assignment').click();
  
  await expect(page.getByRole('alert')).toContainText('Asset assigned successfully');
}

export async function filterAssets(
  page: Page,
  filters: {
    category?: string;
    status?: string;
    search?: string;
  }
) {
  if (filters.category) {
    await page.getByTestId('filter-category').selectOption(filters.category);
  }
  
  if (filters.status) {
    await page.getByTestId('filter-status').selectOption(filters.status);
  }
  
  if (filters.search) {
    await page.getByTestId('search-assets').fill(filters.search);
  }
}
```

#### E2E Test Scenarios

```typescript
// apps/e2e/tests/assets/asset-management.spec.ts
import { test, expect } from '@playwright/test';
import { createAsset, assignAsset, filterAssets } from '../utils/asset-helpers';

test.describe('Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home/test-account/assets');
  });

  test('should create a new asset', async ({ page }) => {
    await createAsset(page, {
      name: 'Test Laptop',
      category: 'laptop',
      status: 'available',
      serialNumber: 'SN123456',
    });

    // Verify asset appears in list
    await expect(page.getByText('Test Laptop')).toBeVisible();
    await expect(page.getByText('SN123456')).toBeVisible();
  });

  test('should assign asset to user', async ({ page }) => {
    // Create asset first
    await createAsset(page, {
      name: 'Test Desktop',
      category: 'desktop',
      status: 'available',
    });

    // Assign to user
    await assignAsset(page, 'Test Desktop', 'John Doe');

    // Verify status changed
    await expect(page.getByText('Assigned')).toBeVisible();
  });

  test('should filter assets by category', async ({ page }) => {
    await filterAssets(page, { category: 'laptop' });

    // Verify only laptops are shown
    const assetCards = page.getByTestId('asset-card');
    await expect(assetCards).toHaveCount(await assetCards.count());
    
    // All visible assets should be laptops
    const categories = await assetCards.locator('[data-test="asset-category"]').allTextContents();
    expect(categories.every(cat => cat === 'Laptop')).toBe(true);
  });

  test('should view asset history', async ({ page }) => {
    await page.getByText('Test Laptop').click();
    await page.getByTestId('history-tab').click();

    // Verify history entries are displayed
    await expect(page.getByTestId('history-entry')).toHaveCount(1);
    await expect(page.getByText('Asset created')).toBeVisible();
  });
});

// apps/e2e/tests/licenses/license-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('License Management', () => {
  test('should create a new license', async ({ page }) => {
    await page.goto('/home/test-account/licenses');
    await page.getByTestId('create-license-button').click();

    await page.getByLabel('Name').fill('Microsoft Office 365');
    await page.getByLabel('Vendor').fill('Microsoft');
    await page.getByLabel('License Key').fill('XXXXX-XXXXX-XXXXX-XXXXX');
    await page.getByLabel('License Type').selectOption('subscription');
    await page.getByLabel('Purchase Date').fill('2024-01-01');
    await page.getByLabel('Expiration Date').fill('2025-01-01');

    await page.getByTestId('submit-license-form').click();

    await expect(page.getByRole('alert')).toContainText('License created successfully');
    await expect(page.getByText('Microsoft Office 365')).toBeVisible();
  });

  test('should display expiring licenses warning', async ({ page }) => {
    await page.goto('/home/test-account/licenses');

    // Verify expiring soon badge is visible
    await expect(page.getByTestId('expiring-soon-badge')).toBeVisible();
  });

  test('should assign license to user', async ({ page }) => {
    await page.goto('/home/test-account/licenses');
    await page.getByText('Microsoft Office 365').click();
    await page.getByTestId('assign-license-button').click();
    await page.getByLabel('Assign to User').selectOption('John Doe');
    await page.getByTestId('confirm-assignment').click();

    await expect(page.getByRole('alert')).toContainText('License assigned successfully');
  });
});

// apps/e2e/tests/users/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('should invite a new user', async ({ page }) => {
    await page.goto('/home/test-account/users');
    await page.getByTestId('invite-user-button').click();

    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Role').selectOption('member');
    await page.getByTestId('submit-invitation').click();

    await expect(page.getByRole('alert')).toContainText('Invitation sent successfully');
  });

  test('should change user role', async ({ page }) => {
    await page.goto('/home/test-account/users');
    await page.getByText('John Doe').click();
    await page.getByTestId('change-role-button').click();
    await page.getByLabel('New Role').selectOption('admin');
    await page.getByTestId('confirm-role-change').click();

    await expect(page.getByRole('alert')).toContainText('Role updated successfully');
    await expect(page.getByText('Admin')).toBeVisible();
  });

  test('should view user activity log', async ({ page }) => {
    await page.goto('/home/test-account/users');
    await page.getByText('John Doe').click();
    await page.getByTestId('activity-tab').click();

    await expect(page.getByTestId('activity-entry')).toHaveCount(await page.getByTestId('activity-entry').count());
  });
});

// apps/e2e/tests/dashboards/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display key metrics', async ({ page }) => {
    await page.goto('/home/test-account');

    await expect(page.getByTestId('total-assets-metric')).toBeVisible();
    await expect(page.getByTestId('assigned-assets-metric')).toBeVisible();
    await expect(page.getByTestId('expiring-licenses-metric')).toBeVisible();
  });

  test('should filter dashboard data by date range', async ({ page }) => {
    await page.goto('/home/test-account');
    
    await page.getByTestId('date-range-filter').click();
    await page.getByText('Last 30 days').click();

    // Wait for data to reload
    await page.waitForLoadState('networkidle');

    // Verify metrics updated
    await expect(page.getByTestId('total-assets-metric')).toBeVisible();
  });
});
```

### Performance Monitoring

#### Web Vitals Tracking

```typescript
// apps/web/app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }
  });

  return null;
}
```

#### Performance Monitoring Utility

```typescript
// packages/shared/src/lib/performance.ts
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }) as Promise<T>;
  }
  
  const duration = performance.now() - start;
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  
  return result;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  
  return Promise.race([promise, timeout]);
}
```

### Accessibility Components

#### Skip Navigation

```typescript
// apps/web/app/_components/skip-nav.tsx
'use client';

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Skip to main content
    </a>
  );
}
```

#### Keyboard Navigation Hook

```typescript
// packages/shared/src/hooks/use-keyboard-navigation.ts
'use client';

import { useEffect } from 'react';

export function useKeyboardNavigation(
  onEscape?: () => void,
  onEnter?: () => void
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
      
      if (event.key === 'Enter' && onEnter) {
        onEnter();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
}
```

### Documentation Components

#### Inline Help Component

```typescript
// packages/ui/src/inline-help.tsx
'use client';

import { HelpCircle } from 'lucide-react';
import { Tooltip } from './tooltip';

interface InlineHelpProps {
  content: string;
  title?: string;
}

export function InlineHelp({ content, title }: InlineHelpProps) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        className="inline-flex items-center text-muted-foreground hover:text-foreground"
        aria-label={title || 'Help'}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
    </Tooltip>
  );
}
```

#### User Guide Structure

```markdown
# User Guide Structure

docs/user-guide/
├── index.md                    # Overview and getting started
├── assets/
│   ├── creating-assets.md      # How to create assets
│   ├── assigning-assets.md     # How to assign assets
│   ├── maintenance.md          # Asset maintenance workflows
│   └── reporting.md            # Asset reports
├── licenses/
│   ├── managing-licenses.md    # License management
│   ├── assignments.md          # License assignments
│   └── renewals.md             # Renewal alerts
├── users/
│   ├── inviting-users.md       # User invitations
│   ├── roles-permissions.md    # Roles and permissions
│   └── activity-tracking.md    # Activity logs
├── dashboards/
│   ├── overview.md             # Dashboard overview
│   └── customization.md        # Customizing dashboards
└── faq.md                      # Frequently asked questions
```

## Data Models

### Performance Metrics

```typescript
interface PerformanceMetrics {
  page_load_time: number;
  time_to_interactive: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  cumulative_layout_shift: number;
  first_input_delay: number;
}

interface PagePerformance {
  url: string;
  metrics: PerformanceMetrics;
  timestamp: string;
  user_agent: string;
}
```

### Bug Tracking

```typescript
interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reproduction_steps: string[];
  affected_features: string[];
  reported_by: string;
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
}
```

## Error Handling

### Performance Degradation

- Monitor performance metrics continuously
- Alert when metrics fall below thresholds
- Implement graceful degradation for slow connections
- Provide feedback to users during slow operations

### Test Failures

- Capture screenshots on test failure
- Record video of failed test runs
- Generate detailed error reports
- Retry flaky tests automatically

### Accessibility Issues

- Run automated accessibility audits
- Manual testing with screen readers
- Keyboard navigation testing
- Color contrast verification

## Testing Strategy

### E2E Test Coverage

**Critical Flows (Must Test)**:
1. Asset creation and management
2. License creation and assignment
3. User invitation and role management
4. Dashboard data visualization
5. Authentication and authorization
6. Search and filtering
7. Form validation and error handling

**Test Organization**:
- Group tests by feature area
- Use descriptive test names
- Implement reusable test utilities
- Maintain test data fixtures

**CI Integration**:
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm supabase:web:start
      - run: pnpm dev &
      - run: pnpm --filter web-e2e test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: apps/e2e/playwright-report/
```

### Performance Testing

- Lighthouse CI for automated audits
- Load testing with realistic data volumes
- Network throttling tests
- Mobile device testing

### Accessibility Testing

- Automated tools (axe-core, Lighthouse)
- Manual screen reader testing
- Keyboard navigation testing
- Color contrast verification

## Performance Considerations

### Optimization Techniques

**Code Splitting**:
- Dynamic imports for heavy components
- Route-based code splitting
- Lazy loading for below-fold content

**Image Optimization**:
- Next.js Image component for automatic optimization
- WebP/AVIF format support
- Responsive images with srcset
- Lazy loading with blur placeholders

**Data Fetching**:
- Server-side rendering for initial load
- Streaming for large datasets
- Pagination for lists
- Debounced search inputs

**Caching**:
- Next.js automatic caching
- Stale-while-revalidate strategy
- CDN caching for static assets
- Browser caching headers

### Bundle Size Optimization

```typescript
// next.config.js optimizations
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

## Security Considerations

### Performance Monitoring

- Sanitize URLs before logging
- Avoid logging sensitive user data
- Rate limit performance reporting endpoints

### E2E Tests

- Use test-specific accounts
- Clean up test data after runs
- Secure test credentials
- Isolate test environment

## Implementation Phases

### Phase 1: Performance Audit and Baseline
- Run Lighthouse audits on all main pages
- Measure current Web Vitals
- Identify performance bottlenecks
- Document baseline metrics

### Phase 2: Core Performance Optimizations
- Implement image optimization
- Add loading states to all async operations
- Optimize database queries
- Implement code splitting

### Phase 3: UX Improvements
- Add toast notification system
- Implement tooltips for all icons
- Add keyboard navigation support
- Improve error messages

### Phase 4: E2E Testing Infrastructure
- Set up Playwright test utilities
- Create test helpers for common operations
- Implement test data fixtures
- Configure CI integration

### Phase 5: E2E Test Implementation
- Write tests for asset management flows
- Write tests for license management flows
- Write tests for user management flows
- Write tests for dashboard functionality

### Phase 6: Accessibility Compliance
- Add ARIA labels to all interactive elements
- Implement skip navigation
- Ensure keyboard navigation works
- Verify color contrast ratios

### Phase 7: Bug Resolution
- Identify and document all known bugs
- Prioritize bugs by severity
- Fix critical and high-priority bugs
- Add regression tests for fixed bugs

### Phase 8: Documentation
- Write user guide for all features
- Create video tutorials for complex workflows
- Add inline help to forms
- Create FAQ section

### Phase 9: Final Optimization and Polish
- Run final performance audits
- Verify all tests pass
- Complete accessibility audit
- Final code quality checks

## Success Metrics

### Performance Targets

- Lighthouse Performance Score: ≥ 85
- First Contentful Paint: ≤ 1.5s
- Largest Contentful Paint: ≤ 2.5s
- Time to Interactive: ≤ 3.5s
- Cumulative Layout Shift: ≤ 0.1

### Test Coverage Targets

- E2E test execution time: ≤ 10 minutes
- Test success rate: ≥ 95%
- Critical flow coverage: 100%

### Accessibility Targets

- WCAG 2.1 Level AA compliance: 100%
- Keyboard navigation: All features accessible
- Screen reader compatibility: Full support

### Code Quality Targets

- TypeScript errors: 0
- ESLint warnings: 0
- Code coverage: ≥ 70% for critical logic
