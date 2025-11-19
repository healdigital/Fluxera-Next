import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@kit/supabase/database';

import { ForbiddenError, UnauthorizedError } from './app-errors';

type Permission = Database['public']['Enums']['app_permissions'];

/**
 * Wraps an async function with account membership and permission verification.
 * 
 * This helper ensures that:
 * 1. The user is authenticated
 * 2. The user is a member of the specified account
 * 3. The user has the required permission for the account
 * 
 * @template T - The return type of the wrapped function
 * @param fn - The async function to wrap
 * @param options - Configuration options
 * @param options.accountId - The account ID to verify membership and permissions for
 * @param options.permission - The required permission (e.g., 'licenses.view', 'assets.create')
 * @param options.client - The Supabase client instance
 * @param options.resourceName - Optional resource name for better error messages
 * 
 * @returns The result of the wrapped function
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks the required permission
 * 
 * @example
 * ```typescript
 * const result = await withAccountPermission(
 *   async () => {
 *     // Your protected logic here
 *     return await createLicense(data);
 *   },
 *   {
 *     accountId: 'account-123',
 *     permission: 'licenses.create',
 *     client: supabaseClient,
 *     resourceName: 'license',
 *   }
 * );
 * ```
 */
export async function withAccountPermission<T>(
  fn: () => Promise<T>,
  options: {
    accountId: string;
    permission: Permission;
    client: SupabaseClient<Database>;
    resourceName?: string;
  },
): Promise<T> {
  const { accountId, permission, client, resourceName = 'resource' } = options;

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  // Check if user is a member of the account
  const { data: membership, error: membershipError } = await client
    .from('accounts_memberships')
    .select('id')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .single();

  if (membershipError || !membership) {
    throw new UnauthorizedError(
      'You are not a member of this account',
      {
        accountId,
        userId: user.id,
      },
    );
  }

  // Check if user has the required permission
  const { data: hasPermission, error: permissionError } = await client.rpc(
    'has_permission',
    {
      account_id: accountId,
      permission_name: permission,
      user_id: user.id,
    },
  );

  if (permissionError) {
    throw new Error(`Failed to check permissions: ${permissionError.message}`);
  }

  if (!hasPermission) {
    throw new ForbiddenError(
      `perform this action on ${resourceName}`,
      undefined,
      {
        accountId,
        permission,
        userId: user.id,
      },
    );
  }

  // Execute the protected function
  return await fn();
}

/**
 * Verifies that the current user has a specific permission for an account.
 * 
 * This is a simpler alternative to `withAccountPermission` when you just need
 * to check permissions without wrapping a function.
 * 
 * @param options - Configuration options
 * @param options.accountId - The account ID to verify permissions for
 * @param options.permission - The required permission
 * @param options.client - The Supabase client instance
 * 
 * @returns True if user has permission, false otherwise
 * @throws {UnauthorizedError} If user is not authenticated
 * 
 * @example
 * ```typescript
 * const canCreate = await verifyPermission({
 *   accountId: 'account-123',
 *   permission: 'licenses.create',
 *   client: supabaseClient,
 * });
 * 
 * if (!canCreate) {
 *   // Show disabled UI or error message
 * }
 * ```
 */
export async function verifyPermission(options: {
  accountId: string;
  permission: Permission;
  client: SupabaseClient<Database>;
}): Promise<boolean> {
  const { accountId, permission, client } = options;

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('You must be logged in to check permissions');
  }

  // Check if user is a member of the account
  const { data: membership, error: membershipError } = await client
    .from('accounts_memberships')
    .select('id')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .single();

  if (membershipError || !membership) {
    return false;
  }

  // Check if user has the required permission
  const { data: hasPermission, error: permissionError } = await client.rpc(
    'has_permission',
    {
      account_id: accountId,
      permission_name: permission,
      user_id: user.id,
    },
  );

  if (permissionError) {
    return false;
  }

  return hasPermission ?? false;
}

/**
 * Checks if the current user is a member of the specified account.
 * 
 * @param options - Configuration options
 * @param options.accountId - The account ID to check membership for
 * @param options.client - The Supabase client instance
 * 
 * @returns True if user is a member, false otherwise
 * @throws {UnauthorizedError} If user is not authenticated
 * 
 * @example
 * ```typescript
 * const isMember = await verifyMembership({
 *   accountId: 'account-123',
 *   client: supabaseClient,
 * });
 * ```
 */
export async function verifyMembership(options: {
  accountId: string;
  client: SupabaseClient<Database>;
}): Promise<boolean> {
  const { accountId, client } = options;

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('You must be logged in to check membership');
  }

  // Check if user is a member of the account
  const { data: membership, error: membershipError } = await client
    .from('accounts_memberships')
    .select('id')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .single();

  return !membershipError && !!membership;
}
