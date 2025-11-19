import { NextRequest, NextResponse } from 'next/server';

import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  CacheKeys,
  dashboardCache,
} from '../../../home/[account]/dashboard/_lib/utils/dashboard-cache';

/**
 * GET /api/dashboard/asset-status
 * Returns asset status distribution for a team account
 * Implements caching to reduce database load
 */
export const GET = enhanceRouteHandler(
  async ({ request }: { request: NextRequest }) => {
    const searchParams = request.nextUrl.searchParams;
    const accountSlug = searchParams.get('accountSlug');

    if (!accountSlug) {
      return NextResponse.json(
        { error: 'Account slug is required' },
        { status: 400 },
      );
    }

    // Check cache first
    const cacheKey = CacheKeys.assetStatus(accountSlug);
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

      const { data, error } = await client.rpc(
        'get_asset_status_distribution',
        {
          p_account_slug: accountSlug,
        },
      );

      if (error) {
        console.error('Error loading asset status distribution:', error);
        return NextResponse.json(
          { error: 'Failed to load asset status distribution' },
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
