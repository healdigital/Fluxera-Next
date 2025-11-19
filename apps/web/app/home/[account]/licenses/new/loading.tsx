import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { PageBody } from '@kit/ui/page';
import { Skeleton } from '@kit/ui/skeleton';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';

export default function NewLicenseLoadingPage() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={
          <Trans i18nKey="licenses:createLicense" defaults="Create License" />
        }
        description={<AppBreadcrumbs />}
        account=""
      />

      <PageBody>
        <div className="space-y-6">
          {/* Back button skeleton */}
          <Skeleton className="h-9 w-32" />

          {/* Form skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Form fields skeleton */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* License Name */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Vendor */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* License Key */}
                  <div className="space-y-2 md:col-span-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* License Type */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Cost */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Purchase Date */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Expiration Date */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 md:col-span-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
