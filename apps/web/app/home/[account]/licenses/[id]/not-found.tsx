import Link from 'next/link';

import { FileQuestion } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export default function LicenseNotFoundPage() {
  return (
    <>
      <PageHeader
        title={
          <Trans i18nKey="licenses:licenseDetails" defaults="License Details" />
        }
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="bg-muted rounded-full p-6">
            <FileQuestion className="text-muted-foreground h-12 w-12" />
          </div>

          <Alert className="max-w-2xl">
            <AlertTitle>
              <Trans
                i18nKey="licenses:licenseNotFound"
                defaults="License Not Found"
              />
            </AlertTitle>

            <AlertDescription>
              <Trans
                i18nKey="licenses:licenseNotFoundDescription"
                defaults="The license you're looking for doesn't exist or you don't have permission to view it."
              />
            </AlertDescription>
          </Alert>

          <Button variant="default" asChild>
            <Link href="../">
              <Trans
                i18nKey="licenses:backToLicenses"
                defaults="Back to Licenses"
              />
            </Link>
          </Button>
        </div>
      </PageBody>
    </>
  );
}
