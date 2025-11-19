'use client';

import { cn } from '../lib/utils';

/**
 * Skip Navigation Link
 * Allows keyboard users to skip directly to main content
 * Meets WCAG 2.1 Level AA requirement 2.4.1 (Bypass Blocks)
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-[9999]',
        'bg-primary rounded-md px-4 py-2',
        'text-primary-foreground text-sm font-medium',
        'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
        'transition-all',
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Main Content Wrapper
 * Provides the target anchor for skip navigation
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      id="main-content"
      className={cn('focus:outline-none', className)}
      tabIndex={-1}
    >
      {children}
    </main>
  );
}
