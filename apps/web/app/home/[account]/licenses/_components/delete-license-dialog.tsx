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

import { deleteLicense } from '../_lib/server/licenses-server-actions';

interface DeleteLicenseDialogProps {
  licenseId: string;
  licenseName: string;
  accountSlug: string;
  assignmentCount?: number;
  assignments?: Array<{
    id: string;
    assigned_to_user?: string | null;
    assigned_to_asset?: string | null;
    users?: { id: string; display_name: string; email: string } | null;
    assets?: { id: string; name: string; category: string } | null;
  }>;
  children: React.ReactNode;
}

export function DeleteLicenseDialog({
  licenseId,
  licenseName,
  accountSlug,
  assignmentCount = 0,
  assignments = [],
  children,
}: DeleteLicenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const result = await deleteLicense({ id: licenseId, accountSlug });

      if (result.success) {
        toast.success(
          <Trans
            i18nKey="licenses:deleteLicenseSuccess"
            defaults="License deleted successfully"
          />,
        );
        setOpen(false);
        // Redirect to licenses list after successful deletion
        router.push(`/home/${accountSlug}/licenses`);
      } else {
        toast.error(
          result.message || (
            <Trans
              i18nKey="licenses:deleteLicenseError"
              defaults="Failed to delete license"
            />
          ),
        );
      }
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      console.error('Error deleting license:', error);
      toast.error(
        <Trans
          i18nKey="licenses:deleteLicenseUnexpectedError"
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
        aria-labelledby="delete-license-title"
        aria-describedby="delete-license-description"
      >
        <AlertDialogHeader>
          <AlertDialogTitle id="delete-license-title">
            <Trans i18nKey="licenses:deleteLicense" defaults="Delete License" />
          </AlertDialogTitle>
          <AlertDialogDescription
            id="delete-license-description"
            className="space-y-3"
          >
            <p>
              <Trans
                i18nKey="licenses:deleteLicenseConfirmation"
                defaults="Are you sure you want to delete <strong>{{licenseName}}</strong>? This action cannot be undone."
                values={{ licenseName }}
                components={{ strong: <strong /> }}
              />
            </p>
            {assignmentCount > 0 && (
              <>
                <p className="font-medium text-orange-600">
                  <Trans
                    i18nKey="licenses:deleteLicenseWarning"
                    defaults="Warning: This license has {{count}} active assignment(s). Deleting it will remove all assignments."
                    values={{ count: assignmentCount }}
                  />
                </p>
                {assignments.length > 0 && (
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-foreground mb-2 text-sm font-medium">
                      <Trans
                        i18nKey="licenses:assignmentsToBeRemoved"
                        defaults="Assignments that will be removed:"
                      />
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      {assignments.map((assignment) => {
                        if (assignment.users) {
                          return (
                            <li key={assignment.id}>
                              • User: {assignment.users.display_name} (
                              {assignment.users.email})
                            </li>
                          );
                        }
                        if (assignment.assets) {
                          return (
                            <li key={assignment.id}>
                              • Asset: {assignment.assets.name} (
                              {assignment.assets.category})
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                )}
              </>
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
              isLoading ? 'Deleting license' : `Delete license ${licenseName}`
            }
          >
            {isLoading ? (
              <>
                <Trash2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                <Trans i18nKey="licenses:deleting" defaults="Deleting..." />
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                <Trans i18nKey="licenses:delete" defaults="Delete" />
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
