'use client';

import { useState } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import { deleteAsset } from '../_lib/server/assets-server-actions';

interface DeleteAssetDialogProps {
  assetId: string;
  assetName: string;
  accountSlug: string;
  hasActiveAssignment?: boolean;
  children: React.ReactNode;
}

export function DeleteAssetDialog({
  assetId,
  assetName,
  accountSlug,
  hasActiveAssignment = false,
  children,
}: DeleteAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const result = await deleteAsset({ id: assetId });

      if (result.success) {
        toast.success(
          <Trans
            i18nKey="assets:deleteAssetSuccess"
            defaults="Asset deleted successfully"
          />,
        );
        setOpen(false);
        // Redirect to assets list after successful deletion
        router.push(`/home/${accountSlug}/assets`);
      } else {
        toast.error(
          result.message || (
            <Trans
              i18nKey="assets:deleteAssetError"
              defaults="Failed to delete asset"
            />
          ),
        );
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      console.error('Error deleting asset:', error);
      toast.error(
        <Trans
          i18nKey="assets:deleteAssetUnexpectedError"
          defaults="An unexpected error occurred"
        />,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        aria-labelledby="delete-asset-title"
        aria-describedby="delete-asset-description"
      >
        <AlertDialogHeader>
          <AlertDialogTitle id="delete-asset-title">
            <Trans i18nKey="assets:deleteAsset" defaults="Delete Asset" />
          </AlertDialogTitle>
          <AlertDialogDescription
            id="delete-asset-description"
            className="space-y-2"
          >
            <p>
              <Trans
                i18nKey="assets:deleteAssetConfirmation"
                defaults="Are you sure you want to delete <strong>{{assetName}}</strong>? This action cannot be undone."
                values={{ assetName }}
                components={{ strong: <strong /> }}
              />
            </p>
            {hasActiveAssignment && (
              <p className="font-medium text-orange-600">
                <Trans
                  i18nKey="assets:deleteAssetWarning"
                  defaults="Warning: This asset is currently assigned to a user. Deleting it will remove the assignment."
                />
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} aria-label="Cancel deletion">
            <Trans i18nKey="common:cancel" defaults="Cancel" />
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
            aria-label={
              isLoading ? 'Deleting asset' : `Delete asset ${assetName}`
            }
          >
            {isLoading ? (
              <>
                <Trash2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                <Trans i18nKey="assets:deleting" defaults="Deleting..." />
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                <Trans i18nKey="assets:delete" defaults="Delete" />
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
