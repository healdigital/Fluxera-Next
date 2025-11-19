import { NextRequest, NextResponse } from 'next/server';

import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CacheKeys,
  dashboardCache,
} from '../../../home/[account]/dashboard/_lib/utils/dashboard-cache';

/**
 * GET /api/dashboard/trends
 * Returns trend data for dashboard charts
 * Implements caching to reduce database load
 */
export const GET = enhanceRouteHandler(
  async ({ request }: { request: NextRequest }) => {
    const searchParams = request.nextUrl.searchParams;
    const accountSlug = searchParams.get('accountSlug');
    const metricType = searchParams.get('metricType') ?? 'assets';
    const timeRange = searchParams.get('timeRange') ?? '30d';

    if (!accountSlug) {
      return NextResponse.json(
        { error: 'Account slug is required' },
        { status: 400 },
      );
    }

    // Validate metric type
    const validMetricTypes = ['assets', 'users', 'licenses'];
    if (!validMetricTypes.includes(metricType)) {
      return NextResponse.json(
        { error: 'Invalid metric type' },
        { status: 400 },
      );
    }

    // Convert time range to days
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = daysMap[timeRange] ?? 30;

    // Check cache first
    const cacheKey = CacheKeys.trends(accountSlug, metricType, timeRange);
    const cachedData = dashboardCache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'private, max-age=30',
        },
      });
    }

    try {
      const client = getSupabaseServerClient();

      const { data, error } = await client.rpc('get_dashboard_trends', {
        p_account_slug: accountSlug,
        p_metric_type: metricType,
        p_days: days,
      });

      if (error) {
        console.error('Error loading trend data:', error);
        return NextResponse.json(
          { error: 'Failed to load trend data' },
          { status: 500 },
        );
      }

      // Cache the result
      dashboardCache.set(cacheKey, data ?? []);

      return NextResponse.json(data ?? [], {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'private, max-age=30',
        },
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  },
);
