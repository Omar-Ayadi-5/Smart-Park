# Smart Park — Frontend

Applications web **React** (Vite) pour Smart Park : une interface **publique** (disponibilité du parking) et une interface **admin** (tableau de bord, utilisateurs, contrôle des places). Le code partagé (client HTTP, overlay de chargement) se trouve dans **`shared`**.

## Structure

| Dossier   | Rôle |
|-----------|------|
| `admin/`  | Application admin (connexion, dashboard, utilisateurs, parking, paramètres) |
| `public/` | Application publique (dashboard visiteur) |
| `shared/` | Package local `@smart-park/shared` (services API, store de chargement) |

Chaque application (`admin`, `public`) installe ses dépendances dans son sous-dossier `src/` et dépend de `shared` via un lien `file:../../shared`.

## Prérequis

- **Node.js** 18+ (LTS recommandé)
- **npm** (ou équivalent)

## Installation

Depuis la racine du dépôt, installez chaque app (ou utilisez les scripts `setup` ci-dessous).

### Admin

```bash
cd frontend/admin
npm run setup
```

### Public

```bash
cd frontend/public
npm run setup
```

`setup` exécute `npm install` dans `src/` et dans `../shared`.

## Développement

Dans `frontend/admin` ou `frontend/public` :

```bash
npm run dev
```

Cela lance Vite depuis le sous-projet `src/` (voir les `package.json` à la racine de chaque app).

Lancez le **backend** en parallèle pour que les appels API fonctionnent. L’URL de l’API est définie dans `shared/services/api.jsx` (base URL du serveur déployé ou à adapter pour le développement local).

## Build de production

```bash
npm run build
```

Les artefacts sont générés dans le dossier de build Vite du sous-projet `src/` (souvent `dist/`).

Prévisualisation du build :

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Package partagé

`frontend/shared` expose notamment :

- `@smart-park/shared/services/api` — client Axios, interceptors, appels vers `/api/admin` et `/api/parking`
- `@smart-park/shared/services/apiLoadingStore` — compteur global de requêtes en cours (overlay de chargement)

Pour modifier l’URL du backend en développement, éditez la `baseURL` dans `shared/services/api.jsx` ou introduisez une variable d’environnement Vite si vous centralisez la configuration.

## Ordre de travail typique

1. Démarrer le backend (`backend/`, port 5000 par défaut).
2. Dans `frontend/admin` ou `frontend/public`, lancer `npm run dev`.
3. Ouvrir l’URL affichée par Vite (souvent `http://localhost:5173` selon la configuration).
