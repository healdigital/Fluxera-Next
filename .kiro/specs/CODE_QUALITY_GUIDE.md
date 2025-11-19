# Guide de Qualité du Code

Ce guide explique comment maintenir la qualité du code dans le projet Fluxera.

## Table des Matières

1. [Commandes Rapides](#commandes-rapides)
2. [Vérifications Automatiques](#vérifications-automatiques)
3. [Workflow de Développement](#workflow-de-développement)
4. [CI/CD](#cicd)
5. [Résolution des Problèmes](#résolution-des-problèmes)

## Commandes Rapides

### Vérification Complète

```bash
# Vérifier tout (typecheck + lint + format)
pnpm verify

# Vérifier et corriger automatiquement
pnpm verify:fix
```

### Vérifications Individuelles

```bash
# TypeScript type checking
pnpm typecheck

# ESLint (vérification)
pnpm lint

# ESLint (correction automatique)
pnpm lint:fix

# Prettier (vérification)
pnpm format

# Prettier (correction automatique)
pnpm format:fix
```

### Vérifications Ciblées

```bash
# Vérifier uniquement les packages modifiés
pnpm typecheck  # --affected est déjà inclus
pnpm lint       # --affected est déjà inclus

# Vérifier un package spécifique
pnpm --filter web typecheck
pnpm --filter @kit/ui lint
```

## Vérifications Automatiques

### Script de Vérification

Le script `scripts/verify-code-quality.ts` exécute toutes les vérifications et génère un rapport :

```bash
# Mode vérification (ne modifie rien)
pnpm verify

# Mode correction (corrige automatiquement)
pnpm verify:fix
```

**Sortie du script** :
- ✅ Statut de chaque vérification
- ⚠️  Nombre de warnings
- ❌ Nombre d'erreurs
- 📊 Rapport détaillé sauvegardé dans `.kiro/specs/LAST_VERIFICATION_REPORT.md`

### Rapport Généré

Le script génère automatiquement un rapport Markdown avec :
- Date et heure de la vérification
- Statut global (PASSED/FAILED)
- Durée totale
- Détails par vérification
- Nombre de warnings et erreurs

## Workflow de Développement

### Avant de Commencer

```bash
# S'assurer que tout est à jour
pnpm install

# Vérifier l'état initial
pnpm verify
```

### Pendant le Développement

```bash
# Développement avec hot reload
pnpm dev

# Vérifier régulièrement (dans un autre terminal)
pnpm typecheck
```

### Avant de Commit

```bash
# Corriger automatiquement les problèmes
pnpm verify:fix

# Vérifier que tout est OK
pnpm verify
```

### Avant de Push

```bash
# Vérification complète
pnpm verify

# Si tout est OK, commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push
```

## CI/CD

### GitHub Actions

Le projet utilise GitHub Actions pour vérifier automatiquement :
- TypeScript type checking
- ESLint
- Prettier
- Tests E2E

**Configuration** : `.github/workflows/`

### Hooks Git (Optionnel)

Pour automatiser les vérifications avant chaque commit :

```bash
# Installer husky
pnpm add -D husky

# Initialiser husky
pnpm exec husky init

# Ajouter un pre-commit hook
echo "pnpm verify:fix" > .husky/pre-commit
```

## Résolution des Problèmes

### Erreurs TypeScript

**Symptôme** : `pnpm typecheck` échoue

**Solutions** :
1. Vérifier les imports manquants
2. Vérifier les types incorrects
3. Régénérer les types Supabase : `pnpm supabase:web:typegen`

```bash
# Voir les erreurs détaillées
pnpm --filter web typecheck
```

### Erreurs ESLint

**Symptôme** : `pnpm lint` échoue

**Solutions** :
1. Corriger automatiquement : `pnpm lint:fix`
2. Désactiver une règle localement si nécessaire :
   ```typescript
   // eslint-disable-next-line rule-name
   const code = 'here';
   ```

### Erreurs Prettier

**Symptôme** : `pnpm format` échoue

**Solutions** :
1. Corriger automatiquement : `pnpm format:fix`
2. Vérifier la configuration Prettier : `@kit/prettier-config`

### Cache Corrompu

**Symptôme** : Erreurs inexplicables ou incohérentes

**Solutions** :
```bash
# Nettoyer le cache Turbo
rm -rf .turbo

# Nettoyer le cache ESLint
rm -rf node_modules/.cache/.eslintcache

# Nettoyer le cache Prettier
rm -rf node_modules/.cache/.prettiercache

# Réinstaller les dépendances
rm -rf node_modules
pnpm install
```

### Warnings Non-Bloquants

**Symptôme** : Warnings React Compiler ou Next.js Image

**Solution** : Voir [WARNINGS_RESOLUTION_GUIDE.md](./WARNINGS_RESOLUTION_GUIDE.md)

Ces warnings sont acceptables et documentés. Ils n'empêchent pas le déploiement.

## Bonnes Pratiques

### 1. Vérifier Régulièrement

```bash
# Pendant le développement
pnpm typecheck

# Avant de commit
pnpm verify:fix
```

### 2. Corriger Immédiatement

Ne pas accumuler les erreurs. Corriger au fur et à mesure.

### 3. Comprendre les Warnings

Lire et comprendre les warnings avant de les ignorer. Voir le guide de résolution.

### 4. Utiliser les Outils

```bash
# Auto-fix quand possible
pnpm lint:fix
pnpm format:fix

# Vérifier avant de push
pnpm verify
```

### 5. Documenter les Exceptions

Si vous devez désactiver une règle :
```typescript
// Raison valide pour désactiver cette règle
// eslint-disable-next-line rule-name
const code = 'here';
```

## Configuration

### ESLint

**Fichier** : `.eslintrc.js` (racine et packages)

**Règles personnalisées** :
- React Compiler warnings acceptés
- Next.js Image warnings acceptés pour uploads utilisateurs

### Prettier

**Fichier** : `@kit/prettier-config`

**Configuration** :
- Semi-colons : oui
- Quotes : simples
- Trailing comma : all
- Tab width : 2

### TypeScript

**Fichier** : `tsconfig.json` (racine et packages)

**Configuration** :
- Strict mode : activé
- No implicit any : activé
- ES2022 target

## Métriques de Qualité

### Objectifs

- ✅ 0 erreur TypeScript
- ✅ 0 erreur ESLint
- ✅ 100% formaté avec Prettier
- ⚠️  Warnings acceptables : < 20

### État Actuel

Voir [TYPECHECK_LINT_REPORT.md](./TYPECHECK_LINT_REPORT.md) pour l'état actuel.

**Dernière vérification** :
- TypeScript : ✅ 0 erreur
- ESLint : ✅ 0 erreur, 16 warnings
- Prettier : ✅ 100% formaté

## Ressources

### Documentation

- [TypeScript](https://www.typescriptlang.org/docs/)
- [ESLint](https://eslint.org/docs/latest/)
- [Prettier](https://prettier.io/docs/en/)
- [Turbo](https://turbo.build/repo/docs)

### Guides Internes

- [TYPECHECK_LINT_REPORT.md](./TYPECHECK_LINT_REPORT.md) - Rapport de vérification
- [WARNINGS_RESOLUTION_GUIDE.md](./WARNINGS_RESOLUTION_GUIDE.md) - Guide de résolution des warnings
- [AGENTS.md](../../AGENTS.md) - Guide pour les agents IA

### Scripts

- `scripts/verify-code-quality.ts` - Script de vérification automatique

## Support

### Problèmes Courants

1. **Cache corrompu** : Nettoyer avec `rm -rf .turbo node_modules/.cache`
2. **Types Supabase obsolètes** : Régénérer avec `pnpm supabase:web:typegen`
3. **Dépendances manquantes** : Réinstaller avec `pnpm install`

### Obtenir de l'Aide

1. Consulter ce guide
2. Consulter [WARNINGS_RESOLUTION_GUIDE.md](./WARNINGS_RESOLUTION_GUIDE.md)
3. Vérifier les logs détaillés : `pnpm verify`
4. Consulter la documentation officielle

## Changelog

### 2025-11-19
- ✅ Ajout du script `verify-code-quality.ts`
- ✅ Ajout des commandes `pnpm verify` et `pnpm verify:fix`
- ✅ Documentation complète de la qualité du code
- ✅ Guide de résolution des warnings
