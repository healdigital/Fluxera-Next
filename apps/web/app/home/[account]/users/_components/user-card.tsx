'use client';

import { useRouter } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { type TeamMember } from '../_lib/server/users-page.loader';

interface UserCardProps {
  user: TeamMember;
  accountSlug: string;
}

export function UserCard({ user, accountSlug }: UserCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/home/${accountSlug}/users/${user.user_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className="hover:bg-muted/50 focus-within:ring-ring cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${user.display_name}`}
      data-test={`user-card-${user.user_id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 rounded-full"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{user.display_name}</CardTitle>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role_name} />
          <StatusBadge status={user.status} />
        </div>

        <div className="text-muted-foreground text-sm">
          {user.last_sign_in_at ? (
            <>
              Last sign in:{' '}
              <span className="text-foreground">
                {new Date(user.last_sign_in_at).toLocaleDateString()}
              </span>
            </>
          ) : (
            <span>Never signed in</span>
          )}
        </div>
      </CardContent>
    </Card>
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
