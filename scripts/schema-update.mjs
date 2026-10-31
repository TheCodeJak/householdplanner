// Schema-Änderungen der Version „Kategorien mit Farben“: Tabelle category,
// Spalten task.category_id, category.icon und user.color samt Indizes und
// Fremdschlüsseln. Für Datenbanken, auf denen `drizzle-kit push` nicht
// läuft (Production).
//
// Aufruf:
//   node scripts/schema-update.mjs           Trockenlauf (alles wird zurückgerollt)
//   node scripts/schema-update.mjs --apply   Änderungen festschreiben
//
// Ziel: development aus .env.local. Mit --production die Production-Datenbank:
// Ihre URL holt das Skript zur Laufzeit per Neon-CLI (lib/target.mjs), du musst
// nichts kopieren. Festschreiben auf Production nur nach Bestätigung durch Tippen.
//
// Reihenfolge für Production (jeweils erst ohne, dann mit --apply):
//   1. schema-update.mjs      legt Tabelle und Spalten an
//   2. backfill-categories.mjs  macht aus dem Kategorie-Text echte Kategorien
//   3. backfill-colors.mjs      vergibt die Farben der Personen
//
// Regeln:
// - Nur Anlegen, nie Ändern oder Löschen: Vorhandene Daten bleiben unberührt.
// - Wiederholbar: Was es schon gibt, wird übersprungen.
// - Alte Programmversionen laufen mit den neuen Spalten weiter (alles optional),
//   die Datenbank kann also VOR dem Deployment umgebaut werden.

import postgres from "postgres";
import { applySchemaUpdate, missingAfter } from "./lib/schemaUpdate.mjs";
import { bold, cyan, dim, green, red, runMain, yellow } from "./lib/ui.mjs";
import { confirmProduction, describe, resolveTarget } from "./lib/target.mjs";

const APPLY = process.argv.includes("--apply");

class DryRun extends Error {}

async function main() {
  const { url, name } = resolveTarget();
  console.log(
    `${dim("Ziel:")} ${cyan(`Neon ${name} (${describe(url)})`)}  ${APPLY ? yellow("(festschreiben)") : green("(Trockenlauf)")}`,
  );
  if (name === "production" && APPLY) await confirmProduction();

  const sql = postgres(url, { max: 1 });
  try {
    await sql
      .begin(async (tx) => {
        const steps = await applySchemaUpdate(tx);

        console.log(`\n${bold("Plan")}`);
        console.table(
          steps.map(({ label, created }) => ({
            Schritt: label,
            Zustand: created ? "wird angelegt" : "vorhanden",
          })),
        );

        // Erwartungs-Check: Fehlt danach etwas, wird alles zurückgerollt
        const missing = await missingAfter(tx);
        console.log(`${bold("Prüfung")}`);
        console.log(
          `  ${missing.length === 0 ? green("✔") : red("✖")} Alle Tabellen, Spalten, Indizes und Fremdschlüssel sind da`,
        );
        for (const label of missing)
          console.log(`    ${red("fehlt:")} ${label}`);
        if (missing.length > 0) {
          throw new Error("Prüfung fehlgeschlagen, nichts wurde geändert.");
        }

        const created = steps.filter((s) => s.created).length;
        console.log(
          `  ${dim(`${created} von ${steps.length} Schritten waren nötig`)}`,
        );

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
