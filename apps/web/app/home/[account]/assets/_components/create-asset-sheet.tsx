'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { FormSheet } from '@kit/ui/modal';
import { toast } from '@kit/ui/sonner';

import { CreateAssetForm } from './create-asset-form';

interface CreateAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountSlug: string;
  onSuccess?: () => void;
}

/**
 * CreateAssetSheet - Wraps CreateAssetForm in a FormSheet
 *
 * Features:
 * - Slide-in sheet from the right
 * - Unsaved changes warning
 * - Optimistic UI update on success
 * - Toast notifications
 */
export function CreateAssetSheet({
  open,
  onOpenChange,
  accountSlug,
  onSuccess,
}: CreateAssetSheetProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSuccess = () => {
    startTransition(() => {
      // Show success toast
      toast.success('Asset created', {
        description: 'The asset has been successfully created.',
      });

      // Close the sheet
      onOpenChange(false);

      // Reset dirty state
      setIsDirty(false);

      // Call optional success callback
      if (onSuccess) {
        onSuccess();
      }

      // Refresh the page to show the new asset
      router.refresh();
    });
  };

  const handleError = (error: Error) => {
    // Handle redirect errors from Next.js
    if (isRedirectError(error)) {
      throw error;
    }

    toast.error('Error', {
      description: error.message || 'Failed to create asset',
    });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Asset"
      description="Add a new asset to your inventory"
      side="right"
      size="xl"
      dirty={isDirty}
      showFooter={false}
    >
      <CreateAssetForm
        accountSlug={accountSlug}
        onSuccess={handleSuccess}
        onError={handleError}
        onDirtyChange={setIsDirty}
      />
    </FormSheet>
  );
}
