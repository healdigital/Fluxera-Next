'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Plus } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { type TeamMember } from '../_lib/server/users-page.loader';
import { type UserDetailData } from '../_lib/server/user-detail.loader';
import { InviteUserModal } from './invite-user-modal';
import { UserFilters } from './user-filters';
import { UserQuickViewModal } from './user-quick-view-modal';
import { UsersPagination } from './users-pagination';

interface UsersListProps {
  users: TeamMember[];
  accountSlug: string;
  accountId: string;
  availableRoles: Array<{ name: string; hierarchy_level: number }>;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export function UsersList({
  users,
  accountSlug,
  accountId,
  availableRoles,
  isLoading = false,
  pagination,
}: UsersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<UserDetailData | null>(null);
  const [isLoadingUserData, startLoadingTransition] = useTransition();

  // Context preservation: save scroll position
  useEffect(() => {
    if (quickViewOpen) {
      const scrollY = window.scrollY;
      sessionStorage.setItem('usersListScrollPosition', scrollY.toString());
    } else {
      const savedScrollY = sessionStorage.getItem('usersListScrollPosition');
      if (savedScrollY) {
        window.scrollTo(0, parseInt(savedScrollY, 10));
      }
    }
  }, [quickViewOpen]);

  // Load user data when modal opens
  const loadUserData = useCallback(async (userId: string) => {
    startLoadingTransition(async () => {
      try {
        const { getUserDetailData } = await import('../_lib/server/users-server-actions');
        const result = await getUserDetailData({ userId, accountSlug });
        
        if (result.success && result.data) {
          setSelectedUserData(result.data);
        } else {
          setSelectedUserData(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setSelectedUserData(null);
      }
    });
  }, [accountSlug]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <UserFilters />
        <div
          className="flex flex-col items-center justify-center space-y-4 py-12"
          role="status"
          aria-live="polite"
        >
          <Spinner className="h-8 w-8" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setQuickViewOpen(true);
    loadUserData(userId);
  };

  const handleQuickViewClose = () => {
    setQuickViewOpen(false);
    setSelectedUserId(null);
    setSelectedUserData(null);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedUserId || !users || users.length === 0) return;

    const currentIndex = users.findIndex((u) => u.user_id === selectedUserId);
    if (currentIndex === -1) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : users.length - 1;
    } else {
      newIndex = currentIndex < users.length - 1 ? currentIndex + 1 : 0;
    }

    const newUserId = users[newIndex]?.user_id;
    if (!newUserId) return;
    
    setSelectedUserId(newUserId);
    loadUserData(newUserId);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleInviteSuccess = () => {
    router.refresh();
  };

  if (users.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <UserFilters />
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <p className="text-muted-foreground text-center">
              No users found. Invite your first team member to get started.
            </p>
            <Button
              onClick={() => setInviteModalOpen(true)}
              data-test="invite-user-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>
        </div>

        <InviteUserModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          accountSlug={accountSlug}
          availableRoles={availableRoles}
          onSuccess={handleInviteSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <UserFilters />

        <div className="flex justify-end">
          <Button
            onClick={() => setInviteModalOpen(true)}
            data-test="invite-user-button"
            aria-label="Invite new user"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Invite User
          </Button>
        </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sign In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.user_id}
                className="hover:bg-muted/50 focus-within:ring-ring cursor-pointer focus-within:ring-2 focus-within:ring-offset-2"
                onClick={() => handleUserClick(user.user_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleUserClick(user.user_id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${user.display_name}`}
                data-test={`user-row-${user.user_id}`}
              >
                <TableCell className="font-medium" data-test="user-name-cell">
                  <div className="flex items-center gap-2">
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt=""
                        aria-hidden="true"
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span>{user.display_name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role_name} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at ? (
                    <span className="text-sm">
                      {new Date(user.last_sign_in_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Never</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

        {pagination && pagination.totalPages > 0 && (
          <UsersPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
          />
        )}
      </div>

      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        accountSlug={accountSlug}
        availableRoles={availableRoles}
        onSuccess={handleInviteSuccess}
      />

      {/* User Quick View Modal */}
      <UserQuickViewModal
        open={quickViewOpen}
        onOpenChange={handleQuickViewClose}
        userData={selectedUserData}
        accountSlug={accountSlug}
        accountId={accountId}
        availableRoles={availableRoles}
        onNavigate={handleNavigate}
        onRefresh={handleRefresh}
      />
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className="font-normal"
      aria-label={`Role: ${role}`}
    >
      {role}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: {
      label: 'Active',
      className: 'text-green-700 border-green-700 bg-green-50',
    },
    inactive: {
      label: 'Inactive',
      className: 'text-gray-700 border-gray-700 bg-gray-50',
    },
    suspended: {
      label: 'Suspended',
      className: 'text-red-700 border-red-700 bg-red-50',
    },
    pending_invitation: {
      label: 'Pending',
      className: 'text-orange-700 border-orange-700 bg-orange-50',
    },
  };

  const config = statusConfig[status] ?? {
    label: status,
    className: 'text-gray-700 border-gray-700 bg-gray-50',
  };

  return (
    <Badge
      variant="outline"
      className={`font-normal ${config.className}`}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
