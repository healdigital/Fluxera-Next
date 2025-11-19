'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import { UserFilters } from './user-filters';
import { UsersPagination } from './users-pagination';

interface UsersListProps {
  users: TeamMember[];
  accountSlug: string;
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
  isLoading = false,
  pagination,
}: UsersListProps) {
  const router = useRouter();

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

  if (users.length === 0) {
    return (
      <div className="space-y-4">
        <UserFilters />
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-muted-foreground text-center">
            No users found. Invite your first team member to get started.
          </p>
          <Button asChild>
            <Link href={`/home/${accountSlug}/users/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserFilters />

      <div className="flex justify-end">
        <Button asChild data-test="invite-user-button">
          <Link
            href={`/home/${accountSlug}/users/new`}
            aria-label="Invite new user"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Invite User
          </Link>
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
                onClick={() => {
                  router.push(`/home/${accountSlug}/users/${user.user_id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/home/${accountSlug}/users/${user.user_id}`);
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
