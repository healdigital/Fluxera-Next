'use client';

import * as React from 'react';
import { useRef, useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { FormFieldHelp } from '@kit/ui/inline-help';
import { Input } from '@kit/ui/input';
import { LoadingSpinner } from '@kit/ui/loading-spinner';
import { FormSheet } from '@kit/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';
import { toast } from '@kit/ui/sonner';

import {
  AssetCategorySchema,
  AssetStatusSchema,
  type UpdateAssetInput,
  UpdateAssetSchema,
} from '../_lib/schemas/asset.schema';
import { type AssetWithUser } from '../_lib/server/assets-page.loader';
import { updateAsset } from '../_lib/server/assets-server-actions';

interface EditAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetWithUser;
  onSuccess?: () => void;
}

/**
 * EditAssetSheet - Edit asset form in a FormSheet
 *
 * Features:
 * - Pre-filled form with current asset data
 * - Real-time validation
 * - Unsaved changes warning
 * - Optimistic UI update on success
 */
export function EditAssetSheet({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: EditAssetSheetProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    asset.image_url,
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useTranslation('assets');

  const form = useForm<UpdateAssetInput>({
    resolver: zodResolver(UpdateAssetSchema),
    defaultValues: {
      id: asset.id,
      accountSlug: '', // Not needed for update
      name: asset.name,
      category: asset.category,
      status: asset.status,
      description: asset.description || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      warranty_expiry_date: asset.warranty_expiry_date || '',
      image_url: asset.image_url || '',
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    try {
      setIsOptimizing(true);
      setError(null);

      // Create form data for optimization
      const formData = new FormData();
      formData.append('image', file);
      formData.append('width', '1920');
      formData.append('height', '1080');
      formData.append('quality', '80');
      formData.append('format', 'webp');

      // Optimize image
      const response = await fetch('/api/images/optimize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to optimize image');
      }

      const optimizedBlob = await response.blob();

      // Create preview URL
      const previewUrl = URL.createObjectURL(optimizedBlob);
      setImagePreview(previewUrl);

      // For now, we'll store the preview URL
      // In a real implementation, you would upload to Supabase Storage
      form.setValue('image_url', previewUrl, { shouldDirty: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview !== asset.image_url) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    form.setValue('image_url', '', { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: UpdateAssetInput) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await updateAsset(data);

        if (result.success) {
          // Clean up image preview if it's a new one
          if (imagePreview && imagePreview !== asset.image_url) {
            URL.revokeObjectURL(imagePreview);
          }

          toast.success('Asset updated', {
            description: 'The asset has been successfully updated.',
          });

          // Close the sheet
          onOpenChange(false);

          // Call success callback
          if (onSuccess) {
            onSuccess();
          }

          // Refresh the page
          router.refresh();
        }
      } catch (err) {
        // Handle redirect errors from Next.js
        if (isRedirectError(err)) {
          throw err;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';

        setError(errorMessage);

        toast.error('Error', {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Asset"
      description={`Update information for ${asset.name}`}
      side="right"
      size="xl"
      dirty={form.formState.isDirty}
      showFooter={false}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>
              <Trans i18nKey="assets:updateAssetError" defaults="Error" />
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-test="edit-asset-form"
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:assetName" />
                    <FormFieldHelp
                      title="Asset Name"
                      content="Enter a descriptive name for the asset. Use a consistent naming convention like 'Device Type - Model - Identifier' for easy identification."
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('assetNamePlaceholder')}
                      disabled={pending}
                      data-test="asset-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>
                <Trans i18nKey="assets:assetImage" defaults="Asset Image" />
                <FormFieldHelp
                  title="Asset Image"
                  content="Upload a clear photo of the asset for easy identification. Supported formats: JPG, PNG, WebP. Maximum size: 10MB. Images are automatically optimized and resized."
                />
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Asset preview"
                        className="h-48 w-auto rounded-lg border object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={handleRemoveImage}
                        disabled={pending || isOptimizing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={pending || isOptimizing}
                        className="hidden"
                        id="asset-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={pending || isOptimizing}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isOptimizing ? (
                          <Trans
                            i18nKey="assets:optimizingImage"
                            defaults="Optimizing..."
                          />
                        ) : (
                          <Trans
                            i18nKey="assets:uploadImage"
                            defaults="Upload Image"
                          />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                <Trans
                  i18nKey="assets:imageUploadDescription"
                  defaults="Upload an image of the asset. Images will be automatically optimized for web."
                />
              </FormDescription>
            </FormItem>

            <FormField
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:category" />
                    <FormFieldHelp
                      title="Asset Category"
                      content="Select the category that best describes this asset. This helps with organization, reporting, and applying category-specific policies."
                    />
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={pending}
                    >
                      <SelectTrigger data-test="asset-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AssetCategorySchema.options.map((category) => (
                          <SelectItem key={category} value={category}>
                            <Trans i18nKey={`assets:categories.${category}`} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:status" />
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={pending}
                    >
                      <SelectTrigger data-test="asset-status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AssetStatusSchema.options.map((status) => (
                          <SelectItem key={status} value={status}>
                            <Trans i18nKey={`assets:statuses.${status}`} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="assets:statusDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:description" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('descriptionPlaceholder')}
                      className="min-h-24"
                      maxLength={5000}
                      disabled={pending}
                      data-test="asset-description-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="serial_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:serialNumber" />
                    <FormFieldHelp
                      title="Serial Number"
                      content="The serial number can be found on the device label, usually on the bottom or back. It's typically a unique alphanumeric code used for warranty and support."
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('serialNumberPlaceholder')}
                      maxLength={255}
                      disabled={pending}
                      data-test="asset-serial-number-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:purchaseDate" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" disabled={pending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="warranty_expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="assets:warrantyExpiryDate" />
                    <FormFieldHelp
                      title="Warranty Expiry"
                      content="Enter the date when the manufacturer's warranty expires. The system will alert you before expiration so you can plan for extended coverage or replacement."
                    />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" disabled={pending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
                data-test="cancel-edit-asset-button"
              >
                <Trans i18nKey="common:cancel" />
              </Button>
              <Button
                type="submit"
                disabled={pending}
                data-test="submit-edit-asset-button"
              >
                {pending && <LoadingSpinner size="sm" className="mr-2" />}
                {pending ? (
                  <Trans i18nKey="assets:updatingAsset" defaults="Updating..." />
                ) : (
                  <Trans i18nKey="assets:updateAsset" defaults="Update Asset" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </FormSheet>
  );
}
