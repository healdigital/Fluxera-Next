import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../../../_components/team-account-layout-page-header';
import { BackToLicensesButton } from '../../_components/back-to-licenses-button';
import { EditLicenseForm } from '../../_components/edit-license-form';
import { loadLicenseDetailData } from '../../_lib/server/license-detail.loader';

interface EditLicensePageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async ({ params }: EditLicensePageProps) => {
  const i18n = await createI18nServerInstance();
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  try {
    const [license] = await loadLicenseDetailData(client, id, account);
    const title = `${i18n.t('licenses:editLicense')} - ${license.name}`;

    return {
      title,
    };
  } catch {
    return {
      title: i18n.t('licenses:editLicense'),
    };
  }
};

async function EditLicensePage({ params }: EditLicensePageProps) {
  const client = getSupabaseServerClient();
  const { account, id } = await params;

  const [license] = await loadLicenseDetailData(client, id, account);

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={
          <>
            <Trans i18nKey="licenses:editLicense" /> - {license.name}
          </>
        }
        description={<AppBreadcrumbs />}
        account={account}
      />

      <PageBody>
        <BackToLicensesButton accountSlug={account} />
        <div className="mx-auto max-w-2xl">
          <EditLicenseForm accountSlug={account} license={license} />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(EditLicensePage);
