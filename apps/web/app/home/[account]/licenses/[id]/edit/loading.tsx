import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Skeleton } from '@kit/ui/skeleton';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '../../../_components/team-account-layout-page-header';
import { EditLicenseFormSkeleton } from '../../_components/edit-license-form-skeleton';

export default function EditLicenseLoadingPage() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey="licenses:editLicense" defaults="Edit License" />}
        description={<AppBreadcrumbs />}
        account=""
      />

      <PageBody>
        <div className="space-y-6">
          {/* Back button skeleton */}
          <Skeleton className="h-9 w-32" />

          <EditLicenseFormSkeleton />
        </div>
      </PageBody>
    </>
  );
}
