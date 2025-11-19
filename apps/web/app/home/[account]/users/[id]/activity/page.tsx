import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';

import { TeamAccountLayoutPageHeader } from '~/home/[account]/_components/team-account-layout-page-header';
import { BackToUsersButton } from '~/home/[account]/users/_components/back-to-users-button';
import { UserActivityList } from '~/home/[account]/users/_components/user-activity-list';
import { loadUserActivity } from '~/home/[account]/users/_lib/server/user-activity.loader';
import { loadUserDetailData } from '~/home/[account]/users/_lib/server/user-detail.loader';
import { withI18n } from '~/lib/i18n/with-i18n';

interface UserActivityPageProps {
  params: Promise<{
    account: string;
    id: string;
  }>;
  searchParams: Promise<{
    action_type?: string;
    start_date?: string;
    end_date?: string;
    page?: string;
  }>;
}

function UserActivityPage(props: UserActivityPageProps) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);

  const client = getSupabaseServerClient();
  const accountSlug = params.account;
  const userId = params.id;

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const [userDetail, activities] = use(
    Promise.all([
      loadUserDetailData(client, userId, accountSlug),
      loadUserActivity(client, {
        userId,
        accountSlug,
        actionType: searchParams.action_type,
        startDate: searchParams.start_date,
        endDate: searchParams.end_date,
        limit,
        offset,
      }),
    ]),
  );

  const displayName = userDetail.profile?.display_name || userDetail.email;

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={`Activity Log - ${displayName}`}
        description={<AppBreadcrumbs />}
        account={accountSlug}
      />

      <PageBody>
        <BackToUsersButton accountSlug={accountSlug} />
        <div className="space-y-6">
          <UserActivityList
            activities={activities}
            userId={userId}
            accountSlug={accountSlug}
            currentPage={page}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UserActivityPage);

export async function generateMetadata(props: UserActivityPageProps) {
  const params = await props.params;
  const client = getSupabaseServerClient();

  try {
    const userDetail = await loadUserDetailData(
      client,
      params.id,
      params.account,
    );

    const displayName = userDetail.profile?.display_name || userDetail.email;

    return {
      title: `Activity Log - ${displayName}`,
    };
  } catch {
    return {
      title: 'Activity Log',
    };
  }
}
