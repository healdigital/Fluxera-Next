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
  Bar,
  BarChart,
  Legend,
} from 'recharts';

import { ExpandedWidgetModal, type FilterConfig } from '@kit/ui/modal';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import type {
  TrendDataPoint,
  TrendMetricType,
  TrendTimeRange,
} from '../_lib/types/dashboard.types';

interface ExpandedChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountSlug: string;
  metricType?: TrendMetricType;
  defaultTimeRange?: TrendTimeRange;
}

/**
 * Expanded Chart Modal
 * Displays detailed chart view with multiple visualization options
 */
export function ExpandedChartModal({
  open,
  onOpenChange,
  accountSlug,
  metricType = 'assets',
  defaultTimeRange = '30d',
}: ExpandedChartModalProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TrendTimeRange>(defaultTimeRange);
  const [selectedMetric, setSelectedMetric] =
    useState<TrendMetricType>(metricType);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [loading, setLoading] = useState(false);

  // Fetch trend data
  useEffect(() => {
    async function fetchTrendData() {
      if (!open) return;

      try {
        setLoading(true);

        const response = await fetch(
          `/api/dashboard/trends?accountSlug=${accountSlug}&metricType=${selectedMetric}&timeRange=${timeRange}`,
        );

        if (!response.ok) {
          throw new Error('Failed to load trend data');
        }

        const data = await response.json();
        setTrendData(data);
      } catch (error) {
        console.error('Error loading trend data:', error);
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchTrendData();
  }, [accountSlug, selectedMetric, timeRange, open]);

  // Filter configuration
  const filters: FilterConfig[] = [
    {
      id: 'metric',
      label: 'Metric',
      type: 'select',
      options: [
        { value: 'assets', label: 'Assets' },
        { value: 'users', label: 'Users' },
        { value: 'licenses', label: 'Licenses' },
      ],
      value: selectedMetric,
      onChange: (value) => setSelectedMetric(value as TrendMetricType),
    },
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
      onChange: (value) => setTimeRange(value as TrendTimeRange),
    },
  ];

  // Export handler
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(
        `/api/dashboard/export-chart?accountSlug=${accountSlug}&metricType=${selectedMetric}&timeRange=${timeRange}&format=${format}`,
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedMetric}-trend-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Calculate statistics
  const stats = calculateStatistics(trendData);

  return (
    <ExpandedWidgetModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${getMetricLabel(selectedMetric)} Trend Analysis`}
      description="Detailed trend analysis with multiple visualization options"
      loading={loading}
      filters={filters}
      onExport={handleExport}
    >
      <div className="space-y-6">
        {/* Chart Type Selector */}
        <div className="flex items-center justify-between">
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'line' | 'bar')}>
            <TabsList>
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              {getMetricLabel(selectedMetric)} Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="text-muted-foreground flex h-[400px] items-center justify-center text-sm">
                No data available for this period
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                        content={
                          <CustomTooltip metricType={selectedMetric} />
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={getMetricLabel(selectedMetric)}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart
                      data={trendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                        content={
                          <CustomTooltip metricType={selectedMetric} />
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name={getMetricLabel(selectedMetric)}
                        fill="hsl(var(--primary))"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Current Value"
              value={stats.current.toLocaleString()}
              trend={stats.trend}
            />
            <StatCard
              label="Change"
              value={`${stats.change > 0 ? '+' : ''}${stats.change}`}
              subtitle={`${stats.changePercentage > 0 ? '+' : ''}${stats.changePercentage.toFixed(1)}%`}
              trend={stats.trend}
            />
            <StatCard
              label="Average"
              value={stats.average.toLocaleString()}
            />
            <StatCard
              label="Peak"
              value={stats.peak.toLocaleString()}
            />
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-right p-2 font-medium">Value</th>
                    <th className="text-right p-2 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((point, index) => {
                    const previousValue =
                      index > 0 ? trendData[index - 1]?.value ?? 0 : 0;
                    const change = point.value - previousValue;
                    const changePercent =
                      previousValue > 0
                        ? ((change / previousValue) * 100).toFixed(1)
                        : '0';

                    return (
                      <tr key={point.date} className="border-b">
                        <td className="p-2">{formatFullDate(point.date)}</td>
                        <td className="text-right p-2 font-medium">
                          {point.value.toLocaleString()}
                        </td>
                        <td
                          className={`text-right p-2 ${
                            index === 0
                              ? 'text-muted-foreground'
                              : change > 0
                                ? 'text-green-600 dark:text-green-400'
                                : change < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : ''
                          }`}
                        >
                          {index === 0
                            ? '-'
                            : `${change > 0 ? '+' : ''}${change} (${changePercent}%)`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExpandedWidgetModal>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  label,
  value,
  subtitle,
  trend,
}: {
  label: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p
            className={`text-2xl font-bold ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : ''
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Custom Tooltip for Charts
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
 * Calculate statistics from trend data
 */
function calculateStatistics(data: TrendDataPoint[]) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const current = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const change = current - first;
  const changePercentage = first > 0 ? (change / first) * 100 : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peak = Math.max(...values);

  return {
    current,
    change,
    changePercentage,
    trend: trend as 'up' | 'down' | 'stable',
    average,
    peak,
  };
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
