import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';

import { TeamAccountLayoutPageHeader } from '~/home/[account]/_components/team-account-layout-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { BackToUsersButton } from '../../_components/back-to-users-button';
import { EditUserProfileForm } from '../../_components/edit-user-profile-form';
import { loadUserDetailData } from '../../_lib/server/user-detail.loader';

interface EditUserProfilePageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async ({
  params,
}: EditUserProfilePageProps) => {
  const i18n = await createI18nServerInstance();
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  try {
    const userData = await loadUserDetailData(client, id, account);
    const displayName =
      userData.profile?.display_name || userData.email || 'User';
    const title = `Edit ${displayName} - User Management`;

    return {
      title,
    };
  } catch {
    return {
      title: i18n.t('common:editProfile', { defaultValue: 'Edit Profile' }),
    };
  }
};

async function EditUserProfilePage({ params }: EditUserProfilePageProps) {
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  const userData = await loadUserDetailData(client, id, account);

  const displayName =
    userData.profile?.display_name || userData.email || 'User';

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={`Edit ${displayName}`}
        description={<AppBreadcrumbs />}
        account={account}
      />

      <PageBody>
        <BackToUsersButton accountSlug={account} />
        <div className="mx-auto max-w-2xl">
          <EditUserProfileForm
            userId={id}
            profile={userData.profile}
            accountSlug={account}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(EditUserProfilePage);
