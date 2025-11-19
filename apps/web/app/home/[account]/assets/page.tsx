import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { AssetsList } from './_components/assets-list';
import {
  type AssetFilters,
  loadAssetsPageData,
} from './_lib/server/assets-page.loader';

interface AssetsPageProps {
  params: Promise<{ account: string }>;
  searchParams: Promise<{
    categories?: string;
    statuses?: string;
    search?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('assets:pageTitle');

  return {
    title,
  };
};

async function AssetsPage({ params, searchParams }: AssetsPageProps) {
  const client = getSupabaseServerClient();
  const slug = (await params).account;
  const filters = await searchParams;

  // Parse filters from URL search params
  const parsedFilters: AssetFilters = {
    categories: filters.categories?.split(',').filter(Boolean) as
      | AssetFilters['categories']
      | undefined,
    statuses: filters.statuses?.split(',').filter(Boolean) as
      | AssetFilters['statuses']
      | undefined,
    search: filters.search,
    page: filters.page ? parseInt(filters.page, 10) : 1,
    pageSize: filters.pageSize ? parseInt(filters.pageSize, 10) : 50,
  };

  const [paginatedAssets, workspace] = await loadAssetsPageData(
    client,
    slug,
    parsedFilters,
  );

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.assets'} />}
        description={<AppBreadcrumbs />}
        account={workspace.account.slug}
      />

      <PageBody>
        <AssetsList
          assets={paginatedAssets.assets}
          accountSlug={workspace.account.slug}
          pagination={{
            currentPage: paginatedAssets.page,
            totalPages: paginatedAssets.totalPages,
            totalCount: paginatedAssets.totalCount,
            pageSize: paginatedAssets.pageSize,
          }}
        />
      </PageBody>
    </>
  );
}

export default withI18n(AssetsPage);
