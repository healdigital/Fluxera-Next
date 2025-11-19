import { notFound } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../../../_components/team-account-layout-page-header';
import { EditAssetForm } from '../../_components/edit-asset-form';
import { loadAssetDetailData } from '../../_lib/server/asset-detail.loader';

interface EditAssetPageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async ({ params }: EditAssetPageProps) => {
  const i18n = await createI18nServerInstance();
  const { id, account } = await params;

  try {
    const client = getSupabaseServerClient();
    const [asset] = await loadAssetDetailData(client, id, account);

    const title = i18n.t('assets:editAssetPageTitle', { name: asset.name });

    return {
      title,
    };
  } catch {
    return {
      title: i18n.t('assets:editAsset'),
    };
  }
};

async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id, account: slug } = await params;
  const client = getSupabaseServerClient();

  let asset;

  try {
    [asset] = await loadAssetDetailData(client, id, slug);
  } catch (error) {
    console.error('Error loading asset for edit:', error);
    notFound();
  }

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'assets:editAsset'} />}
        description={<AppBreadcrumbs />}
        account={slug}
      />

      <PageBody>
        <div className="mx-auto max-w-2xl">
          <EditAssetForm asset={asset} accountSlug={slug} />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(EditAssetPage);
