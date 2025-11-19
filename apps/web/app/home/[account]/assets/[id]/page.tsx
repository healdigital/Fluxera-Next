import Link from 'next/link';

import { Edit, Trash2, UserMinus, UserPlus } from 'lucide-react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { AssetHistoryList } from '../_components/asset-history-list';
import { AssignAssetDialog } from '../_components/assign-asset-dialog';
import { DeleteAssetDialog } from '../_components/delete-asset-dialog';
import { UnassignAssetDialog } from '../_components/unassign-asset-dialog';
import { loadAssetDetailData } from '../_lib/server/asset-detail.loader';

interface AssetDetailPageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async ({ params }: AssetDetailPageProps) => {
  const i18n = await createI18nServerInstance();
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  try {
    const [asset] = await loadAssetDetailData(client, id, account);
    const title = `${asset.name} - ${i18n.t('assets:pageTitle')}`;

    return {
      title,
    };
  } catch {
    return {
      title: i18n.t('assets:pageTitle'),
    };
  }
};

async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  const [asset, history] = await loadAssetDetailData(client, id, account);

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={asset.name}
        description={<AppBreadcrumbs />}
        account={account}
      />

      <PageBody>
        <div className="space-y-6">
          {/* Asset Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{asset.name}</CardTitle>
                  <CardDescription>Asset Details</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!asset.assigned_to && (
                    <AssignAssetDialog assetId={asset.id} accountSlug={account}>
                      <Button
                        variant="outline"
                        size="sm"
                        data-test="assign-asset-button"
                        aria-label={`Assign ${asset.name} to a team member`}
                      >
                        <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Assign
                      </Button>
                    </AssignAssetDialog>
                  )}
                  {asset.assigned_to && asset.assigned_user && (
                    <UnassignAssetDialog
                      assetId={asset.id}
                      assetName={asset.name}
                      assignedUserName={asset.assigned_user.name}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        data-test="unassign-asset-button"
                        aria-label={`Unassign ${asset.name} from ${asset.assigned_user.name}`}
                      >
                        <UserMinus
                          className="mr-2 h-4 w-4"
                          aria-hidden="true"
                        />
                        Unassign
                      </Button>
                    </UnassignAssetDialog>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    data-test="edit-asset-button"
                  >
                    <Link
                      href={`/home/${account}/assets/${asset.id}/edit`}
                      aria-label={`Edit ${asset.name}`}
                    >
                      <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteAssetDialog
                    assetId={asset.id}
                    assetName={asset.name}
                    accountSlug={account}
                    hasActiveAssignment={!!asset.assigned_to}
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      data-test="delete-asset-button"
                      aria-label={`Delete ${asset.name}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </DeleteAssetDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status and Category */}
              <div className="flex items-center gap-2" data-test="asset-badges">
                <CategoryBadge category={asset.category} />
                <StatusBadge status={asset.status} />
              </div>

              {/* Asset Information Grid */}
              <dl
                className="grid gap-4 md:grid-cols-2"
                aria-label="Asset information"
              >
                {asset.description && (
                  <div className="md:col-span-2">
                    <dt className="text-muted-foreground text-sm font-medium">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm">{asset.description}</dd>
                  </div>
                )}

                {asset.serial_number && (
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Serial Number
                    </dt>
                    <dd className="mt-1 text-sm">{asset.serial_number}</dd>
                  </div>
                )}

                {asset.purchase_date && (
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Purchase Date
                    </dt>
                    <dd className="mt-1 text-sm">
                      <time dateTime={asset.purchase_date}>
                        {new Date(asset.purchase_date).toLocaleDateString()}
                      </time>
                    </dd>
                  </div>
                )}

                {asset.warranty_expiry_date && (
                  <div>
                    <dt className="text-muted-foreground text-sm font-medium">
                      Warranty Expiry
                    </dt>
                    <dd className="mt-1 text-sm">
                      <time dateTime={asset.warranty_expiry_date}>
                        {new Date(
                          asset.warranty_expiry_date,
                        ).toLocaleDateString()}
                      </time>
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-muted-foreground text-sm font-medium">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm">
                    {asset.created_at ? (
                      <time dateTime={asset.created_at}>
                        {new Date(asset.created_at).toLocaleString()}
                      </time>
                    ) : (
                      'Unknown'
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground text-sm font-medium">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm">
                    {asset.updated_at ? (
                      <time dateTime={asset.updated_at}>
                        {new Date(asset.updated_at).toLocaleString()}
                      </time>
                    ) : (
                      'Unknown'
                    )}
                  </dd>
                </div>
              </dl>

              {/* Assigned User Information */}
              {asset.assigned_user && (
                <dl className="border-t pt-4" data-test="assigned-user-info">
                  <dt className="text-muted-foreground mb-2 text-sm font-medium">
                    Assigned To
                  </dt>
                  <dd className="flex items-center gap-3">
                    {asset.assigned_user.picture_url && (
                      <img
                        src={asset.assigned_user.picture_url}
                        alt={asset.assigned_user.name}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <div
                        className="font-medium"
                        data-test="assigned-user-name"
                      >
                        {asset.assigned_user.name}
                      </div>
                      {asset.assigned_user.email && (
                        <div className="text-muted-foreground text-sm">
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
                  </dd>
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Asset History */}
          <AssetHistoryList history={history} />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(AssetDetailPage);

// Helper components for badges (reused from asset-card.tsx)
function CategoryBadge({
  category,
}: {
  category:
    | 'laptop'
    | 'desktop'
    | 'mobile_phone'
    | 'tablet'
    | 'monitor'
    | 'printer'
    | 'other_equipment';
}) {
  const categoryLabels = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    mobile_phone: 'Mobile Phone',
    tablet: 'Tablet',
    monitor: 'Monitor',
    printer: 'Printer',
    other_equipment: 'Other Equipment',
  };

  return (
    <Badge
      variant="outline"
      className="font-normal"
      aria-label={`Category: ${categoryLabels[category]}`}
    >
      {categoryLabels[category]}
    </Badge>
  );
}

function StatusBadge({
  status,
}: {
  status: 'available' | 'assigned' | 'in_maintenance' | 'retired' | 'lost';
}) {
  const statusConfig = {
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
    <Badge
      variant="outline"
      className={`font-normal ${config.className}`}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
