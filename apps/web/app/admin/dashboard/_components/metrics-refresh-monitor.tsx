'use client';

import { useCallback, useState, useTransition } from 'react';

import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { toast } from '@kit/ui/sonner';

import {
  getMetricsRefreshStatsAction,
  triggerMetricsRefreshAction,
} from '../_lib/server/admin-dashboard-actions';
import type { MetricsRefreshStats } from '../_lib/types/admin-dashboard.types';

interface MetricsRefreshMonitorProps {
  initialStats: MetricsRefreshStats;
}

export function MetricsRefreshMonitor({
  initialStats,
}: MetricsRefreshMonitorProps) {
  const [stats, setStats] = useState<MetricsRefreshStats>(initialStats);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Client-side health check
  const checkHealth = (stats: MetricsRefreshStats) => {
    const now = new Date();
    const lastRefresh = stats.last_refresh_at
      ? new Date(stats.last_refresh_at)
      : null;
    const minutesSinceLastRefresh = lastRefresh
      ? (now.getTime() - lastRefresh.getTime()) / 1000 / 60
      : Infinity;

    if (!lastRefresh || minutesSinceLastRefresh > 15) {
      return {
        status: 'critical' as const,
        message: 'Metrics refresh is not running',
      };
    }

    if (stats.success_rate < 80) {
      return {
        status: 'warning' as const,
        message: 'High failure rate detected',
      };
    }

    if (minutesSinceLastRefresh > 10) {
      return {
        status: 'warning' as const,
        message: 'Metrics refresh is delayed',
      };
    }

    return {
      status: 'healthy' as const,
      message: 'All systems operational',
    };
  };

  const health = checkHealth(stats);

  const handleRefreshStats = useCallback(() => {
    startTransition(async () => {
      const result = await getMetricsRefreshStatsAction({ hours: 24 });

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        toast.error('Failed to refresh statistics');
      }
    });
  }, []);

  const handleTriggerRefresh = useCallback(() => {
    setIsRefreshing(true);

    startTransition(async () => {
      const result = await triggerMetricsRefreshAction({});

      setIsRefreshing(false);

      if (result.success && result.data) {
        toast.success(
          `Metrics refreshed in ${(result.data.duration_ms / 1000).toFixed(2)}s`,
        );

        // Refresh stats after successful manual refresh
        handleRefreshStats();
      } else {
        toast.error(result.error || 'Failed to trigger metrics refresh');
      }
    });
  }, [handleRefreshStats]);

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    }

    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);

    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Metrics Refresh Monitor</CardTitle>
            <CardDescription>
              Platform metrics are refreshed every 5 minutes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStats}
              disabled={isPending}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
              />
              Refresh Stats
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleTriggerRefresh}
              disabled={isRefreshing || isPending}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Trigger Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Health Status */}
          <div className="flex items-center gap-3">
            <div className={getStatusColor()}>{getStatusIcon()}</div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className={`text-sm ${getStatusColor()}`}>{health.message}</p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Total Refreshes</p>
              <p className="text-2xl font-bold">{stats.total_refreshes}</p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Success Rate</p>
              <p className="text-2xl font-bold">
                {stats.success_rate.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Avg Duration</p>
              <p className="text-2xl font-bold">
                {formatDuration(stats.avg_duration_ms)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Last Refresh</p>
              <p className="text-2xl font-bold">
                {formatTimestamp(stats.last_refresh_at)}
              </p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Successful</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {stats.successful_refreshes}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Failed</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {stats.failed_refreshes}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-xs">Max Duration</p>
              <p className="text-lg font-semibold">
                {formatDuration(stats.max_duration_ms)}
              </p>
            </div>
          </div>

          {/* Last Error */}
          {stats.last_error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Last Error
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {stats.last_error}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              Statistics shown for the last 24 hours. The scheduled job runs
              every 5 minutes to keep platform metrics up to date.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
