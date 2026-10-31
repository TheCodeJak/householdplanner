// Datenbank-Werkzeuge für Neon: Studio öffnen oder Schema anwenden.
// Aufruf: npm run db
//
// development: URL aus .env.local
// production:  URL kommt zur Laufzeit aus dem Neon-CLI und liegt nie in einer Datei.
//              Nur Studio, nie push, und nur nach Bestätigung durch Tippen.

import { spawnSync } from "node:child_process";
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
import {
  NEON_BRANCH_PRODUCTION,
  describe,
  developmentUrl,
  productionUrl,
} from "./lib/target.mjs";

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
