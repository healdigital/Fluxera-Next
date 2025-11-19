# 🚀 Quick Start - Landing Page Fluxera

## Démarrage en 3 minutes

### 1. Lancer le serveur (30 secondes)

```bash
pnpm dev
```

### 2. Ouvrir dans le navigateur (10 secondes)

```
http://localhost:3000/
```

### 3. Explorer les pages (2 minutes)

- **Landing** : `http://localhost:3000/`
- **Contact** : `http://localhost:3000/contact`
- **FAQ** : `http://localhost:3000/faq`
- **Pricing** : `http://localhost:3000/pricing`

## ✅ C'est tout !

Votre landing page est maintenant accessible et fonctionnelle.

---

## 🎨 Personnalisation Rapide (5 minutes)

### Modifier les textes

Éditez ce fichier :
```
apps/web/app/(marketing)/_config/landing-page.config.ts
```

Exemple - Changer le titre :
```typescript
hero: {
  title: {
    line1: 'Votre nouveau titre',
    line2: 'Deuxième ligne',
    highlight: 'Texte en surbrillance',
  },
}
```

### Remplacer l'image

1. Placez votre image dans `apps/web/public/images/`
2. Mettez à jour le chemin :

```typescript
hero: {
  image: {
    src: '/images/votre-image.webp',
    alt: 'Description',
  },
}
```

### Modifier les couleurs

Éditez `apps/web/tailwind.config.js` pour changer le thème.

---

## 📱 Tester le Responsive (2 minutes)

### Dans Chrome DevTools

1. Ouvrez DevTools (F12)
2. Cliquez sur l'icône mobile (Ctrl+Shift+M)
3. Testez différentes tailles :
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1280px)

---

## 🔍 Vérifier la Qualité (3 minutes)

### TypeScript

```bash
pnpm --filter web typecheck
```

Résultat attendu : ✅ Aucune erreur dans les fichiers de la landing page

### Linter

```bash
pnpm --filter web lint:fix
```

### Formater

```bash
pnpm --filter web format:fix
```

---

## 📚 Documentation Complète

Pour aller plus loin, consultez :

| Document | Quand l'utiliser |
|----------|------------------|
| `LANDING_PAGE_README.md` | Architecture technique |
| `CUSTOMIZATION_GUIDE.md` | Personnalisation avancée |
| `VISUAL_STRUCTURE.md` | Comprendre le layout |
| `LANDING_PAGE_COMPLETE.md` | Vue d'ensemble complète |

---

## 🎯 Checklist Avant Production

- [ ] Remplacer `/images/dashboard.webp`
- [ ] Mettre à jour les infos de contact
- [ ] Vérifier tous les liens
- [ ] Tester sur mobile
- [ ] Configurer Google Analytics
- [ ] Optimiser les images
- [ ] Tester les formulaires

---

## 💡 Astuces

### Rechargement automatique

Le serveur de développement recharge automatiquement la page quand vous modifiez un fichier.

### Hot Module Replacement

Les modifications CSS sont appliquées instantanément sans recharger la page.

### Erreurs TypeScript

Si vous voyez des erreurs TypeScript, vérifiez :
1. Que tous les imports sont corrects
2. Que les types sont bien définis
3. Lancez `pnpm --filter web typecheck`

---

## 🆘 Problèmes Courants

### Le serveur ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules
pnpm install
pnpm dev
```

### Les images ne s'affichent pas

Vérifiez que les images sont dans `apps/web/public/images/`

### Les styles ne s'appliquent pas

Vérifiez que Tailwind est bien configuré dans `tailwind.config.js`

---

## 📞 Besoin d'aide ?

- 📖 Documentation : Consultez les fichiers README
- 🐛 Bug : Vérifiez les erreurs dans la console
- 💬 Question : Contactez l'équipe dev

---

**Temps total** : ~10 minutes pour démarrer et personnaliser
**Difficulté** : ⭐ Facile

🎉 **Bon développement !**
