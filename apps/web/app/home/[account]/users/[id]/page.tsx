import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';

import { TeamAccountLayoutPageHeader } from '~/home/[account]/_components/team-account-layout-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { BackToUsersButton } from '../_components/back-to-users-button';
import { UserDetailView } from '../_components/user-detail-view';
import { UserPermissionsView } from '../_components/user-permissions-view';
import { loadUserDetailData } from '../_lib/server/user-detail.loader';

interface UserDetailPageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async ({ params }: UserDetailPageProps) => {
  const i18n = await createI18nServerInstance();
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  try {
    const userData = await loadUserDetailData(client, id, account);
    const displayName =
      userData.profile?.display_name || userData.email || 'User';
    const title = `${displayName} - User Management`;

    return {
      title,
    };
  } catch {
    return {
      title: i18n.t('common:userManagement', {
        defaultValue: 'User Management',
      }),
    };
  }
};

async function UserDetailPage({ params }: UserDetailPageProps) {
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  const userData = await loadUserDetailData(client, id, account);

  // Fetch available roles
  const { data: roles } = await client
    .from('roles')
    .select('name, hierarchy_level')
    .order('hierarchy_level', { ascending: true });

  // Get account ID
  const { data: accountData } = await client
    .from('accounts')
    .select('id')
    .eq('slug', account)
    .single();

  const displayName =
    userData.profile?.display_name || userData.email || 'User';

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={displayName}
        description={<AppBreadcrumbs />}
        account={account}
      />

      <PageBody>
        <BackToUsersButton accountSlug={account} />
        <div className="space-y-6">
          <UserDetailView
            userData={userData}
            accountSlug={account}
            accountId={accountData?.id || ''}
            availableRoles={roles || []}
          />
          <UserPermissionsView
            role={userData.membership.account_role}
            permissions={userData.permissions}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UserDetailPage);
