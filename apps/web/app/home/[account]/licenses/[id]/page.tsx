import Link from 'next/link';

import { Edit, Package, Trash2, UserPlus } from 'lucide-react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { AssignLicenseToAssetDialog } from '../_components/assign-license-to-asset-dialog';
import { AssignLicenseToUserDialog } from '../_components/assign-license-to-user-dialog';
import { BackToLicensesButton } from '../_components/back-to-licenses-button';
import { DeleteLicenseDialog } from '../_components/delete-license-dialog';
import { LicenseAssignmentsList } from '../_components/license-assignments-list';
import { LicenseDetailView } from '../_components/license-detail-view';
import { loadLicenseDetailData } from '../_lib/server/license-detail.loader';

interface LicenseDetailPageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async ({ params }: LicenseDetailPageProps) => {
  const i18n = await createI18nServerInstance();
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  try {
    const [license] = await loadLicenseDetailData(client, id, account);
    const title = `${license.name} - ${i18n.t('licenses:pageTitle', { defaultValue: 'Licenses' })}`;

    return {
      title,
    };
  } catch {
    return {
      title: i18n.t('licenses:pageTitle', { defaultValue: 'Licenses' }),
    };
  }
};

async function LicenseDetailPage({ params }: LicenseDetailPageProps) {
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  const [license, assignments] = await loadLicenseDetailData(
    client,
    id,
    account,
  );

  // Get list of user IDs already assigned to this license
  const assignedUserIds = assignments
    .filter((a) => a.assigned_to_user)
    .map((a) => a.assigned_to_user as string);

  // Get list of asset IDs already assigned to this license
  const assignedAssetIds = assignments
    .filter((a) => a.assigned_to_asset)
    .map((a) => a.assigned_to_asset as string);

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={license.name}
        description={<AppBreadcrumbs />}
        account={account}
      >
        <div className="flex gap-2">
          <AssignLicenseToUserDialog
            licenseId={license.id}
            licenseName={license.name}
            accountSlug={account}
            assignedUserIds={assignedUserIds}
          >
            <Button
              variant="outline"
              size="sm"
              data-test="assign-license-to-user-button"
              aria-label={`Assign ${license.name} to user`}
            >
              <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
              Assign to User
            </Button>
          </AssignLicenseToUserDialog>
          <AssignLicenseToAssetDialog
            licenseId={license.id}
            licenseName={license.name}
            accountSlug={account}
            assignedAssetIds={assignedAssetIds}
          >
            <Button
              variant="outline"
              size="sm"
              data-test="assign-license-to-asset-button"
              aria-label={`Assign ${license.name} to asset`}
            >
              <Package className="mr-2 h-4 w-4" aria-hidden="true" />
              Assign to Asset
            </Button>
          </AssignLicenseToAssetDialog>
          <Button
            asChild
            variant="outline"
            size="sm"
            data-test="edit-license-button"
          >
            <Link
              href={`/home/${account}/licenses/${license.id}/edit`}
              aria-label={`Edit ${license.name}`}
            >
              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <DeleteLicenseDialog
            licenseId={license.id}
            licenseName={license.name}
            accountSlug={account}
            assignmentCount={assignments.length}
            assignments={assignments}
          >
            <Button
              variant="destructive"
              size="sm"
              data-test="delete-license-button"
              aria-label={`Delete ${license.name}`}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </DeleteLicenseDialog>
        </div>
      </TeamAccountLayoutPageHeader>

      <PageBody>
        <BackToLicensesButton accountSlug={account} />
        <div className="space-y-6">
          <LicenseDetailView license={license} />
          <LicenseAssignmentsList
            assignments={assignments}
            licenseId={license.id}
            licenseName={license.name}
            accountSlug={account}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(LicenseDetailPage);
