'use client';

import { useState } from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  TrendingDownIcon,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Trans } from '@kit/ui/trans';

import type {
  FeatureUsageStatistics,
  MostActiveAccount,
} from '../_lib/types/admin-dashboard.types';

interface UsageStatisticsWidgetProps {
  statistics: FeatureUsageStatistics[];
  mostActiveAccounts: MostActiveAccount[];
}

export function UsageStatisticsWidget({
  statistics,
  mostActiveAccounts,
}: UsageStatisticsWidgetProps) {
  const [timeRange, setTimeRange] = useState<string>('30');

  // Calculate feature adoption rates
  const getAdoptionBadgeVariant = (rate: number) => {
    if (rate >= 75) return 'success';
    if (rate >= 50) return 'default';
    if (rate >= 25) return 'warning';
    return 'destructive';
  };

  // Get trend icon and color
  const getTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return {
          icon: <ArrowUpIcon className="h-4 w-4" />,
          color: 'text-green-600',
          label: 'Increasing',
        };
      case 'down':
        return {
          icon: <ArrowDownIcon className="h-4 w-4" />,
          color: 'text-red-600',
          label: 'Declining',
        };
      case 'stable':
        return {
          icon: <MinusIcon className="h-4 w-4" />,
          color: 'text-gray-600',
          label: 'Stable',
        };
    }
  };

  // Identify features with declining engagement
  const decliningFeatures = statistics.filter(
    (stat) => stat.trend_direction === 'down',
  );

  return (
    <div className="space-y-6">
      {/* Feature Usage Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>
            <Trans i18nKey={'admin:dashboard.featureUsageStatistics'} />
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Trans i18nKey={'admin:dashboard.feature'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.totalUsage'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.activeAccounts'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.adoptionRate'} />
                </TableHead>
                <TableHead className="text-center">
                  <Trans i18nKey={'admin:dashboard.trend'} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Trans i18nKey={'admin:dashboard.noUsageData'} />
                  </TableCell>
                </TableRow>
              ) : (
                statistics.map((stat) => {
                  const trend = getTrendIndicator(stat.trend_direction);
                  const isDeclining = stat.trend_direction === 'down';

                  return (
                    <TableRow
                      key={stat.feature_name}
                      className={isDeclining ? 'bg-red-50/50' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {stat.feature_name}
                          {isDeclining && (
                            <TrendingDownIcon className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {stat.total_usage_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {stat.active_accounts_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={getAdoptionBadgeVariant(stat.adoption_rate)}
                        >
                          {stat.adoption_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={`flex items-center justify-center gap-1 ${trend.color}`}
                        >
                          {trend.icon}
                          <span className="text-sm">{trend.label}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Declining Features Alert */}
          {decliningFeatures.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <TrendingDownIcon className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-900">
                    <Trans i18nKey={'admin:dashboard.decliningEngagement'} />
                  </h4>
                  <p className="mt-1 text-sm text-red-700">
                    <Trans
                      i18nKey={'admin:dashboard.decliningEngagementMessage'}
                      values={{ count: decliningFeatures.length }}
                    />
                    : {decliningFeatures.map((f) => f.feature_name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Most Active Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'admin:dashboard.mostActiveAccounts'} />
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey={'admin:dashboard.mostActiveAccountsDescription'} />
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Trans i18nKey={'admin:dashboard.accountName'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.totalActivity'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.assetsCreated'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.usersAdded'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.licensesRegistered'} />
                </TableHead>
                <TableHead className="text-right">
                  <Trans i18nKey={'admin:dashboard.maintenanceScheduled'} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mostActiveAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Trans i18nKey={'admin:dashboard.noActiveAccounts'} />
                  </TableCell>
                </TableRow>
              ) : (
                mostActiveAccounts.map((account, index) => (
                  <TableRow key={account.account_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {account.account_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {account.total_activity_score.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.assets_created.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.users_added.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.licenses_registered.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.maintenance_scheduled.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
