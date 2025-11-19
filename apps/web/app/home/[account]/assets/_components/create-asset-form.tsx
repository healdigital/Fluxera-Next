'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  AssetCategorySchema,
  AssetStatusSchema,
  type CreateAssetInput,
  CreateAssetSchema,
} from '../_lib/schemas/asset.schema';
import { createAsset } from '../_lib/server/assets-server-actions';

interface CreateAssetFormProps {
  accountSlug: string;
}

export function CreateAssetForm({ accountSlug }: CreateAssetFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useTranslation('assets');

  const form = useForm<CreateAssetInput>({
    resolver: zodResolver(CreateAssetSchema),
    defaultValues: {
      accountSlug,
      name: '',
      category: 'laptop',
      status: 'available',
      description: '',
      serial_number: '',
      purchase_date: '',
      warranty_expiry_date: '',
      image_url: '',
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
      form.setValue('image_url', previewUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    form.setValue('image_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: CreateAssetInput) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await createAsset(data);

        if (result.success) {
          // Clean up image preview
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
          }

          // Redirect to assets list
          router.push(`/home/${accountSlug}/assets`);
        }
      } catch (err) {
        // Handle redirect errors from Next.js
        if (isRedirectError(err)) {
          throw err;
        }

        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>
            <Trans i18nKey="assets:createAssetError" />
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          data-test="create-asset-form"
          aria-label="Create new asset form"
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
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={
                      form.formState.errors.name
                        ? 'name-error'
                        : 'name-description'
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>
              <Trans i18nKey="assets:assetImage" defaults="Asset Image" />
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
                      aria-label="Remove image"
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
                      aria-label="Upload asset image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={pending || isOptimizing}
                      data-test="upload-image-button"
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
                    <SelectTrigger
                      data-test="asset-category-select"
                      aria-label="Select asset category"
                      aria-required="true"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AssetCategorySchema.options.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          data-test={`category-option-${category}`}
                        >
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
                    <SelectTrigger
                      data-test="asset-status-select"
                      aria-label="Select asset status"
                      aria-required="true"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AssetStatusSchema.options.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          data-test={`status-option-${status}`}
                        >
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
                    aria-label="Asset description"
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
                    aria-label="Serial number"
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
                  <Input
                    {...field}
                    type="date"
                    disabled={pending}
                    aria-label="Purchase date"
                  />
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
                  <Input
                    {...field}
                    type="date"
                    disabled={pending}
                    aria-label="Warranty expiry date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/home/${accountSlug}/assets`)}
              disabled={pending}
              data-test="cancel-create-asset-button"
              aria-label="Cancel asset creation"
            >
              <Trans i18nKey="common:cancel" />
            </Button>
            <Button
              type="submit"
              disabled={pending}
              data-test="submit-create-asset-button"
              aria-label={pending ? 'Creating asset' : 'Create asset'}
            >
              {pending && <LoadingSpinner size="sm" className="mr-2" />}
              {pending ? (
                <Trans i18nKey="assets:creatingAsset" />
              ) : (
                <Trans i18nKey="assets:createAsset" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
