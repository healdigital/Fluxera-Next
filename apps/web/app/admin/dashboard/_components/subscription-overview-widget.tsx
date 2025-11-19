'use client';

import Link from 'next/link';

import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import type { SubscriptionOverview } from '../_lib/types/admin-dashboard.types';

interface SubscriptionOverviewWidgetProps {
  subscriptions: SubscriptionOverview[];
}

/**
 * Subscription Overview Widget
 * Displays subscription metrics for super administrators
 * Shows account counts by tier, expiring subscriptions, and usage limit warnings
 */
export function SubscriptionOverviewWidget({
  subscriptions,
}: SubscriptionOverviewWidgetProps) {
  // Calculate totals
  const totalAccounts = subscriptions.reduce(
    (sum, sub) => sum + sub.account_count,
    0,
  );
  const totalExpiringSoon = subscriptions.reduce(
    (sum, sub) => sum + sub.expiring_soon_count,
    0,
  );
  const totalOverLimit = subscriptions.reduce(
    (sum, sub) => sum + sub.over_limit_count,
    0,
  );
  const totalRevenue = subscriptions.reduce(
    (sum, sub) => sum + sub.total_revenue,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Accounts */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div
                className={
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }
              >
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="text-muted-foreground mt-4 text-sm font-medium">
              Total Subscriptions
            </div>
            <div className="mt-2 text-3xl font-bold">
              {totalAccounts.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div
                className={
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }
              >
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-muted-foreground mt-4 text-sm font-medium">
              Total Revenue
            </div>
            <div className="mt-2 text-3xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div
                className={
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                }
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-muted-foreground mt-4 text-sm font-medium">
              Expiring Soon
            </div>
            <div className="mt-2 text-3xl font-bold">
              {totalExpiringSoon.toLocaleString()}
            </div>
            <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              Within 30 days
            </div>
          </CardContent>
        </Card>

        {/* Over Limit */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div
                className={
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-muted-foreground mt-4 text-sm font-medium">
              Over Usage Limit
            </div>
            <div className="mt-2 text-3xl font-bold">
              {totalOverLimit.toLocaleString()}
            </div>
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              Requires attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tiers Breakdown */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Subscriptions by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No subscription data available
              </div>
            ) : (
              subscriptions.map((subscription) => (
                <SubscriptionTierRow
                  key={subscription.tier}
                  subscription={subscription}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual Subscription Tier Row
 */
interface SubscriptionTierRowProps {
  subscription: SubscriptionOverview;
}

function SubscriptionTierRow({ subscription }: SubscriptionTierRowProps) {
  const hasWarnings =
    subscription.expiring_soon_count > 0 || subscription.over_limit_count > 0;

  return (
    <div className="border-border flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        {/* Tier Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${getTierColor(subscription.tier)}`}
        >
          <CreditCard className="h-6 w-6" />
        </div>

        {/* Tier Info */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold capitalize">{subscription.tier}</h3>
            {!hasWarnings && (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div className="text-muted-foreground mt-1 text-sm">
            {subscription.account_count.toLocaleString()}{' '}
            {subscription.account_count === 1 ? 'account' : 'accounts'}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6">
        {/* Revenue */}
        <div className="text-right">
          <div className="text-sm font-medium">
            ${subscription.total_revenue.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-xs">Revenue</div>
        </div>

        {/* Warnings */}
        {subscription.expiring_soon_count > 0 && (
          <Link
            href={`/admin/subscriptions?filter=expiring&tier=${subscription.tier}`}
            className="flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{subscription.expiring_soon_count} expiring</span>
          </Link>
        )}

        {subscription.over_limit_count > 0 && (
          <Link
            href={`/admin/subscriptions?filter=over-limit&tier=${subscription.tier}`}
            className="flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{subscription.over_limit_count} over limit</span>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Get color classes for subscription tier
 */
function getTierColor(tier: string): string {
  const tierLower = tier.toLowerCase();

  if (tierLower.includes('enterprise') || tierLower.includes('premium')) {
    return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
  }

  if (tierLower.includes('pro') || tierLower.includes('professional')) {
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
  }

  if (tierLower.includes('basic') || tierLower.includes('starter')) {
    return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
  }

  if (tierLower.includes('free') || tierLower.includes('trial')) {
    return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
  }

  return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
}

/**
 * Subscription Overview Widget Skeleton
 * Loading placeholder for the subscription overview
 */
export function SubscriptionOverviewWidgetSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
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

      {/* Tiers Breakdown Skeleton */}
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border-border flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="mt-2 h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-1 h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
