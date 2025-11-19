import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Skeleton } from '@kit/ui/skeleton';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { DashboardGridSkeleton } from './_components/dashboard-widget-skeleton';

/**
 * Dashboard Loading State
 * Displays skeleton placeholders while dashboard data is loading
 */
export default function DashboardLoading() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.dashboard'} />}
        description={<AppBreadcrumbs />}
        account={''}
      />

      <PageBody>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Dashboard grid skeleton */}
          <DashboardGridSkeleton />
        </div>
      </PageBody>
    </>
  );
}
