export function StatsSection() {
  const stats = [
    {
      value: '500+',
      label: 'Entreprises nous font confiance',
    },
    {
      value: '50K+',
      label: 'Actifs IT gérés',
    },
    {
      value: '99.9%',
      label: 'Disponibilité garantie',
    },
    {
      value: '24/7',
      label: 'Support client',
    },
  ];

  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-bold md:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm opacity-90 md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
