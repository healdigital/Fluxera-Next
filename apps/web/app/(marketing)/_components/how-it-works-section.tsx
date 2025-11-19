import { BarChart3, CheckCircle2, Settings, Upload } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: 'Importez vos données',
      description:
        'Importez facilement vos actifs existants via CSV ou connectez vos outils actuels.',
      step: '01',
    },
    {
      icon: Settings,
      title: 'Configurez votre espace',
      description:
        'Personnalisez les catégories, les workflows et les alertes selon vos besoins.',
      step: '02',
    },
    {
      icon: BarChart3,
      title: 'Suivez en temps réel',
      description:
        'Visualisez vos KPIs, recevez des alertes et prenez des décisions éclairées.',
      step: '03',
    },
    {
      icon: CheckCircle2,
      title: 'Optimisez continuellement',
      description:
        'Analysez les rapports et optimisez vos coûts IT mois après mois.',
      step: '04',
    },
  ];

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Comment ça marche
          </span>
          <h2 className="mt-2 mb-4 text-4xl font-bold">
            Démarrez en 4 étapes simples
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            De l&apos;import de vos données à l&apos;optimisation continue, nous
            vous accompagnons
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="from-primary/50 absolute top-12 left-full z-0 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r to-transparent lg:block" />
              )}

              <div className="bg-card relative z-10 rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex items-start gap-4">
                  <div className="bg-primary/10 inline-flex flex-shrink-0 rounded-lg p-3">
                    <step.icon className="text-primary h-6 w-6" />
                  </div>
                  <div className="text-primary/20 text-4xl font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Besoin d&apos;aide pour démarrer ?
          </p>
          <a
            href="/contact"
            className="text-primary font-semibold hover:underline"
          >
            Contactez notre équipe →
          </a>
        </div>
      </div>
    </section>
  );
}
