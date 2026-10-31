// Einmaliger Umzug: Jede Person bekommt ihre Farbe als Spalte user.color.
//
// Aufruf:
//   node scripts/backfill-colors.mjs           Trockenlauf (alles wird zurückgerollt)
//   node scripts/backfill-colors.mjs --apply   Änderungen festschreiben
//
// Ziel: development aus .env.local. Eine andere Datenbank (z. B. production)
// nur ausdrücklich über BACKFILL_DATABASE_URL, mit Bestätigung durch Tippen.
//
// Regeln:
// - Legt die Spalte an, falls sie fehlt (ADD COLUMN IF NOT EXISTS).
// - Pro Familie bekommen die Mitglieder ohne Farbe der Reihe nach (Beitritt,
//   dann id) die erste Farbe der Palette, die in der Familie noch frei ist.
//   Das entspricht den Farben, die die App bisher nach dem Rang vergeben hat.
// - Wiederholbar: Wer schon eine Farbe hat, bleibt unverändert.
// - Konten ohne Familie bleiben ohne Farbe (sie bekommen sie beim Beitritt).

import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import postgres from "postgres";
import {
  ask,
  bold,
  cyan,
  dim,
  green,
  red,
  runMain,
  yellow,
} from "./lib/ui.mjs";

const APPLY = process.argv.includes("--apply");

// Stand von PERSON_COLORS in src/lib/color.ts zum Zeitpunkt des Umzugs.
// Absichtlich kopiert statt importiert (eine .mjs-Datei kann keine .ts laden,
// und ein späterer Umbau der Palette soll diesen Umzug nicht verändern).
const PALETTE = [
  "#4558ba",
  "#308230",
  "#ba4f45",
  "#337b8a",
  "#ba4593",
  "#867132",
  "#9345ba",
  "#3a8264",
];

class DryRun extends Error {}

function target() {
  if (process.env.BACKFILL_DATABASE_URL) {
    return { url: process.env.BACKFILL_DATABASE_URL, isOverride: true };
  }
  if (!existsSync(".env.local")) {
    throw new Error(".env.local fehlt (Aufruf im Projektordner).");
  }
  // parseEnv statt loadEnvFile: Eine in der Shell gesetzte DATABASE_URL darf
  // die Datei nicht überschreiben.
  const url = parseEnv(readFileSync(".env.local", "utf8")).DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL fehlt in .env.local.");
  return { url, isOverride: false };
}

// Host und Datenbankname ohne Zugangsdaten
function describe(url) {
  const { hostname, pathname } = new URL(url);
  return `${hostname}${pathname}`;
}

async function confirmOverride(url) {
  console.log(
    `\n${red(bold("Achtung:"))} Ziel ist NICHT .env.local, sondern ${bold(describe(url))}`,
  );
  const answer = await ask(
    `Tippe den Datenbanknamen "${new URL(url).pathname.slice(1)}" zum Bestätigen:`,
  );
  if (answer !== new URL(url).pathname.slice(1)) {
    throw new Error("Abgebrochen.");
  }
}

// Dieselbe Regel wie freeColor in src/lib/color.ts
function freeColor(taken) {
  return (
    PALETTE.find((color) => !taken.includes(color)) ??
    PALETTE[taken.length % PALETTE.length]
  );
}

async function main() {
  const { url, isOverride } = target();
  console.log(
    `${dim("Ziel:")} ${cyan(describe(url))}  ${APPLY ? yellow("(festschreiben)") : green("(Trockenlauf)")}`,
  );
  if (isOverride && APPLY) await confirmOverride(url);

  const sql = postgres(url, { max: 1 });
  try {
    await sql
      .begin(async (tx) => {
        await tx`alter table "user" add column if not exists "color" text`;
        // Keine neuen Beitritte, solange der Umzug läuft (Lesen bleibt möglich)
        await tx`lock table "user" in share row exclusive mode`;

        const users = await tx`
          select u.id, u.name, u.family_id, u.color, f.name as family
          from "user" u
          join family f on f.id = u.family_id
          order by u.family_id, u.created_at, u.id`;

        const taken = new Map();
        for (const u of users) {
          if (!u.color) continue;
          taken.set(u.family_id, [...(taken.get(u.family_id) ?? []), u.color]);
        }

        const rows = [];
        for (const u of users) {
          if (u.color) continue;
          const used = taken.get(u.family_id) ?? [];
          const color = freeColor(used);
          taken.set(u.family_id, [...used, color]);
          await tx`update "user" set color = ${color} where id = ${u.id}`;
          rows.push({ Familie: u.family, Person: u.name, Farbe: color });
        }

        console.log(`\n${bold("Plan")}`);
        if (rows.length) console.table(rows);
        else console.log(`  ${dim("nichts zu tun, alle haben eine Farbe")}`);

        // Erwartungs-Check: Bei jeder Abweichung wird alles zurückgerollt
        const count = async (query) => Number((await query)[0].n);
        const checks = {
          "Jedes Mitglied einer Familie hat eine Farbe":
            (await count(tx`
              select count(*) as n from "user"
              where family_id is not null and color is null`)) === 0,
          "Keine Farbe doppelt in einer Familie (bis acht Personen)":
            (await count(tx`
              select count(*) as n from (
                select family_id, color from "user"
                where family_id is not null
                group by family_id, color
                having count(*) > 1 and
                  (select count(*) from "user" x
                   where x.family_id = "user".family_id) <= ${PALETTE.length}
              ) d`)) === 0,
        };

        console.log(`${bold("Prüfung")}`);
        for (const [label, ok] of Object.entries(checks)) {
          console.log(`  ${ok ? green("✔") : red("✖")} ${label}`);
        }
        console.log(`  ${dim(`${rows.length} Farben vergeben`)}`);
        if (!Object.values(checks).every(Boolean)) {
          throw new Error("Prüfung fehlgeschlagen, nichts wurde geändert.");
        }

        if (!APPLY) throw new DryRun();
      })
      .catch((error) => {
        if (!(error instanceof DryRun)) throw error;
        console.log(
          `\n${green("Trockenlauf fertig")}: alles zurückgerollt. Zum Festschreiben ${bold("--apply")} anhängen.`,
        );
      });

    if (APPLY) console.log(`\n${green(bold("✔ Festgeschrieben."))}`);
  } finally {
    await sql.end();
  }
}

runMain(main);
