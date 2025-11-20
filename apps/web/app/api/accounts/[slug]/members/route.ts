import { NextRequest, NextResponse } from 'next/server';

import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * GET /api/accounts/[slug]/members
 *
 * Fetch team members for an account
 */
export const GET = enhanceRouteHandler(
  async ({ request }: { request: NextRequest }) => {
    const client = getSupabaseServerClient();
    
    // Extract slug from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const accountsIndex = pathParts.indexOf('accounts');
    const slug = pathParts[accountsIndex + 1];

    if (!slug) {
      return NextResponse.json(
        { error: 'Account slug is required' },
        { status: 400 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const search = searchParams.get('search') || undefined;

    try {
      // Call the database function to get team members
      const { data, error } = await client.rpc('get_team_members', {
        p_account_slug: slug,
        p_search: search,
        p_role: undefined,
        p_status: undefined,
        p_limit: limit,
        p_offset: 0,
      });

      if (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json(
          { error: 'Failed to fetch team members' },
          { status: 500 },
        );
      }

      return NextResponse.json({
        members: data || [],
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
