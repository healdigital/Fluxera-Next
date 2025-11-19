import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_invitation';

export interface UserProfile {
  id: string;
  display_name: string | null;
  phone_number: string | null;
  job_title: string | null;
  department: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserMembership {
  user_id: string;
  account_id: string;
  account_role: string;
  created_at: string;
}

export interface UserAccountStatus {
  user_id: string;
  account_id: string;
  status: UserStatus;
  status_reason: string | null;
  status_changed_at: string | null;
  status_changed_by: string | null;
}

export interface AssignedAsset {
  id: string;
  name: string;
  category: string;
  serial_number: string | null;
  assigned_at: string | null;
}

export interface AvailableAsset {
  id: string;
  name: string;
  category: string;
  serial_number: string | null;
  status: string;
}

export interface UserDetailData {
  user_id: string;
  email: string;
  profile: UserProfile | null;
  membership: UserMembership;
  status: UserAccountStatus | null;
  assigned_assets: AssignedAsset[];
  available_assets: AvailableAsset[];
  last_sign_in_at: string | null;
  permissions: string[];
}

/**
 * Load complete user detail data including profile, membership, status, and assigned assets
 * @param client - Supabase client
 * @param userId - User ID
 * @param accountSlug - Account slug for verification
 */
export async function loadUserDetailData(
  client: SupabaseClient<Database>,
  userId: string,
  accountSlug: string,
): Promise<UserDetailData> {
  // Get account ID from slug
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

  const accountId = account.id;

  // Load all user data in parallel
  const [
    basicInfo,
    profile,
    membership,
    status,
    assignedAssets,
    availableAssets,
  ] = await Promise.all([
    loadUserBasicInfo(client, userId, accountId),
    loadUserProfile(client, userId),
    loadUserMembership(client, userId, accountId),
    loadUserStatus(client, userId, accountId),
    loadAssignedAssets(client, userId, accountId),
    loadAvailableAssets(client, accountId),
  ]);

  // Load permissions for the user's role
  const permissions = await loadUserPermissions(
    client,
    membership.account_role,
  );

  return {
    user_id: userId,
    email: basicInfo.email,
    profile,
    membership,
    status,
    assigned_assets: assignedAssets,
    available_assets: availableAssets,
    last_sign_in_at: basicInfo.last_sign_in_at,
    permissions,
  };
}

/**
 * Load basic user info (email, last sign in) by querying team members
 * This works because we can access auth.users through the get_team_members function
 */
async function loadUserBasicInfo(
  client: SupabaseClient<Database>,
  userId: string,
  accountId: string,
): Promise<{ email: string; last_sign_in_at: string | null }> {
  // Get account slug for the RPC call
  const { data: account, error: accountError } = await client
    .from('accounts')
    .select('slug')
    .eq('id', accountId)
    .single();

  if (accountError || !account) {
    throw new Error('Failed to load account');
  }

  // Use get_team_members to get user info (it has access to auth.users)
  const { data, error } = await client.rpc('get_team_members', {
    p_account_slug: account.slug ?? '',
    p_search: undefined,
    p_role: undefined,
    p_status: undefined,
    p_limit: 1000,
    p_offset: 0,
  });

  if (error) {
    console.error('Error loading user basic info:', error);
    throw new Error(`Failed to load user info: ${error.message}`);
  }

  const user = data?.find((u) => u.user_id === userId);

  if (!user) {
    throw new Error('User not found in this account');
  }

  return {
    email: user.email,
    last_sign_in_at: user.last_sign_in_at,
  };
}

/**
 * Load user profile data
 */
async function loadUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Profile might not exist yet, which is okay
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error loading user profile:', error);
    throw new Error(`Failed to load user profile: ${error.message}`);
  }

  return data
    ? {
        ...data,
        metadata: (data.metadata as Record<string, unknown>) ?? {},
      }
    : null;
}

/**
 * Load user membership for the specific account
 */
async function loadUserMembership(
  client: SupabaseClient<Database>,
  userId: string,
  accountId: string,
): Promise<UserMembership> {
  const { data, error } = await client
    .from('accounts_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .single();

  if (error) {
    console.error('Error loading user membership:', error);
    throw new Error(`Failed to load user membership: ${error.message}`);
  }

  if (!data) {
    throw new Error('User is not a member of this account');
  }

  return data;
}

/**
 * Load user status for the specific account
 */
async function loadUserStatus(
  client: SupabaseClient<Database>,
  userId: string,
  accountId: string,
): Promise<UserAccountStatus | null> {
  const { data, error } = await client
    .from('user_account_status')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .single();

  if (error) {
    // Status might not exist yet, which means user is active by default
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error loading user status:', error);
    throw new Error(`Failed to load user status: ${error.message}`);
  }

  return data as UserAccountStatus;
}

/**
 * Load assets assigned to the user
 */
async function loadAssignedAssets(
  client: SupabaseClient<Database>,
  userId: string,
  accountId: string,
): Promise<AssignedAsset[]> {
  const { data, error } = await client
    .from('assets')
    .select('id, name, category, serial_number, assigned_at')
    .eq('assigned_to', userId)
    .eq('account_id', accountId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error loading assigned assets:', error);
    // Don't throw, just return empty array
    return [];
  }

  return data ?? [];
}

/**
 * Load available assets that can be assigned
 */
async function loadAvailableAssets(
  client: SupabaseClient<Database>,
  accountId: string,
): Promise<AvailableAsset[]> {
  const { data, error } = await client
    .from('assets')
    .select('id, name, category, serial_number, status')
    .eq('account_id', accountId)
    .eq('status', 'available')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error loading available assets:', error);
    // Don't throw, just return empty array
    return [];
  }

  return data ?? [];
}

/**
 * Load permissions for a user's role
 */
async function loadUserPermissions(
  client: SupabaseClient<Database>,
  role: string,
): Promise<string[]> {
  const { data, error } = await client
    .from('role_permissions')
    .select('permission')
    .eq('role', role);

  if (error) {
    console.error('Error loading user permissions:', error);
    // Don't throw, just return empty array
    return [];
  }

  return data?.map((p) => p.permission) ?? [];
}
