'use client';

import * as React from 'react';

import { useFocusReturn } from '../hooks/use-focus-return';
import { useScreenReaderAnnounce } from '../hooks/use-screen-reader-announce';
import { LoadingSpinner } from '../makerkit/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '../shadcn/alert';
import { Button } from '../shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shadcn/dialog';
import { Progress } from '../shadcn/progress';
import { ScrollArea } from '../shadcn/scroll-area';

export interface BulkActionItem {
  id: string;
  name: string;
}

export interface BulkActionResult {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
}

export interface BulkActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  itemCount: number;
  items: BulkActionItem[];
  onConfirm: (itemIds: string[]) => Promise<BulkActionResult>;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

type BulkActionState = 'confirm' | 'processing' | 'results';

/**
 * BulkActionModal - Handle bulk operations with progress tracking
 *
 * Features:
 * - Confirmation with item preview
 * - Progress indicator during execution
 * - Results summary with success/failure breakdown
 * - Cancellation support
 * - Error details for failed items
 *
 * @example
 * ```tsx
 * <BulkActionModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   action="Delete"
 *   itemCount={selectedAssets.length}
 *   items={selectedAssets}
 *   onConfirm={handleBulkDelete}
 *   destructive
 * />
 * ```
 */
export function BulkActionModal({
  open,
  onOpenChange,
  action,
  itemCount,
  items,
  onConfirm,
  destructive = false,
  confirmLabel,
  cancelLabel = 'Cancel',
}: BulkActionModalProps) {
  // Ensure focus returns to trigger element on close
  useFocusReturn(open);

  const [state, setState] = React.useState<BulkActionState>('confirm');
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<BulkActionResult | null>(null);
  const [isCancelled, setIsCancelled] = React.useState(false);

  // Announce state changes to screen readers
  const stateMessage = React.useMemo(() => {
    if (state === 'confirm') {
      return `Bulk ${action} confirmation dialog opened for ${itemCount} items.`;
    } else if (state === 'processing') {
      return `Processing ${action} operation. ${Math.round(progress)}% complete.`;
    } else if (state === 'results' && result) {
      return `Operation complete. ${result.successful.length} succeeded, ${result.failed.length} failed.`;
    }
    return '';
  }, [state, action, itemCount, progress, result]);

  useScreenReaderAnnounce(stateMessage, open, state === 'results' ? 'assertive' : 'polite');

  const handleConfirm = React.useCallback(async () => {
    setState('processing');
    setProgress(0);
    setIsCancelled(false);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const actionResult = await onConfirm(items.map((item) => item.id));

      clearInterval(progressInterval);
      setProgress(100);
      setResult(actionResult);
      setState('results');
    } catch (error) {
      console.error('Bulk action failed:', error);
      setState('confirm');
    }
  }, [items, onConfirm]);

  const handleCancel = React.useCallback(() => {
    if (state === 'processing') {
      setIsCancelled(true);
      // In a real implementation, this would cancel the ongoing operation
    }
    onOpenChange(false);
  }, [state, onOpenChange]);

  const handleClose = React.useCallback(() => {
    setState('confirm');
    setProgress(0);
    setResult(null);
    setIsCancelled(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setState('confirm');
      setProgress(0);
      setResult(null);
      setIsCancelled(false);
    }
  }, [open]);

  const defaultConfirmLabel = confirmLabel || `${action} ${itemCount} Items`;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {/* Confirmation State */}
        {state === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>
                {action} {itemCount} {itemCount === 1 ? 'Item' : 'Items'}?
              </DialogTitle>
              <DialogDescription>
                {destructive
                  ? 'This action cannot be undone. The following items will be permanently deleted.'
                  : `The following items will be affected by this action.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Item Preview */}
              <ScrollArea className="max-h-[200px] rounded-md border">
                <div className="p-4">
                  <ul className="space-y-2">
                    {items.slice(0, 10).map((item) => (
                      <li key={item.id} className="text-sm">
                        • {item.name}
                      </li>
                    ))}
                    {items.length > 10 && (
                      <li className="text-muted-foreground text-sm italic">
                        ... and {items.length - 10} more
                      </li>
                    )}
                  </ul>
                </div>
              </ScrollArea>

              {destructive && (
                <Alert variant="destructive">
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This action is permanent and cannot be undone.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? 'destructive' : 'default'}
                onClick={handleConfirm}
              >
                {defaultConfirmLabel}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Processing State */}
        {state === 'processing' && (
          <>
            <DialogHeader>
              <DialogTitle>Processing...</DialogTitle>
              <DialogDescription>
                Please wait while we process your request.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center" role="status" aria-live="polite">
                <LoadingSpinner className="h-8 w-8" aria-label="Processing" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="text-muted-foreground" aria-live="polite" aria-atomic="true">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2" 
                  aria-label={`Progress: ${Math.round(progress)}%`}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              <p className="text-muted-foreground text-center text-sm" role="status">
                Processing {itemCount} {itemCount === 1 ? 'item' : 'items'}...
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isCancelled}
              >
                {isCancelled ? 'Cancelling...' : 'Cancel'}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Results State */}
        {state === 'results' && result && (
          <>
            <DialogHeader>
              <DialogTitle>Operation Complete</DialogTitle>
              <DialogDescription>
                {result.failed.length === 0
                  ? 'All items were processed successfully.'
                  : `${result.successful.length} succeeded, ${result.failed.length} failed.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Success Summary */}
              {result.successful.length > 0 && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    {result.successful.length}{' '}
                    {result.successful.length === 1 ? 'item' : 'items'}{' '}
                    processed successfully.
                  </AlertDescription>
                </Alert>
              )}

              {/* Failure Details */}
              {result.failed.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Errors</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="mt-2 max-h-[150px]">
                      <ul className="space-y-2">
                        {result.failed.map((failure) => {
                          const item = items.find((i) => i.id === failure.id);
                          return (
                            <li key={failure.id} className="text-sm">
                              <strong>{item?.name || failure.id}</strong>:{' '}
                              {failure.error}
                            </li>
                          );
                        })}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
