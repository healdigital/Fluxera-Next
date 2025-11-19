import Image from 'next/image';

import { Clock, Shield, TrendingDown, Zap } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingDown,
      title: 'Réduisez vos coûts IT de 30%',
      description:
        'Optimisez vos dépenses en identifiant les licences inutilisées et en planifiant vos renouvellements.',
      stats: '30% d&apos;économies',
    },
    {
      icon: Clock,
      title: 'Gagnez 10h par semaine',
      description:
        'Automatisez les tâches répétitives et centralisez toutes vos informations IT en un seul endroit.',
      stats: '10h économisées',
    },
    {
      icon: Shield,
      title: 'Conformité garantie',
      description:
        'Assurez la conformité de vos licences et respectez les réglementations en vigueur.',
      stats: '100% conforme',
    },
    {
      icon: Zap,
      title: 'Déploiement en 24h',
      description:
        'Mise en place rapide et intuitive. Commencez à gérer vos actifs dès le premier jour.',
      stats: '24h setup',
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side - Benefits */}
          <div>
            <div className="mb-8">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                Avantages
              </span>
              <h2 className="mt-2 mb-4 text-4xl font-bold">
                Pourquoi choisir Fluxera ?
              </h2>
              <p className="text-muted-foreground text-xl">
                Une solution qui s&apos;adapte à vos besoins et fait grandir
                votre entreprise
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="hover:bg-muted/50 flex gap-4 rounded-lg p-4 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 inline-flex rounded-lg p-3">
                      <benefit.icon className="text-primary h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{benefit.title}</h3>
                      <span className="text-primary text-sm font-bold">
                        {benefit.stats}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border shadow-2xl">
              <Image
                src="/images/dashboard.webp"
                alt="Fluxera Benefits"
                width={800}
                height={600}
                className="h-auto w-full"
              />
              <div className="from-primary/20 absolute inset-0 bg-gradient-to-tr to-transparent" />
            </div>

            {/* Floating cards */}
            <div className="bg-card absolute -top-6 -right-6 rounded-lg border p-4 shadow-lg">
              <div className="text-muted-foreground text-sm">
                Économies réalisées
              </div>
              <div className="text-2xl font-bold text-green-500">+€45,000</div>
            </div>

            <div className="bg-card absolute -bottom-6 -left-6 rounded-lg border p-4 shadow-lg">
              <div className="text-muted-foreground text-sm">Actifs gérés</div>
              <div className="text-2xl font-bold text-blue-500">1,247</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
