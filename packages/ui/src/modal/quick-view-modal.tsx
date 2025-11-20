'use client';

import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { useFocusReturn } from '../hooks/use-focus-return';
import { useScreenReaderAnnounce } from '../hooks/use-screen-reader-announce';
import { cn } from '../lib/utils';
import { LoadingSpinner } from '../makerkit/loading-spinner';
import { Button } from '../shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../shadcn/dialog';

const quickViewModalVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-sm sm:max-w-sm',
      md: 'max-w-md sm:max-w-md',
      lg: 'max-w-lg sm:max-w-lg',
      xl: 'max-w-xl sm:max-w-xl',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export interface QuickAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface QuickViewModalProps<T>
  extends VariantProps<typeof quickViewModalVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  data?: T;
  loading?: boolean;
  actions?: QuickAction[];
  onNavigate?: (direction: 'prev' | 'next') => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * QuickViewModal - Display entity details in a modal without navigation
 *
 * Features:
 * - Configurable size variants (sm, md, lg, xl)
 * - Quick action buttons in header
 * - Keyboard navigation (Escape to close, Arrow keys for prev/next)
 * - Loading states
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <QuickViewModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title={asset.name}
 *   data={asset}
 *   size="lg"
 *   actions={[
 *     { label: 'Edit', icon: Edit, onClick: handleEdit },
 *     { label: 'Delete', icon: Trash, onClick: handleDelete, variant: 'destructive' }
 *   ]}
 *   onNavigate={handleNavigate}
 * >
 *   <AssetDetailsContent asset={asset} />
 * </QuickViewModal>
 * ```
 */
export function QuickViewModal<T>({
  open,
  onOpenChange,
  title,
  description,
  loading = false,
  actions = [],
  onNavigate,
  children,
  size,
  className,
}: QuickViewModalProps<T>) {
  // Ensure focus returns to trigger element on close
  useFocusReturn(open);

  // Announce modal opening to screen readers
  useScreenReaderAnnounce(
    `${title} dialog opened. ${description || ''}`,
    open,
    'polite'
  );

  // Handle keyboard navigation for prev/next
  React.useEffect(() => {
    if (!open || !onNavigate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onNavigate, title, description]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          quickViewModalVariants({ size }),
          'max-h-[90vh] overflow-y-auto',
          'p-4 sm:p-6', // Responsive padding
          className
        )}
        aria-describedby={description ? 'quick-view-description' : undefined}
      >
        <DialogHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-1.5">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription id="quick-view-description">
                  {description}
                </DialogDescription>
              )}
            </div>
            {actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quick actions">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={action.onClick}
                      disabled={action.disabled || loading}
                      className="shrink-0 min-h-[44px] min-w-[44px]" // Touch-friendly size
                      aria-label={action.label}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" aria-hidden="true" />}
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{Icon ? '' : action.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="relative">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">{children}</div>
          )}
        </div>

        {onNavigate && !loading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
            <kbd className="bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              ←
            </kbd>
            <kbd className="bg-muted pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              →
            </kbd>
            <span>Navigate between items</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
