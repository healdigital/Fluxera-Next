'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
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
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { LoadingSpinner } from '@kit/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { toast } from '@kit/ui/sonner';
import { Textarea } from '@kit/ui/textarea';

import {
  type AssignLicenseToUserData,
  AssignLicenseToUserSchema,
} from '../_lib/schemas/license.schema';
import { assignLicenseToUser } from '../_lib/server/licenses-server-actions';

interface AssignLicenseToUserDialogProps {
  licenseId: string;
  licenseName: string;
  accountSlug: string;
  assignedUserIds: string[];
  children?: React.ReactNode;
}

export function AssignLicenseToUserDialog({
  licenseId,
  licenseName,
  accountSlug,
  assignedUserIds,
  children,
}: AssignLicenseToUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<AssignLicenseToUserData>({
    resolver: zodResolver(AssignLicenseToUserSchema),
    defaultValues: {
      license_id: licenseId,
      user_id: '',
      notes: '',
    },
  });

  const onSubmit = (data: AssignLicenseToUserData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await assignLicenseToUser({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to assign license');
          toast.error('Assignment Failed', {
            description: result.message || 'Failed to assign license to user',
          });
          return;
        }

        toast.success('License Assigned', {
          description: `${licenseName} has been assigned successfully`,
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
        toast.error('Assignment Failed', {
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
            data-test="assign-license-to-user-button"
            aria-label={`Assign ${licenseName} to user`}
          >
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Assign to User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        data-test="assign-license-to-user-dialog"
        aria-describedby="assign-license-to-user-description"
      >
        <DialogHeader>
          <DialogTitle>Assign License to User</DialogTitle>
          <DialogDescription id="assign-license-to-user-description">
            Select a team member to assign {licenseName} to.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Assignment Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TeamMembersDataProvider
          accountSlug={accountSlug}
          assignedUserIds={assignedUserIds}
        >
          {(members) => (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                data-test="assign-license-to-user-form"
              >
                {/* User Selection */}
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Member</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={pending}
                      >
                        <FormControl>
                          <SelectTrigger
                            data-test="assign-user-select"
                            aria-label="Select team member"
                            aria-required="true"
                          >
                            <SelectValue placeholder="Select a team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.length === 0 ? (
                            <div className="text-muted-foreground p-2 text-center text-sm">
                              No available team members
                            </div>
                          ) : (
                            members.map((member) => (
                              <SelectItem
                                key={member.id}
                                value={member.id}
                                data-test={`member-option-${member.id}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={member.picture_url ?? undefined}
                                      alt={member.name}
                                    />
                                    <AvatarFallback>
                                      {member.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {member.name}
                                    </span>
                                    {member.email && (
                                      <span className="text-muted-foreground text-xs">
                                        {member.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the team member to assign this license to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add any notes about this assignment..."
                          disabled={pending}
                          rows={3}
                          maxLength={1000}
                          data-test="assignment-notes-input"
                          aria-label="Assignment notes"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes about this license assignment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={pending}
                    data-test="cancel-assign-button"
                    aria-label="Cancel assignment"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={pending || !form.watch('user_id')}
                    data-test="confirm-assign-button"
                    aria-label={
                      pending ? 'Assigning license' : 'Assign license'
                    }
                  >
                    {pending && <LoadingSpinner size="sm" className="mr-2" />}
                    {pending ? 'Assigning...' : 'Assign License'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </TeamMembersDataProvider>
      </DialogContent>
    </Dialog>
  );
}

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  picture_url: string | null;
}

function TeamMembersDataProvider({
  accountSlug,
  assignedUserIds,
  children,
}: {
  accountSlug: string;
  assignedUserIds: string[];
  children: (members: TeamMember[]) => React.ReactNode;
}) {
  const { data, isError, isLoading } = useTeamMembers(accountSlug);

  if (isLoading) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Members</AlertTitle>
        <AlertDescription>
          Failed to load team members. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter out users who are already assigned to this license
  const availableMembers = (data ?? []).filter(
    (member) => !assignedUserIds.includes(member.id),
  );

  return children(availableMembers);
}

function useTeamMembers(accountSlug: string) {
  const supabase = useSupabase();
  const queryKey = ['team-members', accountSlug];

  const queryFn = async () => {
    const { data, error } = await supabase.rpc('get_account_members', {
      account_slug: accountSlug,
    });

    if (error) {
      throw error;
    }

    return (data ?? []).map((member) => ({
      id: member.user_id,
      name: member.name,
      email: member.email,
      picture_url: member.picture_url,
    }));
  };

  return useQuery({
    queryKey,
    queryFn,
  });
}
