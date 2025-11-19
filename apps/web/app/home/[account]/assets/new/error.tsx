'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { useCaptureException } from '@kit/monitoring/hooks';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export default function NewAssetErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useCaptureException(error);

  return (
    <>
      <PageHeader
        title={<Trans i18nKey="assets:createAsset" defaults="Create Asset" />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className="flex flex-col space-y-4">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4" />

            <AlertTitle>
              <Trans
                i18nKey="assets:errorLoadingCreatePage"
                defaults="Error Loading Page"
              />
            </AlertTitle>

            <AlertDescription>
              <Trans
                i18nKey="assets:errorLoadingCreatePageDescription"
                defaults="We encountered an error while loading the asset creation page. Please try again."
              />
            </AlertDescription>
          </Alert>

          <div>
            <Button variant="outline" onClick={reset}>
              <Trans i18nKey="common:retry" defaults="Retry" />
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
