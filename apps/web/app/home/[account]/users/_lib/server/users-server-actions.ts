'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { renderInviteEmail } from '@kit/email-templates';
import { getMailer } from '@kit/mailers';
import { enhanceAction } from '@kit/next/actions';
// Import error classes and permission helpers
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from '@kit/shared/app-errors';
import { getLogger } from '@kit/shared/logger';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Database } from '~/lib/database.types';

import {
  ExportUserActivitySchema,
  InviteUserSchema,
  UpdateUserProfileSchema,
  UpdateUserRoleSchema,
  UpdateUserStatusSchema,
} from '../schemas/user.schema';

/**
 * Invites a new user to join a team account.
 *
 * Requires `members.manage` permission for the account.
 *
 * @param data - Invitation data including email, role, and account slug
 * @returns The created invitation
 * @throws {NotFoundError} If account doesn't exist
 * @throws {ConflictError} If user already has a pending invitation or is already a member
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks members.manage permission
 */
export const inviteUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { name: 'users.invite', email: data.email },
      'Inviting new user...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, name, slug, picture_url')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.invite' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Check existing invitation
        const { data: existingInvitation } = await client
          .from('invitations')
          .select('id')
          .eq('email', data.email)
          .eq('account_id', account.id)
          .single();

        if (existingInvitation) {
          throw new ConflictError(
            'This user already has a pending invitation',
            {
              email: data.email,
              accountId: account.id,
            },
          );
        }

        // Check if user is already a member
        const { data: existingUser } = await client.auth.admin.listUsers();
        const userWithEmail = existingUser?.users.find(
          (u) => u.email === data.email,
        );

        if (userWithEmail) {
          const { data: existingMember } = await client
            .from('accounts_memberships')
            .select('user_id')
            .eq('account_id', account.id)
            .eq('user_id', userWithEmail.id)
            .single();

          if (existingMember) {
            throw new ConflictError(
              'This user is already a member of your team',
              {
                email: data.email,
                accountId: account.id,
              },
            );
          }
        }

        // Generate invitation token
        const inviteToken = crypto.randomUUID();

        // Create the invitation
        const { data: invitation, error: inviteError } = await client
          .from('invitations')
          .insert({
            email: data.email,
            account_id: account.id,
            invited_by: currentUser!.id,
            role: data.role,
            invite_token: inviteToken,
          })
          .select()
          .single();

        if (inviteError) {
          logger.error(
            { error: inviteError, name: 'users.invite' },
            'Failed to create invitation',
          );
          throw inviteError;
        }

        // Send invitation email if requested
        if (data.send_invitation) {
          try {
            const mailer = await getMailer();
            const { data: inviterProfile } = await client
              .from('user_profiles')
              .select('display_name')
              .eq('id', currentUser!.id)
              .single();

            const inviterName =
              inviterProfile?.display_name ||
              currentUser!.email ||
              'A team member';
            const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/join?token=${inviteToken}`;

            const { html, subject } = await renderInviteEmail({
              teamName: account.name,
              teamLogo: account.picture_url || undefined,
              inviter: inviterName,
              invitedUserEmail: data.email,
              link: inviteLink,
              productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Fluxera',
            });

            await mailer.sendEmail({
              to: data.email,
              from: process.env.EMAIL_SENDER || 'noreply@fluxera.app',
              subject,
              html,
            });

            logger.info(
              { email: data.email, name: 'users.invite' },
              'Invitation email sent successfully',
            );
          } catch (emailError) {
            logger.error(
              { error: emailError, name: 'users.invite' },
              'Failed to send invitation email',
            );
            // Don't fail the entire operation if email fails
          }
        }

        // Log the activity
        try {
          await client.rpc('log_user_activity', {
            p_user_id: currentUser!.id,
            p_account_id: account.id,
            p_action_type: 'user_created',
            p_resource_type: 'invitation',
            p_resource_id: undefined,
            p_action_details: {
              email: data.email,
              role: data.role,
              invitation_sent: data.send_invitation,
            },
            p_result_status: 'success',
          });
        } catch (logError) {
          logger.error(
            { error: logError, name: 'users.invite' },
            'Failed to log activity',
          );
        }

        logger.info(
          {
            invitationId: invitation.id,
            email: data.email,
            name: 'users.invite',
          },
          'User invitation created successfully',
        );

        revalidatePath(`/home/${data.accountSlug}/users`);

        return { success: true, data: invitation };
      },
      {
        accountId: account.id,
        permission: 'members.manage',
        client,
        resourceName: 'user invitation',
      },
    );
  },
  {
    schema: InviteUserSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Updates user profile information.
 *
 * Requires `members.manage` permission for the account.
 *
 * @param data - Profile data to update (display_name, phone_number, job_title, etc.)
 * @returns Success status
 * @throws {NotFoundError} If account doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks members.manage permission
 */
export const updateUserProfile = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { name: 'users.updateProfile', userId: data.userId },
      'Updating user profile...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.updateProfile' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Prepare profile data (remove undefined values)
        const profileData: Record<string, string> = {};
        if (data.display_name !== undefined)
          profileData.display_name = data.display_name;
        if (data.phone_number !== undefined)
          profileData.phone_number = data.phone_number;
        if (data.job_title !== undefined)
          profileData.job_title = data.job_title;
        if (data.department !== undefined)
          profileData.department = data.department;
        if (data.location !== undefined) profileData.location = data.location;
        if (data.bio !== undefined) profileData.bio = data.bio;

        // Check if profile exists
        const { data: existingProfile } = await client
          .from('user_profiles')
          .select('id')
          .eq('id', data.userId)
          .single();

        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await client
            .from('user_profiles')
            .update(profileData)
            .eq('id', data.userId);

          if (updateError) {
            logger.error(
              { error: updateError, name: 'users.updateProfile' },
              'Failed to update user profile',
            );
            throw updateError;
          }
        } else {
          // Create new profile
          const { error: insertError } = await client
            .from('user_profiles')
            .insert({
              id: data.userId,
              ...profileData,
            });

          if (insertError) {
            logger.error(
              { error: insertError, name: 'users.updateProfile' },
              'Failed to create user profile',
            );
            throw insertError;
          }
        }

        // Log the activity
        try {
          await client.rpc('log_user_activity', {
            p_user_id: currentUser!.id,
            p_account_id: account.id,
            p_action_type: 'profile_updated',
            p_resource_type: 'user',
            p_resource_id: data.userId,
            p_action_details: {
              updated_fields: Object.keys(profileData),
            },
            p_result_status: 'success',
          });
        } catch (logError) {
          logger.error(
            { error: logError, name: 'users.updateProfile' },
            'Failed to log activity',
          );
        }

        logger.info(
          { userId: data.userId, name: 'users.updateProfile' },
          'User profile updated successfully',
        );

        revalidatePath(`/home/${data.accountSlug}/users/${data.userId}`);
        revalidatePath(`/home/${data.accountSlug}/users`);

        return { success: true };
      },
      {
        accountId: account.id,
        permission: 'members.manage',
        client,
        resourceName: 'user profile',
      },
    );
  },
  {
    schema: UpdateUserProfileSchema.extend({
      userId: z.string().uuid('Invalid user ID'),
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Updates a user's role within a team account.
 *
 * Requires `members.manage` permission for the account.
 *
 * @param data - User ID, account ID, and new role
 * @returns Success status
 * @throws {NotFoundError} If account doesn't exist
 * @throws {BusinessRuleError} If account ID mismatch
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks members.manage permission
 */
export const updateUserRole = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { name: 'users.updateRole', userId: data.user_id, newRole: data.role },
      'Updating user role...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.updateRole' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    // Verify account_id matches
    if (account.id !== data.account_id) {
      logger.error(
        {
          name: 'users.updateRole',
          providedAccountId: data.account_id,
          actualAccountId: account.id,
        },
        'Account ID mismatch',
      );
      throw new BusinessRuleError(
        'Account ID does not match the provided slug',
        {
          providedAccountId: data.account_id,
          actualAccountId: account.id,
        },
      );
    }

    return withAccountPermission(
      async () => {
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Get the current role for logging
        const { data: currentMembership } = await client
          .from('accounts_memberships')
          .select('account_role')
          .eq('user_id', data.user_id)
          .eq('account_id', account.id)
          .single();

        const oldRole = currentMembership?.account_role;

        // Update the user's role
        const { error: updateError } = await client
          .from('accounts_memberships')
          .update({
            account_role: data.role,
          })
          .eq('user_id', data.user_id)
          .eq('account_id', account.id);

        if (updateError) {
          logger.error(
            { error: updateError, name: 'users.updateRole' },
            'Failed to update user role',
          );
          throw updateError;
        }

        // Log the activity
        try {
          await client.rpc('log_user_activity', {
            p_user_id: currentUser!.id,
            p_account_id: account.id,
            p_action_type: 'role_changed',
            p_resource_type: 'user',
            p_resource_id: data.user_id,
            p_action_details: {
              old_role: oldRole,
              new_role: data.role,
              target_user_id: data.user_id,
            },
            p_result_status: 'success',
          });
        } catch (logError) {
          logger.error(
            { error: logError, name: 'users.updateRole' },
            'Failed to log activity',
          );
        }

        logger.info(
          {
            userId: data.user_id,
            oldRole,
            newRole: data.role,
            name: 'users.updateRole',
          },
          'User role updated successfully',
        );

        revalidatePath(`/home/${data.accountSlug}/users/${data.user_id}`);
        revalidatePath(`/home/${data.accountSlug}/users`);

        return { success: true };
      },
      {
        accountId: account.id,
        permission: 'members.manage',
        client,
        resourceName: 'user role',
      },
    );
  },
  {
    schema: UpdateUserRoleSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Updates a user's status within a team account (active/inactive).
 *
 * Requires `members.manage` permission for the account.
 * Users cannot deactivate their own account.
 *
 * @param data - User ID, account ID, new status, and optional reason
 * @returns Success status
 * @throws {NotFoundError} If account doesn't exist
 * @throws {BusinessRuleError} If account ID mismatch or trying to self-deactivate
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks members.manage permission
 */
export const updateUserStatus = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        name: 'users.updateStatus',
        userId: data.user_id,
        newStatus: data.status,
      },
      'Updating user status...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.updateStatus' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    // Verify account_id matches
    if (account.id !== data.account_id) {
      logger.error(
        {
          name: 'users.updateStatus',
          providedAccountId: data.account_id,
          actualAccountId: account.id,
        },
        'Account ID mismatch',
      );
      throw new BusinessRuleError(
        'Account ID does not match the provided slug',
        {
          providedAccountId: data.account_id,
          actualAccountId: account.id,
        },
      );
    }

    return withAccountPermission(
      async () => {
        // Call the database function to update user status
        // This function handles self-deactivation prevention
        const { error: updateError } = await client.rpc('update_user_status', {
          p_user_id: data.user_id,
          p_account_id: account.id,
          p_status: data.status,
          p_reason: data.reason || undefined,
        });

        if (updateError) {
          logger.error(
            { error: updateError, name: 'users.updateStatus' },
            'Failed to update user status',
          );

          // Check for specific error messages from the database function
          if (updateError.message.includes('cannot deactivate your own')) {
            throw new BusinessRuleError(
              'You cannot deactivate your own account',
              {
                userId: data.user_id,
              },
            );
          }

          if (updateError.message.includes('Access denied')) {
            throw new BusinessRuleError('Access denied to update user status', {
              userId: data.user_id,
            });
          }

          throw updateError;
        }

        logger.info(
          {
            userId: data.user_id,
            newStatus: data.status,
            name: 'users.updateStatus',
          },
          'User status updated successfully',
        );

        revalidatePath(`/home/${data.accountSlug}/users/${data.user_id}`);
        revalidatePath(`/home/${data.accountSlug}/users`);

        return { success: true };
      },
      {
        accountId: account.id,
        permission: 'members.manage',
        client,
        resourceName: 'user status',
      },
    );
  },
  {
    schema: UpdateUserStatusSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Assigns multiple assets to a user.
 *
 * Requires `assets.manage` permission for the account.
 * All assets must belong to the account and be available (not already assigned).
 *
 * @param data - User ID, array of asset IDs, and account slug
 * @returns Success status
 * @throws {NotFoundError} If account or user doesn't exist, or if some assets are not found
 * @throws {ConflictError} If some assets are already assigned
 * @throws {BusinessRuleError} If user is not a member of the account
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.manage permission
 */
export const assignAssetsToUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        name: 'users.assignAssets',
        userId: data.user_id,
        assetCount: data.asset_ids.length,
      },
      'Assigning assets to user...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.assignAssets' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Verify the user is a member of the account
        const { data: membership, error: membershipError } = await client
          .from('accounts_memberships')
          .select('user_id')
          .eq('account_id', account.id)
          .eq('user_id', data.user_id)
          .single();

        if (membershipError || !membership) {
          logger.error(
            {
              error: membershipError,
              userId: data.user_id,
              accountId: account.id,
              name: 'users.assignAssets',
            },
            'User is not a member of this account',
          );
          throw new BusinessRuleError('User is not a member of this account', {
            userId: data.user_id,
            accountId: account.id,
          });
        }

        // Verify all assets belong to the account and are available
        const { data: assets, error: assetsError } = await client
          .from('assets')
          .select('id, name, status, assigned_to')
          .eq('account_id', account.id)
          .in('id', data.asset_ids);

        if (assetsError) {
          logger.error(
            { error: assetsError, name: 'users.assignAssets' },
            'Failed to fetch assets',
          );
          throw assetsError;
        }

        if (!assets || assets.length !== data.asset_ids.length) {
          logger.error(
            {
              name: 'users.assignAssets',
              requestedCount: data.asset_ids.length,
              foundCount: assets?.length || 0,
            },
            'Some assets not found',
          );
          throw new NotFoundError(
            'Some assets',
            `${data.asset_ids.length - (assets?.length || 0)} asset(s)`,
          );
        }

        // Check if any assets are already assigned
        const alreadyAssigned = assets.filter((asset) => asset.assigned_to);
        if (alreadyAssigned.length > 0) {
          logger.warn(
            {
              name: 'users.assignAssets',
              alreadyAssignedCount: alreadyAssigned.length,
              assetNames: alreadyAssigned.map((a) => a.name),
            },
            'Some assets are already assigned',
          );
          throw new ConflictError('Some assets are already assigned', {
            assetNames: alreadyAssigned.map((a) => a.name),
          });
        }

        // Assign all assets
        const now = new Date().toISOString();
        const { error: updateError } = await client
          .from('assets')
          .update({
            assigned_to: data.user_id,
            assigned_at: now,
            status: 'assigned',
          })
          .in('id', data.asset_ids);

        if (updateError) {
          logger.error(
            { error: updateError, name: 'users.assignAssets' },
            'Failed to assign assets',
          );
          throw updateError;
        }

        // Log activity for each asset assignment
        for (const asset of assets) {
          try {
            await client.rpc('log_user_activity', {
              p_user_id: currentUser!.id,
              p_account_id: account.id,
              p_action_type: 'asset_assigned',
              p_resource_type: 'asset',
              p_resource_id: asset.id,
              p_action_details: {
                asset_name: asset.name,
                assigned_to_user_id: data.user_id,
              },
              p_result_status: 'success',
            });
          } catch (logError) {
            logger.error(
              {
                error: logError,
                assetId: asset.id,
                name: 'users.assignAssets',
              },
              'Failed to log activity for asset',
            );
          }
        }

        logger.info(
          {
            userId: data.user_id,
            assetCount: data.asset_ids.length,
            name: 'users.assignAssets',
          },
          'Assets assigned successfully',
        );

        // Revalidate relevant pages
        revalidatePath(`/home/${data.accountSlug}/users/${data.user_id}`);
        revalidatePath(`/home/${data.accountSlug}/users`);
        revalidatePath(`/home/${data.accountSlug}/assets`);
        for (const assetId of data.asset_ids) {
          revalidatePath(`/home/${data.accountSlug}/assets/${assetId}`);
        }

        return { success: true };
      },
      {
        accountId: account.id,
        permission: 'assets.manage',
        client,
        resourceName: 'asset assignment',
      },
    );
  },
  {
    schema: z.object({
      user_id: z.string().uuid('Invalid user ID'),
      asset_ids: z
        .array(z.string().uuid('Invalid asset ID'))
        .min(1, 'At least one asset must be selected'),
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Unassigns an asset from a user.
 *
 * Requires `assets.manage` permission for the account.
 * The asset must be currently assigned to be unassigned.
 *
 * @param data - Asset ID and account slug
 * @returns Success status
 * @throws {NotFoundError} If account or asset doesn't exist
 * @throws {BusinessRuleError} If asset doesn't belong to the account or is not currently assigned
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.manage permission
 */
export const unassignAssetFromUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { name: 'users.unassignAsset', assetId: data.asset_id },
      'Unassigning asset from user...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.unassignAsset' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Get the asset to verify it exists and is assigned
        const { data: asset, error: assetError } = await client
          .from('assets')
          .select('id, name, assigned_to, account_id')
          .eq('id', data.asset_id)
          .single();

        if (assetError || !asset) {
          logger.error(
            {
              error: assetError,
              assetId: data.asset_id,
              name: 'users.unassignAsset',
            },
            'Failed to find asset',
          );
          throw new NotFoundError('Asset', data.asset_id);
        }

        // Verify asset belongs to the account
        if (asset.account_id !== account.id) {
          logger.error(
            {
              name: 'users.unassignAsset',
              assetAccountId: asset.account_id,
              requestAccountId: account.id,
            },
            'Asset does not belong to this account',
          );
          throw new BusinessRuleError('Asset does not belong to this account', {
            assetId: data.asset_id,
            assetAccountId: asset.account_id,
            requestAccountId: account.id,
          });
        }

        // Check if asset is currently assigned
        if (!asset.assigned_to) {
          logger.warn(
            { assetId: data.asset_id, name: 'users.unassignAsset' },
            'Asset is not currently assigned',
          );
          throw new BusinessRuleError('Asset is not currently assigned', {
            assetId: data.asset_id,
          });
        }

        const previousUserId = asset.assigned_to;

        // Unassign the asset
        const { error: updateError } = await client
          .from('assets')
          .update({
            assigned_to: null,
            assigned_at: null,
            status: 'available',
          })
          .eq('id', data.asset_id);

        if (updateError) {
          logger.error(
            { error: updateError, name: 'users.unassignAsset' },
            'Failed to unassign asset',
          );
          throw updateError;
        }

        // Log the activity
        try {
          await client.rpc('log_user_activity', {
            p_user_id: currentUser!.id,
            p_account_id: account.id,
            p_action_type: 'asset_unassigned',
            p_resource_type: 'asset',
            p_resource_id: asset.id,
            p_action_details: {
              asset_name: asset.name,
              previously_assigned_to: previousUserId,
            },
            p_result_status: 'success',
          });
        } catch (logError) {
          logger.error(
            { error: logError, name: 'users.unassignAsset' },
            'Failed to log activity',
          );
        }

        logger.info(
          { assetId: data.asset_id, name: 'users.unassignAsset' },
          'Asset unassigned successfully',
        );

        // Revalidate relevant pages
        revalidatePath(`/home/${data.accountSlug}/users/${previousUserId}`);
        revalidatePath(`/home/${data.accountSlug}/users`);
        revalidatePath(`/home/${data.accountSlug}/assets`);
        revalidatePath(`/home/${data.accountSlug}/assets/${data.asset_id}`);

        return { success: true };
      },
      {
        accountId: account.id,
        permission: 'assets.manage',
        client,
        resourceName: 'asset unassignment',
      },
    );
  },
  {
    schema: z.object({
      asset_id: z.string().uuid('Invalid asset ID'),
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Exports user activity logs in CSV or JSON format.
 *
 * Note: This action reads data only and relies on RLS policies for access control.
 * No explicit permission check is needed as the database will enforce access rules.
 *
 * @param data - User ID, account slug, format (csv/json), and optional filters
 * @returns Export content with filename and content type
 * @throws {NotFoundError} If account doesn't exist or no activity logs found
 * @throws {UnauthorizedError} If user is not authenticated or not a member (via RLS)
 */
export const exportUserActivity = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        name: 'users.exportActivity',
        userId: data.user_id,
        format: data.format,
      },
      'Exporting user activity...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.exportActivity' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    // Get the current user (for logging purposes)
    const {
      data: { user: currentUser },
    } = await client.auth.getUser();

    // Build the query to fetch all matching activities (no pagination for export)
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
      .eq('user_id', data.user_id)
      .eq('account_id', account.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (data.action_type) {
      query = query.eq(
        'action_type',
        data.action_type as Database['public']['Enums']['user_action_type'],
      );
    }

    if (data.start_date) {
      query = query.gte('created_at', data.start_date);
    }

    if (data.end_date) {
      query = query.lte('created_at', data.end_date);
    }

    const { data: activities, error } = await query;

    if (error) {
      logger.error(
        { error, name: 'users.exportActivity' },
        'Failed to fetch activities',
      );
      throw error;
    }

    if (!activities || activities.length === 0) {
      logger.warn(
        { name: 'users.exportActivity', userId: data.user_id },
        'No activities found to export',
      );
      throw new NotFoundError('Activity logs', 'matching the filters');
    }

    // Fetch user details for the activity owner
    const { data: userProfile } = await client
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('id', data.user_id)
      .single();

    const { data: authUser } = await client.auth.admin.getUserById(
      data.user_id,
    );

    const userDetails = {
      display_name:
        userProfile?.display_name || authUser?.user?.email || 'Unknown User',
      email: authUser?.user?.email || '',
    };

    // Format the data based on the requested format
    let exportContent: string;
    let contentType: string;
    let filename: string;

    if (data.format === 'csv') {
      // Generate CSV
      const headers = [
        'Timestamp',
        'User',
        'Email',
        'Action Type',
        'Resource Type',
        'Resource ID',
        'Details',
        'Result Status',
        'IP Address',
      ];

      const rows = activities.map((activity) => {
        const details = activity.action_details
          ? JSON.stringify(activity.action_details)
          : '';

        return [
          activity.created_at || '',
          userDetails.display_name,
          userDetails.email,
          activity.action_type,
          activity.resource_type || '',
          activity.resource_id || '',
          details.replace(/"/g, '""'), // Escape quotes for CSV
          activity.result_status,
          activity.ip_address || '',
        ];
      });

      // Build CSV content
      const csvRows = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ];

      exportContent = csvRows.join('\n');
      contentType = 'text/csv';
      filename = `user-activity-${data.user_id}-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      // Generate JSON
      const jsonData = activities.map((activity) => ({
        id: activity.id,
        timestamp: activity.created_at,
        user: {
          id: activity.user_id,
          display_name: userDetails.display_name,
          email: userDetails.email,
        },
        action_type: activity.action_type,
        resource_type: activity.resource_type,
        resource_id: activity.resource_id,
        action_details: activity.action_details,
        result_status: activity.result_status,
        ip_address: activity.ip_address,
        user_agent: activity.user_agent,
      }));

      exportContent = JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          user: userDetails,
          filters: {
            action_type: data.action_type,
            start_date: data.start_date,
            end_date: data.end_date,
          },
          total_records: activities.length,
          activities: jsonData,
        },
        null,
        2,
      );

      contentType = 'application/json';
      filename = `user-activity-${data.user_id}-${new Date().toISOString().split('T')[0]}.json`;
    }

    // Log the export activity
    if (currentUser) {
      try {
        await client.rpc('log_user_activity', {
          p_user_id: currentUser.id,
          p_account_id: account.id,
          p_action_type: 'user_updated' as const,
          p_resource_type: 'activity_log',
          p_resource_id: data.user_id,
          p_action_details: {
            action: 'export',
            format: data.format,
            record_count: activities.length,
            filters: {
              action_type: data.action_type,
              start_date: data.start_date,
              end_date: data.end_date,
            },
          },
          p_result_status: 'success',
        });
      } catch (logError) {
        logger.error(
          { error: logError, name: 'users.exportActivity' },
          'Failed to log export activity',
        );
      }
    }

    logger.info(
      {
        userId: data.user_id,
        format: data.format,
        recordCount: activities.length,
        name: 'users.exportActivity',
      },
      'Activity logs exported successfully',
    );

    return {
      success: true,
      data: {
        content: exportContent,
        contentType,
        filename,
      },
    };
  },
  {
    schema: ExportUserActivitySchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);


/**
 * Loads user detail data for display in modals.
 *
 * This is a server action that can be called from client components.
 *
 * @param userId - The ID of the user to load
 * @param accountSlug - The account slug
 * @returns User detail data
 */
export const getUserDetailData = enhanceAction(
  async (data: { userId: string; accountSlug: string }) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { name: 'users.getDetailData', userId: data.userId },
      'Loading user detail data...',
    );

    // Get account
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'users.getDetailData' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const { loadUserDetailData } = await import('./user-detail.loader');
        const userData = await loadUserDetailData(
          client,
          data.userId,
          data.accountSlug,
        );

        logger.info(
          { userId: data.userId, name: 'users.getDetailData' },
          'User detail data loaded successfully',
        );

        return { success: true, data: userData };
      },
      {
        accountId: account.id,
        permission: 'members.manage',
        client,
        resourceName: 'user details',
      },
    );
  },
  {
    schema: z.object({
      userId: z.string().uuid('Invalid user ID'),
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);
