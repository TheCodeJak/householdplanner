// Einmaliger Datenumzug: Kategorien von task.category (Text) in die Tabelle
// category und die Spalte task.category_id.
//
// Aufruf:
//   node scripts/backfill-categories.mjs           Trockenlauf (alles wird zurückgerollt)
//   node scripts/backfill-categories.mjs --apply   Änderungen festschreiben
//
// Ziel: development aus .env.local. Eine andere Datenbank (z. B. production)
// nur ausdrücklich über BACKFILL_DATABASE_URL, mit Bestätigung durch Tippen.
//
// Regeln:
// - Pro Familie wird jeder Kategoriename zu EINER Zeile in category, wobei
//   Groß-/Kleinschreibung zusammenfällt (wie der Unique-Index auf lower(name)).
// - Leere Kategorien, null und der Text "Sonstiges" bleiben ohne category_id:
//   "Sonstiges" ist keine Zeile, sondern die Sammelgruppe in der App.
// - Der Ton ist der, den die App bisher aus dem ersten Icon der Gruppe abgeleitet
//   hat (aktive Aufgaben zuerst), damit nach dem Umzug alles wie vorher aussieht.
// - Die Reihenfolge (sort_order) entspricht der bisherigen Sortierung nach Text.
// - Wiederholbar: Aufgaben mit category_id werden übersprungen, bestehende
//   Kategorien wiederverwendet.
// - task.category (Text) bleibt unverändert. Zurück: UPDATE task SET
//   category_id = NULL; DELETE FROM category;

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
const DEFAULT_CATEGORY = "Sonstiges";

// Stand von taskIconTones in src/lib/taskIcons.ts zum Zeitpunkt des Umzugs.
// Absichtlich kopiert statt importiert: Ein späterer Umbau der App darf das
// Ergebnis dieses Umzugs nicht verändern.
const ICON_TONES = {
  aufraeumen: "sky",
  waschen: "sky",
  saugen: "sky",
  wischen: "sky",
  putzen: "sky",
  buegeln: "sky",
  spuelen: "sky",
  kochen: "amber",
  essen: "amber",
  braten: "amber",
  toasten: "amber",
  kaffee: "amber",
  kuehlschrank: "amber",
  einkaufen: "violet",
  besorgungen: "violet",
  post: "violet",
  paket: "violet",
  hund: "pink",
  katze: "pink",
  pflanzen: "emerald",
  muell: "teal",
  wecker: "indigo",
  zuhause: "indigo",
  kalender: "indigo",
  planung: "indigo",
  schluessel: "indigo",
  bett: "indigo",
  finanzen: "lime",
  apotheke: "rose",
};
const FALLBACK_TONE = "slate";

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

const isVirtual = (name) =>
  !name?.trim() || name.trim().toLowerCase() === DEFAULT_CATEGORY.toLowerCase();

function mostCommon(counts) {
  let best = null;
  for (const [name, n] of counts) if (!best || n > best[1]) best = [name, n];
  return best[0];
}

// Aus den Aufgaben (sortiert wie bisher: Kategorie-Text, dann Titel) die
// Gruppen pro Familie bilden: { familyId -> [{ name, tone, taskIds }] }
function planGroups(tasks) {
  const families = new Map();
  for (const t of tasks) {
    if (t.category_id || isVirtual(t.category)) continue;
    const text = t.category.trim();
    const groups = families.get(t.family_id) ?? new Map();
    families.set(t.family_id, groups);
    const g = groups.get(text.toLowerCase()) ?? {
      spellings: new Map(),
      taskIds: [],
      tones: { active: null, any: null },
    };
    groups.set(text.toLowerCase(), g);

    g.spellings.set(text, (g.spellings.get(text) ?? 0) + 1);
    g.taskIds.push(t.id);
    const tone = ICON_TONES[t.icon];
    if (tone) {
      g.tones.any ??= tone;
      if (t.is_active) g.tones.active ??= tone;
    }
  }

  return new Map(
    [...families].map(([familyId, groups]) => [
      familyId,
      [...groups.values()].map((g) => ({
        name: mostCommon(g.spellings),
        tone: g.tones.active ?? g.tones.any ?? FALLBACK_TONE,
        taskIds: g.taskIds,
      })),
    ]),
  );
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
        // Keine Änderungen an Aufgaben, solange der Umzug läuft (Lesen bleibt möglich)
        await tx`lock table task in share row exclusive mode`;

        const tasks = await tx`
          select id, family_id, category, category_id, icon, is_active
          from task
          order by family_id, category nulls last, title`;
        const families = await tx`select id, name from family`;
        const familyName = new Map(families.map((f) => [f.id, f.name]));
        const total = tasks.length;

        const plan = planGroups(tasks);
        const rows = [];
        let createdCount = 0;
        let assignedCount = 0;

        for (const [familyId, groups] of plan) {
          let [{ next }] = await tx`
            select coalesce(max(sort_order), -1) + 1 as next
            from category where family_id = ${familyId}`;

          for (const g of groups) {
            const [existing] = await tx`
              select id from category
              where family_id = ${familyId} and lower(name) = lower(${g.name})`;
            let id = existing?.id;
            if (!id) {
              [{ id }] = await tx`
                insert into category (family_id, name, tone, sort_order)
                values (${familyId}, ${g.name}, ${g.tone}, ${next++})
                returning id`;
              createdCount++;
            }
            const updated = await tx`
              update task set category_id = ${id}
              where id in ${tx(g.taskIds)} and category_id is null
              returning id`;
            assignedCount += updated.length;
            rows.push({
              Familie: familyName.get(familyId),
              Kategorie: g.name,
              Ton: g.tone,
              Aufgaben: updated.length,
              Neu: existing ? "nein" : "ja",
            });
          }
        }

        console.log(`\n${bold("Plan")}`);
        console.table(rows);

        // Erwartungs-Check: Bei jeder Abweichung wird alles zurückgerollt
        const count = async (query) => Number((await query)[0].n);
        const checks = {
          "Aufgaben insgesamt unverändert":
            (await count(tx`select count(*) as n from task`)) === total,
          "Text-Kategorie ohne category_id (außer Sonstiges)":
            (await count(tx`
              select count(*) as n from task
              where category_id is null
                and nullif(trim(category), '') is not null
                and lower(trim(category)) <> lower(${DEFAULT_CATEGORY})`)) ===
            0,
          "Sonstiges/leer hat keine category_id":
            (await count(tx`
              select count(*) as n from task
              where category_id is not null
                and (nullif(trim(category), '') is null
                  or lower(trim(category)) = lower(${DEFAULT_CATEGORY}))`)) ===
            0,
          "Aufgabe und Kategorie gehören zur selben Familie":
            (await count(tx`
              select count(*) as n from task t
              join category c on c.id = t.category_id
              where c.family_id <> t.family_id`)) === 0,
          "Name der Kategorie passt zum alten Text":
            (await count(tx`
              select count(*) as n from task t
              join category c on c.id = t.category_id
              where lower(c.name) <> lower(trim(t.category))`)) === 0,
        };

        console.log(`${bold("Prüfung")}`);
        for (const [label, ok] of Object.entries(checks)) {
          console.log(`  ${ok ? green("✔") : red("✖")} ${label}`);
        }
        console.log(
          `  ${dim(`${createdCount} Kategorien angelegt, ${assignedCount} Aufgaben zugeordnet`)}`,
        );
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
