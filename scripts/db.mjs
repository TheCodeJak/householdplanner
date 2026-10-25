// Datenbank-Werkzeuge für Neon: Studio öffnen oder Schema anwenden.
// Aufruf: npm run db
//
// development: URL aus .env.local
// production:  URL kommt zur Laufzeit aus dem Neon-CLI und liegt nie in einer Datei.
//              Nur Studio, nie push, und nur nach Bestätigung durch Tippen.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import {
  ask,
  bold,
  cyan,
  dim,
  green,
  red,
  runMain,
  select,
  yellow,
} from "./lib/ui.mjs";

const NEON_BRANCH_PRODUCTION = "production";

// Nur sichere Zeichen, weil die Werte unten in einen Shell-Aufruf wandern.
const SAFE = /^[\w.-]+$/;

function developmentUrl() {
  if (!existsSync(".env.local")) {
    throw new Error(".env.local fehlt. Vorlage: .env.example.");
  }
  // parseEnv statt loadEnvFile: Eine in der Shell gesetzte DATABASE_URL darf
  // die Datei nicht überschreiben.
  const url = parseEnv(readFileSync(".env.local", "utf8")).DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL fehlt in .env.local.");
  return url;
}

// Holt die Production-URL per Neon-CLI. Rolle und Datenbankname übernehmen wir
// von der development-URL (der Neon-Branch ist eine Kopie davon).
function productionUrl(devUrl) {
  if (!existsSync(".neon")) {
    throw new Error(
      "Datei .neon fehlt (enthält die Neon-Projekt-ID). Anlegen: `npx neonctl set-context --project-id <id>`.",
    );
  }
  const { projectId } = JSON.parse(readFileSync(".neon", "utf8"));
  const { username, pathname } = new URL(devUrl);
  const args = {
    "--project-id": projectId,
    "--role-name": decodeURIComponent(username),
    "--database-name": decodeURIComponent(pathname.slice(1)),
  };
  for (const [flag, value] of Object.entries(args)) {
    if (!SAFE.test(value ?? "")) {
      throw new Error(`Unerwarteter Wert für ${flag}.`);
    }
  }

  let url;
  try {
    url = execFileSync(
      "npx",
      [
        "neonctl",
        "connection-string",
        NEON_BRANCH_PRODUCTION,
        ...Object.entries(args).flat(),
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], shell: true },
    ).trim();
  } catch {
    throw new Error(
      "Neon-CLI konnte die URL nicht holen. Einmalig anmelden: `npx neonctl auth`.",
    );
  }
  if (!/^postgres(ql)?:\/\//.test(url)) {
    throw new Error("Unerwartete Ausgabe vom Neon-CLI.");
  }
  return url;
}

// Endpunkt und Datenbankname, ohne Zugangsdaten.
function describe(url) {
  const { host, pathname } = new URL(url);
  return `${host.split(".")[0]} / ${decodeURIComponent(pathname.slice(1))}`;
}

async function main() {
  const action = await select("Was möchtest du tun?", [
    { label: "Studio öffnen", hint: "Daten ansehen", value: "studio" },
    { label: "Schema anwenden", hint: "drizzle-kit push", value: "push" },
  ]);

  // Production gibt es nur für Studio. Schema-Änderungen dort laufen später
  // über Migrationen (drizzle-kit generate/migrate), nicht über push.
  const target =
    action === "studio"
      ? await select("Welche Datenbank?", [
          { label: "Neon development", value: "development" },
          {
            label: "Neon production",
            hint: "geschützt",
            value: "production",
          },
        ])
      : "development";

  const devUrl = developmentUrl();
  const url = target === "production" ? productionUrl(devUrl) : devUrl;
  const label = `Neon ${target} (${describe(url)})`;

  if (target === "production") {
    console.log(
      `\n${red(bold("Achtung:"))} ${label}\n${yellow("Studio kann auch Daten ändern und löschen.")}`,
    );
    const answer = await ask(
      `Tippe "${NEON_BRANCH_PRODUCTION}" zum Bestätigen:`,
    );
    if (answer !== NEON_BRANCH_PRODUCTION) {
      console.log(yellow("Abgebrochen."));
      return;
    }
  } else if (action === "push") {
    const confirmed = await select(`Schema auf ${bold(label)} anwenden?`, [
      { label: "Ja", value: true },
      { label: "Nein", value: false },
    ]);
    if (!confirmed) {
      console.log(yellow("Abgebrochen."));
      return;
    }
  } else {
    console.log(`${dim("Ziel:")} ${cyan(label)}`);
  }

  console.log(green(`\n▶ drizzle-kit ${action}`));
  // DATABASE_URL nur für diesen einen Prozess; drizzle.config.ts liest sie.
  const result = spawnSync("npx", ["drizzle-kit", action], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DATABASE_URL: url },
  });
  process.exitCode = result.status ?? 0; // Strg+C im Studio ist kein Fehler
}

runMain(main);
