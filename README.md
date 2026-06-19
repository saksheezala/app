# app

A production-ready monorepo with a React (Vite + TypeScript) frontend and Node.js (Express + TypeScript) backend, containerised with Docker and deployed via Azure DevOps Pipelines.

> **GitHub**: https://github.com/saksheezala/app  
> **Docker Hub**: https://hub.docker.com/u/saksheezala (`saksheezala/app-frontend`, `saksheezala/app-backend`)

## Repository Structure

```
cicd-monorepo/
├── frontend/          # React + Vite + TypeScript application
├── backend/           # Node.js + Express + TypeScript application
├── pipelines/         # Azure DevOps YAML pipeline definitions
│   └── templates/     # Reusable pipeline templates
├── scripts/           # Shared shell/utility scripts
└── docker-compose.yml # Local development orchestration
```

## Branch Strategy

| Branch | Trigger | Pipeline | Environments |
|--------|---------|----------|-------------|
| `feature/*` | Push / PR | Validation (Lint → Test → Build) | DEV |
| `release` | Merge | Validation | QA → UAT |
| `main` | Merge | Validation | STAGE (approval) → PROD (approval) |

## Local Development

```bash
# Start both services locally
docker compose up --build

# Frontend → http://localhost:5173
# Backend  → http://localhost:3000
```

## Phases

- **Phase 1**  Project Init, Directory Structure & Application Code
- **Phase 2**  Containerisation (Dockerfiles + docker-compose)
- **Phase 3**  Azure DevOps CI/CD Pipelines
