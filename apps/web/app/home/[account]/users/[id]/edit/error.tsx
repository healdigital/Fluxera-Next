'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { useCaptureException } from '@kit/monitoring/hooks';
import { UserErrors } from '@kit/shared/error-messages';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export default function EditUserErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useCaptureException(error);
  const params = useParams();
  const accountSlug = params.account as string;
  const userId = params.id as string;

  // Determine error type based on error message
  const isPermissionError = error.message.toLowerCase().includes('permission');
  const errorMessage = isPermissionError
    ? UserErrors.PERMISSION_DENIED
    : UserErrors.NOT_FOUND;

  return (
    <>
      <PageHeader
        title={<Trans i18nKey="users:editUser" defaults="Edit User" />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className="flex flex-col space-y-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4" />

            <AlertTitle>
              <Trans
                i18nKey="users:errorLoadingEditForm"
                defaults={errorMessage.title}
              />
            </AlertTitle>

            <AlertDescription className="space-y-2">
              <p>
                <Trans
                  i18nKey="users:errorLoadingEditFormDescription"
                  defaults={errorMessage.description}
                />
              </p>
              {errorMessage.action && (
                <p className="text-sm font-medium">
                  <Trans
                    i18nKey="users:errorLoadingEditFormAction"
                    defaults={errorMessage.action}
                  />
                </p>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              <Trans i18nKey="common:retry" defaults="Retry" />
            </Button>
            <Button variant="default" asChild>
              <Link href={`/home/${accountSlug}/users/${userId}`}>
                <Trans
                  i18nKey="users:backToUserDetails"
                  defaults="Back to User Details"
                />
              </Link>
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
