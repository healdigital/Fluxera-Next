import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { ContactForm } from '~/(marketing)/contact/_components/contact-form';
import { ContactInfoSection } from '~/(marketing)/contact/_components/contact-info-section';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:contact'),
  };
}

async function ContactPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`marketing:contact`)}
        subtitle={t(`marketing:contactDescription`)}
      />

      <div className={'container mx-auto py-12'}>
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div
            className={
              'bg-card flex w-full flex-col space-y-4 rounded-lg border p-8'
            }
          >
            <div>
              <Heading level={3}>
                <Trans
                  i18nKey={'marketing:contactHeading'}
                  defaults="Envoyez-nous un message"
                />
              </Heading>

              <p className={'text-muted-foreground'}>
                <Trans
                  i18nKey={'marketing:contactSubheading'}
                  defaults="Remplissez le formulaire et nous vous répondrons dans les 24h"
                />
              </p>
            </div>

            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="flex flex-col justify-center">
            <ContactInfoSection />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(ContactPage);
