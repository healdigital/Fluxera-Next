import { z } from 'zod';

/**
 * License type enum schema
 * Represents the different types of software licenses
 */
export const LicenseTypeSchema = z.enum([
  'perpetual',
  'subscription',
  'volume',
  'oem',
  'trial',
  'educational',
  'enterprise',
]);

export type LicenseType = z.infer<typeof LicenseTypeSchema>;

/**
 * Base schema for license data without validation refinements
 * Used as foundation for create and update schemas
 */
const BaseLicenseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  vendor: z.string().min(1, 'Vendor is required').max(255),
  license_key: z.string().min(1, 'License key is required'),
  license_type: LicenseTypeSchema,
  purchase_date: z.string().date('Invalid purchase date'),
  expiration_date: z.string().date('Invalid expiration date'),
  cost: z.number().positive('Cost must be a positive number').optional(),
  notes: z
    .string()
    .max(5000, 'Notes must be 5000 characters or less')
    .optional(),
});

/**
 * Schema for creating a new software license
 * Includes validation for required fields and date logic
 */
export const CreateLicenseSchema = BaseLicenseSchema.refine(
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

export type CreateLicenseData = z.infer<typeof CreateLicenseSchema>;

/**
 * Schema for updating an existing software license
 * Extends base schema with license ID and includes date validation
 */
export const UpdateLicenseSchema = BaseLicenseSchema.extend({
  id: z.string().uuid('Invalid license ID'),
}).refine(
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

export type UpdateLicenseData = z.infer<typeof UpdateLicenseSchema>;

/**
 * Schema for assigning a license to a user
 * Requires license ID, user ID, and optional notes
 */
export const AssignLicenseToUserSchema = z.object({
  license_id: z.string().uuid('Invalid license ID'),
  user_id: z.string().uuid('Invalid user ID'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

export type AssignLicenseToUserData = z.infer<typeof AssignLicenseToUserSchema>;

/**
 * Schema for assigning a license to an asset
 * Requires license ID, asset ID, and optional notes
 */
export const AssignLicenseToAssetSchema = z.object({
  license_id: z.string().uuid('Invalid license ID'),
  asset_id: z.string().uuid('Invalid asset ID'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

export type AssignLicenseToAssetData = z.infer<
  typeof AssignLicenseToAssetSchema
>;

/**
 * Schema for unassigning a license from a user or asset
 * Requires the assignment ID to be removed
 */
export const UnassignLicenseSchema = z.object({
  assignment_id: z.string().uuid('Invalid assignment ID'),
});

export type UnassignLicenseData = z.infer<typeof UnassignLicenseSchema>;

/**
 * Schema for deleting a software license
 * Requires the license ID to be deleted
 */
export const DeleteLicenseSchema = z.object({
  id: z.string().uuid('Invalid license ID'),
});

export type DeleteLicenseData = z.infer<typeof DeleteLicenseSchema>;
