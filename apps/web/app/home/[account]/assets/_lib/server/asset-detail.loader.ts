import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

type AssetCategory = Database['public']['Enums']['asset_category'];
type AssetStatus = Database['public']['Enums']['asset_status'];
type AssetEventType = Database['public']['Enums']['asset_event_type'];

export interface AssetDetailWithUser {
  id: string;
  account_id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  description: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
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

export interface AssetHistoryWithUser {
  id: string;
  asset_id: string;
  account_id: string;
  event_type: AssetEventType;
  event_data: Record<string, unknown>;
  created_at: string | null;
  created_by: string | null;
  user?: {
    id: string;
    name: string;
    email: string | null;
    picture_url: string | null;
  } | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  picture_url: string | null;
}

/**
 * Load data for the asset detail page
 * @param client - Supabase client
 * @param assetId - Asset ID
 * @param accountSlug - Account slug for verification
 */
export async function loadAssetDetailData(
  client: SupabaseClient<Database>,
  assetId: string,
  accountSlug: string,
) {
  return Promise.all([
    loadAssetDetail(client, assetId, accountSlug),
    loadAssetHistory(client, assetId, accountSlug),
  ]);
}

/**
 * Load team members for assignment
 * @param client - Supabase client
 * @param accountSlug - Account slug
 */
export async function loadTeamMembers(
  client: SupabaseClient<Database>,
  accountSlug: string,
): Promise<TeamMember[]> {
  try {
    // Use the RPC function to get account members
    const { data, error } = await client.rpc('get_account_members', {
      account_slug: accountSlug,
    });

    if (error) {
      console.error('Error loading team members:', error);
      throw new Error(`Failed to load team members: ${error.message}`);
    }

    // Transform the data to match our interface
    return (data ?? []).map((member) => ({
      id: member.user_id,
      name: member.name,
      email: member.email,
      picture_url: member.picture_url,
    }));
  } catch (error) {
    console.error('Unexpected error loading team members:', error);
    throw error;
  }
}

/**
 * Load a single asset with assigned user information
 * @param client - Supabase client
 * @param assetId - Asset ID
 * @param accountSlug - Account slug for verification
 */
async function loadAssetDetail(
  client: SupabaseClient<Database>,
  assetId: string,
  accountSlug: string,
): Promise<AssetDetailWithUser> {
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

    // Load the asset with assigned user information
    const { data, error } = await client
      .from('assets')
      .select(
        `
        *,
        assigned_user:assigned_to (
          id,
          name,
          email,
          picture_url
        )
      `,
      )
      .eq('id', assetId)
      .eq('account_id', account.id)
      .single();

    if (error) {
      console.error('Error loading asset:', error);
      throw new Error(`Failed to load asset: ${error.message}`);
    }

    if (!data) {
      throw new Error('Asset not found');
    }

    // Transform the data to match our interface
    // The assigned_user will be an array with one item or empty array
    return {
      ...data,
      assigned_user: Array.isArray(data.assigned_user)
        ? data.assigned_user[0] || null
        : data.assigned_user || null,
    };
  } catch (error) {
    console.error('Unexpected error loading asset detail:', error);
    throw error;
  }
}

/**
 * Load asset history with user information (limited to recent 50 entries)
 * Returns history entries in reverse chronological order (newest first)
 * Optimized to avoid N+1 queries by using a single join
 * @param client - Supabase client
 * @param assetId - Asset ID
 * @param accountSlug - Account slug for verification
 * @param limit - Maximum number of history entries to return (default: 50)
 */
async function loadAssetHistory(
  client: SupabaseClient<Database>,
  assetId: string,
  accountSlug: string,
  limit: number = 50,
): Promise<AssetHistoryWithUser[]> {
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

    // Load asset history with user information
    // Using limit to prevent loading excessive history entries
    const { data, error } = await client
      .from('asset_history')
      .select(
        `
        *,
        user:created_by (
          id,
          name,
          email,
          picture_url
        )
      `,
      )
      .eq('asset_id', assetId)
      .eq('account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading asset history:', error);
      throw new Error(`Failed to load asset history: ${error.message}`);
    }

    // Transform the data to match our interface
    return (data ?? []).map((entry) => ({
      ...entry,
      event_data: (entry.event_data as Record<string, unknown>) ?? {},
      user: Array.isArray(entry.user)
        ? entry.user[0] || null
        : entry.user || null,
    }));
  } catch (error) {
    console.error('Unexpected error loading asset history:', error);
    throw error;
  }
}
