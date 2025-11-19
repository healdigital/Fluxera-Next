import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Skeleton } from '@kit/ui/skeleton';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { LicenseDetailSkeleton } from '../_components/license-detail-skeleton';

export default function LicenseDetailLoadingPage() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Skeleton className="h-8 w-64" />}
        description={<AppBreadcrumbs />}
        account=""
      >
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </TeamAccountLayoutPageHeader>

      <PageBody>
        <LicenseDetailSkeleton />
      </PageBody>
    </>
  );
}
