import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { UsersList } from './_components/users-list';
import {
  type UserFilters,
  loadUsersPageData,
} from './_lib/server/users-page.loader';

interface UsersPageProps {
  params: Promise<{ account: string }>;
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('users:pageTitle');

  return {
    title,
  };
};

async function UsersPage({ params, searchParams }: UsersPageProps) {
  const client = getSupabaseServerClient();
  const slug = (await params).account;
  const filters = await searchParams;

  // Parse filters from URL search params
  const parsedFilters: UserFilters = {
    search: filters.search,
    role: filters.role,
    status: filters.status,
    page: filters.page ? parseInt(filters.page, 10) : 1,
    pageSize: filters.pageSize ? parseInt(filters.pageSize, 10) : 50,
  };

  const [paginatedUsers, workspace] = await loadUsersPageData(
    client,
    slug,
    parsedFilters,
  );

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.users'} />}
        description={<AppBreadcrumbs />}
        account={workspace.account.slug}
      />

      <PageBody>
        <UsersList
          users={paginatedUsers.users}
          accountSlug={workspace.account.slug}
          pagination={{
            currentPage: paginatedUsers.page,
            totalPages: paginatedUsers.totalPages,
            totalCount: paginatedUsers.totalCount,
            pageSize: paginatedUsers.pageSize,
          }}
        />
      </PageBody>
    </>
  );
}

export default withI18n(UsersPage);
