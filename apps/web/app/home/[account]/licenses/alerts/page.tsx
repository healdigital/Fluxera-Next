import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { LicenseRenewalAlerts } from '../_components/license-renewal-alerts';
import { loadLicenseRenewalAlerts } from '../_lib/server/license-alerts.loader';

interface PageProps {
  params: Promise<{
    account: string;
  }>;
}

export const metadata = {
  title: 'License Renewal Alerts',
  description: 'View and manage license renewal alerts',
};

export default async function LicenseAlertsPage({ params }: PageProps) {
  const { account } = await params;
  const client = getSupabaseServerClient();

  const alerts = await loadLicenseRenewalAlerts(client, account);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">License Renewal Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Stay informed about licenses approaching their expiration dates
        </p>
      </div>

      <LicenseRenewalAlerts alerts={alerts} accountSlug={account} />
    </div>
  );
}
