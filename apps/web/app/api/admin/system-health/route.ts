import { NextRequest, NextResponse } from 'next/server';

import { isSuperAdmin } from '@kit/admin';
import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getSystemHealthStatus } from '../../../admin/dashboard/_lib/server/system-health.service';

/**
 * GET /api/admin/system-health
 * Returns current system health status with all metrics
 * Protected: Super admin only
 */
export const GET = enhanceRouteHandler(
  async ({ request: _request }: { request: NextRequest }) => {
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

    try {
      const systemHealth = await getSystemHealthStatus(client);

      return NextResponse.json(systemHealth);
    } catch (error) {
      console.error('Error fetching system health:', error);

      return NextResponse.json(
        { error: 'Failed to fetch system health' },
        { status: 500 },
      );
    }
  },
);
