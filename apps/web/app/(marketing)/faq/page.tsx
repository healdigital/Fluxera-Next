import Link from 'next/link';

import { ArrowRight, ChevronDown } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:faq'),
  };
};

async function FAQPage() {
  const { t } = await createI18nServerInstance();

  const faqItems = [
    {
      question: `Qu'est-ce que Fluxera ?`,
      answer: `Fluxera est une plateforme complète de gestion IT qui vous permet de gérer vos actifs informatiques, licences logicielles et utilisateurs depuis une interface unique et intuitive.`,
    },
    {
      question: `Proposez-vous un essai gratuit ?`,
      answer: `Oui, nous offrons un essai gratuit de 14 jours sans engagement. Aucune carte bancaire n'est requise pour commencer.`,
    },
    {
      question: `Comment importer mes données existantes ?`,
      answer: `Vous pouvez importer vos données via fichier CSV ou connecter vos outils existants. Notre équipe peut également vous accompagner dans la migration de vos données.`,
    },
    {
      question: `Mes données sont-elles sécurisées ?`,
      answer: `Absolument. Nous utilisons un chiffrement de niveau bancaire, des sauvegardes quotidiennes et sommes conformes RGPD. Vos données sont hébergées en Europe.`,
    },
    {
      question: `Puis-je personnaliser les tableaux de bord ?`,
      answer: `Oui, tous les tableaux de bord sont entièrement personnalisables. Vous pouvez choisir les widgets à afficher et leur disposition selon vos besoins.`,
    },
    {
      question: `Quel support proposez-vous ?`,
      answer: `Nous offrons un support par email, chat et téléphone. Les plans Pro et Enterprise bénéficient d'un support prioritaire 24/7.`,
    },
    {
      question: `Puis-je changer de plan à tout moment ?`,
      answer: `Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis vos paramètres de compte. Les changements sont effectifs immédiatement.`,
    },
    {
      question: `Combien d'utilisateurs puis-je ajouter ?`,
      answer: `Le nombre d'utilisateurs dépend de votre plan. Le plan Starter permet jusqu'à 10 utilisateurs, Pro jusqu'à 50, et Enterprise est illimité.`,
    },
    {
      question: `Proposez-vous des intégrations ?`,
      answer: `Oui, Fluxera s'intègre avec de nombreux outils : Active Directory, Google Workspace, Slack, Microsoft Teams, et bien d'autres via notre API.`,
    },
    {
      question: `Comment fonctionne la facturation ?`,
      answer: `La facturation est mensuelle ou annuelle (avec 20% de réduction). Vous pouvez consulter et télécharger vos factures depuis votre espace client.`,
    },
    {
      question: `Puis-je exporter mes données ?`,
      answer: `Oui, vous pouvez exporter toutes vos données à tout moment au format CSV ou Excel. Vous gardez le contrôle total de vos informations.`,
    },
    {
      question: `Offrez-vous des réductions pour les associations ?`,
      answer: `Oui, nous offrons une réduction de 50% pour les associations et organisations à but non lucratif. Contactez-nous pour en savoir plus.`,
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      };
    }),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('marketing:faq')}
          subtitle={t('marketing:faqSubtitle')}
        />

        <div className={'container flex flex-col items-center space-y-8 pb-16'}>
          <div className="divide-border flex w-full max-w-xl flex-col divide-y divide-dashed rounded-md border">
            {faqItems.map((item, index) => {
              return <FaqItem key={index} item={item} />;
            })}
          </div>

          <div>
            <Button asChild variant={'outline'}>
              <Link href={'/contact'}>
                <span>
                  <Trans i18nKey={'marketing:contactFaq'} />
                </span>

                <ArrowRight className={'ml-2 w-4'} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default withI18n(FAQPage);

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details
      className={
        'hover:bg-muted/70 [&:open]:bg-muted/70 [&:open]:hover:bg-muted transition-all'
      }
    >
      <summary
        className={'flex items-center justify-between p-4 hover:cursor-pointer'}
      >
        <h2 className={'cursor-pointer font-sans text-base'}>
          <Trans i18nKey={item.question} defaults={item.question} />
        </h2>

        <div>
          <ChevronDown
            className={'h-5 transition duration-300 group-open:-rotate-180'}
          />
        </div>
      </summary>

      <div className={'text-muted-foreground flex flex-col gap-y-2 px-4 pb-2'}>
        <Trans i18nKey={item.answer} defaults={item.answer} />
      </div>
    </details>
  );
}
