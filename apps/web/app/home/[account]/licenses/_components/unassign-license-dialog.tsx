'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { toast } from '@kit/ui/sonner';

import { unassignLicense } from '../_lib/server/licenses-server-actions';

interface UnassignLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  assignmentType: 'user' | 'asset';
  assignmentName: string;
  licenseName: string;
  accountSlug: string;
}

export function UnassignLicenseDialog({
  open,
  onOpenChange,
  assignmentId,
  assignmentType,
  assignmentName,
  licenseName,
  accountSlug,
}: UnassignLicenseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnassign = async () => {
    setIsSubmitting(true);

    try {
      const result = await unassignLicense({
        assignment_id: assignmentId,
        accountSlug,
      });

      if (result.success) {
        toast.success('License unassigned successfully');
        onOpenChange(false);

        // Refresh the page data
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.message || 'Failed to unassign license');
      }
    } catch (error) {
      console.error('Error unassigning license:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isPending || isSubmitting;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-test="unassign-license-dialog">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="text-warning h-5 w-5"
              aria-hidden="true"
            />
            <AlertDialogTitle>Unassign License</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to unassign{' '}
            <span className="font-semibold">{licenseName}</span> from{' '}
            {assignmentType === 'user' ? 'user' : 'asset'}{' '}
            <span className="font-semibold">{assignmentName}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-muted rounded-md p-4">
          <p className="text-muted-foreground text-sm">
            This action will remove the license assignment. The license will
            become available for reassignment to other users or assets.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleUnassign();
            }}
            disabled={isLoading}
            data-test="confirm-unassign-button"
          >
            {isLoading ? 'Unassigning...' : 'Unassign'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
