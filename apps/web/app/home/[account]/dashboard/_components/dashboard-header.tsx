'use client';

import { Trans } from '@kit/ui/trans';

import type { DashboardWidget } from '../_lib/types/dashboard.types';
import { ConfigureWidgetsDialog } from './configure-widgets-dialog';

interface DashboardHeaderProps {
  accountSlug: string;
  widgets: DashboardWidget[];
}

/**
 * Dashboard Header Component
 * Displays the dashboard title and configuration button
 */
export function DashboardHeader({
  accountSlug,
  widgets,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <Trans i18nKey="dashboard:title" defaults="Dashboard" />
        </h1>
        <p className="text-muted-foreground">
          <Trans
            i18nKey="dashboard:subtitle"
            defaults="Monitor your organization's key metrics and activities"
          />
        </p>
      </div>

      <ConfigureWidgetsDialog widgets={widgets} accountSlug={accountSlug} />
    </div>
  );
}
