/**
 * Modal Skeleton Loaders
 *
 * Skeleton loading components for data-heavy modals to improve perceived performance.
 *
 * Requirements: 10.2, 10.3 - Loading states and skeleton loaders
 */

import { Skeleton } from '../shadcn/skeleton';

/**
 * QuickViewModalSkeleton - Skeleton loader for QuickViewModal
 *
 * Displays a skeleton structure while modal data is loading
 */
export function QuickViewModalSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>

      {/* Additional fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * FormSheetSkeleton - Skeleton loader for FormSheet
 *
 * Displays a skeleton form structure while form is initializing
 */
export function FormSheetSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form fields */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}

      {/* Textarea field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Select field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/**
 * AssignmentModalSkeleton - Skeleton loader for AssignmentModal
 *
 * Displays a skeleton user list while users are loading
 */
export function AssignmentModalSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* User list skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * BulkActionModalSkeleton - Skeleton loader for BulkActionModal
 *
 * Displays a skeleton structure while bulk action is initializing
 */
export function BulkActionModalSkeleton() {
  return (
    <div className="space-y-4">
      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Item list skeleton */}
      <div className="space-y-2 rounded-md border p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Warning skeleton */}
      <div className="rounded-lg border p-4">
        <Skeleton className="h-5 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

/**
 * DashboardWidgetSkeleton - Skeleton loader for ExpandedWidgetModal
 *
 * Displays a skeleton chart/data structure while widget data is loading
 */
export function DashboardWidgetSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Chart skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Data table skeleton */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * GenericModalSkeleton - Generic skeleton loader for any modal
 *
 * @param lines - Number of content lines to display
 */
export function GenericModalSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
