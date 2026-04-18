# Smart Park — Backend

API REST pour Smart Park : gestion des administrateurs, tableau de bord analytique, et exposition publique de l’occupation du parking.

## Stack

- **Python 3** + **Flask**
- **Flask-SQLAlchemy** (ORM)
- **Flask-CORS** (origines front)
- **PyJWT** (authentification Bearer)
- **Gunicorn** (déploiement)

## Prérequis

- Python 3.10+ recommandé
- Une base de données compatible SQLAlchemy (URI fournie par `DATABASE_URL`)

## Configuration

Créez un fichier `.env` à la racine du dossier `backend` (voir `.env` existant comme modèle) :

| Variable        | Description |
|----------------|-------------|
| `DATABASE_URL` | URI SQLAlchemy (ex. PostgreSQL) |
| `SECRET_KEY`   | Clé secrète pour signer les JWT |

Exemple :

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=votre_cle_secrete_longue_et_aleatoire
```

## Installation

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

## Lancer l’API en local

```bash
python run.py
```

Par défaut l’application écoute sur le **port 5000** (voir `run.py`).

## Structure utile

- `app/__init__.py` — factory Flask, CORS, enregistrement des blueprints
- `app/config.py` — configuration (variables d’environnement)
- `app/routes/` — routes HTTP (`/api/admin`, `/api/parking`)
- `app/controllers/` — logique métier
- `app/models/` — modèles SQLAlchemy
- `app/utils/auth.py` — décorateur `token_required` (JWT Bearer)

## Endpoints (aperçu)

- **`/api/parking/*`** — endpoints publics (ex. dashboard disponibilité)
- **`/api/admin/*`** — inscription, login, dashboard protégé, gestion des admins, bascule hors service des places (JWT requis selon la route)

Les en-têtes autorisés incluent `Authorization` et `Content-Type` pour les appels depuis le frontend.

## Production

Utilisez un serveur WSGI tel que **Gunicorn** (déjà listé dans `requirements.txt`), avec les variables d’environnement définies sur la plateforme (Render, etc.).

```bash
gunicorn "app:create_app()" --factory -b 0.0.0.0:5000
```

Adaptez la commande selon votre hébergeur (nombre de workers, port, etc.).
