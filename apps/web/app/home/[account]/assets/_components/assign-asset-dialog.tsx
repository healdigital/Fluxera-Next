'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { FormFieldHelp } from '@kit/ui/inline-help';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
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
  AssignAssetInput,
  AssignAssetSchema,
} from '../_lib/schemas/asset.schema';
import { assignAsset } from '../_lib/server/assets-server-actions';

interface AssignAssetDialogProps {
  assetId: string;
  accountSlug: string;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AssignAssetDialog({
  assetId,
  accountSlug,
  children,
  onSuccess,
}: AssignAssetDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        data-test="assign-asset-dialog"
        aria-labelledby="assign-asset-title"
        aria-describedby="assign-asset-description"
      >
        <DialogHeader>
          <DialogTitle id="assign-asset-title">
            <Trans i18nKey="assets:assignAsset" defaults="Assign Asset" />
          </DialogTitle>

          <DialogDescription id="assign-asset-description">
            <Trans
              i18nKey="assets:assignAssetDescription"
              defaults="Select a team member to assign this asset to."
            />
          </DialogDescription>
        </DialogHeader>

        <TeamMembersDataProvider accountSlug={accountSlug}>
          {(members) => (
            <AssignAssetForm
              assetId={assetId}
              members={members}
              onSuccess={() => {
                setOpen(false);
                onSuccess?.();
              }}
            />
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
  children,
}: {
  accountSlug: string;
  children: (members: TeamMember[]) => React.ReactNode;
}) {
  const { data, isError, isLoading } = useTeamMembers(accountSlug);

  if (isLoading) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>
          <Trans
            i18nKey="assets:loadMembersError"
            defaults="Error Loading Members"
          />
        </AlertTitle>

        <AlertDescription>
          <Trans
            i18nKey="assets:loadMembersErrorDescription"
            defaults="Failed to load team members. Please try again."
          />
        </AlertDescription>
      </Alert>
    );
  }

  return children(data ?? []);
}

function AssignAssetForm({
  assetId,
  members,
  onSuccess,
}: {
  assetId: string;
  members: TeamMember[];
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssignAssetInput>({
    resolver: zodResolver(AssignAssetSchema),
    defaultValues: {
      asset_id: assetId,
      user_id: '',
    },
  });

  const onSubmit = (data: AssignAssetInput) => {
    startTransition(async () => {
      try {
        const result = await assignAsset(data);

        if (result.success) {
          toast.success(
            <Trans
              i18nKey="assets:assignAssetSuccess"
              defaults="Asset assigned successfully"
            />,
          );
          onSuccess();
        }
      } catch (error) {
        console.error('Error assigning asset:', error);
        toast.error(
          <Trans
            i18nKey="assets:assignAssetError"
            defaults="Failed to assign asset"
          />,
        );
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label="Assign asset to team member form"
      >
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="assets:selectMember" defaults="Team Member" />
                <FormFieldHelp
                  title="Asset Assignment"
                  content="Assigning an asset to a team member tracks who is responsible for it. The asset status will automatically change to 'assigned' and the assignment will be logged in the asset history."
                />
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger
                    data-test="assign-user-select"
                    aria-label="Select team member to assign asset"
                    aria-required="true"
                  >
                    <SelectValue
                      placeholder={
                        <Trans
                          i18nKey="assets:selectMemberPlaceholder"
                          defaults="Select a team member"
                        />
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member) => (
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
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isPending}
            data-test="confirm-assign-button"
            aria-label={isPending ? 'Assigning asset' : 'Assign asset'}
          >
            {isPending ? (
              <Trans i18nKey="assets:assigning" defaults="Assigning..." />
            ) : (
              <Trans i18nKey="assets:assignButton" defaults="Assign" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
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
