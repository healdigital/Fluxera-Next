import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { PERFORMANCE_THRESHOLDS, measureAsync } from '@kit/shared/performance';

import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';
import { Database } from '~/lib/database.types';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedUsers {
  users: TeamMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TeamMember {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role_name: string;
  status: string;
  last_sign_in_at: string | null;
  created_at: string;
}

/**
 * Load data for the users page with pagination
 * @param client - Supabase client
 * @param slug - Account slug
 * @param filters - Optional filters for search, role, status, and pagination
 */
export async function loadUsersPageData(
  client: SupabaseClient<Database>,
  slug: string,
  filters?: UserFilters,
) {
  return measureAsync(
    'load-users-page',
    async () => {
      return Promise.all([
        measureAsync(
          'load-users-paginated',
          () => loadUsersPaginated(client, slug, filters),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-team-workspace',
          () => loadTeamWorkspace(slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
      ]);
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD,
  );
}

/**
 * Load team members with pagination and optional filtering
 * Calls the get_team_members database function for data
 * and get_team_members_count for efficient counting
 * @param client - Supabase client
 * @param accountSlug - Account slug
 * @param filters - Optional filters including pagination
 */
async function loadUsersPaginated(
  client: SupabaseClient<Database>,
  accountSlug: string,
  filters?: UserFilters,
): Promise<PaginatedUsers> {
  try {
    // Pagination settings with defaults
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    // Normalize filter values - convert "all" to undefined for database query
    const normalizedRole =
      filters?.role && filters.role !== 'all' ? filters.role : undefined;
    const normalizedStatus =
      filters?.status && filters.status !== 'all' ? filters.status : undefined;

    // Fetch users and count in parallel for better performance
    const [usersResult, countResult] = await Promise.all([
      client.rpc('get_team_members', {
        p_account_slug: accountSlug,
        p_search: filters?.search || undefined,
        p_role: normalizedRole,
        p_status: normalizedStatus,
        p_limit: pageSize,
        p_offset: offset,
      }),
      client.rpc('get_team_members_count', {
        p_account_slug: accountSlug,
        p_search: filters?.search || undefined,
        p_role: normalizedRole,
        p_status: normalizedStatus,
      }),
    ]);

    if (usersResult.error) {
      console.error('Error loading team members:', usersResult.error);
      throw new Error(
        `Failed to load team members: ${usersResult.error.message}`,
      );
    }

    if (countResult.error) {
      console.error('Error getting user count:', countResult.error);
      // Continue with current page data even if count fails
    }

    const users = usersResult.data ?? [];
    const totalCount = Number(countResult.data ?? users.length);
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      users,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Unexpected error loading users:', error);
    throw error;
  }
}
