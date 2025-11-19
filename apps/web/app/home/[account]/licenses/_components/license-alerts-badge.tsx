import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Badge } from '@kit/ui/badge';

import { getLicenseAlertsCount } from '../_lib/server/license-alerts.loader';

interface LicenseAlertsBadgeProps {
  accountSlug: string;
}

export async function LicenseAlertsBadge({
  accountSlug,
}: LicenseAlertsBadgeProps) {
  const client = getSupabaseServerClient();
  const count = await getLicenseAlertsCount(client, accountSlug);

  if (count === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className="ml-auto">
      {count}
    </Badge>
  );
}
