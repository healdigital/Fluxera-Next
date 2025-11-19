'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { AssetErrors } from '@kit/shared/error-messages';
import { getLogger } from '@kit/shared/logger';
import {
  PERFORMANCE_THRESHOLDS,
  measurePerformance,
  withTimeout,
} from '@kit/shared/performance';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  AssignAssetSchema,
  CreateAssetSchema,
  DeleteAssetSchema,
  UnassignAssetSchema,
  UpdateAssetSchema,
} from '../schemas/asset.schema';

/**
 * Create a new asset
 */
export const createAsset = enhanceAction(
  async (data) => {
    return measurePerformance('create-asset', async () => {
      const logger = await getLogger();
      const client = getSupabaseServerClient();

      try {
        logger.info(
          {
            name: 'assets.create',
          },
          'Creating new asset...',
        );

        // Get account_id from the slug in the data
        const accountQuery = client
          .from('accounts')
          .select('id, slug')
          .eq('slug', data.accountSlug)
          .single();
        const accountResult = await withTimeout(
          accountQuery as unknown as Promise<typeof accountQuery>,
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        );

        const { data: account, error: accountError } = accountResult as Awaited<
          typeof accountQuery
        >;

        if (accountError || !account) {
          logger.error(
            {
              error: accountError,
              name: 'assets.create',
            },
            'Failed to find account',
          );

          return {
            success: false,
            message: AssetErrors.PERMISSION_DENIED.description,
          };
        }

        // Create the asset
        const createQuery = client
          .from('assets')
          .insert({
            account_id: account.id,
            name: data.name,
            category: data.category,
            status: data.status || 'available',
            description: data.description || null,
            serial_number: data.serial_number || null,
            purchase_date: data.purchase_date || null,
            warranty_expiry_date: data.warranty_expiry_date || null,
          })
          .select()
          .single();

        const createResult = await withTimeout(
          createQuery as unknown as Promise<typeof createQuery>,
          PERFORMANCE_THRESHOLDS.DATABASE_QUERY,
        );

        const { data: asset, error: createError } = createResult as Awaited<
          typeof createQuery
        >;

        if (createError) {
          logger.error(
            {
              error: createError,
              name: 'assets.create',
            },
            'Failed to create asset',
          );

          return {
            success: false,
            message: `${AssetErrors.CREATE_FAILED.description} ${AssetErrors.CREATE_FAILED.action}`,
          };
        }

        logger.info(
          {
            assetId: asset.id,
            name: 'assets.create',
          },
          'Asset successfully created',
        );

        revalidatePath(`/home/${data.accountSlug}/assets`);

        return {
          success: true,
          data: asset,
        };
      } catch (error) {
        logger.error(
          {
            error,
            name: 'assets.create',
          },
          'Unexpected error creating asset',
        );

        return {
          success: false,
          message: `${AssetErrors.CREATE_FAILED.description} ${AssetErrors.CREATE_FAILED.action}`,
        };
      }
    });
  },
  {
    schema: CreateAssetSchema,
  },
);

/**
 * Update an existing asset
 */
export const updateAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          assetId: data.id,
          name: 'assets.update',
        },
        'Updating asset...',
      );

      // Get the asset to find its account slug
      const { data: existingAsset, error: fetchError } = await client
        .from('assets')
        .select('account_id, accounts!inner(slug)')
        .eq('id', data.id)
        .single();

      if (fetchError || !existingAsset) {
        logger.error(
          {
            error: fetchError,
            assetId: data.id,
            name: 'assets.update',
          },
          'Failed to find asset',
        );

        return {
          success: false,
          message: `${AssetErrors.NOT_FOUND.description} ${AssetErrors.NOT_FOUND.action}`,
        };
      }

      // Update the asset
      const { data: updatedAsset, error: updateError } = await client
        .from('assets')
        .update({
          name: data.name,
          category: data.category,
          status: data.status,
          description: data.description || null,
          serial_number: data.serial_number || null,
          purchase_date: data.purchase_date || null,
          warranty_expiry_date: data.warranty_expiry_date || null,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            error: updateError,
            assetId: data.id,
            name: 'assets.update',
          },
          'Failed to update asset',
        );

        return {
          success: false,
          message: `${AssetErrors.UPDATE_FAILED.description} ${AssetErrors.UPDATE_FAILED.action}`,
        };
      }

      logger.info(
        {
          assetId: data.id,
          name: 'assets.update',
        },
        'Asset successfully updated',
      );

      const accountSlug = (existingAsset.accounts as { slug: string }).slug;
      revalidatePath(`/home/${accountSlug}/assets`);
      revalidatePath(`/home/${accountSlug}/assets/${data.id}`);

      return {
        success: true,
        data: updatedAsset,
      };
    } catch (error) {
      logger.error(
        {
          error,
          assetId: data.id,
          name: 'assets.update',
        },
        'Unexpected error updating asset',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: UpdateAssetSchema,
  },
);

/**
 * Delete an asset
 */
export const deleteAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          assetId: data.id,
          name: 'assets.delete',
        },
        'Deleting asset...',
      );

      // Get the asset to find its account slug before deletion
      const { data: existingAsset, error: fetchError } = await client
        .from('assets')
        .select('account_id, accounts!inner(slug)')
        .eq('id', data.id)
        .single();

      if (fetchError || !existingAsset) {
        logger.error(
          {
            error: fetchError,
            assetId: data.id,
            name: 'assets.delete',
          },
          'Failed to find asset',
        );

        return {
          success: false,
          message: `${AssetErrors.NOT_FOUND.description} ${AssetErrors.NOT_FOUND.action}`,
        };
      }

      // Delete the asset
      const { error: deleteError } = await client
        .from('assets')
        .delete()
        .eq('id', data.id);

      if (deleteError) {
        logger.error(
          {
            error: deleteError,
            assetId: data.id,
            name: 'assets.delete',
          },
          'Failed to delete asset',
        );

        return {
          success: false,
          message: `${AssetErrors.DELETE_FAILED.description} ${AssetErrors.DELETE_FAILED.action}`,
        };
      }

      logger.info(
        {
          assetId: data.id,
          name: 'assets.delete',
        },
        'Asset successfully deleted',
      );

      const accountSlug = (existingAsset.accounts as { slug: string }).slug;
      revalidatePath(`/home/${accountSlug}/assets`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          assetId: data.id,
          name: 'assets.delete',
        },
        'Unexpected error deleting asset',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: DeleteAssetSchema,
  },
);

/**
 * Assign an asset to a user
 */
export const assignAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          assetId: data.asset_id,
          userId: data.user_id,
          name: 'assets.assign',
        },
        'Assigning asset to user...',
      );

      // Get the asset to find its account slug
      const { data: existingAsset, error: fetchError } = await client
        .from('assets')
        .select('account_id, accounts!inner(slug)')
        .eq('id', data.asset_id)
        .single();

      if (fetchError || !existingAsset) {
        logger.error(
          {
            error: fetchError,
            assetId: data.asset_id,
            name: 'assets.assign',
          },
          'Failed to find asset',
        );

        return {
          success: false,
          message: `${AssetErrors.NOT_FOUND.description} ${AssetErrors.NOT_FOUND.action}`,
        };
      }

      // Verify the user is a member of the same account
      const { data: membership, error: membershipError } = await client
        .from('accounts_memberships')
        .select('user_id')
        .eq('account_id', existingAsset.account_id)
        .eq('user_id', data.user_id)
        .single();

      if (membershipError || !membership) {
        logger.error(
          {
            error: membershipError,
            userId: data.user_id,
            accountId: existingAsset.account_id,
            name: 'assets.assign',
          },
          'User is not a member of this account',
        );

        return {
          success: false,
          message: `${AssetErrors.ASSIGN_FAILED.description} ${AssetErrors.ASSIGN_FAILED.action}`,
        };
      }

      // Assign the asset and update status
      const { data: updatedAsset, error: updateError } = await client
        .from('assets')
        .update({
          assigned_to: data.user_id,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
        })
        .eq('id', data.asset_id)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            error: updateError,
            assetId: data.asset_id,
            name: 'assets.assign',
          },
          'Failed to assign asset',
        );

        return {
          success: false,
          message: `${AssetErrors.ASSIGN_FAILED.description} ${AssetErrors.ASSIGN_FAILED.action}`,
        };
      }

      logger.info(
        {
          assetId: data.asset_id,
          userId: data.user_id,
          name: 'assets.assign',
        },
        'Asset successfully assigned',
      );

      const accountSlug = (existingAsset.accounts as { slug: string }).slug;
      revalidatePath(`/home/${accountSlug}/assets`);
      revalidatePath(`/home/${accountSlug}/assets/${data.asset_id}`);

      return {
        success: true,
        data: updatedAsset,
      };
    } catch (error) {
      logger.error(
        {
          error,
          assetId: data.asset_id,
          name: 'assets.assign',
        },
        'Unexpected error assigning asset',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: AssignAssetSchema,
  },
);

/**
 * Unassign an asset from a user
 */
export const unassignAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          assetId: data.asset_id,
          name: 'assets.unassign',
        },
        'Unassigning asset...',
      );

      // Get the asset to find its account slug
      const { data: existingAsset, error: fetchError } = await client
        .from('assets')
        .select('account_id, assigned_to, accounts!inner(slug)')
        .eq('id', data.asset_id)
        .single();

      if (fetchError || !existingAsset) {
        logger.error(
          {
            error: fetchError,
            assetId: data.asset_id,
            name: 'assets.unassign',
          },
          'Failed to find asset',
        );

        return {
          success: false,
          message: `${AssetErrors.NOT_FOUND.description} ${AssetErrors.NOT_FOUND.action}`,
        };
      }

      // Check if asset is currently assigned
      if (!existingAsset.assigned_to) {
        logger.warn(
          {
            assetId: data.asset_id,
            name: 'assets.unassign',
          },
          'Asset is not currently assigned',
        );

        return {
          success: false,
          message: `${AssetErrors.NOT_ASSIGNED.description} ${AssetErrors.NOT_ASSIGNED.action}`,
        };
      }

      // Unassign the asset and reset status to available
      const { data: updatedAsset, error: updateError } = await client
        .from('assets')
        .update({
          assigned_to: null,
          assigned_at: null,
          status: 'available',
        })
        .eq('id', data.asset_id)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            error: updateError,
            assetId: data.asset_id,
            name: 'assets.unassign',
          },
          'Failed to unassign asset',
        );

        return {
          success: false,
          message: `${AssetErrors.UNASSIGN_FAILED.description} ${AssetErrors.UNASSIGN_FAILED.action}`,
        };
      }

      logger.info(
        {
          assetId: data.asset_id,
          name: 'assets.unassign',
        },
        'Asset successfully unassigned',
      );

      const accountSlug = (existingAsset.accounts as { slug: string }).slug;
      revalidatePath(`/home/${accountSlug}/assets`);
      revalidatePath(`/home/${accountSlug}/assets/${data.asset_id}`);

      return {
        success: true,
        data: updatedAsset,
      };
    } catch (error) {
      logger.error(
        {
          error,
          assetId: data.asset_id,
          name: 'assets.unassign',
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
    schema: UnassignAssetSchema,
  },
);
