// ⚠️ TEMPORÄR: Beispieldaten für die Profilseite, bis die Endpunkte
// (family.get, tasks.list …) stehen. Danach diese Datei löschen.

import type { FamilyMember, TaskTemplate } from "@/types/profile";

export const MOCK_FAMILY = {
  name: "Familie Jung",
  inviteCode: "K7PM4XQR",
};

export const MOCK_MEMBERS: FamilyMember[] = [
  {
    id: "u1",
    name: "Jakob",
    email: "jakob@example.com",
    color: "#6366f1",
    isCurrentUser: true,
    isAdmin: true,
  },
  {
    id: "u2",
    name: "Lena",
    email: "lena@example.com",
    color: "#ec4899",
    isCurrentUser: false,
    isAdmin: false,
  },
  {
    id: "u3",
    name: "Max",
    email: "max@example.com",
    color: "#10b981",
    isCurrentUser: false,
    isAdmin: false,
  },
];

/** Erledigte Einträge der laufenden Woche (für die Statistik-Leiste) */
export const MOCK_DONE_THIS_WEEK = 24;

export const MOCK_TASKS: TaskTemplate[] = [
  {
    id: "t1",
    title: "Kochen",
    icon: "kochen",
    category: "Küche",
    slots: ["Morgens", "Mittags", "Abends"],
    isActive: true,
  },
  {
    id: "t2",
    title: "Spülmaschine ausräumen",
    icon: "spuelen",
    category: "Küche",
    slots: [],
    isActive: true,
  },
  {
    id: "t3",
    title: "Einkaufen",
    icon: "einkaufen",
    category: "Erledigungen",
    description: "Liste hängt am Kühlschrank",
    slots: [],
    isActive: true,
  },
  {
    id: "t4",
    title: "Mit dem Hund raus",
    icon: "hund",
    category: "Tiere",
    slots: ["Morgens", "Abends"],
    isActive: true,
  },
  {
    id: "t5",
    title: "Müll rausbringen",
    icon: "muell",
    category: "Haushalt",
    slots: [],
    isActive: true,
  },
  {
    id: "t6",
    title: "Pflanzen gießen",
    icon: "pflanzen",
    category: "Haushalt",
    slots: [],
    isActive: true,
  },
  {
    id: "t7",
    title: "Wäsche waschen",
    icon: "waschen",
    category: "Reinigung",
    slots: [],
    isActive: true,
  },
  {
    id: "t8",
    title: "Staubsaugen",
    icon: "saugen",
    category: "Reinigung",
    slots: [],
    isActive: true,
  },
  {
    id: "t9",
    title: "Bügeln",
    icon: "buegeln",
    category: "Reinigung",
    slots: [],
    isActive: false,
  },
  {
    id: "t10",
    title: "Fenster putzen",
    icon: "putzen",
    category: "Reinigung",
    slots: [],
    isActive: false,
  },
];
