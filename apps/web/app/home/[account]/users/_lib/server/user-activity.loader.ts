import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';

interface LoadUserActivityParams {
  userId: string;
  accountSlug: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface UserActivityWithDetails {
  id: string;
  user_id: string;
  account_id: string;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  action_details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  result_status: string;
  created_at: string;
  user: {
    display_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export async function loadUserActivity(
  client: SupabaseClient<Database>,
  params: LoadUserActivityParams,
): Promise<UserActivityWithDetails[]> {
  const {
    userId,
    accountSlug,
    actionType,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = params;

  // First get the account ID from slug
  const { data: account, error: accountError } = await client
    .from('accounts')
    .select('id')
    .eq('slug', accountSlug)
    .single();

  if (accountError || !account) {
    throw new Error('Account not found');
  }

  // Build the query
  let query = client
    .from('user_activity_log')
    .select(
      `
      id,
      user_id,
      account_id,
      action_type,
      resource_type,
      resource_id,
      action_details,
      ip_address,
      user_agent,
      result_status,
      created_at
    `,
    )
    .eq('user_id', userId)
    .eq('account_id', account.id)
    .order('created_at', { ascending: false });

  // Apply filters
  if (actionType) {
    query = query.eq(
      'action_type',
      actionType as Database['public']['Enums']['user_action_type'],
    );
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: activities, error } = await query;

  if (error) {
    throw error;
  }

  if (!activities || activities.length === 0) {
    return [];
  }

  // Fetch user details for the activity owner
  const { data: userProfile } = await client
    .from('user_profiles')
    .select('display_name, avatar_url')
    .eq('id', userId)
    .single();

  const { data: authUser } = await client.auth.admin.getUserById(userId);

  const userDetails = {
    display_name:
      userProfile?.display_name || authUser?.user?.email || 'Unknown User',
    email: authUser?.user?.email || '',
    avatar_url: userProfile?.avatar_url || null,
  };

  // Combine activity data with user details
  return activities.map((activity) => ({
    id: activity.id,
    user_id: activity.user_id,
    account_id: activity.account_id,
    action_type: activity.action_type,
    resource_type: activity.resource_type,
    resource_id: activity.resource_id,
    action_details: (activity.action_details as Record<string, unknown>) || {},
    ip_address: activity.ip_address as string | null,
    user_agent: activity.user_agent as string | null,
    result_status: activity.result_status,
    created_at: activity.created_at || new Date().toISOString(),
    user: userDetails,
  }));
}

export async function loadUserActivityCount(
  client: SupabaseClient<Database>,
  params: Omit<LoadUserActivityParams, 'limit' | 'offset'>,
): Promise<number> {
  const { userId, accountSlug, actionType, startDate, endDate } = params;

  // First get the account ID from slug
  const { data: account, error: accountError } = await client
    .from('accounts')
    .select('id')
    .eq('slug', accountSlug)
    .single();

  if (accountError || !account) {
    throw new Error('Account not found');
  }

  // Build the query
  let query = client
    .from('user_activity_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('account_id', account.id);

  // Apply filters
  if (actionType) {
    query = query.eq(
      'action_type',
      actionType as Database['public']['Enums']['user_action_type'],
    );
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}
