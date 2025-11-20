'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { BusinessRuleError, NotFoundError } from '@kit/shared/app-errors';
import { getLogger } from '@kit/shared/logger';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  AssignAssetSchema,
  BulkAssignAssetsSchema,
  BulkDeleteAssetsSchema,
  CreateAssetSchema,
  DeleteAssetSchema,
  UnassignAssetSchema,
  UpdateAssetSchema,
} from '../schemas/asset.schema';

/**
 * Creates a new asset.
 *
 * Requires `assets.create` permission for the account.
 *
 * @param data - Asset data including account slug
 * @returns The created asset
 * @throws {NotFoundError} If account doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.create permission
 */
export const createAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'assets.create' }, 'Creating new asset...');

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'assets.create' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Create the asset
        const { data: asset, error: createError } = await client
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

        if (createError) {
          logger.error(
            { error: createError, name: 'assets.create' },
            'Failed to create asset',
          );
          throw createError;
        }

        logger.info(
          { assetId: asset.id, name: 'assets.create' },
          'Asset successfully created',
        );

        revalidatePath(`/home/${data.accountSlug}/assets`);

        return {
          success: true,
          data: asset,
        };
      },
      {
        accountId: account.id,
        permission: 'assets.create',
        client,
        resourceName: 'asset',
      },
    );
  },
  {
    schema: CreateAssetSchema,
  },
);

/**
 * Updates an existing asset.
 *
 * Requires `assets.update` permission for the account.
 *
 * @param data - Asset update data
 * @returns The updated asset
 * @throws {NotFoundError} If asset doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.update permission
 */
export const updateAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { assetId: data.id, name: 'assets.update' },
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
        { error: fetchError, assetId: data.id, name: 'assets.update' },
        'Failed to find asset',
      );
      throw new NotFoundError('Asset', data.id);
    }

    const accountSlug = (existingAsset.accounts as { slug: string }).slug;

    // Get the full account
    const { data: account } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', accountSlug)
      .single();

    return withAccountPermission(
      async () => {
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
            { error: updateError, assetId: data.id, name: 'assets.update' },
            'Failed to update asset',
          );
          throw updateError;
        }

        logger.info(
          { assetId: data.id, name: 'assets.update' },
          'Asset successfully updated',
        );

        revalidatePath(`/home/${accountSlug}/assets`);
        revalidatePath(`/home/${accountSlug}/assets/${data.id}`);

        return {
          success: true,
          data: updatedAsset,
        };
      },
      {
        accountId: account!.id,
        permission: 'assets.update',
        client,
        resourceName: 'asset',
      },
    );
  },
  {
    schema: UpdateAssetSchema,
  },
);

/**
 * Deletes an asset.
 *
 * Requires `assets.delete` permission for the account.
 *
 * @param data - Asset deletion data
 * @returns Success status
 * @throws {NotFoundError} If asset doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.delete permission
 */
export const deleteAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { assetId: data.id, name: 'assets.delete' },
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
        { error: fetchError, assetId: data.id, name: 'assets.delete' },
        'Failed to find asset',
      );
      throw new NotFoundError('Asset', data.id);
    }

    const accountSlug = (existingAsset.accounts as { slug: string }).slug;

    // Get the full account
    const { data: account } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', accountSlug)
      .single();

    return withAccountPermission(
      async () => {
        // Delete the asset
        const { error: deleteError } = await client
          .from('assets')
          .delete()
          .eq('id', data.id);

        if (deleteError) {
          logger.error(
            { error: deleteError, assetId: data.id, name: 'assets.delete' },
            'Failed to delete asset',
          );
          throw deleteError;
        }

        logger.info(
          { assetId: data.id, name: 'assets.delete' },
          'Asset successfully deleted',
        );

        revalidatePath(`/home/${accountSlug}/assets`);

        return {
          success: true,
        };
      },
      {
        accountId: account!.id,
        permission: 'assets.delete',
        client,
        resourceName: 'asset',
      },
    );
  },
  {
    schema: DeleteAssetSchema,
  },
);

/**
 * Assigns an asset to a user.
 *
 * Requires `assets.manage` permission for the account.
 *
 * @param data - Asset assignment data
 * @returns The updated asset
 * @throws {NotFoundError} If asset doesn't exist
 * @throws {BusinessRuleError} If user is not a member of the account
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.manage permission
 */
export const assignAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { assetId: data.asset_id, userId: data.user_id, name: 'assets.assign' },
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
        { error: fetchError, assetId: data.asset_id, name: 'assets.assign' },
        'Failed to find asset',
      );
      throw new NotFoundError('Asset', data.asset_id);
    }

    const accountSlug = (existingAsset.accounts as { slug: string }).slug;

    // Get the full account
    const { data: account } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', accountSlug)
      .single();

    return withAccountPermission(
      async () => {
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
          throw new BusinessRuleError(
            'Cannot assign asset to user who is not a member of this account',
            {
              userId: data.user_id,
              accountId: existingAsset.account_id,
            },
          );
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
          throw updateError;
        }

        logger.info(
          {
            assetId: data.asset_id,
            userId: data.user_id,
            name: 'assets.assign',
          },
          'Asset successfully assigned',
        );

        revalidatePath(`/home/${accountSlug}/assets`);
        revalidatePath(`/home/${accountSlug}/assets/${data.asset_id}`);

        return {
          success: true,
          data: updatedAsset,
        };
      },
      {
        accountId: account!.id,
        permission: 'assets.manage',
        client,
        resourceName: 'asset assignment',
      },
    );
  },
  {
    schema: AssignAssetSchema,
  },
);

/**
 * Unassigns an asset from a user.
 *
 * Requires `assets.manage` permission for the account.
 *
 * @param data - Asset unassignment data
 * @returns The updated asset
 * @throws {NotFoundError} If asset doesn't exist
 * @throws {BusinessRuleError} If asset is not currently assigned
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.manage permission
 */
export const unassignAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { assetId: data.asset_id, name: 'assets.unassign' },
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
        { error: fetchError, assetId: data.asset_id, name: 'assets.unassign' },
        'Failed to find asset',
      );
      throw new NotFoundError('Asset', data.asset_id);
    }

    const accountSlug = (existingAsset.accounts as { slug: string }).slug;

    // Get the full account
    const { data: account } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', accountSlug)
      .single();

    return withAccountPermission(
      async () => {
        // Check if asset is currently assigned
        if (!existingAsset.assigned_to) {
          logger.warn(
            { assetId: data.asset_id, name: 'assets.unassign' },
            'Asset is not currently assigned',
          );
          throw new BusinessRuleError('Asset is not currently assigned', {
            assetId: data.asset_id,
          });
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
          throw updateError;
        }

        logger.info(
          { assetId: data.asset_id, name: 'assets.unassign' },
          'Asset successfully unassigned',
        );

        revalidatePath(`/home/${accountSlug}/assets`);
        revalidatePath(`/home/${accountSlug}/assets/${data.asset_id}`);

        return {
          success: true,
          data: updatedAsset,
        };
      },
      {
        accountId: account!.id,
        permission: 'assets.manage',
        client,
        resourceName: 'asset assignment',
      },
    );
  },
  {
    schema: UnassignAssetSchema,
  },
);

/**
 * Bulk deletes multiple assets.
 *
 * Requires `assets.delete` permission for the account.
 *
 * @param data - Bulk delete data with asset IDs
 * @returns Results with successful and failed deletions
 * @throws {NotFoundError} If account doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.delete permission
 */
export const bulkDeleteAssets = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { assetCount: data.assetIds.length, name: 'assets.bulk-delete' },
      'Bulk deleting assets...',
    );

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'assets.bulk-delete' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        const successful: string[] = [];
        const failed: Array<{ id: string; error: string }> = [];

        // Process each asset deletion
        for (const assetId of data.assetIds) {
          try {
            // Verify asset belongs to this account
            const { data: asset, error: fetchError } = await client
              .from('assets')
              .select('id, account_id')
              .eq('id', assetId)
              .eq('account_id', account.id)
              .single();

            if (fetchError || !asset) {
              failed.push({
                id: assetId,
                error: 'Asset not found or does not belong to this account',
              });
              continue;
            }

            // Delete the asset
            const { error: deleteError } = await client
              .from('assets')
              .delete()
              .eq('id', assetId);

            if (deleteError) {
              logger.error(
                {
                  error: deleteError,
                  assetId,
                  name: 'assets.bulk-delete',
                },
                'Failed to delete asset',
              );
              failed.push({
                id: assetId,
                error: deleteError.message || 'Failed to delete asset',
              });
            } else {
              successful.push(assetId);
            }
          } catch (error) {
            logger.error(
              { error, assetId, name: 'assets.bulk-delete' },
              'Error processing asset deletion',
            );
            failed.push({
              id: assetId,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            });
          }
        }

        logger.info(
          {
            successful: successful.length,
            failed: failed.length,
            name: 'assets.bulk-delete',
          },
          'Bulk delete completed',
        );

        revalidatePath(`/home/${data.accountSlug}/assets`);

        return {
          success: true,
          data: {
            successful,
            failed,
          },
        };
      },
      {
        accountId: account.id,
        permission: 'assets.delete',
        client,
        resourceName: 'assets',
      },
    );
  },
  {
    schema: BulkDeleteAssetsSchema,
  },
);

/**
 * Bulk assigns multiple assets to a user.
 *
 * Requires `assets.manage` permission for the account.
 *
 * @param data - Bulk assign data with asset IDs and user ID
 * @returns Results with successful and failed assignments
 * @throws {NotFoundError} If account doesn't exist
 * @throws {BusinessRuleError} If user is not a member of the account
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks assets.manage permission
 */
export const bulkAssignAssets = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        assetCount: data.assetIds.length,
        userId: data.userId,
        name: 'assets.bulk-assign',
      },
      'Bulk assigning assets...',
    );

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'assets.bulk-assign' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Verify the user is a member of the account
        const { data: membership, error: membershipError } = await client
          .from('accounts_memberships')
          .select('user_id')
          .eq('account_id', account.id)
          .eq('user_id', data.userId)
          .single();

        if (membershipError || !membership) {
          logger.error(
            {
              error: membershipError,
              userId: data.userId,
              accountId: account.id,
              name: 'assets.bulk-assign',
            },
            'User is not a member of this account',
          );
          throw new BusinessRuleError(
            'Cannot assign assets to user who is not a member of this account',
            {
              userId: data.userId,
              accountId: account.id,
            },
          );
        }

        const successful: string[] = [];
        const failed: Array<{ id: string; error: string }> = [];

        // Process each asset assignment
        for (const assetId of data.assetIds) {
          try {
            // Verify asset belongs to this account
            const { data: asset, error: fetchError } = await client
              .from('assets')
              .select('id, account_id')
              .eq('id', assetId)
              .eq('account_id', account.id)
              .single();

            if (fetchError || !asset) {
              failed.push({
                id: assetId,
                error: 'Asset not found or does not belong to this account',
              });
              continue;
            }

            // Assign the asset
            const { error: updateError } = await client
              .from('assets')
              .update({
                assigned_to: data.userId,
                assigned_at: new Date().toISOString(),
                status: 'assigned',
              })
              .eq('id', assetId);

            if (updateError) {
              logger.error(
                {
                  error: updateError,
                  assetId,
                  name: 'assets.bulk-assign',
                },
                'Failed to assign asset',
              );
              failed.push({
                id: assetId,
                error: updateError.message || 'Failed to assign asset',
              });
            } else {
              successful.push(assetId);
            }
          } catch (error) {
            logger.error(
              { error, assetId, name: 'assets.bulk-assign' },
              'Error processing asset assignment',
            );
            failed.push({
              id: assetId,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
            });
          }
        }

        logger.info(
          {
            successful: successful.length,
            failed: failed.length,
            name: 'assets.bulk-assign',
          },
          'Bulk assign completed',
        );

        revalidatePath(`/home/${data.accountSlug}/assets`);

        return {
          success: true,
          data: {
            successful,
            failed,
          },
        };
      },
      {
        accountId: account.id,
        permission: 'assets.manage',
        client,
        resourceName: 'asset assignments',
      },
    );
  },
  {
    schema: BulkAssignAssetsSchema,
  },
);
