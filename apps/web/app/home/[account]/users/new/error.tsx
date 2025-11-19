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

export default function InviteUserErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useCaptureException(error);
  const params = useParams();
  const accountSlug = params.account as string;

  const errorMessage = UserErrors.INVITE_FAILED;

  return (
    <>
      <PageHeader
        title={<Trans i18nKey="users:inviteUser" defaults="Invite User" />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className="flex flex-col space-y-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4" />

            <AlertTitle>
              <Trans
                i18nKey="users:errorLoadingInviteForm"
                defaults={errorMessage.title}
              />
            </AlertTitle>

            <AlertDescription className="space-y-2">
              <p>
                <Trans
                  i18nKey="users:errorLoadingInviteFormDescription"
                  defaults={errorMessage.description}
                />
              </p>
              {errorMessage.action && (
                <p className="text-sm font-medium">
                  <Trans
                    i18nKey="users:errorLoadingInviteFormAction"
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
              <Link href={`/home/${accountSlug}/users`}>
                <Trans i18nKey="users:backToUsers" defaults="Back to Users" />
              </Link>
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
