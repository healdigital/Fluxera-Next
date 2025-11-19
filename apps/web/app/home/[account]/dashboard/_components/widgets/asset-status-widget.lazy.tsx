'use client';

import dynamic from 'next/dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

/**
 * Lazy-loaded Asset Status Widget
 * Uses dynamic import to code-split the recharts library
 */
export const AssetStatusWidget = dynamic(
  () =>
    import('./asset-status-widget').then((mod) => ({
      default: mod.AssetStatusWidget,
    })),
  {
    loading: () => <AssetStatusWidgetSkeleton />,
    ssr: false,
  },
);

function AssetStatusWidgetSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
