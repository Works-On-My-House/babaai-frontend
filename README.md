# BabaAI Frontend

React + TypeScript SPA for the BabaAI recipe and pantry app.

## Prerequisites

- Docker, or Node 22+ for local dev

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:5173 — requires the API gateway on the URL set in `VITE_API_BASE_URL`.

## Local dev (without Docker)

```bash
npm install
cp .env.example .env
npm run dev
```

## Full stack (all 4 repos)

Clone as siblings under one folder, then start in order:

1. **babaai-core** — `docker compose up --build`
2. **babaai-ai** — `docker compose up --build`
3. **babaai-gateway** — `docker compose up --build`
4. **babaai-frontend** — `docker compose up --build`

Use the same `AI_SERVICE_TOKEN` in **core** and **ai** `.env` files.

Optional: Ollama for AI proposals — see `docker-compose.ollama.yml` in the **babaai-ai** repo.

## Environment

Copy `.env.example` to `.env` before running locally or with Docker. **All `VITE_*` variables are required** (except `VITE_LIBRETRANSLATE_URL`, which disables auto-translation when omitted).

| Variable | Description |
|----------|-------------|
| `FRONTEND_PORT` | Host port for Docker (default in example: `5173`) |
| `VITE_API_BASE_URL` | Browser → gateway URL |
| `VITE_INGREDIENT_PAGE_SIZE` | Default pantry / browse page size |
| `VITE_RECIPE_CATALOG_PAGE_SIZE` | Recipe catalog page size |
| `VITE_SUGGESTIONS_PAGE_SIZE` | Suggestions pagination |
| `VITE_HISTORY_PAGE_SIZE` | Suggestion history pagination |
| `VITE_DEFAULT_MIN_MATCH_PERCENT` | Default match % slider |
| `VITE_LIBRETRANSLATE_URL` | Optional LibreTranslate URL |
