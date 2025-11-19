'use client';

import React, { useEffect, useState } from 'react';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  HardDrive,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Alert, AlertDescription } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';

import type {
  SystemHealthMetric,
  SystemHealthStatus,
  SystemHealthTrend,
} from '../_lib/types/admin-dashboard.types';

interface SystemHealthWidgetProps {
  systemHealth: SystemHealthStatus;
}

export function SystemHealthWidget({ systemHealth }: SystemHealthWidgetProps) {
  const [currentHealth, setCurrentHealth] =
    useState<SystemHealthStatus>(systemHealth);
  const [trends, setTrends] = useState<Record<string, SystemHealthTrend>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/system-health');
        if (response.ok) {
          const data = await response.json();
          setCurrentHealth(data);
        }
      } catch (error) {
        console.error('Error refreshing system health:', error);
      } finally {
        setIsLoading(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Load trend data for each metric
  useEffect(() => {
    async function loadTrends() {
      const trendData: Record<string, SystemHealthTrend> = {};

      for (const metric of currentHealth.metrics) {
        try {
          const response = await fetch(
            `/api/admin/system-health/trends?metric=${metric.metric_type}`,
          );
          if (response.ok) {
            const trend = await response.json();
            trendData[metric.metric_type] = trend;
          }
        } catch (error) {
          console.error(
            `Error loading trend for ${metric.metric_type}:`,
            error,
          );
        }
      }

      setTrends(trendData);
    }

    loadTrends();
  }, [currentHealth.metrics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'warning',
      critical: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        <Trans
          i18nKey={`admin:dashboard.systemHealth.status.${status}`}
          defaults={status}
        />
      </Badge>
    );
  };

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'database_performance':
        return <Database className="h-5 w-5" />;
      case 'api_response_time':
        return <Activity className="h-5 w-5" />;
      case 'storage_utilization':
        return <HardDrive className="h-5 w-5" />;
      case 'active_connections':
        return <Users className="h-5 w-5" />;
      case 'error_rate':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricBgColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 dark:bg-green-950';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950';
      case 'critical':
        return 'bg-red-50 dark:bg-red-950';
      default:
        return 'bg-gray-50 dark:bg-gray-950';
    }
  };

  const formatMetricName = (metricType: string) => {
    return metricType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTrendData = (trend: SystemHealthTrend) => {
    return trend.data_points.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: point.value,
      status: point.status,
    }));
  };

  const getChartColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#22c55e';
      case 'warning':
        return '#eab308';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(currentHealth.overall_status)}
              <CardTitle>
                <Trans i18nKey={'admin:dashboard.systemHealth.title'} />
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(currentHealth.overall_status)}
              {isLoading && (
                <span className="text-muted-foreground text-sm">
                  <Trans i18nKey={'admin:dashboard.systemHealth.updating'} />
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            <Trans
              i18nKey={'admin:dashboard.systemHealth.lastChecked'}
              values={{
                time: new Date(currentHealth.last_checked).toLocaleTimeString(),
              }}
            />
          </p>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {currentHealth.metrics.some((m) => m.status === 'critical') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <Trans i18nKey={'admin:dashboard.systemHealth.criticalAlert'} />
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentHealth.metrics.map((metric) => (
          <MetricCard
            key={metric.metric_type}
            metric={metric}
            trend={trends[metric.metric_type]}
            getMetricIcon={getMetricIcon}
            getMetricColor={getMetricColor}
            getMetricBgColor={getMetricBgColor}
            formatMetricName={formatMetricName}
            formatTrendData={formatTrendData}
            getChartColor={getChartColor}
          />
        ))}
      </div>
    </div>
  );
}

interface MetricCardProps {
  metric: SystemHealthMetric;
  trend?: SystemHealthTrend;
  getMetricIcon: (metricType: string) => React.ReactElement;
  getMetricColor: (status: string) => string;
  getMetricBgColor: (status: string) => string;
  formatMetricName: (metricType: string) => string;
  formatTrendData: (
    trend: SystemHealthTrend,
  ) => Array<{ time: string; value: number }>;
  getChartColor: (status: string) => string;
}

function MetricCard({
  metric,
  trend,
  getMetricIcon,
  getMetricColor,
  getMetricBgColor,
  formatMetricName,
  formatTrendData,
  getChartColor,
}: MetricCardProps) {
  const chartData = trend ? formatTrendData(trend) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={getMetricColor(metric.status)}>
              {getMetricIcon(metric.metric_type)}
            </div>
            <CardTitle className="text-base">
              {formatMetricName(metric.metric_type)}
            </CardTitle>
          </div>
          <Badge
            variant={
              metric.status === 'critical'
                ? 'destructive'
                : metric.status === 'warning'
                  ? 'warning'
                  : 'default'
            }
            className="text-xs"
          >
            {metric.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className={`rounded-lg p-4 ${getMetricBgColor(metric.status)}`}>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${getMetricColor(metric.status)}`}
            >
              {metric.current_value}
            </span>
            <span className="text-muted-foreground text-sm">{metric.unit}</span>
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            <Trans
              i18nKey={'admin:dashboard.systemHealth.thresholds'}
              values={{
                warning: metric.warning_threshold,
                critical: metric.critical_threshold,
                unit: metric.unit,
              }}
            />
          </div>
        </div>

        {/* 24-Hour Trend Chart */}
        {chartData.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              <Trans i18nKey={'admin:dashboard.systemHealth.trend24h'} />
            </p>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id={`gradient-${metric.metric_type}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={getChartColor(metric.status)}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={getChartColor(metric.status)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getChartColor(metric.status)}
                  strokeWidth={2}
                  fill={`url(#gradient-${metric.metric_type})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
