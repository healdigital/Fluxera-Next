'use client';

import { cn } from '../lib/utils/cn';
import { Spinner } from './spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component with optional label and full-screen mode
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" label="Loading data..." />
 * <LoadingSpinner fullScreen />
 * ```
 */
function LoadingSpinner({
  size = 'md',
  className,
  label,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} aria-hidden="true" />
      {label && <p className="text-muted-foreground text-sm">{label}</p>}
      {!label && <span className="sr-only">Loading...</span>}
    </div>
  );

  return content;
}

export { LoadingSpinner };
