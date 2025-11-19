# Guide de Personnalisation de la Landing Page

## Introduction

Ce guide vous explique comment personnaliser facilement la landing page de Fluxera sans toucher au code des composants.

## Configuration Centralisée

Tous les textes et paramètres sont centralisés dans le fichier :
```
apps/web/app/(marketing)/_config/landing-page.config.ts
```

## Sections Personnalisables

### 1. Hero Section

```typescript
hero: {
  pill: {
    label: 'Nouveau',  // Badge en haut
    text: 'Votre texte ici',
  },
  title: {
    line1: 'Première ligne',
    line2: 'Deuxième ligne',
    highlight: 'Texte en surbrillance',  // Avec gradient
  },
  subtitle: 'Description principale...',
  cta: {
    primary: 'Bouton principal',
    secondary: 'Bouton secondaire',
  },
  image: {
    src: '/images/votre-image.webp',
    alt: 'Description de l\'image',
  },
}
```

### 2. Statistiques

```typescript
stats: [
  { value: '500+', label: 'Votre métrique' },
  { value: '50K+', label: 'Autre métrique' },
  // Ajoutez ou supprimez des stats
]
```

### 3. Fonctionnalités

```typescript
features: {
  title: 'Titre de la section',
  subtitle: 'Sous-titre',
  items: [
    {
      title: 'Nom de la fonctionnalité',
      description: 'Description détaillée',
      color: 'blue',  // blue, purple, green, orange, red, indigo, yellow, cyan
    },
    // Ajoutez autant de fonctionnalités que nécessaire
  ]
}
```

### 4. Bénéfices

```typescript
benefits: {
  title: 'Titre',
  subtitle: 'Sous-titre',
  items: [
    {
      title: 'Bénéfice principal',
      description: 'Explication',
      stats: '30%',  // Statistique affichée
    },
  ]
}
```

### 5. Comment ça marche

```typescript
howItWorks: {
  title: 'Titre',
  subtitle: 'Sous-titre',
  steps: [
    {
      title: 'Étape 1',
      description: 'Description de l\'étape',
    },
    // 4 étapes recommandées
  ]
}
```

### 6. Témoignages

```typescript
testimonials: {
  title: 'Titre',
  subtitle: 'Sous-titre',
  items: [
    {
      name: 'Nom du client',
      role: 'Poste, Entreprise',
      company: 'Nom entreprise',
      content: 'Témoignage complet...',
      rating: 5,  // 1 à 5 étoiles
    },
  ],
  companies: ['Logo1', 'Logo2'],  // Noms affichés en bas
}
```

### 7. CTA Final

```typescript
finalCta: {
  title: 'Titre accrocheur',
  subtitle: 'Sous-titre',
  features: [
    'Avantage 1',
    'Avantage 2',
    // Liste des avantages
  ],
  cta: {
    primary: 'Bouton principal',
    secondary: 'Bouton secondaire',
  },
  trustIndicator: 'Texte de confiance',
}
```

### 8. Contact

```typescript
contact: {
  email: 'votre@email.com',
  phone: '+33 X XX XX XX XX',
  address: 'Votre adresse',
  hours: 'Horaires d\'ouverture',
  social: {
    twitter: 'https://twitter.com/...',
    linkedin: 'https://linkedin.com/...',
    github: 'https://github.com/...',
  },
}
```

## Personnalisation des Images

### Remplacer l'image du dashboard

1. Placez votre image dans `apps/web/public/images/`
2. Mettez à jour le chemin dans la config :

```typescript
hero: {
  image: {
    src: '/images/votre-nouvelle-image.webp',
    alt: 'Description',
  },
}
```

### Formats recommandés

- **Format** : WebP (meilleure compression)
- **Résolution** : 3558x2222px (ratio 16:10)
- **Poids** : < 500KB
- **Fallback** : PNG ou JPEG

## Personnalisation des Couleurs

Les couleurs sont gérées par le système de thème Tailwind. Pour modifier :

### Couleurs des icônes de fonctionnalités

Dans `features-section.tsx`, les couleurs disponibles sont :
- `blue` - Bleu
- `purple` - Violet
- `green` - Vert
- `orange` - Orange
- `red` - Rouge
- `indigo` - Indigo
- `yellow` - Jaune
- `cyan` - Cyan

### Modifier le thème global

Éditez `apps/web/tailwind.config.js` pour changer les couleurs primaires.

## Traductions i18n

Pour ajouter le support multilingue :

1. Créez les fichiers de traduction dans `apps/web/public/locales/`
2. Remplacez les textes en dur par des clés i18n :

```typescript
// Avant
title: 'Mon titre'

// Après
title: t('landing:hero.title')
```

3. Ajoutez les traductions dans les fichiers JSON :

```json
{
  "landing": {
    "hero": {
      "title": "Mon titre"
    }
  }
}
```

## Optimisation SEO

### Metadata

Ajoutez les metadata dans `apps/web/app/(marketing)/page.tsx` :

```typescript
export const metadata = {
  title: 'Fluxera - Gestion IT simplifiée',
  description: 'Votre description SEO...',
  keywords: ['gestion IT', 'actifs', 'licences'],
  openGraph: {
    title: 'Fluxera',
    description: 'Description pour les réseaux sociaux',
    images: ['/images/og-image.jpg'],
  },
};
```

### Structured Data

Le structured data est déjà configuré pour la FAQ. Pour ajouter d'autres types :

```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fluxera',
  url: 'https://fluxera.com',
  logo: 'https://fluxera.com/logo.png',
};
```

## Ajout de Nouvelles Sections

### 1. Créer le composant

```typescript
// apps/web/app/(marketing)/_components/nouvelle-section.tsx
export function NouvelleSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Votre contenu */}
      </div>
    </section>
  );
}
```

### 2. Exporter le composant

Dans `apps/web/app/(marketing)/_components/index.ts` :

```typescript
export { NouvelleSection } from './nouvelle-section';
```

### 3. Ajouter à la page

Dans `apps/web/app/(marketing)/page.tsx` :

```typescript
import { NouvelleSection } from './_components';

// Dans le return
<NouvelleSection />
```

## Animations

### Ajouter Framer Motion

1. Installer la dépendance :
```bash
pnpm add framer-motion
```

2. Utiliser dans un composant :
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Contenu */}
</motion.div>
```

## Tests

### Vérifier les types

```bash
pnpm --filter web typecheck
```

### Linter

```bash
pnpm --filter web lint:fix
```

### Formater

```bash
pnpm --filter web format:fix
```

### Tester en local

```bash
pnpm dev
```

Puis ouvrez `http://localhost:3000`

## Performance

### Optimiser les images

```bash
# Convertir en WebP
cwebp input.png -q 80 -o output.webp
```

### Lazy loading

Les composants lourds peuvent être chargés dynamiquement :

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <div>Chargement...</div>,
});
```

## Checklist de Déploiement

- [ ] Remplacer toutes les images placeholder
- [ ] Mettre à jour les informations de contact
- [ ] Vérifier les liens (CTA, réseaux sociaux)
- [ ] Tester sur mobile, tablette, desktop
- [ ] Vérifier les performances (Lighthouse)
- [ ] Tester l'accessibilité
- [ ] Configurer les metadata SEO
- [ ] Ajouter Google Analytics
- [ ] Tester les formulaires de contact
- [ ] Vérifier les traductions

## Support

Pour toute question sur la personnalisation :
- Documentation : `/docs`
- Email : dev@fluxera.com
- GitHub Issues : https://github.com/fluxera/issues
