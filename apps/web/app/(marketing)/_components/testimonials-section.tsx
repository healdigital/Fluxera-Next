import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sophie Martin',
      role: 'DSI, TechCorp',
      company: 'TechCorp',
      content:
        'Fluxera a transformé notre gestion IT. Nous avons réduit nos coûts de licences de 35% en identifiant les doublons et les licences inutilisées.',
      rating: 5,
      avatar: 'SM',
    },
    {
      name: 'Thomas Dubois',
      role: 'Responsable IT, InnovateLab',
      company: 'InnovateLab',
      content:
        "L'interface est intuitive et les tableaux de bord nous donnent une visibilité complète sur notre parc informatique. Un gain de temps considérable.",
      rating: 5,
      avatar: 'TD',
    },
    {
      name: 'Marie Lefebvre',
      role: 'CTO, DataFlow',
      company: 'DataFlow',
      content:
        'Les alertes automatiques nous ont évité plusieurs expirations de licences critiques. Le ROI a été immédiat dès le premier mois.',
      rating: 5,
      avatar: 'ML',
    },
    {
      name: 'Pierre Rousseau',
      role: 'IT Manager, CloudSystems',
      company: 'CloudSystems',
      content:
        "Excellent support client et fonctionnalités complètes. Fluxera s'est parfaitement intégré à notre workflow existant.",
      rating: 5,
      avatar: 'PR',
    },
    {
      name: 'Julie Bernard',
      role: 'Directrice Financière, FinTech Solutions',
      company: 'FinTech Solutions',
      content:
        "La visibilité sur nos coûts IT nous permet de mieux budgétiser et d'optimiser nos investissements technologiques.",
      rating: 5,
      avatar: 'JB',
    },
    {
      name: 'Alexandre Petit',
      role: 'Responsable Infrastructure, SecureNet',
      company: 'SecureNet',
      content:
        "La gestion des actifs n'a jamais été aussi simple. Nous avons une traçabilité complète de tous nos équipements.",
      rating: 5,
      avatar: 'AP',
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Témoignages
          </span>
          <h2 className="mt-2 mb-4 text-4xl font-bold">
            Ce que disent nos clients
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Rejoignez des centaines d&apos;entreprises qui optimisent leur
            gestion IT avec Fluxera
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border p-6 transition-all duration-300 hover:shadow-lg"
            >
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 border-t pt-16">
          <div className="mb-8 text-center">
            <p className="text-muted-foreground">Ils nous font confiance</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            <div className="text-2xl font-bold">TechCorp</div>
            <div className="text-2xl font-bold">InnovateLab</div>
            <div className="text-2xl font-bold">DataFlow</div>
            <div className="text-2xl font-bold">CloudSystems</div>
            <div className="text-2xl font-bold">FinTech Solutions</div>
            <div className="text-2xl font-bold">SecureNet</div>
          </div>
        </div>
      </div>
    </section>
  );
}
