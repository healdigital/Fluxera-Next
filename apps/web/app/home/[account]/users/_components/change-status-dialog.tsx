'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, AlertTriangle, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { toast } from '@kit/ui/sonner';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  type UpdateUserStatusData,
  UpdateUserStatusSchema,
  type UserStatus,
} from '../_lib/schemas/user.schema';
import { updateUserStatus } from '../_lib/server/users-server-actions';

interface ChangeStatusDialogProps {
  userId: string;
  accountId: string;
  accountSlug: string;
  currentStatus: UserStatus;
  userName: string;
  children?: React.ReactNode;
}

const statusOptions: Array<{
  value: UserStatus;
  label: string;
  description: string;
}> = [
  {
    value: 'active',
    label: 'Active',
    description: 'User can access the account and all assigned resources',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'User cannot access the account or any resources',
  },
  {
    value: 'suspended',
    label: 'Suspended',
    description: 'Temporarily restricted access pending review',
  },
  {
    value: 'pending_invitation',
    label: 'Pending Invitation',
    description: 'User has been invited but has not yet accepted',
  },
];

export function ChangeStatusDialog({
  userId,
  accountId,
  accountSlug,
  currentStatus,
  userName,
  children,
}: ChangeStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation('users');

  const form = useForm<UpdateUserStatusData>({
    resolver: zodResolver(UpdateUserStatusSchema),
    defaultValues: {
      user_id: userId,
      account_id: accountId,
      status: currentStatus,
      reason: '',
    },
  });

  const selectedStatus = form.watch('status');
  const hasStatusChanged = selectedStatus !== currentStatus;
  const isDeactivating =
    selectedStatus === 'inactive' || selectedStatus === 'suspended';

  const onSubmit = (data: UpdateUserStatusData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await updateUserStatus({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError('Failed to update user status');
          toast.error(t('changeStatusError'), {
            description: 'Failed to update user status',
          });
          return;
        }

        toast.success(t('changeStatusSuccess'), {
          description: t('changeStatusSuccessDescription', { userName }),
        });

        // Close dialog and refresh
        setOpen(false);
        form.reset();
        router.refresh();
      } catch (err) {
        // Handle redirect errors from Next.js
        if (isRedirectError(err)) {
          throw err;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast.error(t('changeStatusError'), {
          description: errorMessage,
        });
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!pending) {
      setOpen(newOpen);
      if (!newOpen) {
        form.reset();
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            data-test="change-status-button"
            aria-label={`Change status for ${userName}`}
          >
            <User className="mr-2 h-4 w-4" />
            <Trans i18nKey="users:changeStatus" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        data-test="change-status-dialog"
        aria-describedby="change-status-description"
      >
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="users:changeUserStatus" />
          </DialogTitle>
          <DialogDescription id="change-status-description">
            <Trans
              i18nKey="users:changeStatusDescription"
              values={{ userName }}
            />
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              <Trans i18nKey="users:changeStatusError" />
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-test="change-status-form"
          >
            {/* Current Status Display */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground font-medium">
                  <Trans i18nKey="users:currentStatus" />:
                </span>
                <span className="font-semibold capitalize">
                  {statusOptions.find((s) => s.value === currentStatus)?.label}
                </span>
              </div>
            </div>

            {/* New Status Selection */}
            <FormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="users:newStatus" />
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={pending}
                    >
                      <SelectTrigger
                        data-test="new-status-select"
                        aria-label="Select new status"
                        aria-required="true"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                            data-test={`status-option-${status.value}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {status.label}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {status.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="users:newStatusDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason Field */}
            <FormField
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="users:statusChangeReason" />
                    {isDeactivating && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('users:statusChangeReasonPlaceholder')}
                      disabled={pending}
                      rows={3}
                      data-test="status-change-reason"
                      aria-label="Reason for status change"
                      aria-required={isDeactivating}
                    />
                  </FormControl>
                  <FormDescription>
                    {isDeactivating ? (
                      <Trans i18nKey="users:statusChangeReasonRequired" />
                    ) : (
                      <Trans i18nKey="users:statusChangeReasonOptional" />
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deactivation Warning */}
            {hasStatusChanged && isDeactivating && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  <Trans i18nKey="users:confirmDeactivation" />
                </AlertTitle>
                <AlertDescription>
                  <Trans
                    i18nKey="users:confirmDeactivationDescription"
                    values={{
                      userName,
                      newStatus:
                        statusOptions.find((s) => s.value === selectedStatus)
                          ?.label || selectedStatus,
                    }}
                  />
                </AlertDescription>
              </Alert>
            )}

            {/* Status Change Confirmation */}
            {hasStatusChanged && !isDeactivating && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  <Trans i18nKey="users:confirmStatusChange" />
                </AlertTitle>
                <AlertDescription>
                  <Trans
                    i18nKey="users:confirmStatusChangeDescription"
                    values={{
                      userName,
                      oldStatus:
                        statusOptions.find((s) => s.value === currentStatus)
                          ?.label || currentStatus,
                      newStatus:
                        statusOptions.find((s) => s.value === selectedStatus)
                          ?.label || selectedStatus,
                    }}
                  />
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
                data-test="cancel-change-status-button"
                aria-label="Cancel status change"
              >
                <Trans i18nKey="common:cancel" />
              </Button>
              <Button
                type="submit"
                disabled={pending || !hasStatusChanged}
                variant={isDeactivating ? 'destructive' : 'default'}
                data-test="confirm-change-status-button"
                aria-label={
                  pending ? 'Updating status' : 'Confirm status change'
                }
              >
                {pending ? (
                  <Trans i18nKey="users:updatingStatus" />
                ) : (
                  <Trans i18nKey="users:confirmChange" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
