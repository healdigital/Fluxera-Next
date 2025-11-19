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
import { toast } from '@kit/ui/sonner';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  type UpdateUserProfileData,
  UpdateUserProfileSchema,
} from '../_lib/schemas/user.schema';
import type { UserProfile } from '../_lib/server/user-detail.loader';
import { updateUserProfile } from '../_lib/server/users-server-actions';

interface EditUserProfileFormProps {
  userId: string;
  profile: UserProfile | null;
  accountSlug: string;
}

export function EditUserProfileForm({
  userId,
  profile,
  accountSlug,
}: EditUserProfileFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation('users');

  const form = useForm<UpdateUserProfileData>({
    resolver: zodResolver(UpdateUserProfileSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      phone_number: profile?.phone_number || '',
      job_title: profile?.job_title || '',
      department: profile?.department || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
    },
  });

  const onSubmit = (data: UpdateUserProfileData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await updateUserProfile({
          ...data,
          userId,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to update user profile');
          toast.error(t('updateProfileError'), {
            description: result.message || 'Failed to update user profile',
          });
          return;
        }

        toast.success(t('updateProfileSuccess'), {
          description: t('updateProfileSuccessDescription'),
        });

        // Redirect to user detail page
        router.push(`/home/${accountSlug}/users/${userId}`);
      } catch (err) {
        // Handle redirect errors from Next.js
        if (isRedirectError(err)) {
          throw err;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast.error(t('updateProfileError'), {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>
            <Trans i18nKey="users:updateProfileError" />
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          data-test="edit-user-profile-form"
          aria-label="Edit user profile form"
        >
          <FormField
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="users:displayName" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('displayNamePlaceholder')}
                    maxLength={255}
                    disabled={pending}
                    data-test="user-display-name-input"
                    aria-label="Display name"
                  />
                </FormControl>
                <FormDescription>
                  <Trans i18nKey="users:displayNameDescription" />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="users:phoneNumber" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder={t('phoneNumberPlaceholder')}
                    maxLength={50}
                    disabled={pending}
                    data-test="user-phone-number-input"
                    aria-label="Phone number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="job_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="users:jobTitle" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('jobTitlePlaceholder')}
                    maxLength={255}
                    disabled={pending}
                    data-test="user-job-title-input"
                    aria-label="Job title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="users:department" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('departmentPlaceholder')}
                    maxLength={255}
                    disabled={pending}
                    data-test="user-department-input"
                    aria-label="Department"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="users:location" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('locationPlaceholder')}
                    maxLength={255}
                    disabled={pending}
                    data-test="user-location-input"
                    aria-label="Location"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="users:bio" />
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t('bioPlaceholder')}
                    className="min-h-24"
                    maxLength={5000}
                    disabled={pending}
                    data-test="user-bio-input"
                    aria-label="Bio"
                  />
                </FormControl>
                <FormDescription>
                  <Trans i18nKey="users:bioDescription" />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/home/${accountSlug}/users/${userId}`)
              }
              disabled={pending}
              data-test="cancel-edit-user-profile-button"
              aria-label="Cancel profile editing"
            >
              <Trans i18nKey="common:cancel" />
            </Button>
            <Button
              type="submit"
              disabled={pending}
              data-test="submit-edit-user-profile-button"
              aria-label={pending ? 'Updating profile' : 'Update profile'}
            >
              {pending ? (
                <Trans i18nKey="users:updatingProfile" />
              ) : (
                <Trans i18nKey="users:updateProfile" />
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
