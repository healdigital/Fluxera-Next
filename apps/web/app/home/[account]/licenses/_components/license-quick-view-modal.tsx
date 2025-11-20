'use client';

import { Edit, RefreshCw, Trash, UserPlus } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { QuickViewModal } from '@kit/ui/modal';
import { Separator } from '@kit/ui/separator';

import { type LicenseWithAssignments } from '../_lib/server/licenses-page.loader';

interface LicenseQuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: LicenseWithAssignments | null;
  loading?: boolean;
  onEdit?: () => void;
  onAssign?: () => void;
  onRenew?: () => void;
  onDelete?: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

/**
 * LicenseQuickViewModal - Display license details in a modal
 *
 * Shows all license information including:
 * - Name, vendor, license key
 * - License type, dates, status
 * - Assignment count
 * - Expiration highlighting (within 30 days)
 *
 * Provides quick actions for Assign, Renew, Edit, and Delete
 */
export function LicenseQuickViewModal({
  open,
  onOpenChange,
  license,
  loading = false,
  onEdit,
  onAssign,
  onRenew,
  onDelete,
  onNavigate,
}: LicenseQuickViewModalProps) {
  if (!license && !loading) {
    return null;
  }

  const actions = [
    ...(onAssign
      ? [
          {
            label: 'Assign',
            icon: UserPlus,
            onClick: onAssign,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(onRenew
      ? [
          {
            label: 'Renew',
            icon: RefreshCw,
            onClick: onRenew,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            label: 'Edit',
            icon: Edit,
            onClick: onEdit,
            variant: 'outline' as const,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: 'Delete',
            icon: Trash,
            onClick: onDelete,
            variant: 'destructive' as const,
          },
        ]
      : []),
  ];

  return (
    <QuickViewModal
      open={open}
      onOpenChange={onOpenChange}
      title={license?.name || 'License Details'}
      loading={loading}
      actions={actions}
      onNavigate={onNavigate}
      size="xl"
    >
      {license && (
        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-3">
            <ExpirationStatusBadge
              daysUntilExpiry={license.days_until_expiry}
              isExpired={license.is_expired}
            />
            <LicenseTypeBadge type={license.license_type} />
          </div>

          <Separator />

          {/* License Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField label="Vendor" value={license.vendor} />
            <InfoField
              label="License Key"
              value={license.license_key}
              mono
            />
            <InfoField
              label="Expiration Date"
              value={new Date(license.expiration_date).toLocaleDateString()}
              highlight={
                !license.is_expired && license.days_until_expiry <= 30
              }
            />
            <InfoField
              label="Days Until Expiry"
              value={
                license.is_expired
                  ? `Expired ${Math.abs(license.days_until_expiry)} days ago`
                  : `${license.days_until_expiry} days`
              }
              highlight={
                !license.is_expired && license.days_until_expiry <= 30
              }
            />
          </div>

          <Separator />

          {/* Assignment Information */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Assignments</h3>
            {license.assignment_count > 0 ? (
              <div className="bg-muted flex items-center justify-between rounded-lg p-3">
                <div>
                  <div className="text-sm font-medium">
                    {license.assignment_count}{' '}
                    {license.assignment_count === 1
                      ? 'Assignment'
                      : 'Assignments'}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    This license is currently assigned to{' '}
                    {license.assignment_count}{' '}
                    {license.assignment_count === 1
                      ? 'user or asset'
                      : 'users or assets'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm">
                Not assigned to anyone
              </div>
            )}
          </div>
        </div>
      )}
    </QuickViewModal>
  );
}

function InfoField({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-muted-foreground mb-1 text-xs font-medium">
        {label}
      </dt>
      <dd
        className={`text-sm ${mono ? 'font-mono' : ''} ${
          highlight
            ? 'font-semibold text-orange-600 dark:text-orange-400'
            : ''
        }`}
      >
        {value || <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

function LicenseTypeBadge({
  type,
}: {
  type: LicenseWithAssignments['license_type'];
}) {
  const typeLabels: Record<LicenseWithAssignments['license_type'], string> = {
    perpetual: 'Perpetual',
    subscription: 'Subscription',
    volume: 'Volume',
    oem: 'OEM',
    trial: 'Trial',
    educational: 'Educational',
    enterprise: 'Enterprise',
  };

  return (
    <Badge variant="outline" className="font-normal">
      {typeLabels[type] || type}
    </Badge>
  );
}

function ExpirationStatusBadge({
  daysUntilExpiry,
  isExpired,
}: {
  daysUntilExpiry: number;
  isExpired: boolean;
}) {
  if (isExpired) {
    return (
      <Badge
        variant="outline"
        className="border-red-700 bg-red-50 font-normal text-red-800 dark:border-red-600 dark:bg-red-950 dark:text-red-300"
      >
        Expired
      </Badge>
    );
  }

  // Highlight expiring licenses (within 30 days)
  if (daysUntilExpiry <= 7) {
    return (
      <Badge
        variant="outline"
        className="border-red-700 bg-red-50 font-normal text-red-800 dark:border-red-600 dark:bg-red-950 dark:text-red-300"
      >
        Expires in {daysUntilExpiry} days
      </Badge>
    );
  }

  if (daysUntilExpiry <= 30) {
    return (
      <Badge
        variant="outline"
        className="border-orange-700 bg-orange-50 font-normal text-orange-800 dark:border-orange-600 dark:bg-orange-950 dark:text-orange-300"
      >
        Expires in {daysUntilExpiry} days
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-green-700 bg-green-50 font-normal text-green-800 dark:border-green-600 dark:bg-green-950 dark:text-green-300"
    >
      Active
    </Badge>
  );
}
