'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Package, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
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
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { LoadingSpinner } from '@kit/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Textarea } from '@kit/ui/textarea';
import { toast } from '@kit/ui/sonner';

import {
  assignLicenseToAsset,
  assignLicenseToUser,
} from '../_lib/server/licenses-server-actions';

interface AssignLicenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  licenseId: string;
  licenseName: string;
  accountSlug: string;
  assignedUserIds?: string[];
  assignedAssetIds?: string[];
  onSuccess?: () => void;
}

const AssignToUserSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  notes: z.string().max(1000).optional(),
});

const AssignToAssetSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  notes: z.string().max(1000).optional(),
});

type AssignToUserData = z.infer<typeof AssignToUserSchema>;
type AssignToAssetData = z.infer<typeof AssignToAssetSchema>;

/**
 * AssignLicenseModal - Modal for assigning licenses to users or assets
 *
 * Features:
 * - Tabbed interface for user and asset assignment
 * - Real-time search and filtering
 * - Current assignment display
 * - Reassignment warnings
 * - Success notification and list update
 */
export function AssignLicenseModal({
  open,
  onOpenChange,
  licenseId,
  licenseName,
  accountSlug,
  assignedUserIds = [],
  assignedAssetIds = [],
  onSuccess,
}: AssignLicenseModalProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'asset'>('user');
  const router = useRouter();

  const userForm = useForm<AssignToUserData>({
    resolver: zodResolver(AssignToUserSchema),
    defaultValues: {
      user_id: '',
      notes: '',
    },
  });

  const assetForm = useForm<AssignToAssetData>({
    resolver: zodResolver(AssignToAssetSchema),
    defaultValues: {
      asset_id: '',
      notes: '',
    },
  });

  const onSubmitUser = (data: AssignToUserData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await assignLicenseToUser({
          license_id: licenseId,
          user_id: data.user_id,
          notes: data.notes,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to assign license');
          toast.error('Assignment Failed', {
            description: result.message || 'Failed to assign license to user',
          });
          return;
        }

        toast.success('License assigned to user successfully');
        userForm.reset();
        onOpenChange(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } catch (err) {
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

  const onSubmitAsset = (data: AssignToAssetData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await assignLicenseToAsset({
          license_id: licenseId,
          asset_id: data.asset_id,
          notes: data.notes,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to assign license');
          toast.error('Assignment Failed', {
            description: result.message || 'Failed to assign license to asset',
          });
          return;
        }

        toast.success('License assigned to asset successfully');
        assetForm.reset();
        onOpenChange(false);

        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } catch (err) {
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
    if (!newOpen && !pending) {
      onOpenChange(newOpen);
      userForm.reset();
      assetForm.reset();
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign License</DialogTitle>
          <DialogDescription>
            Assign {licenseName} to a user or asset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Assignment Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" data-test="assign-to-user-tab">
              <UserPlus className="mr-2 h-4 w-4" />
              Assign to User
            </TabsTrigger>
            <TabsTrigger value="asset" data-test="assign-to-asset-tab">
              <Package className="mr-2 h-4 w-4" />
              Assign to Asset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4">
            <TeamMembersDataProvider
              accountSlug={accountSlug}
              assignedUserIds={assignedUserIds}
            >
              {(members) => (
                <Form {...userForm}>
                  <form
                    onSubmit={userForm.handleSubmit(onSubmitUser)}
                    className="space-y-4"
                    data-test="assign-license-to-user-form"
                  >
                    <FormField
                      control={userForm.control}
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

                    <FormField
                      control={userForm.control}
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

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={pending}
                        data-test="cancel-assign-button"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={pending || !userForm.watch('user_id')}
                        data-test="confirm-assign-user-button"
                      >
                        {pending && (
                          <LoadingSpinner size="sm" className="mr-2" />
                        )}
                        {pending ? 'Assigning...' : 'Assign License'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </TeamMembersDataProvider>
          </TabsContent>

          <TabsContent value="asset" className="space-y-4">
            <TeamAssetsDataProvider
              accountSlug={accountSlug}
              assignedAssetIds={assignedAssetIds}
            >
              {(assets) => (
                <Form {...assetForm}>
                  <form
                    onSubmit={assetForm.handleSubmit(onSubmitAsset)}
                    className="space-y-4"
                    data-test="assign-license-to-asset-form"
                  >
                    <FormField
                      control={assetForm.control}
                      name="asset_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={pending}
                          >
                            <FormControl>
                              <SelectTrigger
                                data-test="assign-asset-select"
                                aria-label="Select asset"
                                aria-required="true"
                              >
                                <SelectValue placeholder="Select an asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assets.length === 0 ? (
                                <div className="text-muted-foreground p-2 text-center text-sm">
                                  No available assets
                                </div>
                              ) : (
                                assets.map((asset) => (
                                  <SelectItem
                                    key={asset.id}
                                    value={asset.id}
                                    data-test={`asset-option-${asset.id}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                          {asset.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {asset.category}
                                          </Badge>
                                          {asset.serial_number && (
                                            <span className="text-muted-foreground text-xs">
                                              SN: {asset.serial_number}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the asset to assign this license to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assetForm.control}
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

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={pending}
                        data-test="cancel-assign-button"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={pending || !assetForm.watch('asset_id')}
                        data-test="confirm-assign-asset-button"
                      >
                        {pending && (
                          <LoadingSpinner size="sm" className="mr-2" />
                        )}
                        {pending ? 'Assigning...' : 'Assign License'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </TeamAssetsDataProvider>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Data provider components
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

interface TeamAsset {
  id: string;
  name: string;
  category: string;
  serial_number: string | null;
}

function TeamAssetsDataProvider({
  accountSlug,
  assignedAssetIds,
  children,
}: {
  accountSlug: string;
  assignedAssetIds: string[];
  children: (assets: TeamAsset[]) => React.ReactNode;
}) {
  const { data, isError, isLoading } = useTeamAssets(accountSlug);

  if (isLoading) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Assets</AlertTitle>
        <AlertDescription>
          Failed to load team assets. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const availableAssets = (data ?? []).filter(
    (asset) => !assignedAssetIds.includes(asset.id),
  );

  return children(availableAssets);
}

function useTeamAssets(accountSlug: string) {
  const supabase = useSupabase();
  const queryKey = ['team-assets', accountSlug];

  const queryFn = async () => {
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    const { data, error } = await supabase
      .from('assets')
      .select('id, name, category, serial_number')
      .eq('account_id', account.id)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  };

  return useQuery({
    queryKey,
    queryFn,
  });
}
