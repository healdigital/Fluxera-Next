import {
  Body,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

import { BodyStyle } from '../components/body-style';
import { EmailContent } from '../components/content';
import { CtaButton } from '../components/cta-button';
import { EmailFooter } from '../components/footer';
import { EmailHeader } from '../components/header';
import { EmailHeading } from '../components/heading';
import { EmailWrapper } from '../components/wrapper';
import { initializeEmailI18n } from '../lib/i18n';

interface Props {
  licenseName: string;
  vendor: string;
  expirationDate: string;
  daysUntilExpiry: number;
  licenseDetailUrl: string;
  alertType: '30_day' | '7_day';
  productName: string;
  language?: string;
}

export async function renderLicenseExpirationEmail(props: Props) {
  const namespace = 'license-expiration-email';

  const { t } = await initializeEmailI18n({
    language: props.language,
    namespace,
  });

  const isUrgent = props.alertType === '7_day';
  const urgencyLevel = isUrgent ? 'urgent' : 'warning';

  const previewText = t(`${namespace}:previewText`, {
    licenseName: props.licenseName,
    daysUntilExpiry: props.daysUntilExpiry,
  });

  const subject = t(`${namespace}:subject.${urgencyLevel}`, {
    licenseName: props.licenseName,
    daysUntilExpiry: props.daysUntilExpiry,
  });

  const heading = t(`${namespace}:heading.${urgencyLevel}`);

  const mainText = t(`${namespace}:mainText`, {
    licenseName: props.licenseName,
    vendor: props.vendor,
    daysUntilExpiry: props.daysUntilExpiry,
    expirationDate: props.expirationDate,
  });

  const actionText = t(`${namespace}:actionText`);
  const viewLicense = t(`${namespace}:viewLicense`);
  const renewalReminder = t(`${namespace}:renewalReminder`);
  const contactVendor = t(`${namespace}:contactVendor`, {
    vendor: props.vendor,
  });

  const html = await render(
    <Html>
      <Head>
        <BodyStyle />
      </Head>

      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body>
          <EmailWrapper>
            <EmailHeader>
              <EmailHeading>{heading}</EmailHeading>
            </EmailHeader>

            <EmailContent>
              {isUrgent && (
                <Section className="mb-4 rounded-lg bg-red-50 p-4">
                  <Text className="m-0 text-[14px] font-semibold text-red-800">
                    ⚠️ {t(`${namespace}:urgentNotice`)}
                  </Text>
                </Section>
              )}

              <Text
                className="text-[16px] leading-[24px] text-[#242424]"
                dangerouslySetInnerHTML={{ __html: mainText }}
              />

              <Section className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Text className="m-0 mb-2 text-[14px] font-semibold text-[#242424]">
                  {t(`${namespace}:licenseDetails`)}
                </Text>
                <Text className="m-0 text-[14px] text-[#666666]">
                  <strong>{t(`${namespace}:license`)}:</strong>{' '}
                  {props.licenseName}
                </Text>
                <Text className="m-0 text-[14px] text-[#666666]">
                  <strong>{t(`${namespace}:vendor`)}:</strong> {props.vendor}
                </Text>
                <Text className="m-0 text-[14px] text-[#666666]">
                  <strong>{t(`${namespace}:expiresOn`)}:</strong>{' '}
                  {props.expirationDate}
                </Text>
                <Text className="m-0 text-[14px] text-[#666666]">
                  <strong>{t(`${namespace}:daysRemaining`)}:</strong>{' '}
                  {props.daysUntilExpiry}
                </Text>
              </Section>

              <Text className="text-[16px] leading-[24px] text-[#242424]">
                {actionText}
              </Text>

              <Section className="mt-[32px] mb-[32px] text-center">
                <CtaButton href={props.licenseDetailUrl}>
                  {viewLicense}
                </CtaButton>
              </Section>

              <Text className="text-[14px] leading-[22px] text-[#666666]">
                {renewalReminder}
              </Text>

              <Text className="text-[14px] leading-[22px] text-[#666666]">
                {contactVendor}
              </Text>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="text-[12px] leading-[24px] text-[#666666]">
                {t(`${namespace}:automatedMessage`)}{' '}
                <Link
                  href={props.licenseDetailUrl}
                  className="text-blue-600 no-underline"
                >
                  {t(`${namespace}:viewInDashboard`)}
                </Link>
              </Text>
            </EmailContent>

            <EmailFooter>{props.productName}</EmailFooter>
          </EmailWrapper>
        </Body>
      </Tailwind>
    </Html>,
  );

  return {
    html,
    subject,
  };
}
