import {
  BarChart3,
  Bell,
  Clock,
  Key,
  Package,
  Shield,
  Users,
  Zap,
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: 'Gestion des Actifs',
      description:
        'Suivez tous vos équipements IT : ordinateurs, serveurs, périphériques. Historique complet et maintenance préventive.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Key,
      title: 'Licences Logicielles',
      description:
        'Centralisez vos licences, suivez les expirations et optimisez vos coûts. Alertes automatiques avant expiration.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Users,
      title: 'Gestion des Utilisateurs',
      description:
        'Gérez les accès, rôles et permissions. Suivez l&apos;activité et les ressources assignées à chaque utilisateur.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: BarChart3,
      title: 'Tableaux de Bord',
      description:
        'Visualisez vos KPIs en temps réel. Dashboards personnalisables avec métriques et graphiques interactifs.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Bell,
      title: 'Alertes Intelligentes',
      description:
        'Notifications automatiques pour les expirations, maintenances et événements critiques de votre infrastructure.',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: Shield,
      title: 'Sécurité & Conformité',
      description:
        "Contrôle d'accès granulaire, audit trail complet et conformité RGPD. Vos données sont protégées.",
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      icon: Zap,
      title: 'Automatisation',
      description:
        'Automatisez les tâches répétitives : assignations, renouvellements, rapports. Gagnez du temps précieux.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Clock,
      title: 'Historique Complet',
      description:
        "Traçabilité totale de toutes les opérations. Consultez l'historique des modifications et des assignations.",
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Toutes les fonctionnalités dont vous avez besoin
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Une plateforme complète pour gérer l&apos;ensemble de votre
            infrastructure IT
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card relative rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`inline-flex rounded-lg p-3 ${feature.bgColor} mb-4`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
