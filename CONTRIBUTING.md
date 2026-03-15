# Contribuer à JobTracker

Ce projet est personnel et solo. Les issues sont les bienvenues pour signaler des bugs.

## Prérequis

- Node.js >= 18
- Ollama installé localement (optionnel, pour les fonctionnalités IA)

## Setup local

```bash
git clone https://github.com/<ton-user>/job-tracker.git
cd job-tracker
npm install
cp .env.example .env
npm run init-db
npm start

Conventions
Vanilla JS uniquement — pas de framework

Utils.showToast pour tous les feedbacks UI (jamais showToast directement)

Utils.formatErrorMessage(error) pour les erreurs réseau/API

Architecture 4 couches stricte : Routes → Controller → Service → DAL