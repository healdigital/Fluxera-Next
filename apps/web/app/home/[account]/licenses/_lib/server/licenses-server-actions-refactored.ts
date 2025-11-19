'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from '@kit/shared/app-errors';
import { getLogger } from '@kit/shared/logger';
import { withAccountPermission } from '@kit/shared/permission-helpers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// Schema for create license action with accountSlug
const CreateLicenseActionSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    vendor: z.string().min(1, 'Vendor is required').max(255),
    license_key: z.string().min(1, 'License key is required'),
    license_type: z.enum([
      'perpetual',
      'subscription',
      'volume',
      'oem',
      'trial',
      'educational',
      'enterprise',
    ]),
    purchase_date: z.string().date('Invalid purchase date'),
    expiration_date: z.string().date('Invalid expiration date'),
    cost: z.number().positive('Cost must be a positive number').optional(),
    notes: z
      .string()
      .max(5000, 'Notes must be 5000 characters or less')
      .optional(),
    accountSlug: z.string().min(1, 'Account slug is required'),
  })
  .refine(
    (data) => {
      const purchaseDate = new Date(data.purchase_date);
      const expirationDate = new Date(data.expiration_date);
      return expirationDate > purchaseDate;
    },
    {
      message: 'Expiration date must be after purchase date',
      path: ['expiration_date'],
    },
  );

/**
 * Creates a new software license.
 *
 * Requires `licenses.create` permission for the account.
 *
 * @param data - License data including account slug
 * @returns The created license
 * @throws {NotFoundError} If account doesn't exist
 * @throws {ConflictError} If license key already exists
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.create permission
 */
export const createLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ name: 'licenses.create' }, 'Creating new license...');

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.create' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Create the license
        const { data: license, error: createError } = await client
          .from('software_licenses')
          .insert({
            account_id: account.id,
            name: data.name,
            vendor: data.vendor,
            license_key: data.license_key,
            license_type: data.license_type,
            purchase_date: data.purchase_date,
            expiration_date: data.expiration_date,
            cost: data.cost || null,
            notes: data.notes || null,
            created_by: currentUser!.id,
            updated_by: currentUser!.id,
          })
          .select()
          .single();

        if (createError) {
          logger.error(
            { error: createError, name: 'licenses.create' },
            'Failed to create license',
          );

          // Handle duplicate license key error
          if (createError.code === '23505') {
            throw new ConflictError(
              'A license with this key already exists for your account',
              {
                licenseKey: data.license_key,
                accountId: account.id,
              },
            );
          }

          throw createError;
        }

        logger.info(
          { licenseId: license.id, name: 'licenses.create' },
          'License successfully created',
        );

        revalidatePath(`/home/${data.accountSlug}/licenses`);

        return {
          success: true,
          data: license,
        };
      },
      {
        accountId: account.id,
        permission: 'licenses.create',
        client,
        resourceName: 'license',
      },
    );
  },
  {
    schema: CreateLicenseActionSchema,
  },
);

// Schema for update license action with accountSlug
const UpdateLicenseActionSchema = z
  .object({
    id: z.string().uuid('Invalid license ID'),
    name: z.string().min(1, 'Name is required').max(255),
    vendor: z.string().min(1, 'Vendor is required').max(255),
    license_key: z.string().min(1, 'License key is required'),
    license_type: z.enum([
      'perpetual',
      'subscription',
      'volume',
      'oem',
      'trial',
      'educational',
      'enterprise',
    ]),
    purchase_date: z.string().date('Invalid purchase date'),
    expiration_date: z.string().date('Invalid expiration date'),
    cost: z.number().positive('Cost must be a positive number').optional(),
    notes: z
      .string()
      .max(5000, 'Notes must be 5000 characters or less')
      .optional(),
    accountSlug: z.string().min(1, 'Account slug is required'),
  })
  .refine(
    (data) => {
      const purchaseDate = new Date(data.purchase_date);
      const expirationDate = new Date(data.expiration_date);
      return expirationDate > purchaseDate;
    },
    {
      message: 'Expiration date must be after purchase date',
      path: ['expiration_date'],
    },
  );

/**
 * Updates an existing software license.
 *
 * Requires `licenses.update` permission for the account.
 *
 * @param data - License data including ID and account slug
 * @returns The updated license
 * @throws {NotFoundError} If account or license doesn't exist
 * @throws {ConflictError} If license key already exists
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.update permission
 */
export const updateLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { licenseId: data.id, name: 'licenses.update' },
      'Updating license...',
    );

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.update' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Update the license
        const { data: license, error: updateError } = await client
          .from('software_licenses')
          .update({
            name: data.name,
            vendor: data.vendor,
            license_key: data.license_key,
            license_type: data.license_type,
            purchase_date: data.purchase_date,
            expiration_date: data.expiration_date,
            cost: data.cost || null,
            notes: data.notes || null,
            updated_by: currentUser!.id,
          })
          .eq('id', data.id)
          .eq('account_id', account.id)
          .select()
          .single();

        if (updateError) {
          logger.error(
            { error: updateError, name: 'licenses.update' },
            'Failed to update license',
          );

          // Handle not found
          if (updateError.code === 'PGRST116') {
            throw new NotFoundError('License', data.id);
          }

          // Handle duplicate license key error
          if (updateError.code === '23505') {
            throw new ConflictError(
              'A license with this key already exists for your account',
              {
                licenseKey: data.license_key,
                accountId: account.id,
              },
            );
          }

          throw updateError;
        }

        logger.info(
          { licenseId: license.id, name: 'licenses.update' },
          'License successfully updated',
        );

        revalidatePath(`/home/${data.accountSlug}/licenses`);
        revalidatePath(`/home/${data.accountSlug}/licenses/${data.id}`);

        return {
          success: true,
          data: license,
        };
      },
      {
        accountId: account.id,
        permission: 'licenses.update',
        client,
        resourceName: 'license',
      },
    );
  },
  {
    schema: UpdateLicenseActionSchema,
  },
);

// Schema for delete license action with accountSlug
const DeleteLicenseActionSchema = z.object({
  id: z.string().uuid('Invalid license ID'),
  accountSlug: z.string().min(1, 'Account slug is required'),
});

/**
 * Deletes a software license.
 *
 * Requires `licenses.delete` permission for the account.
 * Checks for existing assignments and includes them in the response.
 * Cascade deletes all assignments when license is deleted.
 *
 * @param data - License ID and account slug
 * @returns Assignment count and details
 * @throws {NotFoundError} If account or license doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.delete permission
 */
export const deleteLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { licenseId: data.id, name: 'licenses.delete' },
      'Deleting license...',
    );

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.delete' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Check for existing assignments before deletion
        const { data: assignments, error: assignmentsError } = await client
          .from('license_assignments')
          .select(
            `
          id,
          assigned_to_user,
          assigned_to_asset,
          users:assigned_to_user(id, display_name, email),
          assets:assigned_to_asset(id, name, category)
        `,
          )
          .eq('license_id', data.id);

        if (assignmentsError) {
          logger.error(
            { error: assignmentsError, name: 'licenses.delete' },
            'Failed to check license assignments',
          );
          throw assignmentsError;
        }

        const assignmentCount = assignments?.length || 0;

        // Delete the license (cascade will delete assignments)
        const { error: deleteError } = await client
          .from('software_licenses')
          .delete()
          .eq('id', data.id)
          .eq('account_id', account.id);

        if (deleteError) {
          logger.error(
            { error: deleteError, name: 'licenses.delete' },
            'Failed to delete license',
          );

          // Handle not found
          if (deleteError.code === 'PGRST116') {
            throw new NotFoundError('License', data.id);
          }

          throw deleteError;
        }

        logger.info(
          {
            licenseId: data.id,
            assignmentCount,
            userId: currentUser!.id,
            name: 'licenses.delete',
          },
          'License successfully deleted',
        );

        revalidatePath(`/home/${data.accountSlug}/licenses`);

        return {
          success: true,
          data: {
            assignmentCount,
            assignments: assignments || [],
          },
        };
      },
      {
        accountId: account.id,
        permission: 'licenses.delete',
        client,
        resourceName: 'license',
      },
    );
  },
  {
    schema: DeleteLicenseActionSchema,
  },
);

// Schema for assign license to user action with accountSlug
const AssignLicenseToUserActionSchema = z.object({
  license_id: z.string().uuid('Invalid license ID'),
  user_id: z.string().uuid('Invalid user ID'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
  accountSlug: z.string().min(1, 'Account slug is required'),
});

/**
 * Assigns a software license to a user.
 *
 * Requires `licenses.manage` permission for the account.
 * Checks for duplicate assignments and verifies user is a team member.
 *
 * @param data - License ID, user ID, and account slug
 * @returns The created assignment
 * @throws {NotFoundError} If account, license, or user doesn't exist
 * @throws {ConflictError} If license is already assigned to this user
 * @throws {BusinessRuleError} If user is not a member of the account
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.manage permission
 */
export const assignLicenseToUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        licenseId: data.license_id,
        userId: data.user_id,
        name: 'licenses.assignToUser',
      },
      'Assigning license to user...',
    );

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.assignToUser' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Verify the license exists and belongs to the account
        const { data: license, error: licenseError } = await client
          .from('software_licenses')
          .select('id, name')
          .eq('id', data.license_id)
          .eq('account_id', account.id)
          .single();

        if (licenseError || !license) {
          logger.error(
            {
              error: licenseError,
              licenseId: data.license_id,
              name: 'licenses.assignToUser',
            },
            'Failed to find license',
          );
          throw new NotFoundError('License', data.license_id);
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
              name: 'licenses.assignToUser',
            },
            'User is not a member of this account',
          );
          throw new BusinessRuleError('User is not a member of this account', {
            userId: data.user_id,
            accountId: account.id,
          });
        }

        // Check for duplicate assignment
        const { data: existingAssignment, error: checkError } = await client
          .from('license_assignments')
          .select('id')
          .eq('license_id', data.license_id)
          .eq('assigned_to_user', data.user_id)
          .maybeSingle();

        if (checkError) {
          logger.error(
            { error: checkError, name: 'licenses.assignToUser' },
            'Failed to check for existing assignment',
          );
          throw checkError;
        }

        if (existingAssignment) {
          logger.warn(
            {
              licenseId: data.license_id,
              userId: data.user_id,
              name: 'licenses.assignToUser',
            },
            'License is already assigned to this user',
          );
          throw new ConflictError(
            'This license is already assigned to this user',
            {
              licenseId: data.license_id,
              userId: data.user_id,
            },
          );
        }

        // Create the assignment
        const { data: assignment, error: assignError } = await client
          .from('license_assignments')
          .insert({
            license_id: data.license_id,
            account_id: account.id,
            assigned_to_user: data.user_id,
            assigned_by: currentUser!.id,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (assignError) {
          logger.error(
            { error: assignError, name: 'licenses.assignToUser' },
            'Failed to create license assignment',
          );
          throw assignError;
        }

        logger.info(
          {
            assignmentId: assignment.id,
            licenseId: data.license_id,
            userId: data.user_id,
            name: 'licenses.assignToUser',
          },
          'License successfully assigned to user',
        );

        revalidatePath(`/home/${data.accountSlug}/licenses`);
        revalidatePath(`/home/${data.accountSlug}/licenses/${data.license_id}`);

        return {
          success: true,
          data: assignment,
        };
      },
      {
        accountId: account.id,
        permission: 'licenses.manage',
        client,
        resourceName: 'license assignment',
      },
    );
  },
  {
    schema: AssignLicenseToUserActionSchema,
  },
);

// Schema for assign license to asset action with accountSlug
const AssignLicenseToAssetActionSchema = z.object({
  license_id: z.string().uuid('Invalid license ID'),
  asset_id: z.string().uuid('Invalid asset ID'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
  accountSlug: z.string().min(1, 'Account slug is required'),
});

/**
 * Assigns a software license to an asset.
 *
 * Requires `licenses.manage` permission for the account.
 * Checks for duplicate assignments and verifies asset belongs to the account.
 *
 * @param data - License ID, asset ID, and account slug
 * @returns The created assignment
 * @throws {NotFoundError} If account, license, or asset doesn't exist
 * @throws {ConflictError} If license is already assigned to this asset
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.manage permission
 */
export const assignLicenseToAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        licenseId: data.license_id,
        assetId: data.asset_id,
        name: 'licenses.assignToAsset',
      },
      'Assigning license to asset...',
    );

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.assignToAsset' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Verify the license exists and belongs to the account
        const { data: license, error: licenseError } = await client
          .from('software_licenses')
          .select('id, name')
          .eq('id', data.license_id)
          .eq('account_id', account.id)
          .single();

        if (licenseError || !license) {
          logger.error(
            {
              error: licenseError,
              licenseId: data.license_id,
              name: 'licenses.assignToAsset',
            },
            'Failed to find license',
          );
          throw new NotFoundError('License', data.license_id);
        }

        // Verify the asset belongs to the account
        const { data: asset, error: assetError } = await client
          .from('assets')
          .select('id, name')
          .eq('id', data.asset_id)
          .eq('account_id', account.id)
          .single();

        if (assetError || !asset) {
          logger.error(
            {
              error: assetError,
              assetId: data.asset_id,
              accountId: account.id,
              name: 'licenses.assignToAsset',
            },
            'Asset not found or does not belong to this account',
          );
          throw new NotFoundError('Asset', data.asset_id);
        }

        // Check for duplicate assignment
        const { data: existingAssignment, error: checkError } = await client
          .from('license_assignments')
          .select('id')
          .eq('license_id', data.license_id)
          .eq('assigned_to_asset', data.asset_id)
          .maybeSingle();

        if (checkError) {
          logger.error(
            { error: checkError, name: 'licenses.assignToAsset' },
            'Failed to check for existing assignment',
          );
          throw checkError;
        }

        if (existingAssignment) {
          logger.warn(
            {
              licenseId: data.license_id,
              assetId: data.asset_id,
              name: 'licenses.assignToAsset',
            },
            'License is already assigned to this asset',
          );
          throw new ConflictError(
            'This license is already assigned to this asset',
            {
              licenseId: data.license_id,
              assetId: data.asset_id,
            },
          );
        }

        // Create the assignment
        const { data: assignment, error: assignError } = await client
          .from('license_assignments')
          .insert({
            license_id: data.license_id,
            account_id: account.id,
            assigned_to_asset: data.asset_id,
            assigned_by: currentUser!.id,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (assignError) {
          logger.error(
            { error: assignError, name: 'licenses.assignToAsset' },
            'Failed to create license assignment',
          );
          throw assignError;
        }

        logger.info(
          {
            assignmentId: assignment.id,
            licenseId: data.license_id,
            assetId: data.asset_id,
            name: 'licenses.assignToAsset',
          },
          'License successfully assigned to asset',
        );

        revalidatePath(`/home/${data.accountSlug}/licenses`);
        revalidatePath(`/home/${data.accountSlug}/licenses/${data.license_id}`);

        return {
          success: true,
          data: assignment,
        };
      },
      {
        accountId: account.id,
        permission: 'licenses.manage',
        client,
        resourceName: 'license assignment',
      },
    );
  },
  {
    schema: AssignLicenseToAssetActionSchema,
  },
);

// Schema for unassign license action with accountSlug
const UnassignLicenseActionSchema = z.object({
  assignment_id: z.string().uuid('Invalid assignment ID'),
  accountSlug: z.string().min(1, 'Account slug is required'),
});

/**
 * Unassigns a software license from a user or asset.
 *
 * Requires `licenses.manage` permission for the account.
 * Removes the assignment record and logs the action.
 *
 * @param data - Assignment ID and account slug
 * @returns Assignment and license IDs
 * @throws {NotFoundError} If account or assignment doesn't exist
 * @throws {UnauthorizedError} If user is not authenticated or not a member
 * @throws {ForbiddenError} If user lacks licenses.manage permission
 */
export const unassignLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { assignmentId: data.assignment_id, name: 'licenses.unassign' },
      'Unassigning license...',
    );

    // Get account_id from the slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.unassign' },
        'Failed to find account',
      );
      throw new NotFoundError('Account', data.accountSlug);
    }

    return withAccountPermission(
      async () => {
        // Get current user for audit tracking
        const {
          data: { user: currentUser },
        } = await client.auth.getUser();

        // Get assignment details before deletion for logging
        const { data: assignment, error: assignmentError } = await client
          .from('license_assignments')
          .select(
            `
          id,
          license_id,
          assigned_to_user,
          assigned_to_asset,
          account_id
        `,
          )
          .eq('id', data.assignment_id)
          .eq('account_id', account.id)
          .single();

        if (assignmentError || !assignment) {
          logger.error(
            {
              error: assignmentError,
              assignmentId: data.assignment_id,
              name: 'licenses.unassign',
            },
            'Failed to find assignment',
          );
          throw new NotFoundError('Assignment', data.assignment_id);
        }

        // Delete the assignment
        const { error: deleteError } = await client
          .from('license_assignments')
          .delete()
          .eq('id', data.assignment_id)
          .eq('account_id', account.id);

        if (deleteError) {
          logger.error(
            { error: deleteError, name: 'licenses.unassign' },
            'Failed to delete assignment',
          );
          throw deleteError;
        }

        logger.info(
          {
            assignmentId: data.assignment_id,
            licenseId: assignment.license_id,
            userId: currentUser!.id,
            assignedToUser: assignment.assigned_to_user,
            assignedToAsset: assignment.assigned_to_asset,
            name: 'licenses.unassign',
          },
          'License successfully unassigned',
        );

        revalidatePath(`/home/${data.accountSlug}/licenses`);
        revalidatePath(
          `/home/${data.accountSlug}/licenses/${assignment.license_id}`,
        );

        return {
          success: true,
          data: {
            assignment_id: data.assignment_id,
            license_id: assignment.license_id,
          },
        };
      },
      {
        accountId: account.id,
        permission: 'licenses.manage',
        client,
        resourceName: 'license assignment',
      },
    );
  },
  {
    schema: UnassignLicenseActionSchema,
  },
);
