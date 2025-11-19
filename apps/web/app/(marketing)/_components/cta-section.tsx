import Link from 'next/link';

import { ArrowRightIcon, CheckCircle2 } from 'lucide-react';

import { CtaButton } from '@kit/ui/marketing';

export function CtaSection() {
  const features = [
    'Essai gratuit de 14 jours',
    'Aucune carte bancaire requise',
    'Configuration en moins de 5 minutes',
    'Support client dédié',
  ];

  return (
    <section className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-br py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Prêt à optimiser votre gestion IT ?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Rejoignez des centaines d&apos;entreprises qui ont déjà simplifié
            leur gestion IT avec Fluxera
          </p>

          {/* Features list */}
          <div className="mb-10 flex flex-wrap justify-center gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <CtaButton className="bg-background text-foreground hover:bg-background/90 h-12 px-8 text-base">
              <Link href="/auth/sign-up">
                <span className="flex items-center gap-2">
                  <span>Commencer gratuitement</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            </CtaButton>

            <CtaButton
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 text-base"
            >
              <Link href="/contact">Parler à un expert</Link>
            </CtaButton>
          </div>

          {/* Trust indicator */}
          <p className="mt-8 text-sm opacity-75">
            Plus de 500 entreprises nous font confiance • Note moyenne 4.9/5
          </p>
        </div>
      </div>
    </section>
  );
}
