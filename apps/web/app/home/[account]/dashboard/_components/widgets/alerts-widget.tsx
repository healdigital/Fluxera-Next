'use client';

import { Bell } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import type { DashboardAlert } from '../../_lib/types/dashboard.types';
import { AlertCard } from '../alert-card';

interface AlertsWidgetProps {
  alerts: DashboardAlert[];
  onDismissAlert?: (alertId: string) => Promise<void>;
}

/**
 * Alerts Widget Component
 * Displays active alerts sorted by severity (critical first)
 * Shows alert cards with dismiss functionality
 */
export function AlertsWidget({ alerts, onDismissAlert }: AlertsWidgetProps) {
  // Sort alerts by severity (critical > warning > info) and then by created_at
  const sortedAlerts = sortAlertsBySeverity(alerts);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            <span>Alerts</span>
          </CardTitle>
          {sortedAlerts.length > 0 && (
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {sortedAlerts.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedAlerts.length === 0 ? (
          <EmptyAlertsState />
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onDismiss={onDismissAlert}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Empty State Component
 * Displayed when there are no active alerts
 */
function EmptyAlertsState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
        <Bell className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="text-muted-foreground mt-4 text-sm font-medium">
        No active alerts
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        You&apos;re all caught up! Alerts will appear here when action is
        needed.
      </p>
    </div>
  );
}

/**
 * Sort alerts by severity and creation date
 * Priority: critical > warning > info
 * Within same severity: most recent first
 */
function sortAlertsBySeverity(alerts: DashboardAlert[]): DashboardAlert[] {
  const severityOrder: Record<DashboardAlert['severity'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return [...alerts].sort((a, b) => {
    // First, sort by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }

    // If same severity, sort by created_at (most recent first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Alerts Widget Skeleton
 * Loading placeholder for the alerts widget
 */
export function AlertsWidgetSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border-l-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
