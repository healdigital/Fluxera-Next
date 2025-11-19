import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { BackToLicensesButton } from '../_components/back-to-licenses-button';
import { CreateLicenseForm } from '../_components/create-license-form';

interface NewLicensePageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('licenses:createLicensePageTitle');

  return {
    title,
  };
};

async function NewLicensePage({ params }: NewLicensePageProps) {
  const slug = (await params).account;

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'licenses:createLicense'} />}
        description={<AppBreadcrumbs />}
        account={slug}
      />

      <PageBody>
        <BackToLicensesButton accountSlug={slug} />
        <div className="mx-auto max-w-2xl">
          <CreateLicenseForm accountSlug={slug} />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(NewLicensePage);
