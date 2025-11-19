import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { PERFORMANCE_THRESHOLDS, measureAsync } from '@kit/shared/performance';

import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';
import { Database } from '~/lib/database.types';

type AssetCategory = Database['public']['Enums']['asset_category'];
type AssetStatus = Database['public']['Enums']['asset_status'];

export interface AssetFilters {
  categories?: AssetCategory[];
  statuses?: AssetStatus[];
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAssets {
  assets: AssetWithUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AssetWithUser {
  id: string;
  account_id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  description: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  image_url: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  assigned_user?: {
    id: string;
    name: string;
    email: string | null;
    picture_url: string | null;
  } | null;
}

/**
 * Load data for the assets page with pagination
 * @param client - Supabase client
 * @param slug - Account slug
 * @param filters - Optional filters for category, status, search, and pagination
 */
export async function loadAssetsPageData(
  client: SupabaseClient<Database>,
  slug: string,
  filters?: AssetFilters,
) {
  return measureAsync(
    'load-assets-page',
    async () => {
      return Promise.all([
        measureAsync(
          'load-assets-paginated',
          () => loadAssetsPaginated(client, slug, filters),
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
 * Load assets with pagination and optional filtering
 * Includes assigned user information and avoids N+1 queries
 * @param client - Supabase client
 * @param accountSlug - Account slug
 * @param filters - Optional filters including pagination
 */
async function loadAssetsPaginated(
  client: SupabaseClient<Database>,
  accountSlug: string,
  filters?: AssetFilters,
): Promise<PaginatedAssets> {
  try {
    // First, get the account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError) {
      console.error('Error loading account:', accountError);
      throw new Error(`Failed to load account: ${accountError.message}`);
    }

    if (!account) {
      throw new Error('Account not found');
    }

    // Pagination settings with defaults
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 50; // Default to 50 items per page
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build the query for assets with count
    let query = client
      .from('assets')
      .select('*', { count: 'exact' })
      .eq('account_id', account.id);

    // Apply category filter
    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    // Apply status filter
    if (filters?.statuses && filters.statuses.length > 0) {
      query = query.in('status', filters.statuses);
    }

    // Apply search filter (search by name)
    if (filters?.search && filters.search.trim()) {
      query = query.ilike('name', `%${filters.search.trim()}%`);
    }

    // Apply ordering and pagination
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error loading assets:', error);
      throw new Error(`Failed to load assets: ${error.message}`);
    }

    const assetsData = data ?? [];

    // Get unique user IDs that are assigned to assets
    const assignedUserIds = assetsData
      .map((asset) => asset.assigned_to)
      .filter((id): id is string => id !== null);

    // Fetch user data for assigned users if there are any
    const usersMap = new Map<string, AssetWithUser['assigned_user']>();

    if (assignedUserIds.length > 0) {
      const { data: usersData, error: usersError } = await client
        .from('accounts_memberships')
        .select(
          `
          user_id,
          account:accounts!inner(id, name, email, picture_url)
        `,
        )
        .in('user_id', assignedUserIds)
        .eq('account_id', account.id);

      if (!usersError && usersData) {
        usersData.forEach((membership) => {
          if (membership.account) {
            usersMap.set(membership.user_id, {
              id: membership.user_id,
              name: membership.account.name || '',
              email: membership.account.email || null,
              picture_url: membership.account.picture_url || null,
            });
          }
        });
      }
    }

    // Transform the data to match our interface
    const assets: AssetWithUser[] = assetsData.map((asset) => ({
      ...asset,
      assigned_user: asset.assigned_to
        ? usersMap.get(asset.assigned_to) || null
        : null,
    }));

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      assets,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Unexpected error loading assets:', error);
    throw error;
  }
}
