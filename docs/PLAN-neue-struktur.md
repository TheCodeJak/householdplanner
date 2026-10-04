# Plan: Neue Struktur, Logik und Modal-Anbindung (Mobile First)

Stand: 2026-10-04. Dieses Dokument ist nur ein Plan, es wurde dafür kein Code geändert.

## 1. Ausgangslage (aus dem Code, nicht geraten)

Bereits überarbeitet und beibehalten: `TaskWrapper` (Karte), `DaySelect`, `BottomNav`. Die jaklib-Migration von Button, Card, TextField und Modal ist erledigt (Plan 1).

Probleme, die dieser Plan löst:

| # | Befund | Fundstelle |
|---|---|---|
| 1 | `dashboard/page.tsx` zeigt hartcodierte Demo-Karten. Die echten Daten laufen noch durch die alte `MobileView`. | `page.tsx:63-107` |
| 2 | Drei getrennte Zustände für "welcher Tag": `dayOffset`, `weekOffset`, `selectedDayIdx`. Sie hängen nicht zusammen, `DaySelect` ändert die Daten nicht. | `page.tsx:14-16` |
| 3 | Bug: `getDayByDayOffset(0)` liefert den **Montag** der Woche, nicht heute. Die Seite öffnet deshalb immer auf Montag. | `dateUtils.ts:40` |
| 4 | `CellModal` hat 10 Props (8 Callbacks). `page.tsx` baut die Callbacks in einer verschachtelten IIFE zusammen. | `cellModal.tsx`, `page.tsx:174-236` |
| 5 | Datenmodell `Row` > `DayCell` > `SlotEntry` > `AssignmentData` ist ein 7-Tage-Raster, die Mobile-Ansicht braucht aber nur einen Tag. | `types/plan.ts` |
| 6 | `FAMILY_ID` ist hartcodiert und wird aus einer Hook-Datei exportiert. | `useWeekPlan.ts:7` |
| 7 | "Sofort erledigen" macht zwei Requests (`assign`, dann `complete`). Schlägt der zweite fehl, bleibt die Aufgabe halb übernommen. | `page.tsx:222-232` |
| 8 | Serverseitig prüft `unassign`/`uncomplete` nicht, wem die Zuweisung gehört. `tasks.add` prüft keine Familienzugehörigkeit. `title` hat keine Validierung. | `routers/*.ts` |
| 9 | Komponenten liegen unter `src/app/components`. Unter `app/` sollten nur Routen liegen. | Ordnerstruktur |

## 2. Regeln

- **Max. 5 Props pro Komponente.** Mehr bedeutet: aufteilen, oder Daten per Hook holen statt durchreichen. Ein gebündeltes Domänenobjekt (z. B. `task: TaskView`) zählt als 1 Prop.
- **Hooks haben max. 3 Argumente.**
- **Komponenten rendern, Hooks holen/ändern Daten, reine Funktionen berechnen.** Keine API-Aufrufe oder Datenumbauten im JSX.
- **Eine Quelle der Wahrheit pro Zustand**, z. B. ein `selectedDate` statt drei Offsets.
- **Neue Komponenten nutzen jaklib**, sofern dort eine existiert (`Button`, `Card`, `Modal`, `TextField`).
- **Benennung:** Komponentendateien in PascalCase (`TaskCard.tsx`), Hooks und Funktionen in camelCase (`useDayPlan.ts`). Ordner sind nach Dateityp gegliedert (`components`, `hooks`, `lib`, `types`), nicht nach Feature. Siehe offene Entscheidung A.

## 3. Zielstruktur

```
src/
  app/                          nur Routen und Layouts
    (auth)/                     unverändert
    (dashboard)/
      layout.tsx
      dashboard/page.tsx        setzt Hooks und Komponenten zusammen
      calendar/ profile/ statistics/   unverändert
    api/                        unverändert
  components/
    layout/
      BottomNav.tsx             (bleibt)
      NavButton.tsx             (bleibt)
    dashboard/
      DayNavigator.tsx          (war daySelect.tsx)
      StatusFilter.tsx          Alle/Offen/Erledigt
      TaskCardList.tsx
      TaskCard.tsx              (war taskWrapper.tsx)
      TaskSlotRow.tsx
      AddTaskButton.tsx         schwebender "+"-Button
    modals/
      TaskDetailModal.tsx       (war cellModal.tsx)
      NewTaskModal.tsx          (war taskModal.tsx)
      SlotListEditor.tsx        Zeitslots im NewTaskModal
    ui/
      TaskStatusIcon.tsx
      PersonDot.tsx
    icons/                      nur noch tatsächlich genutzte Icons
  hooks/
    useSelectedDay.ts
    useDayPlan.ts
    useAssignmentActions.ts
    useCreateTask.ts
    useModalTarget.ts
  lib/
    dateUtils.ts, color.ts, trpc.tsx, auth.ts, family.ts   (vorhanden)
    buildDayPlan.ts             reine Funktion: API-Daten -> TaskView[]
    getSlotActions.ts           reine Funktion: Slot -> verfügbare Aktionen
  types/
    plan.ts                     TaskView, SlotView, Person, TaskStatus, SlotRef
  db/                           unverändert
```

Die Aufteilung nach Dateityp ist die, die das Projekt schon hat (`lib/`, `types/`). `components/` zieht nur aus `app/` heraus und wird in vier kleine Ordner gegliedert. Es gibt keine Feature-Ordner und keinen Screen-Wrapper: `dashboard/page.tsx` setzt Navigator, Liste und Modals selbst zusammen. Das bleibt unter 5 Hook-Aufrufen und ist damit lesbar.

## 4. Datenmodell (UI)

Ersetzt `types/plan.ts`.

```ts
type TaskStatus = "open" | "claimed" | "completed";

type Person = { id: string; name: string; color: string; isCurrentUser: boolean };

type SlotView = {
  slotId: string | null;        // null = Aufgabe ohne Zeitslot
  label: string | null;         // "Morgens" ...
  status: TaskStatus;
  assignmentId: string | null;
  assignee: Person | null;
  completedBy: Person | null;   // nur gesetzt, wenn abweichend vom Assignee
  note: string | null;
};

type TaskView = { taskId: string; title: string; slots: SlotView[] };

type SlotRef = { taskId: string; slotId: string | null; date: string }; // ISO-Datum
```

Statusableitung in `buildDayPlan`: keine Zuweisung = `open`, Zuweisung ohne `completedAt` = `claimed`, mit `completedAt` = `completed`. `completedBy` wird nur gesetzt, wenn `completedById !== assignedToId`. Das entspricht dem Pfeil "J → L" in `TaskCard`.

## 5. Komponenten und Props (alle <= 5)

| Komponente | Props | Anzahl |
|---|---|---|
| `DashboardPage` (page.tsx) | keine | 0 |
| `DayNavigator` | `date`, `isToday`, `onShift(delta)`, `onToday` | 4 |
| `StatusFilter` | `value`, `onChange` | 2 |
| `TaskCardList` | `tasks`, `onSelect(ref)`, `date` | 3 |
| `TaskCard` | `task`, `onSelect(slotId)` | 2 |
| `TaskSlotRow` | `slot`, `onSelect` | 2 |
| `TaskStatusIcon` | `status` | 1 |
| `PersonDot` | `person` | 1 |
| `AddTaskButton` | `onClick` | 1 |
| `TaskDetailModal` | `open`, `onClose`, `target` | 3 |
| `NewTaskModal` | `open`, `onClose` | 2 |
| `SlotListEditor` | `value`, `onChange` | 2 |

`TaskDetailModal` bekommt keine Callbacks mehr. Es holt den aktuellen Slot über `useDayPlan(target.date)` und führt Aktionen über `useAssignmentActions()` aus.

## 6. Hooks

| Hook | Aufgabe |
|---|---|
| `useSelectedDay()` | Ein `selectedDate`. Liefert `{ date, isToday, shift(n), goToday }`. Startwert ist **heute**. |
| `useDayPlan(date)` | Lädt `tasks.getByFamily` und `assignments.getForWeek` (Montag des Datums) und liefert `TaskView[]` über `buildDayPlan`. Tagwechsel innerhalb einer Woche ist ein Cache-Treffer und damit sofort da. |
| `useAssignmentActions()` | `claim`, `release`, `complete`, `reopen`, `claimAndComplete`, `isPending`, `error`. Kapselt die vier Mutationen samt Cache-Invalidierung und optimistischem Update. |
| `useCreateTask()` | `tasks.add` samt Invalidierung und Fehlertext. |
| `useModalTarget<T>()` | `{ target, isOpen, openFor(t), close }`. Behält `target` nach `close()`, damit das Sheet beim Ausblenden nicht leer wird. Ersetzt `modal`, `cellModalOpen` und die IIFE in `page.tsx`. |

## 7. API-Anbindung

Wiederverwendet (unverändert): `tasks.getByFamily`, `assignments.getForWeek`, `assign`, `unassign`, `complete`, `uncomplete`, `tasks.add`.

Zu ändern oder neu (kleiner Backend-Umfang, Phase 2 und 7):

1. **`assignments.assignAndComplete`** (neu): eine Transaktion statt zweier Requests. Löst Befund 7.
2. **Berechtigungen:** `unassign` nur durch den Assignee. `uncomplete` nur durch den, der erledigt hat. `complete` darf jeder in der Familie, das passt zum UI-Text "Ich habe das erledigt".
3. **Validierung (zod):** `title` mit `.trim().min(1).max(80)`, `slots` höchstens 6 Einträge mit je max. 20 Zeichen, `date` als ISO-Muster `YYYY-MM-DD`.
4. **`familyId` aus der Session:** `familyId` in den JWT und die Session aufnehmen (`lib/auth.ts` Callbacks). Die Router leiten die Familie aus `ctx` ab, statt sie vom Client zu nehmen. `FAMILY_ID` entfällt. Löst Befund 6 und 8.
5. **`assignments.getForDate`** wird nicht benutzt und kann gelöscht werden.

Optimistische Updates (Phase 2): `complete`, `reopen`, `claim` und `release` schreiben per `onMutate` in den Cache von `getForWeek` und rollen bei `onError` zurück. Das ist auf dem Handy der Unterschied zwischen "träge" und "fühlt sich nativ an". Fehler zeigt die UI inline im Modal oder als Text unter der Karte. Das aktuelle `alert(err.message)` fällt weg.

## 8. Modal-Verhalten

`TaskDetailModal` (jaklib `Modal`, `variant="sheet"`):

- Titel `task.title` (plus Slot-Label), Untertitel das Datum.
- Abschnitte: "Geplant von", "Erledigt von", "Notiz". Jeder ist eine eigene kleine Komponente mit `person` bzw. `note` als Prop.
- Buttons kommen aus `getSlotActions(slot)`, einer reinen Funktion, die eine Liste `{ key, label, variant }` liefert. Das ersetzt die verschachtelten `&&`-Blöcke:

| Zustand | Aktionen |
|---|---|
| offen | "Ich mache das" (primary), "Sofort erledigen" (ghost) |
| übernommen, von mir | "Als erledigt markieren" (primary), "Nicht mehr ich" (ghost) |
| übernommen, von anderem | "Ich habe das erledigt" (primary) |
| erledigt, von mir | "Doch nicht erledigt" (ghost) |
| erledigt, von anderem | keine |

- Nach erfolgreicher Aktion schließt das Sheet (siehe offene Entscheidung B). Die Karte in der Liste zeigt den neuen Zustand sofort (optimistisch).

`NewTaskModal`: `TextField` für den Titel, `SlotListEditor` für die Zeitslots (Eingabe per `TextField`, Chips mit Entfernen-Button). Der Button ist deaktiviert, bis der Titel gültig ist. Serverfehler erscheinen als Text im Sheet.

## 9. Phasen

Jede Phase endet mit einer lauffähigen App. Prüfung jeweils: `npx tsc --noEmit`, `npx eslint src` und manuell im Mobile-Viewport (375x812) mit dem lokalen Testaccount.

**Phase 0: Vorbereitung**
- Aktuellen Stand committen (jaklib-Migration plus deine Redesigns), danach Branch `refactor/day-plan`.
- Optional: Vitest einrichten, nur für reine Funktionen (`buildDayPlan`, `getSlotActions`, `dateUtils`).

**Phase 1: Fundament (keine sichtbare Änderung außer dem Tag-Bug)**
- `types/plan.ts` (neues Modell), `lib/buildDayPlan.ts`, `lib/getSlotActions.ts`.
- `dateUtils`: `addDays`, `isSameDay`, `getMonday(date)` ergänzen. `getDayByDayOffset` und `getDayByWeekOffset` entfernen.
- `useSelectedDay`. Der Navigator öffnet damit auf **heute** (Befund 3).
- `lib/family.ts` mit der Konstante `FAMILY_ID` als Übergang bis Phase 7.

**Phase 2: Datenlayer**
- `useDayPlan`, `useAssignmentActions` (mit optimistischen Updates), `useCreateTask`.
- Backend: `assignAndComplete`, Berechtigungsprüfungen, zod-Validierung.
- Alte `useWeekPlan.ts` bleibt noch bestehen, bis Phase 3 sie ablöst.

**Phase 3: Liste mit echten Daten**
- `TaskCard` (aus `taskWrapper.tsx`, Logik unverändert), `TaskSlotRow`, `TaskStatusIcon`, `PersonDot`, `TaskCardList`, `StatusFilter`, `DayNavigator`.
- `dashboard/page.tsx` auf die neuen Komponenten und Hooks umbauen. Demo-Karten und alte `MobileView` entfallen.

**Phase 4: Detail-Modal**
- `useModalTarget`, `TaskDetailModal` mit `useDayPlan` und `useAssignmentActions`. `cellModal.tsx` und die IIFE entfallen.

**Phase 5: Neue Aufgabe**
- `NewTaskModal`, `SlotListEditor`, `AddTaskButton`. `taskModal.tsx` entfällt.

**Phase 6: Aufräumen**
- Löschen nach Grep-Prüfung: `mobileView.tsx`, `desktopView.tsx`, `dayPicker.tsx`, `weekHeader.tsx`, `taskCell.tsx`, `useWeekPlan.ts`, `cellModal.tsx`, `taskModal.tsx`, `userAvatar.tsx`, `avatarDot.tsx`, `addButton.tsx`, `plusDot.tsx`, `types/plan.ts`, `HomeIcon`, `CloseButton`, ungenutzte Icons.
- Komponenten aus `src/app/components` nach `src/components/{layout,dashboard,modals,ui,icons}` verschieben, Importpfade anpassen.
- `formik` aus `devDependencies` nach `dependencies` verschieben (wird zur Laufzeit im Login benutzt).

**Phase 7: Familie aus der Session**
- `familyId` in JWT und Session, Router leiten sie aus `ctx` ab, `FAMILY_ID` und `lib/family.ts` entfallen. Eigene Phase, weil sie die Anmeldung berührt. Bestehende Sessions müssen sich danach neu anmelden.

**Phase 8: Design-Pass**
- Aus `TaskCard`, `DayNavigator` und `BottomNav` die verwendeten Werte (Radien, Schatten, Weiß-Transparenz, Textgrößen) als Tokens in `globals.css` festhalten.
- Harte Farben (`text-orange-500`, `bg-[#FEF9F6]`, `slate-*`) in den übrigen Komponenten durch diese Tokens ersetzen. Status-Farben (`open`, `claimed`, `completed`) einmal zentral definieren, nicht je Komponente.
- jaklib-`Avatar` einbauen, sobald dort `size` und `completed` existieren. Bis dahin bleibt `PersonDot` die einzige Avatar-Komponente.

## 10. Offene Entscheidungen (mit meinem Default)

- **A. Dateinamen:** PascalCase für Komponenten (Default) oder weiter camelCase wie jetzt (`taskWrapper.tsx`)?
- **B. Sheet nach Aktion:** schließen (Default, Feedback kommt über die Karte) oder offen lassen wie heute?
- **C. Desktop:** Bis zum neuen Layout zeigt Desktop dieselbe Spalte mit begrenzter Breite (Default), `DesktopView` wird gelöscht (bleibt in Git-Historie).
- **D. Wochenfortschritt und Nutzer-Balken** der alten `MobileView`: weglassen (Default, vorher nicht im neuen Design) oder als `DayProgress` auf den gewählten Tag umgebaut zurückholen?
- **E. Vitest:** einrichten (Default, nur für die reinen Funktionen) oder nur manuell prüfen?

## 11. Risiken

- Optimistische Updates können bei zwei gleichzeitigen Änderungen kurz Flackern verursachen. Mitigation: nach jeder Mutation trotzdem `invalidate`.
- Phase 7 macht alte Sessions ungültig (Familie fehlt im Token). Einmalig neu anmelden.
- Das Löschen in Phase 6 ist erst nach Grep auf Restverwendungen sicher. Zwischenstände sind per Git wiederherstellbar.
