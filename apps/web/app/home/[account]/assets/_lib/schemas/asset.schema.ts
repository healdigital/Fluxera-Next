import { z } from 'zod';

export const AssetCategorySchema = z.enum([
  'laptop',
  'desktop',
  'mobile_phone',
  'tablet',
  'monitor',
  'printer',
  'other_equipment',
]);

export const AssetStatusSchema = z.enum([
  'available',
  'assigned',
  'in_maintenance',
  'retired',
  'lost',
]);

export const CreateAssetSchema = z.object({
  accountSlug: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(255),
  category: AssetCategorySchema,
  status: AssetStatusSchema,
  description: z.string().max(5000).optional(),
  serial_number: z.string().max(255).optional(),
  purchase_date: z.string().date().optional(),
  warranty_expiry_date: z.string().date().optional(),
  image_url: z.string().url().optional(),
});

export const UpdateAssetSchema = CreateAssetSchema.extend({
  id: z.string().uuid(),
});

export const AssignAssetSchema = z.object({
  asset_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export const UnassignAssetSchema = z.object({
  asset_id: z.string().uuid(),
});

export const DeleteAssetSchema = z.object({
  id: z.string().uuid(),
});

export type AssetCategory = z.infer<typeof AssetCategorySchema>;
export type AssetStatus = z.infer<typeof AssetStatusSchema>;
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;
export type AssignAssetInput = z.infer<typeof AssignAssetSchema>;
export type UnassignAssetInput = z.infer<typeof UnassignAssetSchema>;
export type DeleteAssetInput = z.infer<typeof DeleteAssetSchema>;
