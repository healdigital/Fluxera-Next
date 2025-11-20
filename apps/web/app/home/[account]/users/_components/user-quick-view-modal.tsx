'use client';

import { useState, useTransition } from 'react';

import Link from 'next/link';

import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Edit,
  Laptop,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { QuickViewModal } from '@kit/ui/modal';
import { toast } from '@kit/ui/sonner';

import { UserDetailData } from '../_lib/server/user-detail.loader';
import {
  assignAssetsToUser,
  unassignAssetFromUser,
} from '../_lib/server/users-server-actions';
import { AssignAssetsDialog } from './assign-assets-dialog';
import { EditUserModal } from './edit-user-modal';

interface UserQuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: UserDetailData | null;
  accountSlug: string;
  accountId: string;
  availableRoles: Array<{ name: string; hierarchy_level: number }>;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onRefresh?: () => void;
}

export function UserQuickViewModal({
  open,
  onOpenChange,
  userData,
  accountSlug,
  accountId,
  availableRoles,
  onNavigate,
  onRefresh,
}: UserQuickViewModalProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUnassigning, startUnassignTransition] = useTransition();

  if (!userData) {
    return null;
  }

  const {
    profile,
    membership,
    status,
    assigned_assets,
    available_assets,
    email,
    last_sign_in_at,
    user_id,
  } = userData;

  const displayName = profile?.display_name || email;
  const currentStatus = status?.status || 'active';

  const handleAssignAssets = async (data: {
    user_id: string;
    asset_ids: string[];
  }) => {
    const result = await assignAssetsToUser({
      ...data,
      accountSlug,
    });

    if (result.success && onRefresh) {
      onRefresh();
    }

    return result;
  };

  const handleUnassignAsset = (assetId: string) => {
    startUnassignTransition(async () => {
      try {
        const result = await unassignAssetFromUser({
          asset_id: assetId,
          accountSlug,
        });

        if (result.success) {
          toast.success('Asset unassigned successfully');
          if (onRefresh) {
            onRefresh();
          }
        } else {
          toast.error('Failed to unassign asset');
        }
      } catch (error) {
        console.error('Error unassigning asset:', error);
        toast.error('An unexpected error occurred');
      }
    });
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const actions = [
    {
      label: 'Edit Profile',
      icon: Edit,
      onClick: () => setEditModalOpen(true),
    },
  ];

  return (
    <>
      <QuickViewModal
        open={open}
        onOpenChange={onOpenChange}
        title={displayName}
        actions={actions}
        onNavigate={onNavigate}
        size="xl"
      >
        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                      <User className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl">{displayName}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={currentStatus} />
                  <RoleBadge role={membership.account_role} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Details Grid */}
              <dl className="grid gap-4 md:grid-cols-2">
                {profile?.phone_number && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">
                        Phone Number
                      </dt>
                      <dd className="mt-1 text-sm">{profile.phone_number}</dd>
                    </div>
                  </div>
                )}

                {profile?.job_title && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">
                        Job Title
                      </dt>
                      <dd className="mt-1 text-sm">{profile.job_title}</dd>
                    </div>
                  </div>
                )}

                {profile?.department && (
                  <div className="flex items-start gap-3">
                    <Building2 className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">
                        Department
                      </dt>
                      <dd className="mt-1 text-sm">{profile.department}</dd>
                    </div>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">
                        Location
                      </dt>
                      <dd className="mt-1 text-sm">{profile.location}</dd>
                    </div>
                  </div>
                )}
              </dl>

              {/* Bio Section */}
              {profile?.bio && (
                <div className="border-t pt-4">
                  <dt className="text-muted-foreground mb-2 text-sm font-medium">
                    Bio
                  </dt>
                  <dd className="text-sm">{profile.bio}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Membership and activity details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Member Since
                    </dt>
                    <dd className="mt-1 text-sm">
                      {new Date(membership.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </div>

                {last_sign_in_at && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">
                        Last Sign In
                      </dt>
                      <dd className="mt-1 text-sm">
                        {new Date(last_sign_in_at).toLocaleString()}
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Role
                    </dt>
                    <dd
                      className="mt-1 text-sm capitalize"
                      data-test="user-role-display"
                    >
                      {membership.account_role.replace(/_/g, ' ')}
                    </dd>
                  </div>
                </div>

                {status && (
                  <div className="flex items-start gap-3">
                    <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">
                        Status
                      </dt>
                      <dd className="mt-1">
                        <StatusBadge status={status.status} />
                        {status.status_reason && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {status.status_reason}
                          </p>
                        )}
                        {status.status_changed_at && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Changed on{' '}
                            {new Date(
                              status.status_changed_at,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Assigned Assets Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assigned Assets</CardTitle>
                  <CardDescription>
                    Equipment and resources assigned to this user
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{assigned_assets.length}</Badge>
                  <AssignAssetsDialog
                    userId={user_id}
                    accountId={membership.account_id}
                    accountSlug={accountSlug}
                    userName={displayName}
                    currentAssets={assigned_assets}
                    availableAssets={available_assets}
                    onAssign={handleAssignAssets}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assigned_assets.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                  <Laptop className="mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm">No assets assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assigned_assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="hover:bg-muted rounded-lg border p-4 transition-colors"
                      data-test={`assigned-asset-${asset.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/home/${accountSlug}/assets/${asset.id}`}
                          className="flex flex-1 items-start gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Laptop className="text-muted-foreground mt-0.5 h-5 w-5" />
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                              <CategoryBadge category={asset.category} />
                              {asset.serial_number && (
                                <span className="text-xs">
                                  SN: {asset.serial_number}
                                </span>
                              )}
                            </div>
                            {asset.assigned_at && (
                              <p className="text-muted-foreground mt-1 text-xs">
                                Assigned on{' '}
                                {new Date(
                                  asset.assigned_at,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassignAsset(asset.id);
                          }}
                          disabled={isUnassigning}
                          data-test={`unassign-asset-${asset.id}`}
                        >
                          {isUnassigning ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Unassign'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </QuickViewModal>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        userId={user_id}
        profile={profile}
        accountSlug={accountSlug}
        accountId={accountId}
        currentRole={membership.account_role}
        currentStatus={currentStatus}
        userName={displayName}
        availableRoles={availableRoles}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

// Helper component for status badge
function StatusBadge({
  status,
}: {
  status: 'active' | 'inactive' | 'suspended' | 'pending_invitation';
}) {
  const statusConfig = {
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
      label: 'Pending Invitation',
      className: 'text-orange-700 border-orange-700 bg-orange-50',
    },
  };

  const config = statusConfig[status];

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

// Helper component for role badge
function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className="font-normal"
      data-test="user-role-badge"
    >
      {role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
    </Badge>
  );
}

// Helper component for asset category badge
function CategoryBadge({ category }: { category: string }) {
  const categoryLabels: Record<string, string> = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    mobile_phone: 'Mobile Phone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    printer: 'Printer',
    other_equipment: 'Other Equipment',
  };

  return (
    <Badge variant="secondary" className="text-xs font-normal">
      {categoryLabels[category] || category}
    </Badge>
  );
}
