'use client';

import {
  Suspense,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from 'react';

import { Activity } from 'lucide-react';

import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';
import { toast } from '@kit/ui/sonner';

import {
  dismissAlert,
  refreshDashboardMetrics,
} from '../_lib/server/dashboard-server-actions';
import type {
  DashboardAlert,
  DashboardWidget,
  TeamDashboardMetrics,
} from '../_lib/types/dashboard.types';
import { LazyWidgetLoader } from '../_lib/utils/lazy-widget-loader';
import { DashboardWidgetSkeleton } from './dashboard-widget-skeleton';
import { AlertsWidget } from './widgets/alerts-widget';
import { AssetStatusWidget } from './widgets/asset-status-widget.lazy';
import { MetricsSummaryWidget } from './widgets/metrics-summary-widget';
import { QuickActionsWidget } from './widgets/quick-actions-widget';
import { TrendChartWidget } from './widgets/trend-chart-widget.lazy';
import { ExpandedMetricsModal } from './expanded-metrics-modal';
import { ExpandedChartModal } from './expanded-chart-modal';

interface DashboardGridProps {
  metrics: TeamDashboardMetrics;
  widgets: DashboardWidget[];
  alerts: DashboardAlert[];
  accountSlug: string;
  accountId: string;
}

/**
 * Dashboard Grid Component
 * Responsive grid layout for dashboard widgets
 * Supports configurable widget positioning and visibility
 * Includes real-time metric updates via Supabase Realtime
 */
export function DashboardGrid({
  metrics: initialMetrics,
  widgets,
  alerts,
  accountSlug,
  accountId,
}: DashboardGridProps) {
  const [, startTransition] = useTransition();
  const [optimisticAlerts, setOptimisticAlerts] = useOptimistic(
    alerts,
    (currentAlerts, alertIdToRemove: string) => {
      return currentAlerts.filter((alert) => alert.id !== alertIdToRemove);
    },
  );

  // State for real-time metrics and update indicator
  const [metrics, setMetrics] = useState<TeamDashboardMetrics>(initialMetrics);
  const [isLiveUpdateActive, setIsLiveUpdateActive] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Modal state
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [chartModalOpen, setChartModalOpen] = useState(false);

  /**
   * Set up real-time subscriptions and automatic refresh
   */
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isSubscribed = true;

    /**
     * Refresh metrics from the server
     * Memoized within useEffect to avoid stale closures
     */
    const refreshMetrics = async () => {
      // Don't update if component is unmounted
      if (!isSubscribed) return;

      try {
        setIsLiveUpdateActive(true);

        const data = await refreshDashboardMetrics(accountSlug);

        // Check again before updating state
        if (!isSubscribed) return;

        setMetrics(data);
        setLastUpdateTime(new Date());
      } catch (error) {
        if (!isSubscribed) return;

        console.error('Error refreshing metrics:', error);
        toast.error('Failed to refresh metrics', {
          description: 'Unable to fetch the latest data',
        });
      } finally {
        // Keep indicator visible for 1 second
        setTimeout(() => {
          if (isSubscribed) {
            setIsLiveUpdateActive(false);
          }
        }, 1000);
      }
    };

    // Subscribe to changes on assets table
    const assetsChannel = supabase
      .channel('dashboard_assets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          void refreshMetrics();
        },
      )
      .subscribe();

    // Subscribe to changes on accounts_memberships table
    const membershipsChannel = supabase
      .channel('dashboard_memberships_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts_memberships',
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          void refreshMetrics();
        },
      )
      .subscribe();

    // Subscribe to changes on software_licenses table
    const licensesChannel = supabase
      .channel('dashboard_licenses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'software_licenses',
          filter: `account_id=eq.${accountId}`,
        },
        () => {
          void refreshMetrics();
        },
      )
      .subscribe();

    // Set up automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      void refreshMetrics();
    }, 30000);

    // Cleanup subscriptions and interval on unmount
    return () => {
      isSubscribed = false;
      clearInterval(refreshInterval);
      void supabase.removeChannel(assetsChannel);
      void supabase.removeChannel(membershipsChannel);
      void supabase.removeChannel(licensesChannel);
    };
  }, [accountId, accountSlug]);

  /**
   * Handle alert dismissal with optimistic update
   */
  const handleDismissAlert = async (alertId: string) => {
    // Optimistically remove the alert from the UI
    startTransition(() => {
      setOptimisticAlerts(alertId);
    });

    try {
      await dismissAlert({
        alert_id: alertId,
        accountSlug,
      });

      toast.success('Alert dismissed');
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Failed to dismiss alert', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  };
  // Default widget layout if user hasn't configured widgets
  const defaultWidgets: DashboardWidget['widget_type'][] = [
    'metrics_summary',
    'asset_status',
    'trend_chart',
    'alerts',
    'quick_actions',
    'recent_activity',
    'license_expiry',
    'maintenance_schedule',
  ];

  // Use configured widgets or fall back to defaults
  // Filter to only show visible widgets and sort by position_order
  const displayWidgets =
    widgets.length > 0
      ? widgets
          .filter((w) => w.is_visible)
          .sort((a, b) => a.position_order - b.position_order)
          .map((w) => w.widget_type)
      : defaultWidgets;

  return (
    <>
      <div className="space-y-4">
        {/* Live update indicator */}
        <div className="flex items-center justify-end">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs transition-all ${
              isLiveUpdateActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}
            data-test="live-update-indicator"
          >
            <Activity
              className={`h-3 w-3 ${isLiveUpdateActive ? 'animate-pulse' : ''}`}
            />
            <span>
              {isLiveUpdateActive
                ? 'Updating...'
                : `Last updated: ${lastUpdateTime.toLocaleTimeString()}`}
            </span>
          </div>
        </div>

        {/* Dashboard widgets grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayWidgets.map((widgetType, index) => {
            // Determine if widget should be lazy loaded
            // First 3 widgets load immediately, rest are lazy loaded
            const shouldLazyLoad = index >= 3;

            return shouldLazyLoad ? (
              <LazyWidgetLoader key={`${widgetType}-${index}`}>
                <Suspense fallback={<DashboardWidgetSkeleton />}>
                  <WidgetRenderer
                    widgetType={widgetType}
                    metrics={metrics}
                    alerts={optimisticAlerts}
                    accountSlug={accountSlug}
                    onDismissAlert={handleDismissAlert}
                    onOpenMetricsModal={() => setMetricsModalOpen(true)}
                    onOpenChartModal={() => setChartModalOpen(true)}
                  />
                </Suspense>
              </LazyWidgetLoader>
            ) : (
              <Suspense
                key={`${widgetType}-${index}`}
                fallback={<DashboardWidgetSkeleton />}
              >
                <WidgetRenderer
                  widgetType={widgetType}
                  metrics={metrics}
                  alerts={optimisticAlerts}
                  accountSlug={accountSlug}
                  onDismissAlert={handleDismissAlert}
                  onOpenMetricsModal={() => setMetricsModalOpen(true)}
                  onOpenChartModal={() => setChartModalOpen(true)}
                />
              </Suspense>
            );
          })}
        </div>
      </div>

      {/* Expanded Modals */}
      <ExpandedMetricsModal
        open={metricsModalOpen}
        onOpenChange={setMetricsModalOpen}
        metrics={metrics}
        accountSlug={accountSlug}
      />

      <ExpandedChartModal
        open={chartModalOpen}
        onOpenChange={setChartModalOpen}
        accountSlug={accountSlug}
      />
    </>
  );
}

/**
 * Widget Renderer Component
 * Dynamically renders the appropriate widget based on type
 */
function WidgetRenderer({
  widgetType,
  metrics,
  alerts,
  accountSlug,
  onDismissAlert,
  onOpenMetricsModal,
  onOpenChartModal,
}: {
  widgetType: DashboardWidget['widget_type'];
  metrics: TeamDashboardMetrics;
  alerts: DashboardAlert[];
  accountSlug: string;
  onDismissAlert: (alertId: string) => Promise<void>;
  onOpenMetricsModal: () => void;
  onOpenChartModal: () => void;
}) {
  // Render the appropriate widget based on type
  switch (widgetType) {
    case 'metrics_summary':
      return (
        <div
          onClick={onOpenMetricsModal}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
          data-test="widget-metrics-summary-clickable"
        >
          <MetricsSummaryWidget metrics={metrics} />
        </div>
      );

    case 'asset_status':
      return (
        <div data-test="widget-asset-status">
          <AssetStatusWidget accountSlug={accountSlug} />
        </div>
      );

    case 'trend_chart':
      return (
        <div
          onClick={onOpenChartModal}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
          data-test="widget-trend-chart-clickable"
        >
          <TrendChartWidget accountSlug={accountSlug} metricType="assets" />
        </div>
      );

    case 'alerts':
      return (
        <div data-test="widget-alerts">
          <AlertsWidget alerts={alerts} onDismissAlert={onDismissAlert} />
        </div>
      );

    case 'quick_actions':
      return (
        <div data-test="widget-quick-actions">
          <QuickActionsWidget accountSlug={accountSlug} />
        </div>
      );

    // Placeholder for other widgets (will be implemented in subsequent tasks)
    default:
      return (
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold capitalize">
              {widgetType.replace(/_/g, ' ')}
            </h3>
            <p className="text-muted-foreground text-sm">
              Widget content will be implemented in subsequent tasks
            </p>
          </div>
        </div>
      );
  }
}
