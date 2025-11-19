import type { Metadata } from 'next';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { TeamAccountLayoutPageHeader } from '~/home/[account]/_components/team-account-layout-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

import { BackToUsersButton } from '../_components/back-to-users-button';
import { InviteUserForm } from '../_components/invite-user-form';

interface InviteUserPageProps {
  params: Promise<{
    account: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Invite User',
  description: 'Invite a new user to join your team',
};

async function InviteUserPage({ params }: InviteUserPageProps) {
  const { account: accountSlug } = await params;
  const client = getSupabaseServerClient();

  // Fetch available roles
  const { data: roles, error } = await client
    .from('roles')
    .select('name, hierarchy_level')
    .order('hierarchy_level', { ascending: true });

  if (error) {
    throw new Error('Failed to load roles');
  }

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey="users:inviteUser" />}
        description={<AppBreadcrumbs />}
        account={accountSlug}
      />

      <PageBody>
        <BackToUsersButton accountSlug={accountSlug} />
        <div className="mx-auto max-w-2xl">
          <InviteUserForm
            accountSlug={accountSlug}
            availableRoles={roles || []}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(InviteUserPage);
