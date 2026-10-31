import type { TaskIconName, TaskIconTone } from "@/lib/taskIcons";
import type { CategoryView, Person } from "./plan";

// Typen der Profilseite (Familie verwalten, Aufgaben-Vorlagen bearbeiten).

/** Ein Mitglied der Familie, wie es die Profilseite anzeigt */
export type FamilyMember = Person & {
  email: string;
  isAdmin: boolean;
};

/** Ein Zeitfenster einer Aufgaben-Vorlage (Tabelle `task_slot`) */
export type SlotTemplate = {
  id: string;
  label: string;
};

/** Eine Kategorie der Familie zur Verwaltung (Tabelle `category`) */
export type CategoryOption = {
  id: string;
  name: string;
  tone: TaskIconTone;
  icon: TaskIconName | null;
  /** Aufgaben in dieser Kategorie, auch archivierte (so viele wandern beim Löschen nach "Sonstiges") */
  taskCount: number;
};

/** Eine Aufgaben-Vorlage (Tabelle `task` + ihre `task_slot`-Zeilen) */
export type TaskTemplate = {
  id: string;
  title: string;
  icon: TaskIconName | null;
  category: CategoryView;
  description?: string;
  /** Zeitfenster in Reihenfolge, leer = einmal am Tag */
  slots: SlotTemplate[];
  /** false = archiviert: nicht mehr im Plan, Verlauf bleibt erhalten */
  isActive: boolean;
};

/**
 * Stand des Formulars "Aufgabe anlegen / bearbeiten". Bestehende Zeitfenster
 * behalten ihre `id`, neue haben keine. Daran erkennt der Server, welche
 * Zeitfenster umbenannt, neu angelegt oder entfernt wurden.
 */
export type TaskDraft = {
  title: string;
  icon: TaskIconName | null;
  /** null = "Sonstiges" (keine Kategorie) */
  categoryId: string | null;
  description: string;
  slots: { id?: string; label: string }[];
};

/** Die Familie des angemeldeten Nutzers, wie die Profilseite sie anzeigt */
export type FamilyOverview = {
  name: string;
  /** Älteste Familien haben noch keinen; ein Admin kann einen erzeugen */
  inviteCode: string | null;
  /** Admins zuerst, danach nach Beitritt */
  members: FamilyMember[];
  /** Erledigte Einträge der laufenden Woche (Mo bis So) */
  doneThisWeek: number;
};

/**
 * Antwort der Onboarding-Aktionen (Familie gründen / beitreten). Fehler sind
 * hier Daten statt Exceptions: Der Text ist für den Nutzer gedacht.
 */
export type FamilyActionResult =
  | {
      ok: true;
      familyName: string;
      /** Nur nach dem Gründen: der Code für die anderen */
      inviteCode?: string;
      members: Person[];
    }
  | { ok: false; error: string };
