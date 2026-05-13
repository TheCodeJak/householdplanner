import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  boolean,
  integer,
  unique,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    familyIdx: index("task_family_idx").on(t.familyId),
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
    // Tasks MIT Slot: Kombination muss eindeutig sein
    uniqueWithSlot: unique("unique_with_slot").on(
      t.taskId,
      t.assignedToId,
      t.date,
      t.slotId,
    ),

    // Tasks OHNE Slot: Partial Index verhindert Duplikate wenn slotId = null
    // (SQL NULL != NULL — der unique constraint oben greift für null-Werte nicht)
    uniqueWithoutSlot: uniqueIndex("unique_without_slot")
      .on(t.taskId, t.assignedToId, t.date)
      .where(sql`slot_id IS NULL`),

    dateIdx: index("assignments_date_idx").on(t.date),
    assignedToIdx: index("assignments_user_idx").on(t.assignedToId),
  }),
);
