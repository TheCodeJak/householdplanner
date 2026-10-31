// Die Schema-Änderungen der Version „Kategorien mit Farben“ als einzelne,
// wiederholbare Schritte. Jeder Schritt prüft zuerst, ob es sein Ergebnis schon
// gibt, und legt es sonst an (nichts davon ändert oder löscht vorhandene Daten).
// Namen und Typen sind die, die drizzle-kit push in der Entwicklungs-DB erzeugt
// hat (siehe src/db/schema.ts).

const exists = async (tx, query) => (await query)[0].ok;

const tableExists = (tx, name) =>
  exists(tx, tx`select to_regclass(${"public." + name}) is not null as ok`);

const columnExists = (tx, table, column) =>
  exists(
    tx,
    tx`select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = ${table} and column_name = ${column}
    ) as ok`,
  );

const indexExists = (tx, name) =>
  exists(tx, tx`select to_regclass(${"public." + name}) is not null as ok`);

const constraintExists = (tx, name) =>
  exists(
    tx,
    tx`select exists (select 1 from pg_constraint where conname = ${name}) as ok`,
  );

export const STEPS = [
  {
    label: "Tabelle category",
    done: (tx) => tableExists(tx, "category"),
    run: (tx) =>
      tx.unsafe(`
        create table category (
          id uuid primary key default gen_random_uuid(),
          family_id uuid not null,
          name text not null,
          tone text not null default 'slate',
          icon text,
          sort_order integer not null default 0,
          created_at timestamp not null default now()
        )`),
  },
  {
    label: "Spalte category.icon",
    done: (tx) => columnExists(tx, "category", "icon"),
    run: (tx) => tx.unsafe(`alter table category add column icon text`),
  },
  {
    label: "Fremdschlüssel category → family",
    done: (tx) => constraintExists(tx, "category_family_id_family_id_fk"),
    run: (tx) =>
      tx.unsafe(`
        alter table category add constraint category_family_id_family_id_fk
        foreign key (family_id) references family(id) on delete cascade`),
  },
  {
    label: "Index category_family_name_idx (Name pro Familie eindeutig)",
    done: (tx) => indexExists(tx, "category_family_name_idx"),
    run: (tx) =>
      tx.unsafe(`
        create unique index category_family_name_idx
        on category (family_id, lower(name))`),
  },
  {
    label: "Spalte task.category_id",
    done: (tx) => columnExists(tx, "task", "category_id"),
    run: (tx) => tx.unsafe(`alter table task add column category_id uuid`),
  },
  {
    label: "Fremdschlüssel task → category",
    done: (tx) => constraintExists(tx, "task_category_id_category_id_fk"),
    run: (tx) =>
      tx.unsafe(`
        alter table task add constraint task_category_id_category_id_fk
        foreign key (category_id) references category(id) on delete set null`),
  },
  {
    label: "Index task_category_idx",
    done: (tx) => indexExists(tx, "task_category_idx"),
    run: (tx) =>
      tx.unsafe(`create index task_category_idx on task (category_id)`),
  },
  {
    label: "Spalte user.color",
    done: (tx) => columnExists(tx, "user", "color"),
    run: (tx) => tx.unsafe(`alter table "user" add column color text`),
  },
];

/**
 * Legt fehlende Teile an und gibt je Schritt zurück, ob er nötig war.
 * Läuft in der Transaktion des Aufrufers (so lässt sich alles zurückrollen).
 */
export async function applySchemaUpdate(tx) {
  const result = [];
  for (const step of STEPS) {
    const already = await step.done(tx);
    if (!already) await step.run(tx);
    result.push({ label: step.label, created: !already });
  }
  return result;
}

/** Sind danach alle Teile da? Gibt die Namen der fehlenden zurück. */
export async function missingAfter(tx) {
  const missing = [];
  for (const step of STEPS) {
    if (!(await step.done(tx))) missing.push(step.label);
  }
  return missing;
}
