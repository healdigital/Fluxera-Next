import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { AssetDetailSkeleton } from '../_components/asset-detail-skeleton';

export default function AssetDetailLoadingPage() {
  return (
    <>
      <TeamAccountLayoutPageHeader
        title={
          <Trans i18nKey={'assets:assetDetails'} defaults="Asset Details" />
        }
        description={<AppBreadcrumbs />}
        account=""
      />

      <PageBody>
        <AssetDetailSkeleton />
      </PageBody>
    </>
  );
}
