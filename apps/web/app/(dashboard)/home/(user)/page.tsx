import { use } from 'react';

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';
import { Plus } from 'lucide-react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { NewTaskDialog } from '~/(dashboard)/home/(user)/_components/new-task-dialog';
import { TasksTable } from '~/(dashboard)/home/(user)/_components/tasks-table';
import { loadUserWorkspace } from '~/(dashboard)/home/_lib/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { UserAccountHeader } from './_components/user-account-header';

interface SearchParams {
  page?: string;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

function UserHomePage(props: { searchParams: SearchParams }) {
  const client = getSupabaseServerComponentClient();
  const { user } = use(loadUserWorkspace());
  const page = parseInt(props.searchParams.page ?? '1', 10);

  return (
    <>
      <UserAccountHeader
        title={<Trans i18nKey={'common:homeTabLabel'} defaults={'Home'} />}
        description={
          <Trans
            i18nKey={'common:homeTabDescription'}
            defaults={'Welcome to your Home Page'}
          />
        }
      />

      <PageBody className={'space-y-4'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Heading level={4}>Tasks</Heading>
          </div>

          <div>
            <NewTaskDialog />
          </div>
        </div>

        <ServerDataLoader
          client={client}
          table={'tasks'}
          page={page}
          where={{
            account_id: {
              eq: user.id,
            },
          }}
        >
          {(props) => <TasksTable {...props} />}
        </ServerDataLoader>
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
