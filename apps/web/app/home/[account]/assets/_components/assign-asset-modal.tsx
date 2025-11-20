'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { AssignmentModal, type AssignmentUser } from '@kit/ui/modal';
import { toast } from '@kit/ui/sonner';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';
import {
  assignAsset,
  unassignAsset,
} from '../_lib/server/assets-server-actions';

interface AssignAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetWithUser | null;
  accountSlug: string;
  onSuccess?: () => void;
}

/**
 * AssignAssetModal - Assign an asset to a user
 *
 * Features:
 * - Searchable user list
 * - Current assignment display
 * - Reassignment warning
 * - Unassignment option
 * - Optimistic UI update
 */
export function AssignAssetModal({
  open,
  onOpenChange,
  asset,
  accountSlug,
  onSuccess,
}: AssignAssetModalProps) {
  const [users, setUsers] = useState<AssignmentUser[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load team members when modal opens
  useEffect(() => {
    if (open && accountSlug) {
      loadTeamMembers();
    }
  }, [open, accountSlug]);

  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      // Fetch team members from the API
      const response = await fetch(
        `/api/accounts/${accountSlug}/members?limit=100`,
      );

      if (!response.ok) {
        throw new Error('Failed to load team members');
      }

      const data = await response.json();

      // Transform to AssignmentUser format
      const transformedUsers: AssignmentUser[] = data.members.map(
        (member: any) => ({
          id: member.user_id,
          name: member.display_name || member.email,
          email: member.email,
          avatarUrl: member.avatar_url || undefined,
        }),
      );

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Error', {
        description: 'Failed to load team members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId: string) => {
    if (!asset) return;

    try {
      const result = await assignAsset({
        asset_id: asset.id,
        user_id: userId,
      });

      if (result.success) {
        toast.success('Asset assigned', {
          description: 'The asset has been successfully assigned.',
        });

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Refresh the page
        router.refresh();
      }
    } catch (error) {
      console.error('Error assigning asset:', error);
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to assign asset',
      });
      throw error;
    }
  };

  const handleUnassign = async () => {
    if (!asset) return;

    try {
      const result = await unassignAsset({
        asset_id: asset.id,
      });

      if (result.success) {
        toast.success('Asset unassigned', {
          description: 'The asset has been successfully unassigned.',
        });

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Refresh the page
        router.refresh();
      }
    } catch (error) {
      console.error('Error unassigning asset:', error);
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to unassign asset',
      });
      throw error;
    }
  };

  if (!asset) {
    return null;
  }

  const currentAssignee = asset.assigned_user
    ? {
        id: asset.assigned_user.id,
        name: asset.assigned_user.name,
        email: asset.assigned_user.email || '',
        avatarUrl: asset.assigned_user.picture_url || undefined,
      }
    : undefined;

  return (
    <AssignmentModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="asset"
      entityName={asset.name}
      currentAssignee={currentAssignee}
      users={users}
      onAssign={handleAssign}
      onUnassign={asset.assigned_to ? handleUnassign : undefined}
      searchLoading={loading}
    />
  );
}
