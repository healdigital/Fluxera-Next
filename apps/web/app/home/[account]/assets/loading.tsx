import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { AssetsListSkeleton } from './_components/assets-list-skeleton';

export default function AssetsLoadingPage() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.assets'} />}
        description={<AppBreadcrumbs />}
        account=""
      />

      <PageBody>
        <AssetsListSkeleton />
      </PageBody>
    </>
  );
}
