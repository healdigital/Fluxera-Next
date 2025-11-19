# 🚀 Démarrage Rapide - Fluxera

## ✅ Installation terminée !

Votre projet Fluxera est installé et configuré. Voici ce qui a été fait :

- ✅ Repository cloné depuis GitHub
- ✅ Dépendances installées (1680 packages)
- ✅ Configuration de base créée
- ✅ Serveur de développement démarré

## 🌐 Accéder à l'application

Votre application est accessible sur : **http://localhost:3001**

## 📋 Prochaines étapes

### 1. Configurer Supabase (Base de données)

Vous avez deux options :

#### Option A : Supabase Local (Recommandé pour débuter)

```bash
# Installer Supabase CLI (si pas déjà fait)
pnpm add -g supabase

# Démarrer Supabase local
pnpm supabase:web:start
```

#### Option B : Supabase Cloud

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans Settings > API
4. Copiez vos clés dans `apps/web/.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

### 2. Configurer Stripe (Paiements) - Optionnel

Si vous voulez tester les fonctionnalités de paiement :

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Allez dans Developers > API keys (mode Test)
3. Ajoutez vos clés dans `apps/web/.env.local` :

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

4. Pour tester les webhooks localement :

```bash
pnpm stripe:listen
```

### 3. Personnaliser votre application

Modifiez les fichiers de configuration dans `apps/web/config/` :

- `app.config.ts` - Configuration générale
- `auth.config.ts` - Méthodes d'authentification
- `feature-flags.config.ts` - Fonctionnalités activées
- `personal-account-navigation.config.tsx` - Navigation
- `team-account-navigation.config.tsx` - Navigation des équipes

### 4. Personnaliser le contenu

Le contenu de votre site se trouve dans :
- `apps/web/content/` - Articles, pages, etc.
- `apps/web/public/locales/` - Traductions

## 🛠️ Commandes utiles

```bash
# Démarrer le serveur de développement
pnpm dev

# Arrêter le serveur (Ctrl+C dans le terminal)

# Build de production
pnpm build

# Lancer les tests
pnpm test

# Vérifier le code (linting)
pnpm lint

# Formater le code
pnpm format:fix

# Vérifier les types TypeScript
pnpm typecheck
```

## 📁 Structure du projet

```
fluxera/
├── apps/
│   ├── web/              # Application principale Next.js
│   │   ├── app/          # Pages et routes (App Router)
│   │   ├── components/   # Composants React
│   │   ├── config/       # Fichiers de configuration
│   │   ├── lib/          # Utilitaires et helpers
│   │   ├── public/       # Fichiers statiques
│   │   └── supabase/     # Migrations et schémas Supabase
│   └── dev-tool/         # Outils de développement
├── packages/             # Packages partagés
└── tooling/              # Configuration et scripts
```

## 🎨 Personnalisation du thème

Les couleurs et le style sont configurés dans :
- `apps/web/styles/` - Fichiers CSS/Tailwind
- Variables d'environnement pour les couleurs du thème

## 📚 Documentation

- [Guide de configuration complet](./CONFIGURATION_FLUXERA.md)
- [Documentation Makerkit](https://makerkit.dev/docs/next-supabase-turbo)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)

## 🆘 Besoin d'aide ?

- Consultez la documentation Makerkit
- Vérifiez les fichiers `.md` dans le projet
- Consultez les exemples dans `apps/web/app/`

## ⚠️ Notes importantes

1. Le fichier `.env.local` contient votre configuration locale
2. Ne commitez JAMAIS les clés secrètes dans Git
3. Utilisez les clés de TEST en développement
4. Configurez les variables d'environnement sur votre plateforme de déploiement

---

**Bon développement avec Fluxera ! 🎉**
