import 'server-only';

import { notFound } from 'next/navigation';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

type LicenseType = Database['public']['Enums']['license_type'];

export interface LicenseDetail {
  id: string;
  account_id: string;
  name: string;
  vendor: string;
  license_key: string;
  license_type: LicenseType;
  purchase_date: string;
  expiration_date: string;
  cost: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  days_until_expiry: number;
  is_expired: boolean;
}

export interface LicenseAssignmentWithDetails {
  id: string;
  license_id: string;
  account_id: string;
  assigned_to_user: string | null;
  assigned_to_asset: string | null;
  assigned_at: string | null;
  assigned_by: string | null;
  notes: string | null;
  user?: {
    id: string;
    name: string;
    email: string | null;
    picture_url: string | null;
  } | null;
  asset?: {
    id: string;
    name: string;
    category: string;
    serial_number: string | null;
  } | null;
}

/**
 * Load data for the license detail page
 * @param client - Supabase client
 * @param licenseId - License ID
 * @param accountSlug - Account slug for verification
 */
export async function loadLicenseDetailData(
  client: SupabaseClient<Database>,
  licenseId: string,
  accountSlug: string,
) {
  return Promise.all([
    loadLicenseDetail(client, licenseId, accountSlug),
    loadLicenseAssignments(client, licenseId, accountSlug),
  ]);
}

/**
 * Load a single license with calculated expiry information
 * @param client - Supabase client
 * @param licenseId - License ID
 * @param accountSlug - Account slug for verification
 */
async function loadLicenseDetail(
  client: SupabaseClient<Database>,
  licenseId: string,
  accountSlug: string,
): Promise<LicenseDetail> {
  try {
    // First, get the account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError || !account) {
      console.error('Error loading account:', accountError);
      notFound();
    }

    // Load the license
    const { data, error } = await client
      .from('software_licenses')
      .select('*')
      .eq('id', licenseId)
      .eq('account_id', account.id)
      .single();

    if (error || !data) {
      console.error('Error loading license:', error);
      notFound();
    }

    // Calculate days until expiry
    const expirationDate = new Date(data.expiration_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isExpired = daysUntilExpiry < 0;

    return {
      ...data,
      days_until_expiry: daysUntilExpiry,
      is_expired: isExpired,
    };
  } catch (error) {
    console.error('Unexpected error loading license detail:', error);
    throw error;
  }
}

/**
 * Load license assignments with user and asset details
 * @param client - Supabase client
 * @param licenseId - License ID
 * @param accountSlug - Account slug for verification
 */
async function loadLicenseAssignments(
  client: SupabaseClient<Database>,
  licenseId: string,
  accountSlug: string,
): Promise<LicenseAssignmentWithDetails[]> {
  try {
    // First, get the account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError || !account) {
      console.error('Error loading account:', accountError);
      notFound();
    }

    // Load assignments with user and asset details
    const { data, error } = await client
      .from('license_assignments')
      .select(
        `
        *,
        user:assigned_to_user (
          id,
          name,
          email,
          picture_url
        ),
        asset:assigned_to_asset (
          id,
          name,
          category,
          serial_number
        )
      `,
      )
      .eq('license_id', licenseId)
      .eq('account_id', account.id)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error loading license assignments:', error);
      // Don't throw for assignments - just return empty array
      return [];
    }

    // Transform the data to match our interface
    return (data ?? []).map((assignment) => ({
      ...assignment,
      user: Array.isArray(assignment.user)
        ? assignment.user[0] || null
        : assignment.user || null,
      asset: Array.isArray(assignment.asset)
        ? assignment.asset[0] || null
        : assignment.asset || null,
    }));
  } catch (error) {
    console.error('Unexpected error loading license assignments:', error);
    throw error;
  }
}
