import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { PERFORMANCE_THRESHOLDS, measureAsync } from '@kit/shared/performance';

import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';
import { Database } from '~/lib/database.types';

import { loadLicenseRenewalAlerts } from './license-alerts.loader';

type LicenseType = Database['public']['Enums']['license_type'];

export interface LicenseFilters {
  search?: string;
  vendor?: string;
  licenseTypes?: LicenseType[];
  expirationStatus?: 'all' | 'active' | 'expiring' | 'expired';
  page?: number;
  pageSize?: number;
}

export interface PaginatedLicenses {
  licenses: LicenseWithAssignments[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LicenseWithAssignments {
  id: string;
  name: string;
  vendor: string;
  license_key: string;
  license_type: LicenseType;
  expiration_date: string;
  days_until_expiry: number;
  assignment_count: number;
  is_expired: boolean;
}

export interface LicenseStats {
  total_licenses: number;
  expiring_soon: number;
  expired: number;
  total_assignments: number;
}

/**
 * Load data for the licenses page with pagination and statistics
 * @param client - Supabase client
 * @param slug - Account slug
 * @param filters - Optional filters for search, vendor, type, expiration status, and pagination
 */
export async function loadLicensesPageData(
  client: SupabaseClient<Database>,
  slug: string,
  filters?: LicenseFilters,
) {
  return measureAsync(
    'load-licenses-page',
    async () => {
      return Promise.all([
        measureAsync(
          'load-licenses-paginated',
          () => loadLicensesPaginated(client, slug, filters),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-license-stats',
          () => loadLicenseStats(client, slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-unique-vendors',
          () => loadUniqueVendors(client, slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-team-workspace',
          () => loadTeamWorkspace(slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
        measureAsync(
          'load-license-renewal-alerts',
          () => loadLicenseRenewalAlerts(client, slug),
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        ),
      ]);
    },
    PERFORMANCE_THRESHOLDS.PAGE_LOAD,
  );
}

/**
 * Load licenses with pagination and optional filtering
 * Uses the get_licenses_with_assignments database function
 * @param client - Supabase client
 * @param accountSlug - Account slug
 * @param filters - Optional filters including pagination
 */
async function loadLicensesPaginated(
  client: SupabaseClient<Database>,
  accountSlug: string,
  filters?: LicenseFilters,
): Promise<PaginatedLicenses> {
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

    // Fetch licenses using the database function
    const { data: allLicenses, error: licensesError } = await client.rpc(
      'get_licenses_with_assignments',
      {
        p_account_id: account.id,
      },
    );

    if (licensesError) {
      console.error('Error loading licenses:', licensesError);
      throw new Error(`Failed to load licenses: ${licensesError.message}`);
    }

    let filteredLicenses = allLicenses ?? [];

    // Apply search filter (search by name, vendor, or license key)
    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      filteredLicenses = filteredLicenses.filter(
        (license) =>
          license.name.toLowerCase().includes(searchTerm) ||
          license.vendor.toLowerCase().includes(searchTerm) ||
          license.license_key.toLowerCase().includes(searchTerm),
      );
    }

    // Apply vendor filter
    if (filters?.vendor && filters.vendor !== 'all') {
      filteredLicenses = filteredLicenses.filter(
        (license) => license.vendor === filters.vendor,
      );
    }

    // Apply license type filter
    if (filters?.licenseTypes && filters.licenseTypes.length > 0) {
      filteredLicenses = filteredLicenses.filter((license) =>
        filters.licenseTypes!.includes(license.license_type),
      );
    }

    // Apply expiration status filter
    if (filters?.expirationStatus && filters.expirationStatus !== 'all') {
      switch (filters.expirationStatus) {
        case 'active':
          filteredLicenses = filteredLicenses.filter(
            (license) => !license.is_expired && license.days_until_expiry > 30,
          );
          break;
        case 'expiring':
          filteredLicenses = filteredLicenses.filter(
            (license) =>
              !license.is_expired &&
              license.days_until_expiry >= 0 &&
              license.days_until_expiry <= 30,
          );
          break;
        case 'expired':
          filteredLicenses = filteredLicenses.filter(
            (license) => license.is_expired,
          );
          break;
      }
    }

    // Pagination settings with defaults
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 50;
    const totalCount = filteredLicenses.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLicenses = filteredLicenses.slice(startIndex, endIndex);

    return {
      licenses: paginatedLicenses,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Unexpected error loading licenses:', error);
    throw error;
  }
}

/**
 * Load unique vendors for an account
 * @param client - Supabase client
 * @param accountSlug - Account slug
 */
async function loadUniqueVendors(
  client: SupabaseClient<Database>,
  accountSlug: string,
): Promise<string[]> {
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

    // Fetch unique vendors
    const { data, error } = await client
      .from('software_licenses')
      .select('vendor')
      .eq('account_id', account.id)
      .order('vendor');

    if (error) {
      console.error('Error loading vendors:', error);
      throw new Error(`Failed to load vendors: ${error.message}`);
    }

    // Extract unique vendors
    const uniqueVendors = Array.from(
      new Set((data ?? []).map((item) => item.vendor)),
    ).sort();

    return uniqueVendors;
  } catch (error) {
    console.error('Unexpected error loading vendors:', error);
    return [];
  }
}

/**
 * Load license statistics for an account
 * Uses the get_license_stats database function
 * @param client - Supabase client
 * @param accountSlug - Account slug
 */
async function loadLicenseStats(
  client: SupabaseClient<Database>,
  accountSlug: string,
): Promise<LicenseStats> {
  try {
    // First, get the account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError) {
      console.error('Error loading account for license stats:', accountError);
      throw new Error(
        `Failed to load account: ${accountError.message || 'Unknown error'}`,
      );
    }

    if (!account) {
      throw new Error('Account not found');
    }

    // Fetch statistics using the database function
    const { data, error } = await client.rpc('get_license_stats', {
      p_account_id: account.id,
    });

    if (error) {
      console.error('Error loading license stats from RPC:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(
        `Failed to load license stats: ${error.message || error.code || 'Unknown database error'}`,
      );
    }

    // The function returns a single row, but it's wrapped in an array
    const stats = Array.isArray(data) ? data[0] : data;

    if (!stats) {
      // Return default stats if no data
      console.log('No license stats data returned, using defaults');
      return {
        total_licenses: 0,
        expiring_soon: 0,
        expired: 0,
        total_assignments: 0,
      };
    }

    return {
      total_licenses: Number(stats.total_licenses ?? 0),
      expiring_soon: Number(stats.expiring_soon ?? 0),
      expired: Number(stats.expired ?? 0),
      total_assignments: Number(stats.total_assignments ?? 0),
    };
  } catch (error) {
    console.error('Unexpected error loading license stats:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return default stats instead of throwing to prevent page crash
    return {
      total_licenses: 0,
      expiring_soon: 0,
      expired: 0,
      total_assignments: 0,
    };
  }
}
