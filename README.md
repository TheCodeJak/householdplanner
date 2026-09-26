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

```bash
npm run db:push      # Schema auf die DB aus .env.local pushen
npm run db:studio
```

## Deployment

```bash
npm run deploy:dev   # Preview
npm run deploy:prod  # Production
```
