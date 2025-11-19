'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Laptop } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import type { AssetStatusDistribution } from '../../_lib/types/dashboard.types';

interface AssetStatusWidgetProps {
  accountSlug: string;
}

/**
 * Asset Status Distribution Widget
 * Displays a pie chart showing the breakdown of assets by status
 * Clicking on a status segment navigates to filtered asset list
 */
export function AssetStatusWidget({ accountSlug }: AssetStatusWidgetProps) {
  const [distribution, setDistribution] = useState<AssetStatusDistribution[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDistribution() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/dashboard/asset-status?accountSlug=${accountSlug}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load asset status distribution');
        }

        const data = await response.json();
        setDistribution(data);
      } catch (err) {
        console.error('Error loading asset status distribution:', err);
        setError('Failed to load asset status distribution');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDistribution();
  }, [accountSlug]);

  if (isLoading) {
    return <AssetStatusWidgetSkeleton />;
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Laptop className="h-5 w-5" />
            Asset Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (distribution.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Laptop className="h-5 w-5" />
            Asset Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            No assets found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage display
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  // Prepare data for pie chart
  const chartData = distribution.map((item) => ({
    name: formatStatusLabel(item.status),
    value: item.count,
    percentage: item.percentage,
    status: item.status,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Laptop className="h-5 w-5" />
          Asset Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pie Chart */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getStatusColor(entry.status)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Legend with Links */}
          <div className="space-y-2">
            {chartData.map((item) => (
              <Link
                key={item.status}
                href={`/home/${accountSlug}/assets?statuses=${item.status}`}
                className="hover:bg-muted flex items-center justify-between rounded-lg p-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm">
                    {item.value} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Total Count */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total Assets</span>
              <span className="text-sm font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Custom Tooltip for Pie Chart
 */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      percentage: number;
      status: string;
    };
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-lg">
      <p className="font-semibold">{data.name}</p>
      <p className="text-sm">
        Count: <span className="font-medium">{data.value}</span>
      </p>
      <p className="text-sm">
        Percentage:{' '}
        <span className="font-medium">{data.percentage.toFixed(1)}%</span>
      </p>
    </div>
  );
}

/**
 * Format status label for display
 */
function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get color for asset status
 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: '#10b981', // green
    assigned: '#3b82f6', // blue
    in_maintenance: '#f59e0b', // amber
    retired: '#6b7280', // gray
    lost: '#ef4444', // red
  };

  return colors[status] ?? '#8b5cf6'; // default purple
}

/**
 * Asset Status Widget Skeleton
 * Loading placeholder for the asset status widget
 */
export function AssetStatusWidgetSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart skeleton */}
          <div className="flex h-[200px] items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>

          {/* Legend skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Total skeleton */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
