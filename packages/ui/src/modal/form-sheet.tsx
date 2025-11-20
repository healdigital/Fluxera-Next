'use client';

import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { useFocusReturn } from '../hooks/use-focus-return';
import { useScreenReaderAnnounce } from '../hooks/use-screen-reader-announce';
import { useUnsavedChanges } from '../hooks/use-unsaved-changes';
import { cn } from '../lib/utils';
import { LoadingSpinner } from '../makerkit/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../shadcn/alert-dialog';
import { Button } from '../shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../shadcn/sheet';

const formSheetVariants = cva('', {
  variants: {
    size: {
      sm: 'w-full sm:max-w-sm',
      md: 'w-full sm:max-w-md',
      lg: 'w-full sm:max-w-lg',
      xl: 'w-full sm:max-w-xl',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export interface FormSheetProps extends VariantProps<typeof formSheetVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  dirty?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * FormSheet - Slide-in panel for create/edit forms
 *
 * Features:
 * - Configurable slide direction (left, right, top, bottom)
 * - Configurable size variants (sm, md, lg, xl)
 * - Unsaved changes warning on close
 * - Form submission handling
 * - Loading states during submission
 * - Sticky header and footer
 *
 * @example
 * ```tsx
 * <FormSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Create New Asset"
 *   description="Add a new asset to your inventory"
 *   side="right"
 *   size="lg"
 *   dirty={form.formState.isDirty}
 *   onSubmit={handleSubmit}
 *   submitLabel="Create Asset"
 * >
 *   <CreateAssetForm />
 * </FormSheet>
 * ```
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  children,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  dirty = false,
  showFooter = true,
  size,
  className,
}: FormSheetProps) {
  // Ensure focus returns to trigger element on close
  useFocusReturn(open);

  // Announce sheet opening to screen readers
  useScreenReaderAnnounce(
    `${title} form opened. ${description || ''}`,
    open,
    'polite'
  );

  const { showWarning, handleClose, confirmClose, cancelClose } =
    useUnsavedChanges(dirty);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Attempting to close
        const canClose = handleClose();
        if (canClose) {
          onOpenChange(false);
        }
      } else {
        onOpenChange(true);
      }
    },
    [handleClose, onOpenChange],
  );

  const handleConfirmClose = React.useCallback(() => {
    confirmClose();
    onOpenChange(false);
  }, [confirmClose, onOpenChange]);

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side={side}
          className={cn(
            'flex flex-col',
            'p-4 sm:p-6', // Responsive padding
            formSheetVariants({ size }),
            className,
          )}
          aria-describedby={description ? 'form-sheet-description' : undefined}
        >
          {/* Sticky Header */}
          <SheetHeader className="shrink-0">
            <SheetTitle>{title}</SheetTitle>
            {description && (
              <SheetDescription id="form-sheet-description">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              children
            )}
          </div>

          {/* Sticky Footer */}
          {showFooter && (
            <SheetFooter className="shrink-0 border-t pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                aria-label={`${cancelLabel} and close form`}
                className="min-h-[44px]" // Touch-friendly
              >
                {cancelLabel}
              </Button>
              {onSubmit && (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={loading}
                  className="relative min-h-[44px]" // Touch-friendly
                  aria-label={`${submitLabel} form`}
                  aria-busy={loading}
                >
                  {loading && (
                    <LoadingSpinner className="absolute left-3 h-4 w-4" aria-hidden="true" />
                  )}
                  <span className={loading ? 'invisible' : ''}>
                    {submitLabel}
                  </span>
                </Button>
              )}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={cancelClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close this
              form? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClose}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
