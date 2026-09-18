# Cova Task Manager

Mini application de gestion de tâches — test technique pour Cova. Permet de créer un compte,
se connecter, et gérer ses tâches (créer, modifier, supprimer, filtrer, rechercher), avec une
API REST Spring Boot et une interface web React.

## Sommaire

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et exécution](#installation-et-exécution)
- [Tests](#tests)
- [Fonctionnalités](#fonctionnalités)
- [Choix techniques notables](#choix-techniques-notables)
- [CI/CD](#cicd)
- [Déploiement](#déploiement)

## Architecture

Monorepo avec deux applications indépendantes et une base de données partagée :

```
cova-task-manager/
├── backend/          Spring Boot 4 (Java 21) — API REST, JWT, MySQL
├── frontend/          React 19 + Vite + TypeScript — SPA
├── docker-compose.yml  Orchestration locale (MySQL + backend + frontend)
└── .github/workflows/  Pipeline CI (GitHub Actions)
```

Le frontend consomme l'API backend via HTTP (axios), authentifié par JWT (Bearer token). Le
backend est stateless (pas de session serveur) et expose une base de données MySQL relationnelle.

## Stack technique

| Domaine | Technologies |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router |
| Backend | Java 21, Spring Boot 4, Spring Data JPA, Spring Security, MySQL 8 |
| Auth | JWT (jjwt), BCrypt pour le hachage des mots de passe |
| Conteneurisation | Docker (multi-stage builds), Docker Compose |
| CI/CD | GitHub Actions |

## Prérequis

- **Docker** et **Docker Compose** (seule dépendance nécessaire pour la méthode recommandée)

Pour le développement local sans Docker (hot-reload) :
- Java 21 (JDK)
- Maven 3.9+ (ou le wrapper `mvnw` fourni)
- Node.js 20+ et npm

## Installation et exécution

### Option 1 — Docker Compose (recommandé)

Lance les 3 services (MySQL, backend, frontend) en une seule commande :

```bash
docker compose up -d --build
```

- Frontend : http://localhost:5174
- Backend (API) : http://localhost:8080
- MySQL : `localhost:3306` (user `task_manager` / password `task_manager`)

Pour arrêter : `docker compose stop`. Pour tout supprimer (en gardant les données MySQL dans le
volume) : `docker compose down`.

### Option 2 — Développement local (hot-reload)

1. Démarrer uniquement MySQL :
   ```bash
   docker compose up -d mysql
   ```
2. Backend (dans un terminal) :
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   API disponible sur http://localhost:8080.
3. Frontend (dans un autre terminal) :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App disponible sur http://localhost:5173.

**Attention** : ne pas lancer le backend en local (`mvnw spring-boot:run`) en même temps que le
conteneur Docker du backend — les deux écoutent sur le port 8080 et entreraient en conflit.

### Variables d'environnement

**Backend** (`backend/src/main/resources/application.yml`), toutes avec une valeur par défaut
fonctionnelle pour le développement local :

| Variable | Défaut | Usage |
| --- | --- | --- |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `localhost` / `3306` / `task_manager` / `task_manager` / `task_manager` | Connexion MySQL |
| `JWT_SECRET` | secret de dev | Signature des tokens JWT — **à changer avant tout déploiement réel** |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | Durée de validité du token |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origine(s) autorisée(s) à appeler l'API depuis un navigateur |

**Frontend** : copier `frontend/.env.example` vers `frontend/.env` et ajuster `VITE_API_URL` si
le backend n'est pas sur `localhost:8080/api`.

## Tests

```bash
cd backend
./mvnw test
```

11 tests (5 unitaires `AuthService`, 4 unitaires `TaskService`, 1 test d'intégration du flux
CRUD complet, 1 test de chargement du contexte Spring). Les tests tournent sur une base **H2 en
mémoire**, entièrement isolée de la base MySQL de développement — `mvn test` ne touche jamais aux
données réelles.

## Fonctionnalités

- Inscription / connexion / déconnexion (JWT)
- CRUD complet des tâches (titre, description, statut)
- Pagination, filtrage par statut, recherche par titre (avec debounce côté frontend)
- Suppression avec confirmation, soft delete côté backend (les tâches supprimées restent en
  base mais n'apparaissent plus dans l'API)
- Notifications toast (succès / erreur) et gestion des erreurs réseau
- Menu utilisateur avec avatar (initiales) et déconnexion

## Choix techniques notables

- **UUID plutôt qu'ID auto-incrémenté** : évite qu'un identifiant de ressource soit devinable/
  énumérable.
- **Soft delete transparent** via `@SQLDelete` + `@SQLRestriction` (Hibernate) : `DELETE` devient
  un `UPDATE deleted_at = NOW()`, et toute requête générée exclut automatiquement les lignes
  supprimées, sans logique à dupliquer dans chaque méthode du repository.
- **Prévention IDOR** : chaque endpoint `/api/tasks/{id}` vérifie que la tâche appartient bien à
  l'utilisateur authentifié avant lecture/modification/suppression (404 générique dans les deux
  cas "inexistant" et "appartient à un autre utilisateur", pour ne pas révéler l'existence d'une
  ressource à un attaquant).
- **CORS configurable** par variable d'environnement (`CORS_ALLOWED_ORIGINS`), pas codé en dur —
  prêt pour un déploiement avec une origine frontend différente.
- **Index composite** `(user_id, deleted_at, status)` sur la table `tasks` pour garder la liste
  paginée/filtrée rapide à mesure que le volume de données grandit.
- **Code splitting** du frontend par route (`React.lazy`) : l'écran de login ne télécharge pas le
  code du dashboard, et inversement.
- **Logout stateless** : un JWT n'a rien à invalider côté serveur — l'endpoint `/api/auth/logout`
  exige un token valide et renvoie 204, la vraie déconnexion se fait côté client en supprimant le
  token.

## CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`), déclenché sur chaque push/PR vers `main` :

1. **backend** — build Maven + suite de tests complète
2. **frontend** — type-check TypeScript + build de production (pas de framework de tests
   unitaires frontend installé à ce stade — le build/type-check sert de garde-fou de base)
3. **docker** — build des images Docker backend et frontend, pour valider que les `Dockerfile`
   restent fonctionnels

## Déploiement

**Non réalisé.** Le sujet mentionne le déploiement comme un bonus explicite. La stratégie
envisagée était Cloud Run (backend) + Vercel (frontend), avec les `Dockerfile` déjà prêts pour
Cloud Run.

Le blocage rencontré n'est pas technique : la création d'un compte de facturation GCP (testée
sur deux comptes Google distincts) affiche un compte fermé (`OPEN: false`) exigeant un
prépaiement réel de 30$US pour activer n'importe quel service payant — comportement non standard
par rapport à l'offre "300$ d'essai gratuit sans engagement" habituelle de GCP, probablement lié
à la zone de facturation. Vérifié empiriquement : la tentative d'activation de l'API Compute
Engine (alternative à Cloud Run également citée dans le sujet) échoue avec l'erreur explicite
`UREQ_PROJECT_BILLING_NOT_OPEN`, confirmant que le blocage est structurel au compte de
facturation et non spécifique à un service. Plutôt que d'engager une dépense réelle non garantie
pour un bonus, le choix a été de documenter la démarche.

Le pipeline CI/CD reste pleinement fonctionnel côté build/test/images Docker (voir section
CI/CD ci-dessus), et l'ensemble de la stack tourne en local via `docker compose up -d --build`.
