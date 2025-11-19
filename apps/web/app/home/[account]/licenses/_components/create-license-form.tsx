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
  type CreateLicenseData,
  CreateLicenseSchema,
  LicenseTypeSchema,
} from '../_lib/schemas/license.schema';
import { createLicense } from '../_lib/server/licenses-server-actions';

interface CreateLicenseFormProps {
  accountSlug: string;
}

export function CreateLicenseForm({ accountSlug }: CreateLicenseFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation('licenses');

  const form = useForm<CreateLicenseData>({
    resolver: zodResolver(CreateLicenseSchema),
    defaultValues: {
      name: '',
      vendor: '',
      license_key: '',
      license_type: 'subscription',
      purchase_date: '',
      expiration_date: '',
      cost: undefined,
      notes: '',
    },
  });

  const onSubmit = (data: CreateLicenseData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await createLicense({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to create license');
          return;
        }

        // Redirect to license detail page
        router.push(`/home/${accountSlug}/licenses/${result.data?.id || ''}`);
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
            <Trans i18nKey="licenses:createLicenseError" />
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          data-test="create-license-form"
          aria-label="Create new license form"
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
                      field.onChange(value === '' ? undefined : Number(value));
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
              onClick={() => router.push(`/home/${accountSlug}/licenses`)}
              disabled={pending}
              data-test="cancel-create-license-button"
              aria-label="Cancel license creation"
            >
              <Trans i18nKey="common:cancel" />
            </Button>
            <Button
              type="submit"
              disabled={pending}
              data-test="submit-create-license-button"
              aria-label={pending ? 'Creating license' : 'Create license'}
            >
              {pending && <LoadingSpinner size="sm" className="mr-2" />}
              {pending ? (
                <Trans i18nKey="licenses:creatingLicense" />
              ) : (
                <Trans i18nKey="licenses:createLicense" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
