'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import { Search, User } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { BulkActionModal } from '@kit/ui/modal';
import type { BulkActionResult } from '@kit/ui/modal';
import { ScrollArea } from '@kit/ui/scroll-area';
import { toast } from '@kit/ui/sonner';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';
import { bulkAssignAssets } from '../_lib/server/assets-server-actions';

interface BulkAssignAssetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: AssetWithUser[];
  accountSlug: string;
  users: Array<{ id: string; name: string; email: string }>;
  onSuccess?: () => void;
}

type AssignmentState = 'select-user' | 'confirming';

/**
 * BulkAssignAssetsModal - Modal for bulk assigning assets to a user
 *
 * Features:
 * - User selection with search
 * - Confirmation with asset preview
 * - Progress tracking during assignment
 * - Results summary with success/failure breakdown
 *
 * @example
 * ```tsx
 * <BulkAssignAssetsModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   assets={selectedAssets}
 *   accountSlug={accountSlug}
 *   users={accountUsers}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export function BulkAssignAssetsModal({
  open,
  onOpenChange,
  assets,
  accountSlug,
  users,
  onSuccess,
}: BulkAssignAssetsModalProps) {
  const router = useRouter();
  const [state, setState] = React.useState<AssignmentState>('select-user');
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = React.useState('');

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setState('select-user');
      setSelectedUserId(null);
      setSearchTerm('');
    }
  }, [open]);

  // Filter users based on search term
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return users;

    const lowerSearch = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch),
    );
  }, [users, searchTerm]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setState('confirming');
  };

  const handleBack = () => {
    setState('select-user');
  };

  const handleConfirm = React.useCallback(
    async (assetIds: string[]): Promise<BulkActionResult> => {
      if (!selectedUserId) {
        return {
          successful: [],
          failed: assetIds.map((id) => ({
            id,
            error: 'No user selected',
          })),
        };
      }

      try {
        const result = await bulkAssignAssets({
          accountSlug,
          assetIds,
          userId: selectedUserId,
        });

        if (result.data) {
          // Show success toast
          if (result.data.successful.length > 0) {
            toast.success('Assets assigned', {
              description: `Successfully assigned ${result.data.successful.length} ${
                result.data.successful.length === 1 ? 'asset' : 'assets'
              } to ${selectedUser?.name}.`,
            });
          }

          // Show error toast if there were failures
          if (result.data.failed.length > 0) {
            toast.error('Some assignments failed', {
              description: `${result.data.failed.length} ${
                result.data.failed.length === 1 ? 'asset' : 'assets'
              } could not be assigned.`,
            });
          }

          // Refresh the page
          router.refresh();

          // Call success callback
          if (onSuccess) {
            onSuccess();
          }

          return result.data;
        }

        // Fallback if no data
        return {
          successful: [],
          failed: assetIds.map((id) => ({
            id,
            error: 'Unknown error occurred',
          })),
        };
      } catch (error) {
        console.error('Bulk assign error:', error);

        toast.error('Bulk assign failed', {
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });

        // Return all as failed
        return {
          successful: [],
          failed: assetIds.map((id) => ({
            id,
            error:
              error instanceof Error
                ? error.message
                : 'Unknown error occurred',
          })),
        };
      }
    },
    [accountSlug, selectedUserId, selectedUser, router, onSuccess],
  );

  // User selection dialog
  if (state === 'select-user') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Assets to User</DialogTitle>
            <DialogDescription>
              Select a user to assign {assets.length}{' '}
              {assets.length === 1 ? 'asset' : 'assets'} to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="user-search">Search Users</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="user-search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <ScrollArea className="h-[300px] rounded-md border">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <User className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {searchTerm
                      ? 'No users found matching your search.'
                      : 'No users available.'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className="hover:bg-accent focus:bg-accent w-full rounded-md p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {user.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation and progress dialog
  return (
    <BulkActionModal
      open={open}
      onOpenChange={onOpenChange}
      action={`Assign to ${selectedUser?.name || 'User'}`}
      itemCount={assets.length}
      items={assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
      }))}
      onConfirm={handleConfirm}
      confirmLabel={`Assign ${assets.length} ${assets.length === 1 ? 'Asset' : 'Assets'}`}
      cancelLabel="Back"
    />
  );
}
