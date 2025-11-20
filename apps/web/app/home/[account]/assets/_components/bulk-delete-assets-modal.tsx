'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { BulkActionModal } from '@kit/ui/modal';
import type { BulkActionResult } from '@kit/ui/modal';
import { toast } from '@kit/ui/sonner';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';
import { bulkDeleteAssets } from '../_lib/server/assets-server-actions';

interface BulkDeleteAssetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: AssetWithUser[];
  accountSlug: string;
  onSuccess?: () => void;
}

/**
 * BulkDeleteAssetsModal - Modal for bulk deleting assets
 *
 * Features:
 * - Confirmation with asset preview
 * - Progress tracking during deletion
 * - Results summary with success/failure breakdown
 * - Error handling for failed deletions
 *
 * @example
 * ```tsx
 * <BulkDeleteAssetsModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   assets={selectedAssets}
 *   accountSlug={accountSlug}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export function BulkDeleteAssetsModal({
  open,
  onOpenChange,
  assets,
  accountSlug,
  onSuccess,
}: BulkDeleteAssetsModalProps) {
  const router = useRouter();

  const handleConfirm = React.useCallback(
    async (assetIds: string[]): Promise<BulkActionResult> => {
      try {
        const result = await bulkDeleteAssets({
          accountSlug,
          assetIds,
        });

        if (result.data) {
          // Show success toast
          if (result.data.successful.length > 0) {
            toast.success('Assets deleted', {
              description: `Successfully deleted ${result.data.successful.length} ${
                result.data.successful.length === 1 ? 'asset' : 'assets'
              }.`,
            });
          }

          // Show error toast if there were failures
          if (result.data.failed.length > 0) {
            toast.error('Some deletions failed', {
              description: `${result.data.failed.length} ${
                result.data.failed.length === 1 ? 'asset' : 'assets'
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
          failed: assetIds.map((id) => ({
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
          failed: assetIds.map((id) => ({
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
      itemCount={assets.length}
      items={assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
      }))}
      onConfirm={handleConfirm}
      destructive
      confirmLabel={`Delete ${assets.length} ${assets.length === 1 ? 'Asset' : 'Assets'}`}
    />
  );
}
