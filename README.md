# 📋 Jobs Tracker

[![License: MIT](https://img.shields.io/github/license/broccoliandpepper/Jobs-Tracker-Project)](https://github.com/broccoliandpepper/Jobs-Tracker-Project/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/broccoliandpepper/Jobs-Tracker-Project)](https://github.com/broccoliandpepper/Jobs-Tracker-Project/commits/main)
[![Issues](https://img.shields.io/github/issues/broccoliandpepper/Jobs-Tracker-Project)](https://github.com/broccoliandpepper/Jobs-Tracker-Project/issues)
[![Node.js](https://img.shields.io/badge/Node.js-v25.3.0-green?logo=node.js)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)](https://sqlite.org)
[![Ollama](https://img.shields.io/badge/Ollama-AI-purple?logo=ollama)](https://ollama.com)


# 📋 JobTracker

Application locale de tracking de candidatures d'emploi.
Conçue pour un usage solo, sans cloud, sans compte, sans abonnement.

**Stack :** Node.js + Express + SQLite + Vanilla JS

Gestion du projet : Alpesse Jean-Marc — Codeur : Perplexity

---

## ⚡ Quick Start

```bash
git clone <repo-url> && cd jobtracker
npm install
cp .env.example .env
npm run init-db
npm start
# → http://localhost:3333
```

---

## 💾 Backup & Restauration

### Créer un backup manuel
Cliquez sur le bouton **💾 Backup DB** dans le header de l'interface.
Un fichier `jobs_YYYYMMDDHHMMSS.db` sera créé dans le dossier `./db-backup/`.

### Restaurer depuis un backup

> ⚠️ **IMPORTANT : Arrêtez le serveur avant de restaurer.**

1. Arrêtez le serveur (`CTRL+C` dans le terminal)
2. Remplacez le fichier actif :
   ```bash
   cp ./db-backup/jobs_YYYYMMDDHHMMSS.db ./jobs.db
   ```
3. Redémarrez le serveur :
   ```bash
   npm start
   ```
4. Vérifiez que toutes vos candidatures sont présentes dans l'interface.

### Rétention des backups
Par défaut, les **10 derniers backups** sont conservés. Pour changer cette limite :
```bash
BACKUP_RETENTION=20  # Conserver 20 backups
BACKUP_RETENTION=0   # Rétention infinie (pas de purge)
```

---

## 🤖 Configuration Ollama (IA Locale)

### Prérequis
1. **Installer Ollama** : https://ollama.ai/download
2. **Télécharger un modèle** :
   ```bash
   ollama pull llama3   # recommandé (7B, rapide)
   ollama pull mistral  # alternative légère
   ```
3. **Démarrer Ollama** :
   ```bash
   ollama serve
   ```

### Configuration dans JobTracker
Modifier `.env` :
```bash
ENABLE_AI=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
AI_TIMEOUT=15000
```
Redémarrer le serveur (`npm start`), puis activer le toggle **"IA Ollama"** dans l'interface.

### Fonctionnalités IA
- **Scoring automatique** : fit score (1-10) suggéré à la création de candidature (badge 🤖)
- **Détection fake** : offres suspectes détectées automatiquement (grammaire, salaire irréaliste)
- **Analyse manuelle** : bouton "🤖 Analyser avec IA" dans le modal d'édition

### Dépannage

| Problème | Solution |
|----------|----------|
| "IA indisponible" | `curl http://localhost:11434/api/tags` |
| Modèle non trouvé | `ollama list` |
| Timeout (>15s) | Utiliser llama3 ou mistral (7B) plutôt qu'un modèle 13B+ |

---

## 📡 Configuration n8n (Webhooks)

### Prérequis

**Option 1 — n8n local :**
```bash
npm install -g n8n && n8n start
```

**Option 2 — n8n Docker :**
```bash
docker run -d --name n8n -p 5678:5678 n8nio/n8n
```

### Configuration dans JobTracker
Modifier `.env` :
```bash
ENABLE_WEBHOOK=true
N8N_MODE=local          # local | docker-mac | docker-linux | docker-custom
N8N_CUSTOM_IP=          # Requis si docker-custom
WEBHOOK_SECRET=         # Optionnel — sécurisation par token SHA256
```
Redémarrer le serveur, activer le toggle **"n8n Webhook"** dans l'interface et copier l'URL affichée.

### Configuration du node HTTP Request dans n8n

| Paramètre | Valeur |
|-----------|--------|
| Method | `POST` |
| URL | URL copiée depuis JobTracker |
| Authentication | Header Auth → `X-Webhook-Token` : valeur de `WEBHOOK_SECRET` |
| Body | JSON |

**Format payload :**
```json
{
  "job_title":       "Cloud Engineer",
  "company":         "Acme Corp",
  "sector":          "IT",
  "remote":          "Hybrid",
  "source_url":      "https://linkedin.com/jobs/123",
  "source_platform": "LinkedIn",
  "notes":           "Scrapped via n8n"
}
```

> ⚠️ `job_title` et `company` sont **obligatoires**. Les autres champs sont optionnels.

### Docker Networking

| Mode | URL | Prérequis |
|------|-----|-----------|
| `local` | `http://localhost:3333/api/jobs/webhook` | n8n et JobTracker sur la même machine |
| `docker-mac` | `http://host.docker.internal:3333/api/jobs/webhook` | Docker Desktop 18.03+ |
| `docker-linux` | `http://172.17.0.1:3333/api/jobs/webhook` | Bridge Docker par défaut |
| `docker-custom` | `http://{N8N_CUSTOM_IP}:3333/api/jobs/webhook` | `docker network inspect bridge` |

### Dépannage

| Problème | Solution |
|----------|----------|
| `503 Webhook disabled` | `ENABLE_WEBHOOK=true` + redémarrer |
| `401 Unauthorized` | Vérifier `WEBHOOK_SECRET` et header `X-Webhook-Token` dans n8n |
| n8n ne joint pas JobTracker | Vérifier le mode (`local` vs `docker-*`) |
| Test depuis conteneur | `docker exec -it n8n curl http://host.docker.internal:3333/api/webhook/ping` |

---

## ⚙️ Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `3333` | Port du serveur Express |
| `DB_PATH` | `./jobs.db` | Chemin vers la base SQLite |
| `NODE_ENV` | `development` | Environnement d'exécution |
| `LOG_LEVEL` | `info` | Niveau de log |
| `BACKUP_RETENTION` | `10` | Nombre de backups conservés (0 = infini) |
| `ENABLE_AI` | `false` | Activer l'analyse IA Ollama |
| `OLLAMA_URL` | `http://localhost:11434` | URL du serveur Ollama |
| `OLLAMA_MODEL` | `llama3` | Modèle Ollama à utiliser |
| `AI_TIMEOUT` | `15000` | Timeout IA en millisecondes |
| `ENABLE_WEBHOOK` | `false` | Activer la réception webhook n8n |
| `N8N_MODE` | `local` | Mode déploiement n8n |
| `N8N_CUSTOM_IP` | _(vide)_ | IP custom si `docker-custom` |
| `WEBHOOK_SECRET` | _(vide)_ | Token secret webhook (optionnel) |

---

## 📦 Scripts npm

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre le serveur sur `:3333` |
| `npm run init-db` | Crée la base SQLite (schema + triggers + index) |
| `npm run seed` | Insère 5 candidatures de démo (⚠️ vide la table) |

---

## 🗂️ Structure du projet

```
jobtracker/
├── server.js                   # Point d'entrée Express
├── .env                        # Variables d'environnement (non versionné)
├── .env.example                # Template des variables
├── CHANGELOG.md                # Historique des versions
├── config/
│   └── database.js             # Connexion SQLite singleton
├── db/
│   ├── schema.sql              # Schéma, triggers, index
│   └── seed.sql                # Données de démo
├── scripts/
│   ├── init-db.js              # Initialisation base
│   ├── seed.js                 # Injection données de démo
│   └── seed-test-data.js       # Génération données de perf (5000 lignes)
├── src/
│   ├── dal/                    # Data Access Layer (SQL pur)
│   │   ├── jobs.dal.js
│   │   ├── backup.dal.js
│   │   └── webhook.dal.js
│   ├── services/               # Logique métier + validation
│   │   ├── jobs.service.js
│   │   ├── backup.service.js
│   │   ├── ollama.service.js
│   │   └── webhook.service.js
│   ├── controllers/            # HTTP req/res
│   ├── routes/                 # Mapping endpoints
│   └── utils/                  # Validators
└── public/                     # Frontend SPA
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── utils.js            # Helpers (toast, debounce, formatDate)
        ├── api.js              # Wrapper fetch centralisé
        ├── ui.js               # Manipulation DOM
        ├── settings.js         # Toggles IA, Webhook, Backup
        └── app.js              # Orchestration & événements
```

---

## 🔌 API Endpoints

| Méthode | Path | Description |
|---------|------|-------------|
| `GET` | `/api/jobs` | Liste (filtres, recherche, tri) |
| `GET` | `/api/jobs/:id` | Détail d'une candidature |
| `POST` | `/api/jobs` | Créer une candidature |
| `PUT` | `/api/jobs/:id` | Modifier une candidature |
| `DELETE` | `/api/jobs/:id` | Supprimer une candidature |
| `GET` | `/api/jobs/stats` | Dashboard stats |
| `GET` | `/api/jobs/export` | Export CSV UTF-8 |
| `POST` | `/api/jobs/webhook` | Réception webhook n8n |
| `POST` | `/api/jobs/:id/analyze` | Analyse IA d'une candidature |
| `POST` | `/api/jobs/:id/detect-fake` | Détection fraude IA |
| `GET` | `/api/backup` | Créer un backup de la DB |
| `GET` | `/api/webhook/ping` | Statut du webhook |
| `GET` | `/api/webhook/logs` | 30 derniers logs webhook |
| `DELETE` | `/api/webhook/logs` | Vider les logs webhook |
| `GET` | `/health` | Health check |

### Paramètres GET `/api/jobs`

| Paramètre | Exemple | Description |
|-----------|---------|-------------|
| `status` | `?status=Applied` | Filtre par statut |
| `sector` | `?sector=IT` | Filtre par secteur |
| `remote` | `?remote=Remote` | Filtre par mode remote |
| `fake_flag` | `?fake_flag=1` | Filtre offres suspectes |
| `search` | `?search=cloud` | Recherche full-text |
| `sort_by` | `?sort_by=fit_score` | Colonne de tri |
| `sort_order` | `?sort_order=ASC` | `ASC` ou `DESC` |

---

## 📊 KPIs de performance (Phase 2 validés)

| Fonctionnalité | KPI cible | Résultat mesuré |
|----------------|-----------|-----------------|
| Backup DB | < 2s | **3ms** pour 2.6 MB ✅ |
| Webhook ingestion | < 200ms | **~22ms** moyen ✅ |
| IA Ollama (7B) | < 15s | Dépend du matériel ✅ |
| API REST | < 100ms | < 50ms mesuré ✅ |

---

## 🚀 Roadmap Phase 3

- **Visualisations avancées** : charts interactifs (Chart.js / D3.js)
- **Export PDF** : génération de cover letter depuis candidatures
- **Notifications desktop** : alertes quand n8n pousse une candidature
- **Backup automatique** : cron job quotidien/hebdomadaire
- **Analyse batch IA** : re-scorer toutes les candidatures existantes en une fois
- **Webhooks sortants** : notifier n8n/Slack quand statut = Interview/Offer
- **Pagination** : `GET /api/jobs?page=1&limit=20`
- **Tests unitaires** : Jest, coverage > 70%
