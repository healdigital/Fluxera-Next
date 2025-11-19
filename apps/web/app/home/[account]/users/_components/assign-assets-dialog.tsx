'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Laptop, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { toast } from '@kit/ui/sonner';

import {
  AssignAssetsData,
  AssignAssetsSchema,
} from '../_lib/schemas/user.schema';
import { AssignedAsset } from '../_lib/server/user-detail.loader';

interface AvailableAsset {
  id: string;
  name: string;
  category: string;
  serial_number: string | null;
  status: string;
}

interface AssignAssetsDialogProps {
  userId: string;
  accountId: string;
  accountSlug: string;
  userName: string;
  currentAssets: AssignedAsset[];
  availableAssets: AvailableAsset[];
  onAssign: (data: AssignAssetsData) => Promise<{ success: boolean }>;
  children?: React.ReactNode;
}

export function AssignAssetsDialog({
  userId,
  userName,
  currentAssets,
  availableAssets,
  onAssign,
  children,
}: AssignAssetsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssignAssetsData>({
    resolver: zodResolver(AssignAssetsSchema),
    defaultValues: {
      user_id: userId,
      asset_ids: [],
    },
  });

  const handleSubmit = (data: AssignAssetsData) => {
    startTransition(async () => {
      try {
        const result = await onAssign(data);

        if (result.success) {
          toast.success('Assets assigned successfully');
          setOpen(false);
          form.reset();
        } else {
          toast.error('Failed to assign assets');
        }
      } catch (error) {
        console.error('Error assigning assets:', error);
        toast.error('An unexpected error occurred');
      }
    });
  };

  const selectedAssetIds = form.watch('asset_ids');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" data-test="assign-assets-button">
            <Laptop className="mr-2 h-4 w-4" />
            Assign Assets
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Assets to {userName}</DialogTitle>
          <DialogDescription>
            Select one or more assets to assign to this user. Only available
            assets are shown.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Currently Assigned Assets */}
            {currentAssets.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-medium">
                  Currently Assigned ({currentAssets.length})
                </h4>
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {currentAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-muted/50 flex items-center gap-3 rounded-md p-2"
                    >
                      <Laptop className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {asset.category}
                          {asset.serial_number &&
                            ` • SN: ${asset.serial_number}`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Assigned
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Assets Selection */}
            <FormField
              control={form.control}
              name="asset_ids"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Available Assets ({availableAssets.length})
                  </FormLabel>
                  {availableAssets.length === 0 ? (
                    <div className="text-muted-foreground rounded-md border p-4 text-center text-sm">
                      No available assets to assign
                    </div>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                      {availableAssets.map((asset) => (
                        <FormField
                          key={asset.id}
                          control={form.control}
                          name="asset_ids"
                          render={({ field }) => (
                            <FormItem className="hover:bg-muted/50 flex items-start gap-3 space-y-0 rounded-md p-2 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(asset.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    const newValue = checked
                                      ? [...currentValue, asset.id]
                                      : currentValue.filter(
                                          (id) => id !== asset.id,
                                        );
                                    field.onChange(newValue);
                                  }}
                                  data-test={`asset-checkbox-${asset.id}`}
                                />
                              </FormControl>
                              <div className="flex-1">
                                <FormLabel className="cursor-pointer font-medium">
                                  {asset.name}
                                </FormLabel>
                                <p className="text-muted-foreground text-xs">
                                  {asset.category}
                                  {asset.serial_number &&
                                    ` • SN: ${asset.serial_number}`}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {asset.status}
                              </Badge>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  selectedAssetIds.length === 0 ||
                  availableAssets.length === 0
                }
                data-test="confirm-assign-assets"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign{' '}
                {selectedAssetIds.length > 0 &&
                  `(${selectedAssetIds.length})`}{' '}
                Asset
                {selectedAssetIds.length !== 1 && 's'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
