# Guide de Configuration - Fluxera

Ce guide vous aide à configurer votre application Fluxera basée sur Makerkit.

## 📋 Table des matières

1. [Configuration de l'application](#1-configuration-de-lapplication)
2. [Configuration de l'authentification](#2-configuration-de-lauthentification)
3. [Configuration des feature flags](#3-configuration-des-feature-flags)
4. [Configuration de Supabase](#4-configuration-de-supabase)
5. [Configuration de Stripe (Paiements)](#5-configuration-de-stripe)
6. [Configuration des chemins](#6-configuration-des-chemins)
7. [Configuration de la navigation](#7-configuration-de-la-navigation)

---

## 1. Configuration de l'application

**Fichier**: `apps/web/.env.local` et `apps/web/.env`

### Variables principales :

```env
# Nom de votre application
NEXT_PUBLIC_PRODUCT_NAME=Fluxera

# Titre de la page (SEO)
NEXT_PUBLIC_SITE_TITLE="Fluxera - Votre application SaaS"

# Description (SEO)
NEXT_PUBLIC_SITE_DESCRIPTION="Description de votre application Fluxera"

# URL du site (important pour la production)
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Thème par défaut (light, dark, system)
NEXT_PUBLIC_DEFAULT_THEME_MODE=light

# Couleurs du thème
NEXT_PUBLIC_THEME_COLOR="#ffffff"
NEXT_PUBLIC_THEME_COLOR_DARK="#0a0a0a"
```

**Fichier de configuration**: `apps/web/config/app.config.ts`

---

## 2. Configuration de l'authentification

**Fichier**: `apps/web/.env.local`

### Méthodes d'authentification :

```env
# Authentification par mot de passe
NEXT_PUBLIC_AUTH_PASSWORD=true

# Authentification par lien magique (email)
NEXT_PUBLIC_AUTH_MAGIC_LINK=false

# Authentification par OTP
NEXT_PUBLIC_AUTH_OTP=false

# Afficher la case à cocher des conditions d'utilisation
NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX=false

# Activer la liaison d'identités (OAuth)
NEXT_PUBLIC_AUTH_IDENTITY_LINKING=false

# Clé reCAPTCHA (optionnel)
NEXT_PUBLIC_CAPTCHA_SITE_KEY=
```

### Providers OAuth :

**Fichier**: `apps/web/config/auth.config.ts`

Modifiez la ligne `oAuth` pour activer les providers :

```typescript
oAuth: ['google', 'github', 'facebook'],
```

Providers disponibles : apple, azure, bitbucket, discord, facebook, figma, github, gitlab, google, kakao, keycloak, linkedin, notion, slack, spotify, twitch, twitter, workos, zoom

---

## 3. Configuration des Feature Flags

**Fichier**: `apps/web/.env.local`

```env
# Activer le changement de thème
NEXT_PUBLIC_ENABLE_THEME_TOGGLE=true

# Activer la suppression de compte personnel
NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION=true

# Activer la facturation pour les comptes personnels
NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_BILLING=true

# Activer les comptes d'équipe
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS=true

# Activer la création d'équipes
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION=true

# Activer la suppression d'équipes
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION=true

# Activer la facturation pour les équipes
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_BILLING=true

# Priorité de langue (user ou application)
NEXT_PUBLIC_LANGUAGE_PRIORITY=application

# Activer les notifications
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Notifications en temps réel
NEXT_PUBLIC_REALTIME_NOTIFICATIONS=false

# Activer le vérificateur de version
NEXT_PUBLIC_ENABLE_VERSION_UPDATER=false
```

**Fichier de configuration**: `apps/web/config/feature-flags.config.ts`

---

## 4. Configuration de Supabase

### Option A : Supabase Local (Développement)

**Fichier**: `apps/web/.env.development`

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Pour démarrer Supabase local :
```bash
pnpm supabase:web:start
```

### Option B : Supabase Cloud (Production)

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez vos clés dans Settings > API
3. Ajoutez-les dans `apps/web/.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

---

## 5. Configuration de Stripe

**Fichier**: `apps/web/.env.local`

```env
# Clé publique Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Clé secrète Stripe (NE PAS COMMITER)
STRIPE_SECRET_KEY=sk_test_...

# Secret du webhook Stripe
STRIPE_WEBHOOK_SECRET=whsec_...
```

Pour tester les webhooks en local :
```bash
pnpm stripe:listen
```

**Fichier de configuration**: `apps/web/config/billing.config.ts`

---

## 6. Configuration des chemins

**Fichier**: `apps/web/config/paths.config.ts`

Modifiez les chemins de votre application :

```typescript
const pathsConfig = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    // ...
  },
  app: {
    home: '/home',
    accountSettings: '/home/[account]/settings',
    // ...
  },
};
```

---

## 7. Configuration de la navigation

### Navigation du compte personnel

**Fichier**: `apps/web/config/personal-account-navigation.config.tsx`

Ajoutez ou modifiez les routes de navigation :

```typescript
const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.home',
        path: pathsConfig.app.home,
        Icon: <Home className={iconClasses} />,
      },
      // Ajoutez vos routes ici
    ],
  },
];
```

### Navigation des équipes

**Fichier**: `apps/web/config/team-account-navigation.config.tsx`

---

## 🚀 Commandes utiles

```bash
# Démarrer le serveur de développement
pnpm dev

# Démarrer Supabase local
pnpm supabase:web:start

# Arrêter Supabase local
pnpm supabase:web:stop

# Générer les types TypeScript depuis Supabase
pnpm supabase:web:typegen

# Réinitialiser la base de données Supabase
pnpm supabase:web:reset

# Écouter les webhooks Stripe
pnpm stripe:listen

# Build de production
pnpm build

# Linter
pnpm lint

# Tests
pnpm test
```

---

## 📚 Ressources

- [Documentation Makerkit](https://makerkit.dev/docs/next-supabase-turbo)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Stripe](https://stripe.com/docs)

---

## ⚠️ Notes importantes

1. **Ne jamais commiter** les fichiers `.env.local` ou `.env.production` avec des clés secrètes
2. Utilisez des clés de **test** en développement
3. Configurez les **variables d'environnement** sur votre plateforme de déploiement
4. Activez **HTTPS** en production (requis pour `NEXT_PUBLIC_SITE_URL`)
5. Configurez les **URL de redirection** dans Supabase pour l'authentification
