import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { CreateAssetForm } from '../_components/create-asset-form';

interface NewAssetPageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('assets:createAssetPageTitle');

  return {
    title,
  };
};

async function NewAssetPage({ params }: NewAssetPageProps) {
  const slug = (await params).account;

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'assets:createAsset'} />}
        description={<AppBreadcrumbs />}
        account={slug}
      />

      <PageBody>
        <div className="mx-auto max-w-2xl">
          <CreateAssetForm accountSlug={slug} />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(NewAssetPage);
