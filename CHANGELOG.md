# Changelog — JobTracker

# Changelog

Toutes les modifications notables de ce projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [2.0.0] - 2026-03-15 — Phase 2

### Ajouté
- **Sprint 1** — Backup manuel SQLite avec rétention configurable (`BACKUP_RETENTION`)
- **Sprint 2** — Intégration Ollama IA : scoring automatique (fit score) et détection d'offres suspectes
- **Sprint 3** — Webhook n8n : réception de candidatures externes via endpoint sécurisé
- **Sprint 4** — Gestion des erreurs réseau (Utils.formatErrorMessage), amélioration des toasts

### Modifié
- `Utils.showToast` : durée portée à 6s pour les messages IA
- `analyzeJobAsync` : appels Ollama séquentiels (vs Promise.all) pour éviter les timeouts
- `AITIMEOUT` : passage de 15s à 60s dans `.env`

### Corrigé
- `importCsv` absent du `module.exports` du controller
- Colonne `note` vs `notes` dans les appels `Api.update`
- `showToast` non global → `Utils.showToast` partout

---

## [1.0.0] - 2026-03-14 — Phase 1

### Ajouté
- **Sprint 1** — Structure projet, `schema.sql` (20 colonnes), CRUD complet `/api/jobs`
- **Sprint 2** — Filtres multi-critères, recherche full-text, tri, stats, export CSV, `validators.js`
- **Sprint 3** — SPA complète : `index.html`, `styles.css` dark mode, `utils.js`, `api.js`, `ui.js`, `app.js`
- **Sprint 4** — Badge fake, toasts améliorés, gestion erreurs réseau, `seed.sql` / `seed.js`


## Phase 2 v2.0 — 2026-03-15

### ✨ Nouvelles fonctionnalités

#### EPIC 11 — Backup DB via l'Interface
- Bouton "💾 Backup DB" dans le header
- Copie horodatée de jobs.db vers ./db-backup/
- Affichage du dernier backup avec indicateur de couleur (vert/orange/rouge)
- Rétention configurable (10 backups par défaut, `BACKUP_RETENTION`)
- Documentation de la procédure de restauration

#### EPIC 12 — Intégration Ollama IA (Scoring & Détection Fake)
- Toggle "IA Ollama" pour activer/désactiver l'analyse automatique
- Sélecteur de modèle dynamique (liste depuis Ollama `/api/tags`)
- Scoring automatique (1-10) à la création de candidature
- Détection automatique des offres frauduleuses (grammaire, salaire irréaliste)
- Analyse manuelle à la demande via bouton "🤖 Analyser avec IA"
- Timeout 15s avec fallback gracieux si Ollama indisponible

#### EPIC 13 — Intégration n8n via Webhooks
- Toggle "n8n Webhook" pour activer/désactiver la réception
- Support 4 modes de déploiement : Local, Docker (macOS/Windows), Docker (Linux), Docker (Custom IP)
- URL webhook calculée dynamiquement selon le mode sélectionné
- Sécurisation par token secret (SHA256, timing-safe, header `X-Webhook-Token`)
- Logs des 30 derniers appels webhook (date, mode, status, preview)
- Bouton "🧪 Tester la connexion" avec feedback visuel (badge vert/orange/rouge)

### 🔧 Améliorations techniques
- Architecture en 4 couches maintenue (Routes → Controllers → Services → DAL)
- Zéro régression sur les fonctionnalités Phase 1
- Dégradation gracieuse : l'app fonctionne même si Ollama ou n8n sont indisponibles
- Parsing JSON tolérant avec fallback regex pour les réponses Ollama
- Table `webhook_logs` avec purge automatique (30 entrées max)
- Double mapping payload n8n (`job_title` / `jobtitle`) pour compatibilité maximale

### 📊 KPIs validés
- Backup : **3ms** pour 2.6 MB (KPI < 2s ✅)
- Webhook : **~22ms** moyen sur 10 appels (KPI < 200ms ✅)
- IA Ollama : < 15s timeout (KPI < 15s ✅)

### 🐛 Bugfixes
- Fix : `initWebhookToggle` manquant dans le bloc d'initialisation de `settings.js`
- Fix : route `POST /api/jobs/webhook` déclarée avant `/:id` pour éviter le conflit Express

---

## Phase 1 v1.0 — 2026-03-07

### ✨ Fonctionnalités initiales
- CRUD complet des candidatures (Create, Read, Update, Delete)
- Filtrage multi-critères (status, sector, remote, fake_flag, search)
- Tri dynamique (date_added, last_updated, fit_score, company)
- Dashboard statistiques (total, répartition status/secteur, fit moyen)
- Export/Import CSV (UTF-8, BOM)
- Dark mode UI par défaut
- Architecture REST 4 couches (Node.js, Express, SQLite, Vanilla JS)
- Performance : API < 100ms, UI render < 50ms
