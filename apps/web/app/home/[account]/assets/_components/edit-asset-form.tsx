'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
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
  type UpdateAssetInput,
  UpdateAssetSchema,
} from '../_lib/schemas/asset.schema';
import type { AssetDetailWithUser } from '../_lib/server/asset-detail.loader';
import { updateAsset } from '../_lib/server/assets-server-actions';

interface EditAssetFormProps {
  asset: AssetDetailWithUser;
  accountSlug: string;
}

export function EditAssetForm({ asset, accountSlug }: EditAssetFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation('assets');

  const form = useForm<UpdateAssetInput>({
    resolver: zodResolver(UpdateAssetSchema),
    defaultValues: {
      id: asset.id,
      accountSlug,
      name: asset.name,
      category: asset.category,
      status: asset.status,
      description: asset.description || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      warranty_expiry_date: asset.warranty_expiry_date || '',
    },
  });

  const onSubmit = (data: UpdateAssetInput) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await updateAsset(data);

        if (result.success) {
          // Redirect to asset detail page
          router.push(`/home/${accountSlug}/assets/${asset.id}`);
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
            <Trans i18nKey="assets:updateAssetError" />
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          data-test="edit-asset-form"
          aria-label="Edit asset form"
        >
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="assets:assetName" />
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

          <FormField
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="assets:category" />
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
              onClick={() =>
                router.push(`/home/${accountSlug}/assets/${asset.id}`)
              }
              disabled={pending}
              data-test="cancel-edit-asset-button"
              aria-label="Cancel asset editing"
            >
              <Trans i18nKey="common:cancel" />
            </Button>
            <Button
              type="submit"
              disabled={pending}
              data-test="submit-edit-asset-button"
              aria-label={pending ? 'Updating asset' : 'Update asset'}
            >
              {pending && <LoadingSpinner size="sm" className="mr-2" />}
              {pending ? (
                <Trans i18nKey="assets:updatingAsset" />
              ) : (
                <Trans i18nKey="assets:updateAsset" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
