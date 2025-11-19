import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { LicensesListSkeleton } from './_components/licenses-list-skeleton';

export default function LicensesLoadingPage() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.licenses'} />}
        description={<AppBreadcrumbs />}
        account=""
      />

      <PageBody>
        <LicensesListSkeleton />
      </PageBody>
    </>
  );
}
