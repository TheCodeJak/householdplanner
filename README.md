# Householdplanner

Next.js + tRPC + Drizzle + Auth.js. Deployment auf Vercel, Datenbank auf Neon.

## Setup

Node 24 (wie bei Vercel, festgelegt in `engines` und `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # Werte eintragen
```

| Variable            | Zweck                                                                |
| ------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | Postgres-Verbindung (Neon-Branch `development`)                      |
| `AUTH_SECRET`       | Auth.js-Secret                                                       |
| `REGISTRATION_CODE` | Beta-Code für die Registrierung; fehlt er, ist Registrieren gesperrt |

## Umgebungen

| Umgebung                                         | Datenbank          | Variablen aus                 |
| ------------------------------------------------ | ------------------ | ----------------------------- |
| Lokal (`npm run dev`)                            | Neon `development` | `.env.local`                  |
| Vercel Preview (z. B. `dev.householdplanner.de`) | Neon `development` | Vercel Dashboard (Preview)    |
| Vercel Production                                | Neon `production`  | Vercel Dashboard (Production) |

Die Production-Zugangsdaten liegen nie in einer Datei auf dem Rechner.

## Konten und Familien

Registrieren braucht den `REGISTRATION_CODE`. Nach dem Login landet jeder ohne Familie im Onboarding (`/onboarding`): mit einem Einladungscode beitreten oder eine Familie gründen. Wer gründet, ist Admin und kann im Profil unter „Einladen“ einen neuen Code erzeugen. Wer wohin darf, regelt `src/lib/routeGuard.ts` (aufgerufen von `src/proxy.ts`).

## Lokal entwickeln

```bash
npm run dev   # Dev-Server gegen die Neon-Datenbank aus .env.local
```

## Datenbank

```bash
npm run db   # Aktion und Datenbank per Pfeiltasten wählen
```

| Aktion                               | development          | production    |
| ------------------------------------ | -------------------- | ------------- |
| Studio öffnen                        | ja                   | ja, geschützt |
| Schema anwenden (`drizzle-kit push`) | ja, nach Bestätigung | nie           |

Production ist geschützt: Die URL holt das Script zur Laufzeit per Neon-CLI (einmalig `npx neonctl auth`, außerdem braucht es die Datei `.neon` mit der Projekt-ID, anlegen mit `npx neonctl set-context --project-id <id>`). Zum Starten musst du `production` eintippen. Beachte: Studio kann auch Daten ändern und löschen. Schema-Änderungen für Production gehören später in Migrationen (`drizzle-kit generate` und `migrate`), nicht in `push`.

### Datenbank-Umzüge auf Production

Schema-Änderungen und Datenumzüge liegen als Skripte in `scripts/` und laufen auf Production mit `--production`. Die URL holt das Skript selbst per Neon-CLI (wie `npm run db`), du musst nichts kopieren. Jedes Skript macht ohne `--apply` einen Trockenlauf (alles wird zurückgerollt); `--apply` schreibt fest und verlangt auf Production das Eintippen von `production`.

| Skript                                 | Zweck                                            |
| -------------------------------------- | ------------------------------------------------ |
| `node scripts/schema-update.mjs`       | legt Tabelle `category` und die neuen Spalten an |
| `node scripts/backfill-categories.mjs` | macht aus dem Kategorie-Text echte Kategorien    |
| `node scripts/backfill-colors.mjs`     | vergibt die Farben der Personen (`user.color`)   |

Ablauf einer Version, die das Schema ändert: **erst die Datenbank, dann der Code.** Vorher einen Neon-Branch von `production` als Sicherung anlegen. Dann je Skript `--production` (Trockenlauf prüfen) und danach `--production --apply`, in der Reihenfolge der Tabelle. Der Trockenlauf eines Skripts setzt voraus, dass das davor festgeschrieben ist. Alte Programmversionen vertragen neue, optionale Spalten, die Datenbank darf also vor dem Deployment umgebaut werden.

## Prüfen vor dem PR

```bash
npm run check   # lint + format:check + typecheck
```

## Deployment

```bash
npm run deploy   # Branch und Domain per Pfeiltasten wählen
```

Deployt den **gepushten** Stand eines Branches (nicht den lokalen Arbeitsstand) als Vercel-Preview und hängt ihn an die gewählte Domain. Die Domains stehen in `scripts/deploy.mjs` (`DOMAINS`). Einmalig nötig: `npx vercel login` und `npx vercel link`. Previews sind durch Vercel Authentication geschützt, zum Ansehen musst du bei Vercel eingeloggt sein.
