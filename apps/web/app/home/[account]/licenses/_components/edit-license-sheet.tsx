'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from '@kit/ui/sonner';

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

import {
  LicenseTypeSchema,
  type UpdateLicenseData,
  UpdateLicenseSchema,
} from '../_lib/schemas/license.schema';
import { updateLicense } from '../_lib/server/licenses-server-actions';

interface EditLicenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountSlug: string;
  license: {
    id: string;
    name: string;
    vendor: string;
    license_key: string;
    license_type: string;
    purchase_date: string;
    expiration_date: string;
    cost: number | null;
    notes: string | null;
  };
  onSuccess?: () => void;
}

/**
 * EditLicenseSheet - Slide-in sheet for editing existing licenses
 *
 * Features:
 * - Pre-filled form with current license data
 * - Form validation with real-time feedback
 * - Date validation (expiration after purchase)
 * - Unsaved changes warning
 * - Success notification and list update
 */
export function EditLicenseSheet({
  open,
  onOpenChange,
  accountSlug,
  license,
  onSuccess,
}: EditLicenseSheetProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation('licenses');

  const form = useForm<UpdateLicenseData>({
    resolver: zodResolver(UpdateLicenseSchema),
    defaultValues: {
      id: license.id,
      name: license.name,
      vendor: license.vendor,
      license_key: license.license_key,
      license_type: license.license_type as UpdateLicenseData['license_type'],
      purchase_date: license.purchase_date,
      expiration_date: license.expiration_date,
      cost: license.cost ?? undefined,
      notes: license.notes ?? '',
    },
  });

  const onSubmit = (data: UpdateLicenseData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await updateLicense({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to update license');
          return;
        }

        // Success - close sheet and show notification
        toast.success('License updated successfully');
        onOpenChange(false);

        // Call success callback to refresh list
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback: refresh the page
          router.refresh();
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

  const handleOpenChange = (newOpen: boolean) => {
    // If closing and form is dirty, the FormSheet will handle the warning
    if (!newOpen && !pending) {
      onOpenChange(newOpen);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit License"
      description="Update license information"
      side="right"
      size="lg"
      dirty={form.formState.isDirty}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>
              <Trans i18nKey="licenses:updateLicenseError" />
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-test="edit-license-form"
            aria-label="Edit license form"
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="licenses:licenseName" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('licenseNamePlaceholder')}
                      disabled={pending}
                      data-test="license-name-input"
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.name}
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="licenses:licenseNameDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="licenses:vendor" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('vendorPlaceholder')}
                      disabled={pending}
                      data-test="license-vendor-input"
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.vendor}
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="licenses:vendorDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="license_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="licenses:licenseKey" />
                    <FormFieldHelp
                      title="License Key Security"
                      content="License keys are encrypted and stored securely. Only authorized users can view them. All access is logged for audit purposes."
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('licenseKeyPlaceholder')}
                      disabled={pending}
                      data-test="license-key-input"
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.license_key}
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="licenses:licenseKeyDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="license_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="licenses:licenseType" />
                    <FormFieldHelp
                      title="License Type"
                      content="Perpetual licenses are one-time purchases with indefinite usage. Subscription licenses require recurring payments and expire if not renewed. Choose the type that matches your agreement."
                    />
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={pending}
                    >
                      <SelectTrigger
                        data-test="license-type-select"
                        aria-label="Select license type"
                        aria-required="true"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LicenseTypeSchema.options.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            data-test={`license-type-option-${type}`}
                          >
                            <Trans i18nKey={`licenses:licenseTypes.${type}`} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="licenses:licenseTypeDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="licenses:purchaseDate" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        disabled={pending}
                        data-test="license-purchase-date-input"
                        aria-required="true"
                        aria-label="Purchase date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="licenses:expirationDate" />
                      <FormFieldHelp
                        title="Expiration Date"
                        content="The date when this license expires. You'll receive alerts 30 and 7 days before expiration to ensure timely renewal and avoid service interruption."
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        disabled={pending}
                        data-test="license-expiration-date-input"
                        aria-required="true"
                        aria-label="Expiration date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="licenses:cost" />
                    <FormFieldHelp
                      title="License Cost"
                      content="Enter the total cost of the license. For subscriptions, enter the annual or recurring cost. This helps track software spending and budget planning."
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t('costPlaceholder')}
                      disabled={pending}
                      data-test="license-cost-input"
                      aria-label="License cost"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? undefined : Number(value),
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="licenses:costDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="licenses:notes" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('notesPlaceholder')}
                      className="min-h-24"
                      maxLength={5000}
                      disabled={pending}
                      data-test="license-notes-input"
                      aria-label="License notes"
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="licenses:notesDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
                data-test="cancel-edit-license-button"
                aria-label="Cancel license editing"
              >
                <Trans i18nKey="common:cancel" />
              </Button>
              <Button
                type="submit"
                disabled={pending}
                data-test="submit-edit-license-button"
                aria-label={pending ? 'Updating license' : 'Update license'}
              >
                {pending && <LoadingSpinner size="sm" className="mr-2" />}
                {pending ? (
                  <Trans i18nKey="licenses:updatingLicense" />
                ) : (
                  <Trans i18nKey="licenses:updateLicense" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </FormSheet>
  );
}
