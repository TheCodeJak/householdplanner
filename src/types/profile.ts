import type { TaskIconName } from "@/lib/taskIcons";
import type { Person } from "./plan";

// Typen der Profilseite (Familie verwalten, Aufgaben-Vorlagen bearbeiten).

/** Ein Mitglied der Familie, wie es die Profilseite anzeigt */
export type FamilyMember = Person & {
  email: string;
  isAdmin: boolean;
};

/** Eine Aufgaben-Vorlage (Tabelle `task` + ihre `task_slot`-Labels) */
export type TaskTemplate = {
  id: string;
  title: string;
  icon: TaskIconName | null;
  category: string;
  description?: string;
  /** Labels der Zeitfenster in Reihenfolge, leer = einmal am Tag */
  slots: string[];
  /** false = archiviert: nicht mehr im Plan, Verlauf bleibt erhalten */
  isActive: boolean;
};
