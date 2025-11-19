'use client';

import { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@kit/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
      <div className="text-destructive flex items-center gap-2">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        <h2 className="text-2xl font-semibold">Dashboard Error</h2>
      </div>

      <p className="text-muted-foreground max-w-md text-center">
        We encountered an error while loading your dashboard. This could be due
        to a temporary issue with data loading or connectivity.
      </p>

      {error.message && (
        <p className="text-muted-foreground max-w-md text-center text-sm">
          Error: {error.message}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Page
        </Button>
      </div>
    </div>
  );
}
