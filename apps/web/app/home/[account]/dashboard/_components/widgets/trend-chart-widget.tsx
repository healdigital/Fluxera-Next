'use client';

import { useEffect, useState } from 'react';

import { TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import type {
  TrendDataPoint,
  TrendMetricType,
  TrendTimeRange,
} from '../../_lib/types/dashboard.types';

interface TrendChartWidgetProps {
  accountSlug: string;
  metricType?: TrendMetricType;
  defaultTimeRange?: TrendTimeRange;
}

/**
 * Trend Chart Widget
 * Displays line chart showing how key metrics change over time
 * Supports multiple time ranges and metric types
 */
export function TrendChartWidget({
  accountSlug,
  metricType = 'assets',
  defaultTimeRange = '30d',
}: TrendChartWidgetProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TrendTimeRange>(defaultTimeRange);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/dashboard/trends?accountSlug=${accountSlug}&metricType=${metricType}&timeRange=${selectedTimeRange}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load trend data');
        }

        const data = await response.json();
        setTrendData(data);
      } catch (err) {
        console.error('Error loading trend data:', err);
        setError('Failed to load trend data');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchTrendData();
  }, [accountSlug, metricType, selectedTimeRange]);

  if (isLoading) {
    return <TrendChartWidgetSkeleton />;
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            {getMetricLabel(metricType)} Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have sufficient data
  const hasData = trendData.length > 0;
  const hasMultipleDataPoints = trendData.length > 1;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            {getMetricLabel(metricType)} Trend
          </CardTitle>

          {/* Time Range Selector */}
          <TimeRangeSelector
            selectedRange={selectedTimeRange}
            onRangeChange={setSelectedTimeRange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
            No data available for this period
          </div>
        ) : !hasMultipleDataPoints ? (
          <div className="space-y-4">
            <div className="text-muted-foreground flex h-[300px] items-center justify-center text-center text-sm">
              <div>
                <p className="font-medium">Insufficient data</p>
                <p className="text-xs">
                  At least 2 data points are needed to display a trend
                </p>
              </div>
            </div>
            {/* Show current value */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Value</span>
                <span className="text-lg font-bold">
                  {trendData[0]?.value ?? 0}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Line Chart */}
            <div className="h-[300px] w-full" data-test="trend-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateTick}
                    className="text-xs"
                    stroke="currentColor"
                  />
                  <YAxis
                    className="text-xs"
                    stroke="currentColor"
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip metricType={metricType} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <TrendSummary data={trendData} metricType={metricType} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Time Range Selector Component
 * Allows users to switch between different time ranges
 */
interface TimeRangeSelectorProps {
  selectedRange: TrendTimeRange;
  onRangeChange: (range: TrendTimeRange) => void;
}

function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  const ranges: Array<{ value: TrendTimeRange; label: string }> = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];

  return (
    <div className="bg-muted flex rounded-lg p-1">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            selectedRange === range.value
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Custom Tooltip for Line Chart
 * Displays exact values and timestamps on hover
 */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: TrendDataPoint;
  }>;
  metricType: TrendMetricType;
}

function CustomTooltip({ active, payload, metricType }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div className="bg-popover text-popover-foreground rounded-lg border p-3 shadow-lg">
      <p className="text-xs font-medium">{formatFullDate(data.date)}</p>
      <p className="mt-1 text-sm">
        <span className="text-muted-foreground">
          {getMetricLabel(metricType)}:{' '}
        </span>
        <span className="font-bold">{data.value.toLocaleString()}</span>
      </p>
    </div>
  );
}

/**
 * Trend Summary Component
 * Shows summary statistics for the trend data
 */
interface TrendSummaryProps {
  data: TrendDataPoint[];
  metricType: TrendMetricType;
}

function TrendSummary({ data }: TrendSummaryProps) {
  if (data.length === 0) {
    return null;
  }

  const values = data.map((d) => d.value);
  const firstValue = values[0] ?? 0;
  const lastValue = values[values.length - 1] ?? 0;
  const change = lastValue - firstValue;
  const changePercentage =
    firstValue > 0 ? ((change / firstValue) * 100).toFixed(1) : '0';
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

  const maxValue = Math.max(...values);
  const avgValue = Math.round(
    values.reduce((a, b) => a + b, 0) / values.length,
  );

  return (
    <div className="border-t pt-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Current Value */}
        <div>
          <p className="text-muted-foreground text-xs">Current</p>
          <p className="text-lg font-bold">{lastValue.toLocaleString()}</p>
        </div>

        {/* Change */}
        <div>
          <p className="text-muted-foreground text-xs">Change</p>
          <p
            className={`text-lg font-bold ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : ''
            }`}
          >
            {change > 0 ? '+' : ''}
            {change} ({changePercentage}%)
          </p>
        </div>

        {/* Average */}
        <div>
          <p className="text-muted-foreground text-xs">Average</p>
          <p className="text-lg font-bold">{avgValue.toLocaleString()}</p>
        </div>

        {/* Peak */}
        <div>
          <p className="text-muted-foreground text-xs">Peak</p>
          <p className="text-lg font-bold">{maxValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Get human-readable label for metric type
 */
function getMetricLabel(metricType: TrendMetricType): string {
  const labels: Record<TrendMetricType, string> = {
    assets: 'Assets',
    users: 'Users',
    licenses: 'Licenses',
  };

  return labels[metricType] ?? 'Metric';
}

/**
 * Format date for chart tick (short format)
 */
function formatDateTick(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  return `${month} ${day}`;
}

/**
 * Format date for tooltip (full format)
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Trend Chart Widget Skeleton
 * Loading placeholder for the trend chart widget
 */
export function TrendChartWidgetSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart skeleton */}
          <div className="flex h-[300px] items-end justify-between gap-2">
            {Array.from({ length: 12 }).map((_, index) => {
              // Use index-based height for consistent skeleton rendering
              const height = 40 + ((index * 5) % 60);
              return (
                <Skeleton
                  key={index}
                  className="w-full"
                  style={{
                    height: `${height}%`,
                  }}
                />
              );
            })}
          </div>

          {/* Summary skeleton */}
          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="mb-2 h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
