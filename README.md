# Householdplanner

Next.js + tRPC + Drizzle + Auth.js. Deployment auf Vercel, Datenbank auf Neon.

## Setup

```bash
npm install
cp .env.example .env.local   # Werte eintragen
```

| Variable | Zweck |
|---|---|
| `DATABASE_URL` | Postgres-Verbindung (Neon-Branch `development`) |
| `DATABASE_URL_UNPOOLED` | Direkte Neon-Verbindung, z. B. für Schema-Änderungen |
| `DATABASE_PASSWORD` | Nur für die lokale Docker-Datenbank |
| `AUTH_SECRET` | Auth.js-Secret |

## Lokal entwickeln

```bash
npm run dev          # Dev-Server gegen die Neon-DB aus .env.local
npm run docker:dev   # Dev-Server + lokale Postgres-DB in Docker
```

In Docker überschreibt `compose.yaml` `DATABASE_URL` mit der lokalen DB. Schema dort anlegen:

```bash
docker compose exec web npx drizzle-kit push
```

## Datenbank

Es gibt zwei Entwicklungsdatenbanken. Das Ziel steht im Skriptnamen, damit nicht versehentlich die falsche getroffen wird:

| Skript | Datenbank | Gehört zu |
|---|---|---|
| `db:push:neon-dev` / `db:studio:neon-dev` | Neon-Branch `development` (aus `.env.local`) | `npm run dev` |
| `db:push:docker` / `db:studio:docker` | lokales Postgres im Container (`.env.docker-db`) | `npm run docker:dev` |

`.env.docker-db` enthält nur `DATABASE_URL=postgresql://postgres:<Passwort der Docker-DB>@127.0.0.1:5432/householdplaner` und wird nicht eingecheckt (`.env*` ist in `.gitignore`). `127.0.0.1` statt `localhost`, weil der Port nur auf IPv4 freigegeben ist.

Für die Produktion gibt es bewusst kein Skript.

## Deployment

```bash
npm run deploy:dev   # Preview
npm run deploy:prod  # Production
```
