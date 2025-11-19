import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { loadTeamWorkspace } from '../_lib/server/team-account-workspace.loader';
import { DashboardGrid } from './_components/dashboard-grid';
import { DashboardHeader } from './_components/dashboard-header';
import { loadDashboardPageData } from './_lib/server/dashboard-page.loader';

interface DashboardPageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('dashboard:pageTitle');

  return {
    title,
    description: i18n.t('dashboard:pageDescription'),
  };
};

async function DashboardPage({ params }: DashboardPageProps) {
  const client = getSupabaseServerClient();
  const { account } = await params;

  // Load workspace to get user data
  const workspace = await loadTeamWorkspace(account);

  // Load dashboard data
  const [metrics, widgets, alerts] = await loadDashboardPageData(
    client,
    account,
    workspace.user.id,
  );

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.dashboard'} />}
        description={<AppBreadcrumbs />}
        account={workspace.account.slug}
      />

      <PageBody>
        <div className="space-y-6">
          <DashboardHeader
            accountSlug={workspace.account.slug}
            widgets={widgets}
          />

          <DashboardGrid
            metrics={metrics}
            widgets={widgets}
            alerts={alerts}
            accountSlug={workspace.account.slug}
            accountId={workspace.account.id}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(DashboardPage);
