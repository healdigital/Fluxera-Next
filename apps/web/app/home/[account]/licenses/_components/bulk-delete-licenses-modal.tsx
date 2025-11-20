'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { BulkActionModal } from '@kit/ui/modal';
import type { BulkActionResult } from '@kit/ui/modal';
import { toast } from '@kit/ui/sonner';

import { type LicenseWithAssignments } from '../_lib/server/licenses-page.loader';
import { bulkDeleteLicenses } from '../_lib/server/licenses-server-actions';

interface BulkDeleteLicensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenses: LicenseWithAssignments[];
  accountSlug: string;
  onSuccess?: () => void;
}

/**
 * BulkDeleteLicensesModal - Modal for bulk deleting licenses
 *
 * Features:
 * - Confirmation with license preview
 * - Progress tracking during deletion
 * - Results summary with success/failure breakdown
 * - Error handling for failed deletions
 * - Cascade deletes all assignments
 *
 * @example
 * ```tsx
 * <BulkDeleteLicensesModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   licenses={selectedLicenses}
 *   accountSlug={accountSlug}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export function BulkDeleteLicensesModal({
  open,
  onOpenChange,
  licenses,
  accountSlug,
  onSuccess,
}: BulkDeleteLicensesModalProps) {
  const router = useRouter();

  const handleConfirm = React.useCallback(
    async (licenseIds: string[]): Promise<BulkActionResult> => {
      try {
        const result = await bulkDeleteLicenses({
          accountSlug,
          licenseIds,
        });

        if (result.data) {
          // Show success toast
          if (result.data.successful.length > 0) {
            toast.success('Licenses deleted', {
              description: `Successfully deleted ${result.data.successful.length} ${
                result.data.successful.length === 1 ? 'license' : 'licenses'
              }.`,
            });
          }

          // Show error toast if there were failures
          if (result.data.failed.length > 0) {
            toast.error('Some deletions failed', {
              description: `${result.data.failed.length} ${
                result.data.failed.length === 1 ? 'license' : 'licenses'
              } could not be deleted.`,
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
        console.error('Bulk delete error:', error);

        toast.error('Bulk delete failed', {
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
    [accountSlug, router, onSuccess],
  );

  return (
    <BulkActionModal
      open={open}
      onOpenChange={onOpenChange}
      action="Delete"
      itemCount={licenses.length}
      items={licenses.map((license) => ({
        id: license.id,
        name: `${license.name} (${license.vendor})`,
      }))}
      onConfirm={handleConfirm}
      destructive
      confirmLabel={`Delete ${licenses.length} ${licenses.length === 1 ? 'License' : 'Licenses'}`}
    />
  );
}
