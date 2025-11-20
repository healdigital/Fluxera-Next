'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
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
import { Separator } from '@kit/ui/separator';
import { toast } from '@kit/ui/sonner';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  type UpdateUserProfileData,
  UpdateUserProfileSchema,
  type UserStatus,
} from '../_lib/schemas/user.schema';
import type { UserProfile } from '../_lib/server/user-detail.loader';
import { updateUserProfile } from '../_lib/server/users-server-actions';
import { AssignRoleDialog } from './assign-role-dialog';
import { ChangeStatusDialog } from './change-status-dialog';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  profile: UserProfile | null;
  accountSlug: string;
  accountId: string;
  currentRole: string;
  currentStatus: UserStatus;
  userName: string;
  availableRoles: Array<{ name: string; hierarchy_level: number }>;
  onSuccess?: () => void;
}

export function EditUserModal({
  open,
  onOpenChange,
  userId,
  profile,
  accountSlug,
  accountId,
  currentRole,
  currentStatus,
  userName,
  availableRoles,
  onSuccess,
}: EditUserModalProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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

  const handleClose = () => {
    if (pending) return; // Prevent closing while submitting

    // Check for unsaved changes
    if (form.formState.isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }

    form.reset();
    setError(null);
    onOpenChange(false);
  };

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
          setError('Failed to update user profile');
          toast.error(t('updateProfileError'), {
            description: 'Failed to update user profile',
          });
          return;
        }

        toast.success(t('updateProfileSuccess'), {
          description: t('updateProfileSuccessDescription'),
        });

        // Reset form and close modal
        form.reset();
        setError(null);
        onOpenChange(false);

        // Call success callback to refresh the data
        onSuccess?.();
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="edit-user-description"
      >
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="users:editUserProfile" />
          </DialogTitle>
          <DialogDescription id="edit-user-description">
            <Trans
              i18nKey="users:editUserProfileDescription"
              values={{ userName }}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions for Role and Status */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <h3 className="text-sm font-medium mb-3">
              <Trans i18nKey="users:quickActions" />
            </h3>
            <div className="flex flex-wrap gap-2">
              <AssignRoleDialog
                userId={userId}
                accountId={accountId}
                accountSlug={accountSlug}
                currentRole={currentRole}
                userName={userName}
                availableRoles={availableRoles}
              />
              <ChangeStatusDialog
                userId={userId}
                accountId={accountId}
                accountSlug={accountSlug}
                currentStatus={currentStatus}
                userName={userName}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              <Trans i18nKey="users:quickActionsDescription" />
            </p>
          </div>

          <Separator />

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
                  onClick={handleClose}
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
                  {pending && <LoadingSpinner size="sm" className="mr-2" />}
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
      </DialogContent>
    </Dialog>
  );
}
