'use client';

import { Building2, Laptop, Package, Users } from 'lucide-react';

import { Card, CardContent } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import type { PlatformMetrics } from '../_lib/types/admin-dashboard.types';

interface AdminMetricsOverviewProps {
  metrics: PlatformMetrics;
}

/**
 * Admin Metrics Overview Widget
 * Displays platform-wide metrics for super administrators
 * Shows total accounts, users, assets, and licenses with growth indicators
 */
export function AdminMetricsOverview({ metrics }: AdminMetricsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Accounts */}
        <MetricCard
          icon={<Building2 className="h-5 w-5" />}
          label="Total Accounts"
          value={metrics.total_accounts}
          growth={metrics.new_accounts_30d}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />

        {/* Total Users */}
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={metrics.total_users}
          growth={metrics.new_users_30d}
          iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />

        {/* Total Assets */}
        <MetricCard
          icon={<Laptop className="h-5 w-5" />}
          label="Total Assets"
          value={metrics.total_assets}
          growth={metrics.new_assets_30d}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />

        {/* Total Licenses */}
        <MetricCard
          icon={<Package className="h-5 w-5" />}
          label="Total Licenses"
          value={metrics.total_licenses}
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      {/* Last Updated Timestamp */}
      <div className="text-muted-foreground text-sm">
        Last updated: {formatTimestamp(metrics.last_updated)}
      </div>
    </div>
  );
}

/**
 * Individual Metric Card Component
 */
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  growth?: number;
  iconColor: string;
}

function MetricCard({
  icon,
  label,
  value,
  growth,
  iconColor,
}: MetricCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
          >
            {icon}
          </div>
        </div>

        {/* Label */}
        <div className="text-muted-foreground mt-4 text-sm font-medium">
          {label}
        </div>

        {/* Value */}
        <div className="mt-2 text-3xl font-bold">{value.toLocaleString()}</div>

        {/* Growth Indicator */}
        {growth !== undefined && growth > 0 && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
            +{growth.toLocaleString()} in last 30 days
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

/**
 * Admin Metrics Overview Skeleton
 * Loading placeholder for the admin metrics overview
 */
export function AdminMetricsOverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-4 w-64" />
    </div>
  );
}
