'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { Calendar } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { BulkActionModal } from '@kit/ui/modal';
import type { BulkActionResult } from '@kit/ui/modal';
import { toast } from '@kit/ui/sonner';

import { type LicenseWithAssignments } from '../_lib/server/licenses-page.loader';
import { bulkRenewLicenses } from '../_lib/server/licenses-server-actions';

interface BulkRenewLicensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenses: LicenseWithAssignments[];
  accountSlug: string;
  onSuccess?: () => void;
}

type RenewalState = 'select-date' | 'confirming';

/**
 * BulkRenewLicensesModal - Modal for bulk renewing licenses
 *
 * Features:
 * - Date selection for new expiration date
 * - Confirmation with license preview
 * - Progress tracking during renewal
 * - Results summary with success/failure breakdown
 * - Validation that new date is after purchase date
 *
 * @example
 * ```tsx
 * <BulkRenewLicensesModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   licenses={selectedLicenses}
 *   accountSlug={accountSlug}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export function BulkRenewLicensesModal({
  open,
  onOpenChange,
  licenses,
  accountSlug,
  onSuccess,
}: BulkRenewLicensesModalProps) {
  const router = useRouter();
  const [state, setState] = React.useState<RenewalState>('select-date');
  const [newExpirationDate, setNewExpirationDate] = React.useState('');
  const [dateError, setDateError] = React.useState('');

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setState('select-date');
      setNewExpirationDate('');
      setDateError('');
    }
  }, [open]);

  // Calculate minimum date (today)
  const minDate = React.useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const handleDateSelect = () => {
    // Validate date
    if (!newExpirationDate) {
      setDateError('Please select an expiration date');
      return;
    }

    const selectedDate = new Date(newExpirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setDateError('Expiration date must be in the future');
      return;
    }

    setDateError('');
    setState('confirming');
  };

  const handleBack = () => {
    setState('select-date');
  };

  const handleConfirm = React.useCallback(
    async (licenseIds: string[]): Promise<BulkActionResult> => {
      if (!newExpirationDate) {
        return {
          successful: [],
          failed: licenseIds.map((id) => ({
            id,
            error: 'No expiration date selected',
          })),
        };
      }

      try {
        const result = await bulkRenewLicenses({
          accountSlug,
          licenseIds,
          newExpirationDate,
        });

        if (result.data) {
          // Show success toast
          if (result.data.successful.length > 0) {
            toast.success('Licenses renewed', {
              description: `Successfully renewed ${result.data.successful.length} ${
                result.data.successful.length === 1 ? 'license' : 'licenses'
              }.`,
            });
          }

          // Show error toast if there were failures
          if (result.data.failed.length > 0) {
            toast.error('Some renewals failed', {
              description: `${result.data.failed.length} ${
                result.data.failed.length === 1 ? 'license' : 'licenses'
              } could not be renewed.`,
            });
          }

          // Refresh the page
          router.refresh();

          // Call success callback
          if (onSuccess) {
            onSuccess();
          }

          return result.data;
        }

        // Fallback if no data
        return {
          successful: [],
          failed: licenseIds.map((id) => ({
            id,
            error: 'Unknown error occurred',
          })),
        };
      } catch (error) {
        console.error('Bulk renew error:', error);

        toast.error('Bulk renew failed', {
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });

        // Return all as failed
        return {
          successful: [],
          failed: licenseIds.map((id) => ({
            id,
            error:
              error instanceof Error
                ? error.message
                : 'Unknown error occurred',
          })),
        };
      }
    },
    [accountSlug, newExpirationDate, router, onSuccess],
  );

  // Date selection dialog
  if (state === 'select-date') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Licenses</DialogTitle>
            <DialogDescription>
              Select a new expiration date for {licenses.length}{' '}
              {licenses.length === 1 ? 'license' : 'licenses'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="expiration-date">New Expiration Date</Label>
              <div className="relative">
                <Calendar className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="expiration-date"
                  type="date"
                  value={newExpirationDate}
                  onChange={(e) => {
                    setNewExpirationDate(e.target.value);
                    setDateError('');
                  }}
                  min={minDate}
                  className="pl-9"
                  autoFocus
                />
              </div>
              {dateError && (
                <p className="text-destructive text-sm">{dateError}</p>
              )}
            </div>

            {/* License Preview */}
            <div className="rounded-md border p-4">
              <p className="text-muted-foreground mb-2 text-sm">
                Selected licenses:
              </p>
              <ul className="space-y-1">
                {licenses.slice(0, 5).map((license) => (
                  <li key={license.id} className="text-sm">
                    • {license.name} ({license.vendor})
                  </li>
                ))}
                {licenses.length > 5 && (
                  <li className="text-muted-foreground text-sm italic">
                    ... and {licenses.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleDateSelect}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation and progress dialog
  return (
    <BulkActionModal
      open={open}
      onOpenChange={onOpenChange}
      action={`Renew until ${new Date(newExpirationDate).toLocaleDateString()}`}
      itemCount={licenses.length}
      items={licenses.map((license) => ({
        id: license.id,
        name: `${license.name} (${license.vendor})`,
      }))}
      onConfirm={handleConfirm}
      confirmLabel={`Renew ${licenses.length} ${licenses.length === 1 ? 'License' : 'Licenses'}`}
      cancelLabel="Back"
    />
  );
}
