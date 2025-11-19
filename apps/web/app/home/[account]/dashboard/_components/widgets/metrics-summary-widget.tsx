'use client';

import { ArrowDown, ArrowUp, Laptop, Package, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import type { TeamDashboardMetrics } from '../../_lib/types/dashboard.types';

interface MetricsSummaryWidgetProps {
  metrics: TeamDashboardMetrics;
}

/**
 * Metrics Summary Widget
 * Displays key metrics (assets, users, licenses) with comparison to previous period
 * Shows percentage change indicators with up/down arrows
 */
export function MetricsSummaryWidget({ metrics }: MetricsSummaryWidgetProps) {
  // Calculate previous period values based on growth
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

  // For licenses, we don't have growth data, so we'll show active vs total
  const licensesUtilization =
    metrics.total_licenses > 0
      ? ((metrics.active_licenses / metrics.total_licenses) * 100).toFixed(1)
      : '0';

  return (
    <Card className="shadow-sm" data-test="widget-metrics-summary">
      <CardHeader>
        <CardTitle className="text-lg">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assets Metric */}
        <MetricItem
          icon={<Laptop className="h-5 w-5" />}
          label="Total Assets"
          value={metrics.total_assets}
          change={assetsChange}
          subtitle={`${metrics.available_assets} available`}
          dataTest="metric-total-assets"
          availableDataTest="metric-available-assets"
        />

        {/* Users Metric */}
        <MetricItem
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={metrics.total_users}
          change={usersChange}
          subtitle={`${metrics.active_users} active`}
          dataTest="metric-total-users"
          activeDataTest="metric-active-users"
        />

        {/* Licenses Metric */}
        <MetricItem
          icon={<Package className="h-5 w-5" />}
          label="Software Licenses"
          value={metrics.total_licenses}
          subtitle={`${licensesUtilization}% utilized`}
          badge={
            metrics.expiring_licenses_30d > 0
              ? {
                  text: `${metrics.expiring_licenses_30d} expiring soon`,
                  variant: 'warning',
                  dataTest: 'metric-expiring-licenses',
                }
              : undefined
          }
          dataTest="metric-total-licenses"
        />
      </CardContent>
    </Card>
  );
}

/**
 * Individual Metric Item Component
 */
interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'warning' | 'info';
    dataTest?: string;
  };
  dataTest?: string;
  availableDataTest?: string;
  activeDataTest?: string;
}

function MetricItem({
  icon,
  label,
  value,
  change,
  subtitle,
  badge,
  dataTest,
  availableDataTest,
  activeDataTest,
}: MetricItemProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Icon */}
      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          {change && <ChangeIndicator change={change} />}
        </div>

        <p className="text-2xl font-bold" data-test={dataTest}>
          {value.toLocaleString()}
        </p>

        {subtitle && (
          <p
            className="text-muted-foreground text-xs"
            data-test={availableDataTest || activeDataTest}
          >
            {subtitle}
          </p>
        )}

        {badge && (
          <div className="pt-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                badge.variant === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
              data-test={badge.dataTest}
            >
              {badge.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Change Indicator Component
 * Shows percentage change with up/down arrow
 */
interface ChangeIndicatorProps {
  change: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

function ChangeIndicator({ change }: ChangeIndicatorProps) {
  const isPositive = change.trend === 'up';

  if (change.trend === 'stable') {
    return (
      <span className="text-muted-foreground text-xs font-medium">
        No change
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium ${
        isPositive
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      <span>{Math.abs(change.percentage).toFixed(1)}%</span>
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

  // Handle division by zero
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

/**
 * Metrics Summary Widget Skeleton
 * Loading placeholder for the metrics summary widget
 */
export function MetricsSummaryWidgetSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
