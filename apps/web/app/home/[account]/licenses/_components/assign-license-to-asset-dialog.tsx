'use client';

import { useState, useTransition } from 'react';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
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
  type AssignLicenseToAssetData,
  AssignLicenseToAssetSchema,
} from '../_lib/schemas/license.schema';
import { assignLicenseToAsset } from '../_lib/server/licenses-server-actions';

interface AssignLicenseToAssetDialogProps {
  licenseId: string;
  licenseName: string;
  accountSlug: string;
  assignedAssetIds: string[];
  children?: React.ReactNode;
}

export function AssignLicenseToAssetDialog({
  licenseId,
  licenseName,
  accountSlug,
  assignedAssetIds,
  children,
}: AssignLicenseToAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<AssignLicenseToAssetData>({
    resolver: zodResolver(AssignLicenseToAssetSchema),
    defaultValues: {
      license_id: licenseId,
      asset_id: '',
      notes: '',
    },
  });

  const onSubmit = (data: AssignLicenseToAssetData) => {
    startTransition(async () => {
      try {
        setError(null);

        const result = await assignLicenseToAsset({
          ...data,
          accountSlug,
        });

        if (!result.success) {
          setError(result.message || 'Failed to assign license');
          toast.error('Assignment Failed', {
            description: result.message || 'Failed to assign license to asset',
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
            data-test="assign-license-to-asset-button"
            aria-label={`Assign ${licenseName} to asset`}
          >
            <Package className="mr-2 h-4 w-4" aria-hidden="true" />
            Assign to Asset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        data-test="assign-license-to-asset-dialog"
        aria-describedby="assign-license-to-asset-description"
      >
        <DialogHeader>
          <DialogTitle>Assign License to Asset</DialogTitle>
          <DialogDescription id="assign-license-to-asset-description">
            Select an asset to assign {licenseName} to.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Assignment Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TeamAssetsDataProvider
          accountSlug={accountSlug}
          assignedAssetIds={assignedAssetIds}
        >
          {(assets) => (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                data-test="assign-license-to-asset-form"
              >
                {/* Asset Selection */}
                <FormField
                  control={form.control}
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
                    disabled={pending || !form.watch('asset_id')}
                    data-test="confirm-assign-button"
                    aria-label={
                      pending ? 'Assigning license' : 'Assign license'
                    }
                  >
                    {pending ? 'Assigning...' : 'Assign License'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </TeamAssetsDataProvider>
      </DialogContent>
    </Dialog>
  );
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

  // Filter out assets that are already assigned to this license
  const availableAssets = (data ?? []).filter(
    (asset) => !assignedAssetIds.includes(asset.id),
  );

  return children(availableAssets);
}

function useTeamAssets(accountSlug: string) {
  const supabase = useSupabase();
  const queryKey = ['team-assets', accountSlug];

  const queryFn = async () => {
    // First get the account_id from the slug
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('slug', accountSlug)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Then fetch assets for this account
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
