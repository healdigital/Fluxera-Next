import { NextRequest, NextResponse } from 'next/server';

import { isSuperAdmin } from '@kit/admin';
import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getSystemHealthTrend } from '../../../../admin/dashboard/_lib/server/system-health.service';

/**
 * GET /api/admin/system-health/trends?metric=<metric_type>
 * Returns 24-hour trend data for a specific metric
 * Protected: Super admin only
 */
export const GET = enhanceRouteHandler(
  async ({ request }: { request: NextRequest }) => {
    const client = getSupabaseServerClient();

    // Verify super admin access
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isSuperAdmin(client);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get metric type from query params
    const { searchParams } = new URL(request.url);
    const metricType = searchParams.get('metric');

    if (!metricType) {
      return NextResponse.json(
        { error: 'Missing metric parameter' },
        { status: 400 },
      );
    }

    // Validate metric type
    const validMetrics = [
      'database_performance',
      'api_response_time',
      'storage_utilization',
      'active_connections',
      'error_rate',
    ];

    if (!validMetrics.includes(metricType)) {
      return NextResponse.json(
        { error: 'Invalid metric type' },
        { status: 400 },
      );
    }

    try {
      const trend = await getSystemHealthTrend(client, metricType);

      return NextResponse.json(trend);
    } catch (error) {
      console.error('Error fetching system health trend:', error);

      return NextResponse.json(
        { error: 'Failed to fetch system health trend' },
        { status: 500 },
      );
    }
  },
);
