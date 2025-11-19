'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { useCaptureException } from '@kit/monitoring/hooks';
import { AssetErrors } from '@kit/shared/error-messages';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export default function AssetsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useCaptureException(error);

  const errorMessage = AssetErrors.LOAD_FAILED;

  return (
    <>
      <PageHeader
        title={<Trans i18nKey="assets:pageTitle" />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className="flex flex-col space-y-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4" />

            <AlertTitle>
              <Trans
                i18nKey="assets:errorLoadingAssets"
                defaults={errorMessage.title}
              />
            </AlertTitle>

            <AlertDescription className="space-y-2">
              <p>
                <Trans
                  i18nKey="assets:errorLoadingAssetsDescription"
                  defaults={errorMessage.description}
                />
              </p>
              {errorMessage.action && (
                <p className="text-sm font-medium">
                  <Trans
                    i18nKey="assets:errorLoadingAssetsAction"
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
          </div>
        </div>
      </PageBody>
    </>
  );
}
