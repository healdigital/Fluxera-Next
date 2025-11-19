import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';

import { PricingTable } from '@kit/billing-gateway/marketing';
import {
  CtaButton,
  Hero,
  Pill,
  PillActionButton,
  SecondaryHero,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import {
  BenefitsSection,
  CtaSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
  TestimonialsSection,
} from './_components';

function Home() {
  return (
    <div className={'flex flex-col'}>
      {/* Hero Section */}
      <div className={'mx-auto mt-4 py-14'}>
        <Hero
          pill={
            <Pill label={'Nouveau'}>
              <span>
                La solution complète de gestion IT pour votre entreprise
              </span>
              <PillActionButton asChild>
                <Link href={'/auth/sign-up'}>
                  <ArrowRightIcon className={'h-4 w-4'} />
                </Link>
              </PillActionButton>
            </Pill>
          }
          title={
            <span className="text-secondary-foreground">
              <span className="block">Gérez vos actifs IT,</span>
              <span className="block">licences et utilisateurs</span>
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                en toute simplicité
              </span>
            </span>
          }
          subtitle={
            <span className="text-lg">
              Fluxera centralise la gestion de vos ressources informatiques dans
              une plateforme intuitive. Suivez vos actifs, gérez vos licences
              logicielles et optimisez vos coûts IT en temps réel.
            </span>
          }
          cta={<MainCallToActionButton />}
          image={
            <div className="relative">
              <Image
                priority
                className={
                  'dark:border-primary/10 w-full rounded-lg border border-gray-200 shadow-2xl'
                }
                width={3558}
                height={2222}
                src={`/images/dashboard.webp`}
                alt={`Fluxera Dashboard`}
              />
              <div className="from-background/80 absolute inset-0 rounded-lg bg-gradient-to-t to-transparent" />
            </div>
          }
        />
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <div className={'container mx-auto py-24'}>
        <div className={'flex flex-col items-center justify-center space-y-12'}>
          <SecondaryHero
            pill={
              <Pill label="Essai gratuit">Aucune carte bancaire requise</Pill>
            }
            heading="Des tarifs adaptés à toutes les entreprises"
            subheading="Commencez gratuitement et évoluez selon vos besoins"
          />

          <div className={'w-full'}>
            <PricingTable
              config={billingConfig}
              paths={{
                signUp: pathsConfig.auth.signUp,
                return: pathsConfig.app.home,
              }}
            />
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <CtaSection />
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex flex-col gap-4 sm:flex-row sm:space-x-2.5'}>
      <CtaButton className="h-12 px-8 text-base">
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-2'}>
            <span>
              <Trans
                i18nKey={'common:getStarted'}
                defaults="Commencer gratuitement"
              />
            </span>

            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant={'outline'} className="h-12 px-8 text-base">
        <Link href={'/contact'}>Demander une démo</Link>
      </CtaButton>
    </div>
  );
}
