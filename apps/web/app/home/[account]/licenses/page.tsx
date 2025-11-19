import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { LicenseRenewalAlerts } from './_components/license-renewal-alerts';
import { LicenseStatsCards } from './_components/license-stats-cards';
import { LicensesList } from './_components/licenses-list';
import {
  type LicenseFilters,
  loadLicensesPageData,
} from './_lib/server/licenses-page.loader';

interface LicensesPageProps {
  params: Promise<{ account: string }>;
  searchParams: Promise<{
    search?: string;
    vendor?: string;
    licenseTypes?: string;
    expirationStatus?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('licenses:pageTitle');

  return {
    title,
  };
};

async function LicensesPage({ params, searchParams }: LicensesPageProps) {
  const client = getSupabaseServerClient();
  const slug = (await params).account;
  const filters = await searchParams;

  // Parse filters from URL search params
  const parsedFilters: LicenseFilters = {
    search: filters.search,
    vendor: filters.vendor,
    licenseTypes: filters.licenseTypes?.split(',').filter(Boolean) as
      | LicenseFilters['licenseTypes']
      | undefined,
    expirationStatus:
      (filters.expirationStatus as
        | LicenseFilters['expirationStatus']
        | undefined) ?? 'all',
    page: filters.page ? parseInt(filters.page, 10) : 1,
    pageSize: filters.pageSize ? parseInt(filters.pageSize, 10) : 50,
  };

  const [paginatedLicenses, stats, vendors, workspace, alerts] =
    await loadLicensesPageData(client, slug, parsedFilters);

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.licenses'} />}
        description={<AppBreadcrumbs />}
        account={workspace.account.slug}
      />

      <PageBody>
        <div className="space-y-6">
          <LicenseStatsCards stats={stats} />

          {/* Display renewal alerts if any exist */}
          {alerts.length > 0 && (
            <LicenseRenewalAlerts
              alerts={alerts}
              accountSlug={workspace.account.slug}
            />
          )}

          <LicensesList
            licenses={paginatedLicenses.licenses}
            accountSlug={workspace.account.slug}
            vendors={vendors}
            pagination={{
              currentPage: paginatedLicenses.page,
              totalPages: paginatedLicenses.totalPages,
              totalCount: paginatedLicenses.totalCount,
              pageSize: paginatedLicenses.pageSize,
            }}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(LicensesPage);
