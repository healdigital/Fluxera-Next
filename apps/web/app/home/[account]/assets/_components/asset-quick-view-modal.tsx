'use client';

import { Edit, Trash, UserPlus } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { QuickViewModal } from '@kit/ui/modal';
import { Separator } from '@kit/ui/separator';

import { type AssetWithUser } from '../_lib/server/assets-page.loader';

interface AssetQuickViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetWithUser | null;
  loading?: boolean;
  onEdit?: () => void;
  onAssign?: () => void;
  onDelete?: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

/**
 * AssetQuickViewModal - Display asset details in a modal
 *
 * Shows all asset information including:
 * - Name, category, status
 * - Serial number, purchase date, warranty
 * - Assigned user
 * - Description
 *
 * Provides quick actions for Edit, Assign, and Delete
 */
export function AssetQuickViewModal({
  open,
  onOpenChange,
  asset,
  loading = false,
  onEdit,
  onAssign,
  onDelete,
  onNavigate,
}: AssetQuickViewModalProps) {
  if (!asset && !loading) {
    return null;
  }

  const actions = [
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
      title={asset?.name || 'Asset Details'}
      loading={loading}
      actions={actions}
      onNavigate={onNavigate}
      size="xl"
    >
      {asset && (
        <div className="space-y-6">
          {/* Status and Category */}
          <div className="flex items-center gap-3">
            <StatusBadge status={asset.status} />
            <CategoryBadge category={asset.category} />
          </div>

          <Separator />

          {/* Asset Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField label="Serial Number" value={asset.serial_number} />
            <InfoField
              label="Purchase Date"
              value={
                asset.purchase_date
                  ? new Date(asset.purchase_date).toLocaleDateString()
                  : null
              }
            />
            <InfoField
              label="Warranty Expiry"
              value={
                asset.warranty_expiry_date
                  ? new Date(asset.warranty_expiry_date).toLocaleDateString()
                  : null
              }
            />
            <InfoField
              label="Created"
              value={
                asset.created_at
                  ? new Date(asset.created_at).toLocaleDateString()
                  : null
              }
            />
          </div>

          <Separator />

          {/* Assignment Information */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Assignment</h3>
            {asset.assigned_user ? (
              <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
                {asset.assigned_user.picture_url && (
                  <img
                    src={asset.assigned_user.picture_url}
                    alt={asset.assigned_user.name}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {asset.assigned_user.name}
                  </div>
                  {asset.assigned_user.email && (
                    <div className="text-muted-foreground text-xs">
                      {asset.assigned_user.email}
                    </div>
                  )}
                  {asset.assigned_at && (
                    <div className="text-muted-foreground text-xs">
                      Assigned on{' '}
                      {new Date(asset.assigned_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm">
                Not assigned to anyone
              </div>
            )}
          </div>

          {/* Description */}
          {asset.description && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-medium">Description</h3>
                <p className="text-muted-foreground text-sm">
                  {asset.description}
                </p>
              </div>
            </>
          )}

          {/* Image */}
          {asset.image_url && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-sm font-medium">Image</h3>
                <img
                  src={asset.image_url}
                  alt={asset.name}
                  className="h-auto w-full max-w-md rounded-lg border"
                />
              </div>
            </>
          )}
        </div>
      )}
    </QuickViewModal>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-muted-foreground mb-1 text-xs font-medium">
        {label}
      </dt>
      <dd className="text-sm">
        {value || <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

function CategoryBadge({ category }: { category: AssetWithUser['category'] }) {
  const categoryLabels: Record<AssetWithUser['category'], string> = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    mobile_phone: 'Mobile Phone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    printer: 'Printer',
    other_equipment: 'Other Equipment',
  };

  return (
    <Badge variant="outline" className="font-normal">
      {categoryLabels[category]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AssetWithUser['status'] }) {
  const statusConfig: Record<
    AssetWithUser['status'],
    { label: string; className: string }
  > = {
    available: {
      label: 'Available',
      className:
        'text-green-800 border-green-700 bg-green-50 dark:text-green-300 dark:border-green-600 dark:bg-green-950',
    },
    assigned: {
      label: 'Assigned',
      className:
        'text-blue-800 border-blue-700 bg-blue-50 dark:text-blue-300 dark:border-blue-600 dark:bg-blue-950',
    },
    in_maintenance: {
      label: 'In Maintenance',
      className:
        'text-orange-800 border-orange-700 bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:bg-orange-950',
    },
    retired: {
      label: 'Retired',
      className:
        'text-gray-800 border-gray-700 bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-950',
    },
    lost: {
      label: 'Lost',
      className:
        'text-red-800 border-red-700 bg-red-50 dark:text-red-300 dark:border-red-600 dark:bg-red-950',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={`font-normal ${config.className}`}>
      {config.label}
    </Badge>
  );
}
