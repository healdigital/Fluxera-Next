'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { renderInviteEmail } from '@kit/email-templates';
import { getMailer } from '@kit/mailers';
import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
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
 * Invite a new user to join a team account
 */
export const inviteUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.invite',
          email: data.email,
        },
        'Inviting new user...',
      );

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, name, slug, picture_url')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.invite',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user (inviter)
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.invite',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

      // Check if user already has an invitation
      const { data: existingInvitation } = await client
        .from('invitations')
        .select('id')
        .eq('email', data.email)
        .eq('account_id', account.id)
        .single();

      if (existingInvitation) {
        logger.warn(
          {
            email: data.email,
            accountId: account.id,
            name: 'users.invite',
          },
          'User already has a pending invitation',
        );

        return {
          success: false,
          message: 'This user already has a pending invitation',
        };
      }

      // Check if user with this email is already a member
      // First, get the user ID from auth.users if they exist
      const { data: existingUser } = await client.auth.admin.listUsers();
      const userWithEmail = existingUser?.users.find(
        (u) => u.email === data.email,
      );

      if (userWithEmail) {
        // Check if they're already a member
        const { data: existingMember } = await client
          .from('accounts_memberships')
          .select('user_id')
          .eq('account_id', account.id)
          .eq('user_id', userWithEmail.id)
          .single();

        if (existingMember) {
          logger.warn(
            {
              email: data.email,
              accountId: account.id,
              name: 'users.invite',
            },
            'User is already a member of this account',
          );

          return {
            success: false,
            message: 'This user is already a member of your team',
          };
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
          invited_by: currentUser.id,
          role: data.role,
          invite_token: inviteToken,
        })
        .select()
        .single();

      if (inviteError) {
        logger.error(
          {
            error: inviteError,
            name: 'users.invite',
          },
          'Failed to create invitation',
        );

        return {
          success: false,
          message: 'Failed to create invitation',
        };
      }

      // Send invitation email if requested
      if (data.send_invitation) {
        try {
          const mailer = await getMailer();

          // Get inviter profile
          const { data: inviterProfile } = await client
            .from('user_profiles')
            .select('display_name')
            .eq('id', currentUser.id)
            .single();

          const inviterName =
            inviterProfile?.display_name ||
            currentUser.email ||
            'A team member';

          // Build invitation link
          const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/join?token=${inviteToken}`;

          // Render email
          const { html, subject } = await renderInviteEmail({
            teamName: account.name,
            teamLogo: account.picture_url || undefined,
            inviter: inviterName,
            invitedUserEmail: data.email,
            link: inviteLink,
            productName: process.env.NEXT_PUBLIC_PRODUCT_NAME || 'Fluxera',
          });

          // Send email
          await mailer.sendEmail({
            to: data.email,
            from: process.env.EMAIL_SENDER || 'noreply@fluxera.app',
            subject,
            html,
          });

          logger.info(
            {
              email: data.email,
              name: 'users.invite',
            },
            'Invitation email sent successfully',
          );
        } catch (emailError) {
          logger.error(
            {
              error: emailError,
              name: 'users.invite',
            },
            'Failed to send invitation email',
          );

          // Don't fail the entire operation if email fails
          // The invitation is still created
        }
      }

      // Log the activity
      try {
        await client.rpc('log_user_activity', {
          p_user_id: currentUser.id,
          p_account_id: account.id,
          p_action_type: 'user_created',
          p_resource_type: 'invitation',
          p_resource_id: undefined, // Invitations table uses serial ID, not UUID
          p_action_details: {
            email: data.email,
            role: data.role,
            invitation_sent: data.send_invitation,
          },
          p_result_status: 'success',
        });
      } catch (logError) {
        logger.error(
          {
            error: logError,
            name: 'users.invite',
          },
          'Failed to log activity',
        );
        // Don't fail the operation if logging fails
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

      return {
        success: true,
        data: invitation,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.invite',
        },
        'Unexpected error inviting user',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: InviteUserSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Update user profile information
 */
export const updateUserProfile = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.updateProfile',
          userId: data.userId,
        },
        'Updating user profile...',
      );

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.updateProfile',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.updateProfile',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

      // Prepare profile data (remove undefined values)
      const profileData: Record<string, string> = {};
      if (data.display_name !== undefined)
        profileData.display_name = data.display_name;
      if (data.phone_number !== undefined)
        profileData.phone_number = data.phone_number;
      if (data.job_title !== undefined) profileData.job_title = data.job_title;
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
            {
              error: updateError,
              name: 'users.updateProfile',
            },
            'Failed to update user profile',
          );

          return {
            success: false,
            message: 'Failed to update user profile',
          };
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
            {
              error: insertError,
              name: 'users.updateProfile',
            },
            'Failed to create user profile',
          );

          return {
            success: false,
            message: 'Failed to create user profile',
          };
        }
      }

      // Log the activity
      try {
        await client.rpc('log_user_activity', {
          p_user_id: currentUser.id,
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
          {
            error: logError,
            name: 'users.updateProfile',
          },
          'Failed to log activity',
        );
        // Don't fail the operation if logging fails
      }

      logger.info(
        {
          userId: data.userId,
          name: 'users.updateProfile',
        },
        'User profile updated successfully',
      );

      revalidatePath(`/home/${data.accountSlug}/users/${data.userId}`);
      revalidatePath(`/home/${data.accountSlug}/users`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.updateProfile',
        },
        'Unexpected error updating user profile',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: UpdateUserProfileSchema.extend({
      userId: z.string().uuid('Invalid user ID'),
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Update user role within a team account
 */
export const updateUserRole = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.updateRole',
          userId: data.user_id,
          newRole: data.role,
        },
        'Updating user role...',
      );

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.updateRole',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
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

        return {
          success: false,
          message: 'Invalid account',
        };
      }

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.updateRole',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

      // Verify the caller has members.manage permission
      // This is also enforced by RLS, but we check explicitly for better error messages
      const { data: hasPermission } = await client.rpc('has_permission', {
        user_id: currentUser.id,
        account_id: account.id,
        permission_name: 'members.manage',
      });

      if (!hasPermission) {
        logger.warn(
          {
            name: 'users.updateRole',
            userId: currentUser.id,
            accountId: account.id,
          },
          'User does not have permission to manage members',
        );

        return {
          success: false,
          message: "You don't have permission to manage team members",
        };
      }

      // Get the current role for logging
      const { data: currentMembership } = await client
        .from('accounts_memberships')
        .select('account_role')
        .eq('user_id', data.user_id)
        .eq('account_id', account.id)
        .single();

      const oldRole = currentMembership?.account_role;

      // Update the user's role in accounts_memberships
      const { error: updateError } = await client
        .from('accounts_memberships')
        .update({
          account_role: data.role,
        })
        .eq('user_id', data.user_id)
        .eq('account_id', account.id);

      if (updateError) {
        logger.error(
          {
            error: updateError,
            name: 'users.updateRole',
          },
          'Failed to update user role',
        );

        return {
          success: false,
          message: 'Failed to update user role',
        };
      }

      // Log the activity
      try {
        await client.rpc('log_user_activity', {
          p_user_id: currentUser.id,
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
          {
            error: logError,
            name: 'users.updateRole',
          },
          'Failed to log activity',
        );
        // Don't fail the operation if logging fails
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

      // Revalidate the user detail page and users list
      revalidatePath(`/home/${data.accountSlug}/users/${data.user_id}`);
      revalidatePath(`/home/${data.accountSlug}/users`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.updateRole',
        },
        'Unexpected error updating user role',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: UpdateUserRoleSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Update user status within a team account
 */
export const updateUserStatus = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.updateStatus',
          userId: data.user_id,
          newStatus: data.status,
        },
        'Updating user status...',
      );

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.updateStatus',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
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

        return {
          success: false,
          message: 'Invalid account',
        };
      }

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.updateStatus',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

      // Call the database function to update user status
      // This function handles permission checks and self-deactivation prevention
      const { error: updateError } = await client.rpc('update_user_status', {
        p_user_id: data.user_id,
        p_account_id: account.id,
        p_status: data.status,
        p_reason: data.reason || undefined,
      });

      if (updateError) {
        logger.error(
          {
            error: updateError,
            name: 'users.updateStatus',
          },
          'Failed to update user status',
        );

        // Check for specific error messages from the database function
        if (updateError.message.includes('cannot deactivate your own')) {
          return {
            success: false,
            message: 'You cannot deactivate your own account',
          };
        }

        if (updateError.message.includes('Access denied')) {
          return {
            success: false,
            message: "You don't have permission to manage user status",
          };
        }

        return {
          success: false,
          message: 'Failed to update user status',
        };
      }

      logger.info(
        {
          userId: data.user_id,
          newStatus: data.status,
          name: 'users.updateStatus',
        },
        'User status updated successfully',
      );

      // Revalidate the user detail page and users list
      revalidatePath(`/home/${data.accountSlug}/users/${data.user_id}`);
      revalidatePath(`/home/${data.accountSlug}/users`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.updateStatus',
        },
        'Unexpected error updating user status',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: UpdateUserStatusSchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Assign multiple assets to a user
 */
export const assignAssetsToUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.assignAssets',
          userId: data.user_id,
          assetCount: data.asset_ids.length,
        },
        'Assigning assets to user...',
      );

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.assignAssets',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.assignAssets',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

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

        return {
          success: false,
          message: 'User is not a member of this account',
        };
      }

      // Verify all assets belong to the account and are available
      const { data: assets, error: assetsError } = await client
        .from('assets')
        .select('id, name, status, assigned_to')
        .eq('account_id', account.id)
        .in('id', data.asset_ids);

      if (assetsError) {
        logger.error(
          {
            error: assetsError,
            name: 'users.assignAssets',
          },
          'Failed to fetch assets',
        );

        return {
          success: false,
          message: 'Failed to fetch assets',
        };
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

        return {
          success: false,
          message: 'Some assets were not found',
        };
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

        return {
          success: false,
          message: `Some assets are already assigned: ${alreadyAssigned.map((a) => a.name).join(', ')}`,
        };
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
          {
            error: updateError,
            name: 'users.assignAssets',
          },
          'Failed to assign assets',
        );

        return {
          success: false,
          message: 'Failed to assign assets',
        };
      }

      // Log activity for each asset assignment
      for (const asset of assets) {
        try {
          await client.rpc('log_user_activity', {
            p_user_id: currentUser.id,
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
          // Don't fail the operation if logging fails
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

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.assignAssets',
        },
        'Unexpected error assigning assets',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
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
 * Unassign an asset from a user
 */
export const unassignAssetFromUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.unassignAsset',
          assetId: data.asset_id,
        },
        'Unassigning asset from user...',
      );

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.unassignAsset',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.unassignAsset',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

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

        return {
          success: false,
          message: 'Asset not found',
        };
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

        return {
          success: false,
          message: 'Asset does not belong to this account',
        };
      }

      // Check if asset is currently assigned
      if (!asset.assigned_to) {
        logger.warn(
          {
            assetId: data.asset_id,
            name: 'users.unassignAsset',
          },
          'Asset is not currently assigned',
        );

        return {
          success: false,
          message: 'Asset is not currently assigned',
        };
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
          {
            error: updateError,
            name: 'users.unassignAsset',
          },
          'Failed to unassign asset',
        );

        return {
          success: false,
          message: 'Failed to unassign asset',
        };
      }

      // Log the activity
      try {
        await client.rpc('log_user_activity', {
          p_user_id: currentUser.id,
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
          {
            error: logError,
            name: 'users.unassignAsset',
          },
          'Failed to log activity',
        );
        // Don't fail the operation if logging fails
      }

      logger.info(
        {
          assetId: data.asset_id,
          name: 'users.unassignAsset',
        },
        'Asset unassigned successfully',
      );

      // Revalidate relevant pages
      revalidatePath(`/home/${data.accountSlug}/users/${previousUserId}`);
      revalidatePath(`/home/${data.accountSlug}/users`);
      revalidatePath(`/home/${data.accountSlug}/assets`);
      revalidatePath(`/home/${data.accountSlug}/assets/${data.asset_id}`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.unassignAsset',
        },
        'Unexpected error unassigning asset',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: z.object({
      asset_id: z.string().uuid('Invalid asset ID'),
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);

/**
 * Export user activity logs in CSV or JSON format
 */
export const exportUserActivity = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'users.exportActivity',
          userId: data.user_id,
          format: data.format,
        },
        'Exporting user activity...',
      );

      // Get account details from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'users.exportActivity',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'users.exportActivity',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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
          {
            error,
            name: 'users.exportActivity',
          },
          'Failed to fetch activities',
        );

        return {
          success: false,
          message: 'Failed to fetch activity logs',
        };
      }

      if (!activities || activities.length === 0) {
        logger.warn(
          {
            name: 'users.exportActivity',
            userId: data.user_id,
          },
          'No activities found to export',
        );

        return {
          success: false,
          message: 'No activity logs found matching the filters',
        };
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
          {
            error: logError,
            name: 'users.exportActivity',
          },
          'Failed to log export activity',
        );
        // Don't fail the operation if logging fails
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
    } catch (error) {
      logger.error(
        {
          error,
          name: 'users.exportActivity',
        },
        'Unexpected error exporting activity logs',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: ExportUserActivitySchema.extend({
      accountSlug: z.string().min(1, 'Account slug is required'),
    }),
  },
);
