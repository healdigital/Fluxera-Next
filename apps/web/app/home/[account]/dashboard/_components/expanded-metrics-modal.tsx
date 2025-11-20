'use client';

import { useState } from 'react';

import { ArrowDown, ArrowUp, Laptop, Package, Users } from 'lucide-react';

import { ExpandedWidgetModal, type FilterConfig } from '@kit/ui/modal';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { TeamDashboardMetrics } from '../_lib/types/dashboard.types';

interface ExpandedMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: TeamDashboardMetrics;
  accountSlug: string;
}

/**
 * Expanded Metrics Modal
 * Displays detailed metrics view with historical data and trends
 */
export function ExpandedMetricsModal({
  open,
  onOpenChange,
  metrics,
  accountSlug,
}: ExpandedMetricsModalProps) {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [loading, setLoading] = useState(false);

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      id: 'timeRange',
      label: 'Time Range',
      type: 'select',
      options: [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '1y', label: 'Last year' },
      ],
      value: timeRange,
      onChange: (value) => {
        setTimeRange(value as string);
        // In a real implementation, this would trigger a data refresh
      },
    },
  ];

  // Export handler
  const handleExport = async (format: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      const response = await fetch(
        `/api/dashboard/export?accountSlug=${accountSlug}&format=${format}&timeRange=${timeRange}`,
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate previous period values
  const previousAssets = metrics.total_assets - metrics.assets_growth_30d;
  const previousUsers = metrics.total_users - metrics.users_growth_30d;

  // Calculate percentage changes
  const assetsChange = calculatePercentageChange(
    previousAssets,
    metrics.total_assets,
  );
  const usersChange = calculatePercentageChange(
    previousUsers,
    metrics.total_users,
  );

  return (
    <ExpandedWidgetModal
      open={open}
      onOpenChange={onOpenChange}
      title="Key Metrics Overview"
      description="Detailed view of your organization's key performance indicators"
      loading={loading}
      filters={filters}
      onExport={handleExport}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Assets Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Laptop className="h-4 w-4" />
              </div>
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                {metrics.total_assets.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ChangeIndicator change={assetsChange} />
                <span className="text-muted-foreground text-sm">
                  vs previous period
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <MetricRow
                label="Available"
                value={metrics.available_assets}
                total={metrics.total_assets}
              />
              <MetricRow
                label="In Use"
                value={metrics.total_assets - metrics.available_assets}
                total={metrics.total_assets}
              />
              <MetricRow
                label="Growth (30d)"
                value={metrics.assets_growth_30d}
                showPercentage={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Users className="h-4 w-4" />
              </div>
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                {metrics.total_users.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ChangeIndicator change={usersChange} />
                <span className="text-muted-foreground text-sm">
                  vs previous period
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <MetricRow
                label="Active"
                value={metrics.active_users}
                total={metrics.total_users}
              />
              <MetricRow
                label="Inactive"
                value={metrics.total_users - metrics.active_users}
                total={metrics.total_users}
              />
              <MetricRow
                label="Growth (30d)"
                value={metrics.users_growth_30d}
                showPercentage={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Licenses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Package className="h-4 w-4" />
              </div>
              Software Licenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                {metrics.total_licenses.toLocaleString()}
              </p>
              <div className="mt-2">
                <span className="text-muted-foreground text-sm">
                  {metrics.total_licenses > 0
                    ? `${((metrics.active_licenses / metrics.total_licenses) * 100).toFixed(1)}% utilized`
                    : 'No licenses'}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <MetricRow
                label="Active"
                value={metrics.active_licenses}
                total={metrics.total_licenses}
              />
              <MetricRow
                label="Inactive"
                value={metrics.total_licenses - metrics.active_licenses}
                total={metrics.total_licenses}
              />
              {metrics.expiring_licenses_30d > 0 && (
                <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    {metrics.expiring_licenses_30d} license
                    {metrics.expiring_licenses_30d > 1 ? 's' : ''} expiring in
                    30 days
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.available_assets > metrics.total_assets * 0.3 && (
            <InsightItem
              type="info"
              message={`You have ${metrics.available_assets} available assets (${((metrics.available_assets / metrics.total_assets) * 100).toFixed(0)}% of total). Consider optimizing asset allocation.`}
            />
          )}
          {metrics.expiring_licenses_30d > 0 && (
            <InsightItem
              type="warning"
              message={`${metrics.expiring_licenses_30d} license${metrics.expiring_licenses_30d > 1 ? 's' : ''} expiring soon. Review and renew to avoid service interruptions.`}
            />
          )}
          {metrics.active_users < metrics.total_users * 0.7 && (
            <InsightItem
              type="info"
              message={`${metrics.total_users - metrics.active_users} inactive users detected. Consider reviewing user access and permissions.`}
            />
          )}
        </CardContent>
      </Card>
    </ExpandedWidgetModal>
  );
}

/**
 * Metric Row Component
 * Displays a metric with optional percentage bar
 */
function MetricRow({
  label,
  value,
  total,
  showPercentage = true,
}: {
  label: string;
  value: number;
  total?: number;
  showPercentage?: boolean;
}) {
  const percentage = total && total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value.toLocaleString()}
          {showPercentage && total && (
            <span className="text-muted-foreground ml-1">
              ({percentage.toFixed(0)}%)
            </span>
          )}
        </span>
      </div>
      {showPercentage && total && (
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Change Indicator Component
 */
function ChangeIndicator({
  change,
}: {
  change: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}) {
  const isPositive = change.trend === 'up';

  if (change.trend === 'stable') {
    return (
      <span className="text-muted-foreground text-sm font-medium">
        No change
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        isPositive
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isPositive ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
      <span>
        {Math.abs(change.value)} ({Math.abs(change.percentage).toFixed(1)}%)
      </span>
    </div>
  );
}

/**
 * Insight Item Component
 */
function InsightItem({
  type,
  message,
}: {
  type: 'info' | 'warning';
  message: string;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-sm ${
        type === 'warning'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      }`}
    >
      {message}
    </div>
  );
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(
  previous: number,
  current: number,
): {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
} {
  const value = current - previous;

  if (value === 0) {
    return { value: 0, percentage: 0, trend: 'stable' };
  }

  if (previous === 0) {
    return {
      value,
      percentage: 100,
      trend: value > 0 ? 'up' : 'down',
    };
  }

  const percentage = (value / previous) * 100;

  return {
    value,
    percentage,
    trend: value > 0 ? 'up' : value < 0 ? 'down' : 'stable',
  };
}
