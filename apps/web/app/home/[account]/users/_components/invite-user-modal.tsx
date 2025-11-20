'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import {
  type InviteUserData,
  InviteUserSchema,
} from '../_lib/schemas/user.schema';
import { inviteUser } from '../_lib/server/users-server-actions';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountSlug: string;
  availableRoles: Array<{ name: string; hierarchy_level: number }>;
  onSuccess?: () => void;
}

export function InviteUserModal({
  open,
  onOpenChange,
  accountSlug,
  availableRoles,
  onSuccess,
}: InviteUserModalProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('users');

  const form = useForm<InviteUserData>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: {
      email: '',
      role: 'member',
      send_invitation: true,
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

  const onSubmit = (data: InviteUserData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await inviteUser({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError('Failed to invite user');
          toast.error(t('inviteUserError'), {
            description: 'Failed to invite user',
          });
          return;
        }

        toast.success(t('inviteUserSuccess'), {
          description: t('inviteUserSuccessDescription'),
        });

        // Reset form and close modal
        form.reset();
        setError(null);
        onOpenChange(false);
        
        // Call success callback to refresh the list
        onSuccess?.();
      } catch (err) {
        // Handle redirect errors from Next.js
        if (isRedirectError(err)) {
          throw err;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast.error(t('inviteUserError'), {
          description: errorMessage,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl"
        aria-describedby="invite-user-description"
      >
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="users:inviteUser" />
          </DialogTitle>
          <DialogDescription id="invite-user-description">
            <Trans i18nKey="users:inviteUserDescription" />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>
                <Trans i18nKey="users:inviteUserError" />
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              data-test="invite-user-form"
              aria-label="Invite new user form"
            >
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="users:email" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        disabled={pending}
                        data-test="user-email-input"
                        aria-required="true"
                        aria-invalid={!!form.formState.errors.email}
                        aria-describedby={
                          form.formState.errors.email
                            ? 'email-error'
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      <Trans i18nKey="users:emailDescription" />
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="users:role" />
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={pending}
                      >
                        <SelectTrigger
                          data-test="user-role-select"
                          aria-label="Select user role"
                          aria-required="true"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem
                              key={role.name}
                              value={role.name}
                              data-test={`role-option-${role.name}`}
                            >
                              <Trans i18nKey={`users:roles.${role.name}`} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      <Trans i18nKey="users:roleDescription" />
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="send_invitation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={pending}
                        data-test="send-invitation-checkbox"
                        aria-label="Send invitation email"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        <Trans i18nKey="users:sendInvitation" />
                      </FormLabel>
                      <FormDescription>
                        <Trans i18nKey="users:sendInvitationDescription" />
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={pending}
                  data-test="cancel-invite-user-button"
                  aria-label="Cancel user invitation"
                >
                  <Trans i18nKey="common:cancel" />
                </Button>
                <Button
                  type="submit"
                  disabled={pending}
                  data-test="submit-invite-user-button"
                  aria-label={pending ? 'Inviting user' : 'Invite user'}
                >
                  {pending && <LoadingSpinner size="sm" className="mr-2" />}
                  {pending ? (
                    <Trans i18nKey="users:invitingUser" />
                  ) : (
                    <Trans i18nKey="users:inviteUser" />
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
