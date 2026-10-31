// Welche Datenbank ist das Ziel eines Skripts?
//
// development: URL aus .env.local (der Standard).
// production:  URL kommt zur Laufzeit aus dem Neon-CLI und liegt nie in einer
//              Datei oder in der Zwischenablage. Aktiviert mit `--production`.
//              Einmalig nötig: `npx neonctl auth` und die Datei `.neon` mit der
//              Projekt-ID (`npx neonctl set-context --project-id <id>`).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { ask, bold, red, yellow } from "./ui.mjs";

export const NEON_BRANCH_PRODUCTION = "production";

// Nur sichere Zeichen, weil die Werte unten in einen Shell-Aufruf wandern.
const SAFE = /^[\w.-]+$/;

export function developmentUrl() {
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
export function productionUrl(devUrl) {
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
export function describe(url) {
  const { host, pathname } = new URL(url);
  return `${host.split(".")[0]} / ${decodeURIComponent(pathname.slice(1))}`;
}

/**
 * Ziel eines Umzugs-Skripts: Standard development, mit `--production` die
 * Production-Datenbank. `name` ist "development" oder "production".
 */
export function resolveTarget(argv = process.argv) {
  const devUrl = developmentUrl();
  if (argv.includes("--production")) {
    return { name: NEON_BRANCH_PRODUCTION, url: productionUrl(devUrl) };
  }
  return { name: "development", url: devUrl };
}

/** Festschreiben auf Production nur, wenn „production“ eingetippt wird */
export async function confirmProduction() {
  console.log(
    `\n${red(bold("Achtung:"))} Das schreibt auf die ${bold("Production")}-Datenbank.`,
  );
  const answer = await ask(`Tippe "${NEON_BRANCH_PRODUCTION}" zum Bestätigen:`);
  if (answer !== NEON_BRANCH_PRODUCTION) {
    throw new Error(yellow("Abgebrochen."));
  }
}
