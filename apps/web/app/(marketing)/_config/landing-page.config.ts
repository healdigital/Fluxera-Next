/**
 * Configuration de la landing page Fluxera
 * Centralisez ici tous les textes et paramètres pour faciliter les modifications
 */

export const landingPageConfig = {
  hero: {
    pill: {
      label: 'Nouveau',
      text: 'La solution complète de gestion IT pour votre entreprise',
    },
    title: {
      line1: 'Gérez vos actifs IT,',
      line2: 'licences et utilisateurs',
      highlight: 'en toute simplicité',
    },
    subtitle:
      'Fluxera centralise la gestion de vos ressources informatiques dans une plateforme intuitive. Suivez vos actifs, gérez vos licences logicielles et optimisez vos coûts IT en temps réel.',
    cta: {
      primary: 'Commencer gratuitement',
      secondary: 'Demander une démo',
    },
    image: {
      src: '/images/dashboard.webp',
      alt: 'Fluxera Dashboard',
    },
  },

  stats: [
    { value: '500+', label: 'Entreprises nous font confiance' },
    { value: '50K+', label: 'Actifs IT gérés' },
    { value: '99.9%', label: 'Disponibilité garantie' },
    { value: '24/7', label: 'Support client' },
  ],

  features: {
    title: 'Toutes les fonctionnalités dont vous avez besoin',
    subtitle:
      "Une plateforme complète pour gérer l'ensemble de votre infrastructure IT",
    items: [
      {
        title: 'Gestion des Actifs',
        description:
          'Suivez tous vos équipements IT : ordinateurs, serveurs, périphériques. Historique complet et maintenance préventive.',
        color: 'blue',
      },
      {
        title: 'Licences Logicielles',
        description:
          'Centralisez vos licences, suivez les expirations et optimisez vos coûts. Alertes automatiques avant expiration.',
        color: 'purple',
      },
      {
        title: 'Gestion des Utilisateurs',
        description:
          "Gérez les accès, rôles et permissions. Suivez l'activité et les ressources assignées à chaque utilisateur.",
        color: 'green',
      },
      {
        title: 'Tableaux de Bord',
        description:
          'Visualisez vos KPIs en temps réel. Dashboards personnalisables avec métriques et graphiques interactifs.',
        color: 'orange',
      },
      {
        title: 'Alertes Intelligentes',
        description:
          'Notifications automatiques pour les expirations, maintenances et événements critiques de votre infrastructure.',
        color: 'red',
      },
      {
        title: 'Sécurité & Conformité',
        description:
          "Contrôle d'accès granulaire, audit trail complet et conformité RGPD. Vos données sont protégées.",
        color: 'indigo',
      },
      {
        title: 'Automatisation',
        description:
          'Automatisez les tâches répétitives : assignations, renouvellements, rapports. Gagnez du temps précieux.',
        color: 'yellow',
      },
      {
        title: 'Historique Complet',
        description:
          "Traçabilité totale de toutes les opérations. Consultez l'historique des modifications et des assignations.",
        color: 'cyan',
      },
    ],
  },

  benefits: {
    title: 'Pourquoi choisir Fluxera ?',
    subtitle:
      "Une solution qui s'adapte à vos besoins et fait grandir votre entreprise",
    items: [
      {
        title: 'Réduisez vos coûts IT de 30%',
        description:
          'Optimisez vos dépenses en identifiant les licences inutilisées et en planifiant vos renouvellements.',
        stats: "30% d'économies",
      },
      {
        title: 'Gagnez 10h par semaine',
        description:
          'Automatisez les tâches répétitives et centralisez toutes vos informations IT en un seul endroit.',
        stats: '10h économisées',
      },
      {
        title: 'Conformité garantie',
        description:
          'Assurez la conformité de vos licences et respectez les réglementations en vigueur.',
        stats: '100% conforme',
      },
      {
        title: 'Déploiement en 24h',
        description:
          'Mise en place rapide et intuitive. Commencez à gérer vos actifs dès le premier jour.',
        stats: '24h setup',
      },
    ],
  },

  howItWorks: {
    title: 'Démarrez en 4 étapes simples',
    subtitle:
      "De l'import de vos données à l'optimisation continue, nous vous accompagnons",
    steps: [
      {
        title: 'Importez vos données',
        description:
          'Importez facilement vos actifs existants via CSV ou connectez vos outils actuels.',
      },
      {
        title: 'Configurez votre espace',
        description:
          'Personnalisez les catégories, les workflows et les alertes selon vos besoins.',
      },
      {
        title: 'Suivez en temps réel',
        description:
          'Visualisez vos KPIs, recevez des alertes et prenez des décisions éclairées.',
      },
      {
        title: 'Optimisez continuellement',
        description:
          'Analysez les rapports et optimisez vos coûts IT mois après mois.',
      },
    ],
  },

  testimonials: {
    title: 'Ce que disent nos clients',
    subtitle:
      "Rejoignez des centaines d'entreprises qui optimisent leur gestion IT avec Fluxera",
    items: [
      {
        name: 'Sophie Martin',
        role: 'DSI, TechCorp',
        company: 'TechCorp',
        content:
          'Fluxera a transformé notre gestion IT. Nous avons réduit nos coûts de licences de 35% en identifiant les doublons et les licences inutilisées.',
        rating: 5,
      },
      {
        name: 'Thomas Dubois',
        role: 'Responsable IT, InnovateLab',
        company: 'InnovateLab',
        content:
          "L'interface est intuitive et les tableaux de bord nous donnent une visibilité complète sur notre parc informatique. Un gain de temps considérable.",
        rating: 5,
      },
      {
        name: 'Marie Lefebvre',
        role: 'CTO, DataFlow',
        company: 'DataFlow',
        content:
          'Les alertes automatiques nous ont évité plusieurs expirations de licences critiques. Le ROI a été immédiat dès le premier mois.',
        rating: 5,
      },
      {
        name: 'Pierre Rousseau',
        role: 'IT Manager, CloudSystems',
        company: 'CloudSystems',
        content:
          "Excellent support client et fonctionnalités complètes. Fluxera s'est parfaitement intégré à notre workflow existant.",
        rating: 5,
      },
      {
        name: 'Julie Bernard',
        role: 'Directrice Financière, FinTech Solutions',
        company: 'FinTech Solutions',
        content:
          "La visibilité sur nos coûts IT nous permet de mieux budgétiser et d'optimiser nos investissements technologiques.",
        rating: 5,
      },
      {
        name: 'Alexandre Petit',
        role: 'Responsable Infrastructure, SecureNet',
        company: 'SecureNet',
        content:
          "La gestion des actifs n'a jamais été aussi simple. Nous avons une traçabilité complète de tous nos équipements.",
        rating: 5,
      },
    ],
    companies: [
      'TechCorp',
      'InnovateLab',
      'DataFlow',
      'CloudSystems',
      'FinTech Solutions',
      'SecureNet',
    ],
  },

  pricing: {
    pill: 'Essai gratuit',
    pillSubtext: 'Aucune carte bancaire requise',
    title: 'Des tarifs adaptés à toutes les entreprises',
    subtitle: 'Commencez gratuitement et évoluez selon vos besoins',
  },

  finalCta: {
    title: 'Prêt à optimiser votre gestion IT ?',
    subtitle:
      "Rejoignez des centaines d'entreprises qui ont déjà simplifié leur gestion IT avec Fluxera",
    features: [
      'Essai gratuit de 14 jours',
      'Aucune carte bancaire requise',
      'Configuration en moins de 5 minutes',
      'Support client dédié',
    ],
    cta: {
      primary: 'Commencer gratuitement',
      secondary: 'Parler à un expert',
    },
    trustIndicator:
      'Plus de 500 entreprises nous font confiance • Note moyenne 4.9/5',
  },

  contact: {
    email: 'contact@fluxera.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées, 75008 Paris, France',
    hours: 'Lun - Ven: 9h00 - 18h00',
    social: {
      twitter: 'https://twitter.com/fluxera',
      linkedin: 'https://linkedin.com/company/fluxera',
      github: 'https://github.com/fluxera',
    },
  },
} as const;

export type LandingPageConfig = typeof landingPageConfig;
