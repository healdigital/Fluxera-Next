'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
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
 * Create a new software license
 */
export const createLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          name: 'licenses.create',
        },
        'Creating new license...',
      );

      // Get account_id from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'licenses.create',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user for audit tracking
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'licenses.create',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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
          created_by: currentUser.id,
          updated_by: currentUser.id,
        })
        .select()
        .single();

      if (createError) {
        logger.error(
          {
            error: createError,
            name: 'licenses.create',
          },
          'Failed to create license',
        );

        // Handle duplicate license key error
        if (createError.code === '23505') {
          return {
            success: false,
            message: 'A license with this key already exists for your account',
          };
        }

        return {
          success: false,
          message: 'Failed to create license',
        };
      }

      logger.info(
        {
          licenseId: license.id,
          name: 'licenses.create',
        },
        'License successfully created',
      );

      revalidatePath(`/home/${data.accountSlug}/licenses`);

      return {
        success: true,
        data: license,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.create',
        },
        'Unexpected error creating license',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
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
 * Update an existing software license
 */
export const updateLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          licenseId: data.id,
          name: 'licenses.update',
        },
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
          {
            error: accountError,
            name: 'licenses.update',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user for audit tracking
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'licenses.update',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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
          updated_by: currentUser.id,
        })
        .eq('id', data.id)
        .eq('account_id', account.id)
        .select()
        .single();

      if (updateError) {
        logger.error(
          {
            error: updateError,
            name: 'licenses.update',
          },
          'Failed to update license',
        );

        // Handle duplicate license key error
        if (updateError.code === '23505') {
          return {
            success: false,
            message: 'A license with this key already exists for your account',
          };
        }

        return {
          success: false,
          message: 'Failed to update license',
        };
      }

      logger.info(
        {
          licenseId: license.id,
          name: 'licenses.update',
        },
        'License successfully updated',
      );

      revalidatePath(`/home/${data.accountSlug}/licenses`);
      revalidatePath(`/home/${data.accountSlug}/licenses/${data.id}`);

      return {
        success: true,
        data: license,
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.update',
        },
        'Unexpected error updating license',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
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
 * Delete a software license
 * Checks for existing assignments and includes them in the response
 * Cascade deletes all assignments when license is deleted
 */
export const deleteLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          licenseId: data.id,
          name: 'licenses.delete',
        },
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
          {
            error: accountError,
            name: 'licenses.delete',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user for audit tracking
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'licenses.delete',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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
          {
            error: assignmentsError,
            name: 'licenses.delete',
          },
          'Failed to check license assignments',
        );

        return {
          success: false,
          message: 'Failed to check license assignments',
        };
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
          {
            error: deleteError,
            name: 'licenses.delete',
          },
          'Failed to delete license',
        );

        return {
          success: false,
          message: 'Failed to delete license',
        };
      }

      logger.info(
        {
          licenseId: data.id,
          assignmentCount,
          userId: currentUser.id,
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
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.delete',
        },
        'Unexpected error deleting license',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
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
 * Assign a software license to a user
 * Checks for duplicate assignments and verifies user is a team member
 */
export const assignLicenseToUser = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
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
          {
            error: accountError,
            name: 'licenses.assignToUser',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user for audit tracking
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'licenses.assignToUser',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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

        return {
          success: false,
          message: 'License not found',
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
            name: 'licenses.assignToUser',
          },
          'User is not a member of this account',
        );

        return {
          success: false,
          message: 'User is not a member of this account',
        };
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
          {
            error: checkError,
            name: 'licenses.assignToUser',
          },
          'Failed to check for existing assignment',
        );

        return {
          success: false,
          message: 'Failed to check for existing assignment',
        };
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

        return {
          success: false,
          message: 'This license is already assigned to this user',
        };
      }

      // Create the assignment
      const { data: assignment, error: assignError } = await client
        .from('license_assignments')
        .insert({
          license_id: data.license_id,
          account_id: account.id,
          assigned_to_user: data.user_id,
          assigned_by: currentUser.id,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (assignError) {
        logger.error(
          {
            error: assignError,
            name: 'licenses.assignToUser',
          },
          'Failed to create license assignment',
        );

        return {
          success: false,
          message: 'Failed to assign license',
        };
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
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.assignToUser',
        },
        'Unexpected error assigning license to user',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
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
 * Assign a software license to an asset
 * Checks for duplicate assignments and verifies asset belongs to the account
 */
export const assignLicenseToAsset = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
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
          {
            error: accountError,
            name: 'licenses.assignToAsset',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user for audit tracking
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'licenses.assignToAsset',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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

        return {
          success: false,
          message: 'License not found',
        };
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

        return {
          success: false,
          message: 'Asset not found or does not belong to this account',
        };
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
          {
            error: checkError,
            name: 'licenses.assignToAsset',
          },
          'Failed to check for existing assignment',
        );

        return {
          success: false,
          message: 'Failed to check for existing assignment',
        };
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

        return {
          success: false,
          message: 'This license is already assigned to this asset',
        };
      }

      // Create the assignment
      const { data: assignment, error: assignError } = await client
        .from('license_assignments')
        .insert({
          license_id: data.license_id,
          account_id: account.id,
          assigned_to_asset: data.asset_id,
          assigned_by: currentUser.id,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (assignError) {
        logger.error(
          {
            error: assignError,
            name: 'licenses.assignToAsset',
          },
          'Failed to create license assignment',
        );

        return {
          success: false,
          message: 'Failed to assign license',
        };
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
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.assignToAsset',
        },
        'Unexpected error assigning license to asset',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
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
 * Unassign a software license from a user or asset
 * Removes the assignment record and logs the action
 */
export const unassignLicense = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          assignmentId: data.assignment_id,
          name: 'licenses.unassign',
        },
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
          {
            error: accountError,
            name: 'licenses.unassign',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Get the current user for audit tracking
      const {
        data: { user: currentUser },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !currentUser) {
        logger.error(
          {
            error: userError,
            name: 'licenses.unassign',
          },
          'Failed to get current user',
        );

        return {
          success: false,
          message: 'Authentication required',
        };
      }

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

        return {
          success: false,
          message: 'Assignment not found',
        };
      }

      // Delete the assignment
      const { error: deleteError } = await client
        .from('license_assignments')
        .delete()
        .eq('id', data.assignment_id)
        .eq('account_id', account.id);

      if (deleteError) {
        logger.error(
          {
            error: deleteError,
            name: 'licenses.unassign',
          },
          'Failed to delete assignment',
        );

        return {
          success: false,
          message: 'Failed to unassign license',
        };
      }

      logger.info(
        {
          assignmentId: data.assignment_id,
          licenseId: assignment.license_id,
          userId: currentUser.id,
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
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.unassign',
        },
        'Unexpected error unassigning license',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: UnassignLicenseActionSchema,
  },
);

// Schema for export licenses action with accountSlug and filters
const ExportLicensesActionSchema = z.object({
  accountSlug: z.string().min(1, 'Account slug is required'),
  search: z.string().optional(),
  vendor: z.string().optional(),
  licenseTypes: z
    .array(
      z.enum([
        'perpetual',
        'subscription',
        'volume',
        'oem',
        'trial',
        'educational',
        'enterprise',
      ]),
    )
    .optional(),
  expirationStatus: z.enum(['all', 'active', 'expiring', 'expired']).optional(),
});

/**
 * Export licenses to CSV format
 * Fetches filtered licenses and generates CSV with all fields and assignments
 */
export const exportLicenses = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    try {
      logger.info(
        {
          accountSlug: data.accountSlug,
          name: 'licenses.export',
        },
        'Exporting licenses...',
      );

      // Get account_id from the slug
      const { data: account, error: accountError } = await client
        .from('accounts')
        .select('id, slug')
        .eq('slug', data.accountSlug)
        .single();

      if (accountError || !account) {
        logger.error(
          {
            error: accountError,
            name: 'licenses.export',
          },
          'Failed to find account',
        );

        return {
          success: false,
          message: 'Account not found',
        };
      }

      // Fetch all licenses with assignments
      const { data: allLicenses, error: licensesError } = await client.rpc(
        'get_licenses_with_assignments',
        {
          p_account_id: account.id,
        },
      );

      if (licensesError) {
        logger.error(
          {
            error: licensesError,
            name: 'licenses.export',
          },
          'Failed to fetch licenses',
        );

        return {
          success: false,
          message: 'Failed to fetch licenses',
        };
      }

      let filteredLicenses = allLicenses ?? [];

      // Apply search filter
      if (data.search && data.search.trim()) {
        const searchTerm = data.search.trim().toLowerCase();
        filteredLicenses = filteredLicenses.filter(
          (license) =>
            license.name.toLowerCase().includes(searchTerm) ||
            license.vendor.toLowerCase().includes(searchTerm) ||
            license.license_key?.toLowerCase().includes(searchTerm),
        );
      }

      // Apply vendor filter
      if (data.vendor && data.vendor !== 'all') {
        filteredLicenses = filteredLicenses.filter(
          (license) => license.vendor === data.vendor,
        );
      }

      // Apply license type filter
      if (data.licenseTypes && data.licenseTypes.length > 0) {
        filteredLicenses = filteredLicenses.filter((license) =>
          data.licenseTypes!.includes(license.license_type),
        );
      }

      // Apply expiration status filter
      if (data.expirationStatus && data.expirationStatus !== 'all') {
        switch (data.expirationStatus) {
          case 'active':
            filteredLicenses = filteredLicenses.filter(
              (license) =>
                !license.is_expired && license.days_until_expiry > 30,
            );
            break;
          case 'expiring':
            filteredLicenses = filteredLicenses.filter(
              (license) =>
                !license.is_expired &&
                license.days_until_expiry >= 0 &&
                license.days_until_expiry <= 30,
            );
            break;
          case 'expired':
            filteredLicenses = filteredLicenses.filter(
              (license) => license.is_expired,
            );
            break;
        }
      }

      // Fetch full license details with assignments for export
      const licenseIds = filteredLicenses.map((l) => l.id);

      if (licenseIds.length === 0) {
        logger.info(
          {
            name: 'licenses.export',
          },
          'No licenses to export',
        );

        return {
          success: true,
          data: {
            csv: 'Name,Vendor,License Key,License Type,Purchase Date,Expiration Date,Days Until Expiry,Status,Cost,Total Assignments,User Assignments,Asset Assignments,Notes\n',
            count: 0,
          },
        };
      }

      // Fetch full license details
      const { data: licenses, error: detailsError } = await client
        .from('software_licenses')
        .select(
          `
          id,
          name,
          vendor,
          license_key,
          license_type,
          purchase_date,
          expiration_date,
          cost,
          notes
        `,
        )
        .in('id', licenseIds)
        .eq('account_id', account.id);

      if (detailsError) {
        logger.error(
          {
            error: detailsError,
            name: 'licenses.export',
          },
          'Failed to fetch license details',
        );

        return {
          success: false,
          message: 'Failed to fetch license details',
        };
      }

      // Fetch assignment counts for each license
      const { data: assignments, error: assignmentsError } = await client
        .from('license_assignments')
        .select('license_id, assigned_to_user, assigned_to_asset')
        .in('license_id', licenseIds);

      if (assignmentsError) {
        logger.error(
          {
            error: assignmentsError,
            name: 'licenses.export',
          },
          'Failed to fetch assignments',
        );

        return {
          success: false,
          message: 'Failed to fetch assignments',
        };
      }

      // Group assignment counts by license_id
      const assignmentsByLicense = (licenseIds ?? []).reduce(
        (acc, licenseId) => {
          acc[licenseId] = { userCount: 0, assetCount: 0 };
          return acc;
        },
        {} as Record<string, { userCount: number; assetCount: number }>,
      );

      // Count assignments
      (assignments ?? []).forEach((assignment) => {
        const licenseAssignments = assignmentsByLicense[assignment.license_id];
        if (!licenseAssignments) return;

        if (assignment.assigned_to_user) {
          licenseAssignments.userCount++;
        }

        if (assignment.assigned_to_asset) {
          licenseAssignments.assetCount++;
        }
      });

      // Generate CSV
      const csvRows: string[] = [
        'Name,Vendor,License Key,License Type,Purchase Date,Expiration Date,Days Until Expiry,Status,Cost,Total Assignments,User Assignments,Asset Assignments,Notes',
      ];

      // Escape CSV values
      const escapeCsv = (value: string | null | undefined) => {
        if (!value) return '';
        const stringValue = String(value);
        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      for (const license of licenses ?? []) {
        const licenseData = filteredLicenses.find((l) => l.id === license.id);
        const assignments = assignmentsByLicense[license.id] || {
          userCount: 0,
          assetCount: 0,
        };

        const daysUntilExpiry = licenseData?.days_until_expiry ?? 0;
        const isExpired = licenseData?.is_expired ?? false;
        const status = isExpired
          ? 'Expired'
          : daysUntilExpiry <= 7
            ? 'Expiring Soon (7 days)'
            : daysUntilExpiry <= 30
              ? 'Expiring Soon (30 days)'
              : 'Active';

        const totalAssignments = assignments.userCount + assignments.assetCount;

        csvRows.push(
          [
            escapeCsv(license.name),
            escapeCsv(license.vendor),
            escapeCsv(license.license_key),
            escapeCsv(license.license_type),
            escapeCsv(license.purchase_date),
            escapeCsv(license.expiration_date),
            String(daysUntilExpiry),
            escapeCsv(status),
            license.cost ? String(license.cost) : '',
            String(totalAssignments),
            String(assignments.userCount),
            String(assignments.assetCount),
            escapeCsv(license.notes),
          ].join(','),
        );
      }

      const csv = csvRows.join('\n');

      logger.info(
        {
          count: licenses?.length ?? 0,
          name: 'licenses.export',
        },
        'Licenses successfully exported',
      );

      return {
        success: true,
        data: {
          csv,
          count: licenses?.length ?? 0,
        },
      };
    } catch (error) {
      logger.error(
        {
          error,
          name: 'licenses.export',
        },
        'Unexpected error exporting licenses',
      );

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  },
  {
    schema: ExportLicensesActionSchema,
  },
);

/**
 * Bulk deletes multiple licenses.
 *
 * @param data - Bulk delete data with license IDs
 * @returns Results with successful and failed deletions
 */
export const bulkDeleteLicenses = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      { licenseCount: data.licenseIds.length, name: 'licenses.bulk-delete' },
      'Bulk deleting licenses...',
    );

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.bulk-delete' },
        'Failed to find account',
      );

      return {
        success: false,
        message: 'Account not found',
      };
    }

    const successful: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    // Process each license deletion
    for (const licenseId of data.licenseIds) {
      try {
        // Verify license belongs to this account
        const { data: license, error: fetchError } = await client
          .from('software_licenses')
          .select('id, account_id')
          .eq('id', licenseId)
          .eq('account_id', account.id)
          .single();

        if (fetchError || !license) {
          failed.push({
            id: licenseId,
            error: 'License not found or does not belong to this account',
          });
          continue;
        }

        // Delete the license (cascade will delete assignments)
        const { error: deleteError } = await client
          .from('software_licenses')
          .delete()
          .eq('id', licenseId);

        if (deleteError) {
          logger.error(
            {
              error: deleteError,
              licenseId,
              name: 'licenses.bulk-delete',
            },
            'Failed to delete license',
          );
          failed.push({
            id: licenseId,
            error: deleteError.message || 'Failed to delete license',
          });
        } else {
          successful.push(licenseId);
        }
      } catch (error) {
        logger.error(
          { error, licenseId, name: 'licenses.bulk-delete' },
          'Error processing license deletion',
        );
        failed.push({
          id: licenseId,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }

    logger.info(
      {
        successful: successful.length,
        failed: failed.length,
        name: 'licenses.bulk-delete',
      },
      'Bulk delete completed',
    );

    revalidatePath(`/home/${data.accountSlug}/licenses`);

    return {
      success: true,
      data: {
        successful,
        failed,
      },
    };
  },
  {
    schema: z.object({
      accountSlug: z.string().min(1),
      licenseIds: z
        .array(z.string().uuid())
        .min(1, 'At least one license must be selected'),
    }),
  },
);

/**
 * Bulk renews multiple licenses by updating their expiration dates.
 *
 * @param data - Bulk renew data with license IDs and new expiration date
 * @returns Results with successful and failed renewals
 */
export const bulkRenewLicenses = enhanceAction(
  async (data) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info(
      {
        licenseCount: data.licenseIds.length,
        newExpirationDate: data.newExpirationDate,
        name: 'licenses.bulk-renew',
      },
      'Bulk renewing licenses...',
    );

    // Get account from slug
    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, slug')
      .eq('slug', data.accountSlug)
      .single();

    if (accountError || !account) {
      logger.error(
        { error: accountError, name: 'licenses.bulk-renew' },
        'Failed to find account',
      );

      return {
        success: false,
        message: 'Account not found',
      };
    }

    // Get the current user for audit tracking
    const {
      data: { user: currentUser },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !currentUser) {
      logger.error(
        {
          error: userError,
          name: 'licenses.bulk-renew',
        },
        'Failed to get current user',
      );

      return {
        success: false,
        message: 'Authentication required',
      };
    }

    const successful: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    // Process each license renewal
    for (const licenseId of data.licenseIds) {
      try {
        // Verify license belongs to this account
        const { data: license, error: fetchError } = await client
          .from('software_licenses')
          .select('id, account_id, purchase_date')
          .eq('id', licenseId)
          .eq('account_id', account.id)
          .single();

        if (fetchError || !license) {
          failed.push({
            id: licenseId,
            error: 'License not found or does not belong to this account',
          });
          continue;
        }

        // Validate that new expiration date is after purchase date
        const purchaseDate = new Date(license.purchase_date);
        const newExpirationDate = new Date(data.newExpirationDate);

        if (newExpirationDate <= purchaseDate) {
          failed.push({
            id: licenseId,
            error: 'New expiration date must be after purchase date',
          });
          continue;
        }

        // Update the license expiration date
        const { error: updateError } = await client
          .from('software_licenses')
          .update({
            expiration_date: data.newExpirationDate,
            updated_by: currentUser.id,
          })
          .eq('id', licenseId);

        if (updateError) {
          logger.error(
            {
              error: updateError,
              licenseId,
              name: 'licenses.bulk-renew',
            },
            'Failed to renew license',
          );
          failed.push({
            id: licenseId,
            error: updateError.message || 'Failed to renew license',
          });
        } else {
          successful.push(licenseId);
        }
      } catch (error) {
        logger.error(
          { error, licenseId, name: 'licenses.bulk-renew' },
          'Error processing license renewal',
        );
        failed.push({
          id: licenseId,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }

    logger.info(
      {
        successful: successful.length,
        failed: failed.length,
        name: 'licenses.bulk-renew',
      },
      'Bulk renew completed',
    );

    revalidatePath(`/home/${data.accountSlug}/licenses`);

    return {
      success: true,
      data: {
        successful,
        failed,
      },
    };
  },
  {
    schema: z.object({
      accountSlug: z.string().min(1),
      licenseIds: z
        .array(z.string().uuid())
        .min(1, 'At least one license must be selected'),
      newExpirationDate: z.string().date('Invalid expiration date'),
    }),
  },
);
