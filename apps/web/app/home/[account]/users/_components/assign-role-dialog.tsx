'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Shield } from 'lucide-react';
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
import { Trans } from '@kit/ui/trans';

import {
  type UpdateUserRoleData,
  UpdateUserRoleSchema,
} from '../_lib/schemas/user.schema';
import { updateUserRole } from '../_lib/server/users-server-actions';

interface AssignRoleDialogProps {
  userId: string;
  accountId: string;
  accountSlug: string;
  currentRole: string;
  userName: string;
  availableRoles: Array<{ name: string; hierarchy_level: number }>;
  children?: React.ReactNode;
}

export function AssignRoleDialog({
  userId,
  accountId,
  accountSlug,
  currentRole,
  userName,
  availableRoles,
  children,
}: AssignRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t: _t } = useTranslation('users');

  const form = useForm<UpdateUserRoleData>({
    resolver: zodResolver(UpdateUserRoleSchema),
    defaultValues: {
      user_id: userId,
      account_id: accountId,
      role: currentRole,
    },
  });

  const selectedRole = form.watch('role');
  const hasRoleChanged = selectedRole !== currentRole;

  const onSubmit = (data: UpdateUserRoleData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await updateUserRole({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to update user role');
          toast.error(_t('assignRoleError'), {
            description: result.message || 'Failed to update user role',
          });
          return;
        }

        toast.success(_t('assignRoleSuccess'), {
          description: _t('assignRoleSuccessDescription', { userName }),
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
        toast.error(_t('assignRoleError'), {
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
            data-test="assign-role-button"
            aria-label={`Change role for ${userName}`}
          >
            <Shield className="mr-2 h-4 w-4" />
            <Trans i18nKey="users:changeRole" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        data-test="assign-role-dialog"
        aria-describedby="assign-role-description"
      >
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="users:assignRole" />
          </DialogTitle>
          <DialogDescription id="assign-role-description">
            <Trans
              i18nKey="users:assignRoleDescription"
              values={{ userName }}
            />
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              <Trans i18nKey="users:assignRoleError" />
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-test="assign-role-form"
          >
            {/* Current Role Display */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground font-medium">
                  <Trans i18nKey="users:currentRole" />:
                </span>
                <span className="font-semibold capitalize">
                  {currentRole.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* New Role Selection */}
            <FormField
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="users:newRole" />
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={pending}
                    >
                      <SelectTrigger
                        data-test="new-role-select"
                        aria-label="Select new role"
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
                            <span className="capitalize">
                              {role.name.replace(/_/g, ' ')}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="users:newRoleDescription" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmation Warning */}
            {hasRoleChanged && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  <Trans i18nKey="users:confirmRoleChange" />
                </AlertTitle>
                <AlertDescription>
                  <Trans
                    i18nKey="users:confirmRoleChangeDescription"
                    values={{
                      userName,
                      oldRole: currentRole.replace(/_/g, ' '),
                      newRole: selectedRole.replace(/_/g, ' '),
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
                data-test="cancel-assign-role-button"
                aria-label="Cancel role change"
              >
                <Trans i18nKey="common:cancel" />
              </Button>
              <Button
                type="submit"
                disabled={pending || !hasRoleChanged}
                data-test="confirm-assign-role-button"
                aria-label={pending ? 'Updating role' : 'Confirm role change'}
              >
                {pending ? (
                  <Trans i18nKey="users:updatingRole" />
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
