import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// FAMILIES
// ─────────────────────────────────────────────
export const family = pgTable("family", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// user
// ─────────────────────────────────────────────
export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => family.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  // Farbe der Person (Avatar, Marker). Wird einmal beim Beitritt zu einer Familie
  // vergeben (lib/color.ts, freeColor) und ändert sich danach nicht mehr.
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// RATE LIMIT  (Zähler pro Schlüssel und Zeitfenster, siehe lib/rateLimit.ts)
// ─────────────────────────────────────────────
export const rateLimit = pgTable("rate_limit", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

// ─────────────────────────────────────────────
// TASKS  (Aufgaben-Vorlagen)
// ─────────────────────────────────────────────
export const task = pgTable(
  "task",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => family.id, { onDelete: "cascade" }),
    createdById: uuid("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    icon: text("icon"), // Schlüssel aus TASK_ICON_NAMES, z.B. "kochen"
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    familyIdx: index("task_family_idx").on(t.familyId),
    categoryIdx: index("task_category_idx").on(t.categoryId),
  }),
);

// ─────────────────────────────────────────────
// CATEGORIES (Kategorien der tasks)
// ─────────────────────────────────────────────
export const category = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => family.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tone: text("tone").notNull().default("slate"),
    // Eigenes Icon der Kategorie (Schlüssel aus TASK_ICON_NAMES); leer = das der ersten Aufgabe
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (c) => ({
    // Name pro Familie eindeutig, egal ob groß oder klein geschrieben
    uniqueName: uniqueIndex("category_family_name_idx").on(
      c.familyId,
      sql`lower(${c.name})`,
    ),
  }),
);

// ─────────────────────────────────────────────
// TASK SLOTS  (optionale Zeitfenster pro Task)
// ─────────────────────────────────────────────
export const taskSlot = pgTable("task_slot", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => task.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // z.B. "Morgens", "Mittags", "Abends"
  sortOrder: integer("sort_order").notNull().default(0),
});

// ─────────────────────────────────────────────
// TASK ASSIGNMENTS  (geplante + erledigte Aufgaben)
// ─────────────────────────────────────────────
export const taskAssignment = pgTable(
  "task_assignment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
    slotId: uuid("slot_id").references(() => taskSlot.id, {
      onDelete: "set null",
    }),
    assignedToId: uuid("assigned_to_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    completedById: uuid("completed_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    date: date("date").notNull(),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueSlotPerDay: unique("unique_slot_per_day")
      .on(t.taskId, t.date, t.slotId)
      .nullsNotDistinct(),

    dateIdx: index("assignments_date_idx").on(t.date),
    assignedToIdx: index("assignments_user_idx").on(t.assignedToId),
  }),
);
