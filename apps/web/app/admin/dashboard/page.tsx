import { redirect } from 'next/navigation';

import { isSuperAdmin } from '@kit/admin';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { AccountActivityListWrapper } from './_components/account-activity-list-wrapper';
import { AdminMetricsOverview } from './_components/admin-metrics-overview';
import { MetricsRefreshMonitor } from './_components/metrics-refresh-monitor';
import { SubscriptionOverviewWidget } from './_components/subscription-overview-widget';
import { SystemHealthWidget } from './_components/system-health-widget';
import { UsageStatisticsWidget } from './_components/usage-statistics-widget';
import { loadAdminDashboardPageData } from './_lib/server/admin-dashboard.loader';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('admin:dashboard.pageTitle');

  return {
    title,
    description: i18n.t('admin:dashboard.pageDescription'),
  };
};

async function AdminDashboardPage() {
  const client = getSupabaseServerClient();

  // Verify user has super admin role
  const isAdmin = await isSuperAdmin(client);

  if (!isAdmin) {
    // Redirect to home if not a super admin
    redirect('/home');
  }

  // Load admin dashboard data
  const [
    platformMetrics,
    accountActivity,
    systemHealth,
    subscriptionOverview,
    usageStatistics,
    mostActiveAccounts,
    metricsRefreshStats,
  ] = await loadAdminDashboardPageData(client);

  // Get total account count for pagination
  const { count: totalAccountCount } = await client
    .from('accounts')
    .select('*', { count: 'exact', head: true });

  return (
    <>
      <div className="border-border bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">
            <Trans i18nKey={'admin:dashboard.title'} />
          </h1>
          <p className="text-muted-foreground mt-2">
            <Trans i18nKey={'admin:dashboard.description'} />
          </p>
        </div>
      </div>

      <PageBody>
        <div className="space-y-8">
          {/* Platform Metrics Overview */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              <Trans i18nKey={'admin:dashboard.platformMetrics'} />
            </h2>
            <AdminMetricsOverview metrics={platformMetrics} />
          </section>

          {/* System Health Monitoring */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              <Trans i18nKey={'admin:dashboard.systemHealth'} />
            </h2>
            <SystemHealthWidget systemHealth={systemHealth} />
          </section>

          {/* Metrics Refresh Monitor */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              <Trans i18nKey={'admin:dashboard.metricsRefresh'} />
            </h2>
            <MetricsRefreshMonitor initialStats={metricsRefreshStats} />
          </section>

          {/* Subscription Overview */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              <Trans i18nKey={'admin:dashboard.subscriptionOverview'} />
            </h2>
            <SubscriptionOverviewWidget subscriptions={subscriptionOverview} />
          </section>

          {/* Usage Statistics */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              <Trans i18nKey={'admin:dashboard.usageStatistics'} />
            </h2>
            <UsageStatisticsWidget
              statistics={usageStatistics}
              mostActiveAccounts={mostActiveAccounts}
            />
          </section>

          {/* Account Activity List */}
          <section>
            <AccountActivityListWrapper
              initialAccounts={accountActivity}
              initialTotalCount={totalAccountCount ?? accountActivity.length}
              initialPage={1}
              initialPageSize={50}
            />
          </section>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(AdminDashboardPage);
