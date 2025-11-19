'use client';

import { useState } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { UserMinus } from 'lucide-react';

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

import { unassignAsset } from '../_lib/server/assets-server-actions';

interface UnassignAssetDialogProps {
  assetId: string;
  assetName: string;
  assignedUserName: string;
  children: React.ReactNode;
}

export function UnassignAssetDialog({
  assetId,
  assetName,
  assignedUserName,
  children,
}: UnassignAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUnassign = async () => {
    setIsLoading(true);

    try {
      const result = await unassignAsset({ asset_id: assetId });

      if (result.success) {
        toast.success('Asset unassigned successfully');
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      console.error('Error unassigning asset:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent
        aria-labelledby="unassign-asset-title"
        aria-describedby="unassign-asset-description"
      >
        <AlertDialogHeader>
          <AlertDialogTitle id="unassign-asset-title">
            Unassign Asset
          </AlertDialogTitle>
          <AlertDialogDescription id="unassign-asset-description">
            Are you sure you want to unassign <strong>{assetName}</strong> from{' '}
            <strong>{assignedUserName}</strong>? The asset status will be
            changed to &quot;Available&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            aria-label="Cancel unassignment"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnassign}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
            aria-label={
              isLoading
                ? 'Unassigning asset'
                : `Unassign ${assetName} from ${assignedUserName}`
            }
          >
            {isLoading ? (
              <>
                <UserMinus
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Unassigning...
              </>
            ) : (
              <>
                <UserMinus className="mr-2 h-4 w-4" aria-hidden="true" />
                Unassign
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
