# Plan: Neue Datenstruktur, Logik und Modal-Anbindung (Mobile First)

Stand: 2026-10-04. Dieses Dokument ist nur ein Plan. Es wurde dafür kein Code geändert.

## 0. Arbeitsweise

- **Du schreibst den Code, ich erkläre und prüfe.** Ich fasse keinen Code an, außer du bittest mich ausdrücklich darum.
- Jeder Schritt hat ein Ziel, das Konzept dahinter, was du tust und einen Check. Danach sage mir Bescheid, ich lese deine Änderung und gebe Feedback.
- **Die App bleibt nach jedem Schritt lauffähig.** Neues entsteht neben Altem, Altes wird erst gelöscht, wenn nichts mehr darauf zeigt.
- Von unten nach oben: erst Datenbank und Server, dann der Browser, dann die Oberfläche.

## 1. Ausgangslage

| #   | Befund                                                                                                                                         | Fundstelle                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | `tasks.getByFamily` und `assignments.getForWeek` sind ohne Login abrufbar. Die `FAMILY_ID` steht im Browser-Code.                              | `routers/*.ts`, `useWeekPlan.ts:7`   |
| 2   | Zwei Leute können denselben Slot gleichzeitig übernehmen. Das Unique-Constraint enthält `assignedToId`, `assign` prüft erst und fügt dann ein. | `schema.ts:102`, `assignments.ts:34` |
| 3   | Der Browser baut aus zwei Rohlisten selbst zusammen, wer was übernommen und erledigt hat.                                                      | `useWeekPlan.ts`                     |
| 4   | Drei getrennte Zustände für den Tag (`dayOffset`, `weekOffset`, `selectedDayIdx`). `getDayByDayOffset(0)` liefert den Montag statt heute.      | `page.tsx:14-16`, `dateUtils.ts:40`  |
| 5   | `CellModal` hat 10 Props. `page.tsx` baut die Callbacks in einer IIFE.                                                                         | `cellModal.tsx`, `page.tsx:174`      |
| 6   | "Sofort erledigen" macht zwei Requests. Schlägt der zweite fehl, bleibt die Aufgabe halb übernommen.                                           | `page.tsx:222`                       |
| 7   | Nutzer werden ohne Familie angelegt (`familyId = null`). Es gibt keinen Beitritts- oder Gründungsweg.                                          | `actions.ts`                         |
| 8   | `unassign` und `uncomplete` prüfen nicht, wem die Zuweisung gehört. `title` hat keine Validierung.                                             | `routers/*.ts`                       |
| 9   | Komponenten liegen unter `src/app/components`. Dort sollten nur Routen liegen.                                                                 | Ordnerstruktur                       |

## 2. Regeln

- **Max. 5 Props pro Komponente, max. 3 Argumente pro Hook.** Ein gebündeltes Objekt (z. B. `task: TaskView`) zählt als 1.
- **Komponenten rendern, Hooks holen oder ändern Daten, reine Funktionen berechnen.** Keine Datenumbauten im JSX.
- **Die Familie kommt nie vom Browser**, sondern immer aus der Session.
- **Eine Quelle der Wahrheit pro Zustand**, z. B. ein `selectedDate`.
- **jaklib verwenden**, wo es eine Komponente gibt (`Button`, `Card`, `Modal`, `TextField`).
- **Benennung:** Komponentendateien in PascalCase (`TaskCard.tsx`), Hooks und Funktionen in camelCase (`useDayPlan.ts`). Ordner nach Dateityp, nicht nach Feature.

## 3. Der neue Datenweg

```
Browser                                   Server
─────────────────────────────────         ───────────────────────────────────────────
useDayPlan(date)  ───────────────────►    plan.getDay({ date })              [router]
                                            familyProcedure: userId + familyId aus Session
                                            db/queries/dayPlan.ts: 1 SQL-Abfrage
                                              task ⟕ task_slot ⟕ task_assignment(Tag) ⟕ user ⟕ user
                                            groupDayPlan(rows, userId)       [reine Funktion]
                  ◄───────────────────    TaskView[]
TaskCardList → TaskCard → TaskSlotRow

useAssignmentActions()  ─────────────►    assignments.claim / release / complete / reopen / claimAndComplete
  danach: invalidate plan.getDay          prüft Familie + Besitzerregeln, schreibt, fertig
```

Der Browser bekommt fertige Karten. Er weiß nichts von Joins, Farben oder `completedAt`.

## 4. Wer hat übernommen, wer hat erledigt

Das bleibt in der Datenbank so wie heute, es wird **nichts** zusammengelegt:

| Spalte in `task_assignment` | Bedeutung                                           |
| --------------------------- | --------------------------------------------------- |
| `assigned_to_id`            | wer die Aufgabe **übernommen** hat                  |
| `completed_by_id`           | wer sie **erledigt** hat (kann jemand anderes sein) |
| `completed_at`              | wann                                                |

Im UI-Modell (`types/plan.ts`) wird daraus:

```ts
type TaskStatus = "open" | "claimed" | "completed";

type Person = {
  id: string;
  name: string;
  color: string;
  isCurrentUser: boolean;
};

type SlotView = {
  slotId: string | null; // null = Aufgabe ohne Zeitslot
  label: string | null; // "Morgens" ...
  status: TaskStatus;
  assignmentId: string | null;
  assignee: Person | null; // Übernommen von
  completedBy: Person | null; // Erledigt von, immer gesetzt, sobald erledigt
  note: string | null;
};

type TaskView = { taskId: string; title: string; slots: SlotView[] };
type SlotRef = { taskId: string; slotId: string | null; date: string }; // ISO-Datum
```

Der Pfeil "J → L" in `TaskCard` erscheint, wenn `completedBy.id !== assignee.id`. Die Entscheidung liegt damit in der Komponente, der Server liefert nur Fakten.

Status: keine Zuweisung = `open`, Zuweisung ohne `completed_at` = `claimed`, mit `completed_at` = `completed`.

## 5. Regeln der Aktionen (Server)

**Alle fünf Aktionen bekommen dieselbe Eingabe:** `{ taskId, slotId (nullish), date }` (Datum als Text `YYYY-MM-DD`). Es gibt keine `assignmentId` in der Eingabe. Eine Zuweisung ist durch Aufgabe, Slot und Tag eindeutig (Unique-Index aus Schritt 3), und diese drei Werte kennt jeder Slot in der Oberfläche, auch wenn noch niemand ihn übernommen hat. Sie entsprechen `SlotRef`.

| Aktion             | Wer darf               | Wirkung                                                                              | `CONFLICT`, wenn …                                                 |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `claim`            | jedes Familienmitglied | legt eine Zuweisung an (`assigned_to` = ich)                                         | für Aufgabe, Tag und Slot schon eine existiert, von wem auch immer |
| `claimAndComplete` | jedes Familienmitglied | **ein** INSERT mit `assigned_to` = ich, `completed_by` = ich, `completed_at` = jetzt | wie `claim`                                                        |
| `release`          | nur der Übernehmende   | löscht die Zuweisung                                                                 | sie nicht mir gehört, schon erledigt ist oder nicht existiert      |
| `complete`         | jedes Familienmitglied | setzt `completed_by` = ich und `completed_at` = jetzt, `assigned_to` bleibt          | schon erledigt (der erste Erledigende bleibt) oder nicht existiert |
| `reopen`           | nur wer erledigt hat   | leert `completed_by` und `completed_at`, die Übernahme bleibt                        | nicht erledigt, von jemand anderem erledigt oder nicht existiert   |

**Fehlercodes:**

- `NOT_FOUND` nur bei `claim` und `claimAndComplete`: Aufgabe gehört nicht zur Familie, ist nicht aktiv, der Slot gehört nicht zur Aufgabe, oder `slotId` fehlt bei einer Aufgabe mit Slots (bzw. ist gesetzt bei einer ohne).
- `CONFLICT` in allen anderen Fällen aus der Tabelle. Bei `release`, `complete` und `reopen` stehen Regel und Familienprüfung im `WHERE` **derselben** Datenbankänderung, kommt keine Zeile zurück, war eine Bedingung verletzt. Dort lässt sich nicht unterscheiden, **welche**, deshalb gibt es einen Code mit einer allgemeinen Meldung (verrät auch nicht, ob eine fremde ID existiert).

**Technik:**

- `claim` und `claimAndComplete`: `INSERT … ON CONFLICT DO NOTHING`. Verletzt er den Unique-Index, kommt eine leere Liste zurück statt eines Fehlers.
- Familienprüfung bei `release`, `complete` und `reopen`: `task_id IN (SELECT id FROM task WHERE family_id = …)` im `WHERE`.
- `claimAndComplete` braucht keine Transaktion, weil es nur ein Statement ist.

## 6. Datenbank-Änderungen

1. **Unique-Index `(task_id, date, slot_id)` mit `NULLS NOT DISTINCT`** ersetzt `unique_with_slot` und `unique_without_slot`. Damit gibt es pro Aufgabe, Tag und Slot höchstens eine Zuweisung, auch bei gleichzeitigen Klicks. `NULLS NOT DISTINCT` braucht Postgres 15+ und sorgt dafür, dass auch Aufgaben ohne Slot (`slot_id` = NULL) geschützt sind.
2. **Kein neues Feld für die Familie.** `user.family_id` und `family.invite_code` gibt es bereits.
3. Vor dem Anlegen des Index prüfen, ob es schon Duplikate gibt (Schritt 3).

## 7. Zielstruktur

```
src/
  app/                          nur Routen und Layouts
    (auth)/                     login, register (unverändert) + onboarding/ (neu)
    (dashboard)/
      layout.tsx                leitet auf /onboarding um, wenn keine Familie
      dashboard/page.tsx        setzt Hooks und Komponenten zusammen
    api/trpc/routers/
      plan.ts                   getDay                          (neu)
      assignmentsAction.ts      claim, release, complete, reopen, claimAndComplete
                                (unter dem Namen `assignments`, bis Schritt 13 neben `legacyAssignments`)
      tasks.ts                  add
      family.ts                 create, join                    (neu)
  components/
    layout/      BottomNav, NavButton
    dashboard/   DayNavigator, StatusFilter, TaskCardList, TaskCard, TaskSlotRow, AddTaskButton
    modals/      TaskDetailModal, NewTaskModal, SlotListEditor
    ui/          TaskStatusIcon, PersonDot
    icons/
  hooks/         useSelectedDay, useDayPlan, useAssignmentActions, useCreateTask, useModalTarget
  lib/           dateUtils, color, trpc, auth, getSlotActions
  types/         plan.ts
  db/
    queries/     dayPlan.ts (neu), assignments.ts (nur Schreiben), tasks.ts (nur createTask), family.ts (neu)
```

## 8. Komponenten und Props

| Komponente        | Props                                          | Anzahl |
| ----------------- | ---------------------------------------------- | ------ |
| `DashboardPage`   | keine                                          | 0      |
| `DayNavigator`    | `date`, `isToday`, `onShift(delta)`, `onToday` | 4      |
| `StatusFilter`    | `value`, `onChange`                            | 2      |
| `TaskCardList`    | `tasks`, `onSelect(slotRef)`                   | 2      |
| `TaskCard`        | `task`, `onSelect(slotId)`                     | 2      |
| `TaskSlotRow`     | `slot`, `onSelect`                             | 2      |
| `TaskStatusIcon`  | `status`                                       | 1      |
| `PersonDot`       | `person`                                       | 1      |
| `AddTaskButton`   | `onClick`                                      | 1      |
| `TaskDetailModal` | `open`, `onClose`, `target`                    | 3      |
| `NewTaskModal`    | `open`, `onClose`                              | 2      |
| `SlotListEditor`  | `value`, `onChange`                            | 2      |

`TaskDetailModal` bekommt keine Callbacks. Es holt den Slot über `useDayPlan(target.date)` und führt Aktionen über `useAssignmentActions()` aus. Die Buttons kommen aus `getSlotActions(slot)`:

| Zustand                        | Aktionen                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| offen                          | "Ich mache das" (`claim`), "Sofort erledigen" (`claimAndComplete`)  |
| übernommen, von mir            | "Als erledigt markieren" (`complete`), "Nicht mehr ich" (`release`) |
| übernommen, von anderem        | "Ich habe das erledigt" (`complete`)                                |
| erledigt, von mir erledigt     | "Doch nicht erledigt" (`reopen`)                                    |
| erledigt, von anderem erledigt | keine                                                               |

## 9. Schritte

Jeder Schritt: **Ziel**, **Konzept**, **Du tust**, **Check**. Die Reihenfolge ist so gewählt, dass die App durchgehend läuft.

### Teil A: Vorbereitung

**Schritt 0: Stand sichern**

- Ziel: ein sauberer Ausgangspunkt.
- Du tust: aktuellen Stand committen (jaklib-Migration plus deine Redesigns), neuen Branch `refactor/day-plan`.
- Check: `git status` ist sauber.

**Schritt 1: Daten ansehen und Familie setzen**

- Ziel: verstehen, was in der Datenbank liegt. Sicherstellen, dass dein Account einer Familie angehört.
- Konzept: Der neue Server leitet die Familie aus dem Nutzer ab. Ohne `user.family_id` sieht dein Account nach dem Umbau nichts.
- Du tust: `npm run db:studio`, Tabellen `family`, `user`, `task`, `task_slot`, `task_assignment` ansehen. Bei deinen Accounts `family_id` auf die bestehende Familie setzen (die ID aus `FAMILY_ID`).
- Check: jeder Account, mit dem du testen willst, hat eine `family_id`.

### Teil B: Server

**Schritt 2: Der Typ-Vertrag**

- Ziel: `types/plan.ts` mit `TaskStatus`, `Person`, `SlotView`, `TaskView`, `SlotRef` (siehe Abschnitt 4).
- Konzept: Server und Browser teilen sich diese Typen. Alles Weitere arbeitet auf sie hin. Die alten Typen (`Row`, `DayCell`, …) bleiben, bis die alte Oberfläche weg ist. Lege die neuen daneben, z. B. in derselben Datei.
- Check: `npx tsc --noEmit` ist grün.

**Schritt 3: Unique-Index**

- Ziel: doppeltes Übernehmen in der Datenbank verhindern.
- Konzept: Eine Regel in der Datenbank gilt immer, auch wenn zwei Requests gleichzeitig laufen. Eine Prüfung im Code (`findAssignment`) gilt das nicht.
- Du tust: In Drizzle-Studio oder per SQL nach Duplikaten suchen (`GROUP BY task_id, date, slot_id HAVING count(*) > 1`) und bereinigen. In `schema.ts` die beiden alten Unique-Definitionen durch einen auf `(taskId, date, slotId)` mit `.nullsNotDistinct()` ersetzen. Postgres-Version prüfen (`select version();`, mindestens 15). `npm run db:push`.
- Check: In Drizzle-Studio zwei Zeilen mit gleicher Aufgabe, Datum und Slot einfügen. Die zweite muss abgelehnt werden.

**Schritt 4: `familyProcedure`**

- Ziel: eine Procedure, die Login und Familie verlangt und `ctx.userId` und `ctx.familyId` liefert.
- Konzept: In `init.ts` baut `protectedProcedure` bereits auf `publicProcedure` auf und prüft die Session. `familyProcedure` setzt noch eine Stufe darauf: sie lädt `user.family_id` aus der Datenbank und wirft `FORBIDDEN`, wenn es fehlt. Die ID steht bewusst **nicht** im Token. Sonst würde sie nach dem Beitritt zu einer Familie veralten, und der Nutzer müsste sich neu anmelden.
- Du tust: `familyProcedure` in `init.ts` ergänzen.
- Check: noch keine Wirkung. Weiter mit Schritt 5, dort wird sie benutzt.

**Schritt 5: Die Abfrage `db/queries/dayPlan.ts`**

- Ziel: eine Funktion `getDayPlanRows(familyId, date)`, die pro Aufgabe und Slot eine Zeile liefert, inklusive Zuweisung und beider Personen.
- Konzept: Ein `LEFT JOIN` behält Aufgaben, auch wenn es keine Zuweisung gibt. Die Zuweisung wird nur für den gewählten Tag angehängt. Slot-Gleichheit ohne Slot braucht `IS NOT DISTINCT FROM`, weil `NULL = NULL` in SQL nicht wahr ist. Für `assignedUser` und `completedUser` gibt es schon zwei `alias`-Beispiele in `queries/assignments.ts`.
- Du tust: die Abfrage schreiben, sortiert nach Kategorie, Titel und Slot-Reihenfolge.
- Check: Zeilen ansehen, bevor du weitermachst (Schritt 6). Eine Aufgabe ohne Slot ergibt eine Zeile, eine mit drei Slots drei.

**Schritt 6: `groupDayPlan` und der Router `plan.getDay`**

- Ziel: aus den Zeilen `TaskView[]` machen und über `plan.getDay` anbieten.
- Konzept: `groupDayPlan(rows, currentUserId)` ist eine reine Funktion. Sie sammelt Zeilen pro Aufgabe, leitet den Status ab und baut die `Person`-Objekte (Farbe über `colorFromUserId`, `isCurrentUser` aus der ID). Rein heißt: gleiche Eingabe, gleiche Ausgabe, kein Datenbankzugriff. Deshalb ist sie leicht zu testen.
- Du tust: `groupDayPlan` schreiben, `routers/plan.ts` mit `getDay` (Eingabe: `date` als `YYYY-MM-DD`, geprüft per zod-Regex), in `_app.ts` eintragen.
- Check: auf `dashboard/page.tsx` vorübergehend `trpc.plan.getDay.useQuery(...)` aufrufen und das Ergebnis als `<pre>{JSON.stringify(data, null, 2)}</pre>` ausgeben. Prüfen: offen, übernommen, erledigt von einem anderen.

**Schritt 7: Die neuen Aktionen (neben den alten)**

- Ziel: `claim`, `release`, `complete`, `reopen`, `claimAndComplete` im Router `assignments`, alle als `familyProcedure`, alle mit der Eingabe `{ taskId, slotId, date }` (Abschnitt 5).
- Konzept: Regel und Änderung in **einem** Statement (Bedingung im `WHERE`, `.returning()`, leeres Ergebnis heißt `CONFLICT`). Doppeltes Übernehmen verhindert der Unique-Index per `ON CONFLICT DO NOTHING`. Die alten Procedures bleiben unter `legacyAssignments` bestehen, damit die alte Oberfläche weiterläuft (in `_app.ts` umbenannt, `useWeekPlan.ts` nutzt den neuen Namen).
- Du tust: In `db/queries/assignments.ts` unter den alten Funktionen `slotBelongsToFamily`, `claimSlot` (mit `alsoComplete`), `releaseSlot`, `completeSlot`, `reopenSlot` anlegen (Hilfsbausteine `slotMatch` und `taskIdsOfFamily`). Router in `routers/assignmentsAction.ts` mit einem gemeinsamen `slotInput`, einem Helfer `orConflict` und einer gemeinsamen Funktion `claim`.
- Check (erledigt): Die SQL-Semantik wurde gegen die Docker-Datenbank in einer zurückgerollten Transaktion geprüft: doppeltes Übernehmen durch einen anderen Nutzer (auch ohne Slot) ergibt 0 Zeilen, ein zweites `complete` 0 Zeilen und `reopen`/`release` durch den Falschen 0 Zeilen. Die von Drizzle erzeugten Statements stimmen mit den geprüften überein. Ein Aufruf über den Router (z. B. per `fetch` in der Browser-Konsole) steht noch aus, er braucht eine Anmeldung.

### Teil C: Browser

**Schritt 8: Der gewählte Tag**

- Ziel: ein einziger Zustand `selectedDate`, der mit **heute** startet.
- Konzept: Aus einem Datum lässt sich alles ableiten (Wochentag, Monat, "ist heute"). Drei Offsets, die sich gegenseitig nicht kennen, sind die Ursache des Montag-Bugs.
- Du tust: `lib/dateUtils.ts` um `addDays` und `isSameDay` ergänzen. `hooks/useSelectedDay.ts` schreiben, es liefert `{ date, isToday, shift(n), goToday }`. `DayNavigator` (bisher `daySelect.tsx`) darauf umstellen.
- Check: Seite öffnet auf dem heutigen Datum. Vor und zurück funktioniert über Monatsgrenzen. "Heute" erscheint nur, wenn du nicht auf heute stehst.

**Schritt 9: Liste mit echten Daten**

- Ziel: die Karten zeigen die echten Daten von `plan.getDay`.
- Konzept: `useDayPlan(date)` ist jetzt ein Einzeiler um `trpc.plan.getDay.useQuery`. Der Query-Schlüssel enthält das Datum, deshalb hat jeder Tag seinen eigenen Cache-Eintrag. Beim Zurückkehren auf einen Tag erscheint er sofort. React Query lädt beim Zurückkehren auf den Tab im Hintergrund nach, so siehst du Änderungen anderer Familienmitglieder.
- Du tust: `useDayPlan`, `TaskCardList`, `TaskCard` (aus `taskWrapper.tsx`, die Logik bleibt, `slots` kommt jetzt aus `SlotView`), `TaskSlotRow`, `TaskStatusIcon`, `PersonDot` in den neuen Ordnern. In `dashboard/page.tsx` Demo-Karten und die alte `MobileView` ersetzen.
- Check: erledigte, übernommene und offene Aufgaben erscheinen richtig. "J → L" zeigt sich genau dann, wenn Übernehmender und Erledigender verschieden sind.

**Schritt 10: Das Detail-Modal**

- Ziel: Aktionen aus dem Modal, ohne dass `page.tsx` Callbacks zusammenbaut.
- Konzept: `useModalTarget` behält das Ziel nach dem Schließen, damit das Sheet beim Ausblenden nicht leer wird (vorher gelöst über zwei getrennte State-Variablen). `useAssignmentActions` kapselt die Mutationen und lädt danach `plan.getDay` neu. `getSlotActions(slot)` entscheidet, welche Buttons erscheinen (Tabelle in Abschnitt 8).
- Du tust: `useModalTarget`, `useAssignmentActions`, `getSlotActions`, `TaskDetailModal`. `cellModal.tsx` und die IIFE aus `page.tsx` entfernen.
- Check: alle Zeilen der Tabelle in Abschnitt 8 einmal durchspielen. Zusätzlich mit zwei Accounts: A übernimmt, B erledigt, danach zeigt die Karte beide.

**Schritt 11: Neue Aufgabe**

- Ziel: `NewTaskModal` mit zod-Validierung und `tasks.add` als `familyProcedure`.
- Du tust: `tasks.add` auf `familyProcedure` umstellen (die `familyId` aus dem Input entfällt), `title` mit `.trim().min(1).max(80)`, `slots` höchstens 6 mit je max. 20 Zeichen. `SlotListEditor` und `NewTaskModal` bauen, `useCreateTask` und `AddTaskButton`.
- Check: Aufgabe mit und ohne Slots anlegen, leeren Titel testen (Button deaktiviert, Server lehnt trotzdem ab).

### Teil D: Familie

**Schritt 12: Familie gründen und beitreten**

- Ziel: neue Nutzer gelangen nach der Registrierung in eine Familie.
- Konzept: `family.create({ name })` legt die Familie an, erzeugt einen Einladungscode (z. B. 8 Zeichen ohne verwechselbare Buchstaben) und setzt `user.family_id`. `family.join({ code })` sucht die Familie über `family.invite_code` und setzt `user.family_id`. Beide sind `protectedProcedure`, weil der Nutzer noch keine Familie hat.
- Du tust: `db/queries/family.ts`, `routers/family.ts`, Seite `app/(auth)/onboarding/page.tsx` mit zwei Wegen ("Familie erstellen", "Mit Code beitreten"). In `(dashboard)/layout.tsx` auf `/onboarding` umleiten, wenn der Nutzer keine Familie hat. Auf `/onboarding` selbst nicht umleiten, wenn er schon eine hat.
- Check: frischen Account registrieren, anmelden, `/onboarding` erscheint. Familie erstellen, Dashboard öffnet sich. Zweiten Account mit dem Code beitreten lassen und gegenseitig Aufgaben sehen.

### Teil E: Aufräumen und Design

**Schritt 13: Altes löschen**

- Löschen nach Grep-Prüfung auf Restverwendungen: `mobileView.tsx`, `desktopView.tsx`, `dayPicker.tsx`, `weekHeader.tsx`, `taskCell.tsx`, `useWeekPlan.ts`, `cellModal.tsx`, `taskModal.tsx`, `userAvatar.tsx`, `avatarDot.tsx`, `addButton.tsx`, `plusDot.tsx`, `HomeIcon`, `CloseButton`, ungenutzte Icons.
- Server: `assign`, `unassign`, `uncomplete`, `getForDate`, `getForWeek`, `getByFamily`, `getAssignmentForDate`, `getAssignmentsForWeek` und `FAMILY_ID`.
- Alte Typen `Row`, `DayCell`, `SlotEntry`, `AssignmentData` aus `types/plan.ts`.
- `formik` von `devDependencies` nach `dependencies` verschieben (wird zur Laufzeit im Login benutzt).
- Rest aus `src/app/components` nach `src/components/{layout,dashboard,modals,ui,icons}` verschieben.

**Schritt 14: Design-Pass**

- Aus `TaskCard`, `DayNavigator` und `BottomNav` die verwendeten Werte (Radien, Schatten, Weiß-Transparenz, Textgrößen) als Tokens in `globals.css` festhalten.
- Harte Farben (`text-orange-500`, `bg-[#FEF9F6]`, `slate-*`) in den übrigen Komponenten durch diese Tokens ersetzen. Die Status-Farben (`open`, `claimed`, `completed`) einmal zentral definieren.
- jaklib-`Avatar` einbauen, sobald dort `size` und `completed` existieren. Bis dahin ist `PersonDot` die einzige Avatar-Komponente.

## 10. Offene Entscheidungen (mit meinem Default)

- **A. Dateinamen:** PascalCase für Komponenten (Default) oder weiter camelCase?
- **B. Sheet nach Aktion:** schließen (Default, das Feedback kommt über die Karte) oder offen lassen wie heute?
- **C. Desktop:** bis zum neuen Layout dieselbe Spalte mit begrenzter Breite (Default). `DesktopView` wird gelöscht und bleibt in der Git-Historie.
- **D. Wochenfortschritt und Nutzer-Balken** der alten `MobileView`: weglassen (Default) oder später als Tagesfortschritt zurückholen?
- **E. Vitest** für `groupDayPlan` und `getSlotActions`: einrichten (Default, nur reine Funktionen) oder nur manuell prüfen?
- **F. `reopen`:** nur wer erledigt hat (Default) oder auch der Übernehmende?

## 11. Risiken

- Schritt 3 ändert die Datenbank. Vorher Duplikate prüfen und Sicherung machen (bei Neon z. B. ein Branch).
- Zwischen Schritt 4 und 12 müssen alle Accounts, mit denen du testest, manuell eine `family_id` haben (Schritt 1).
- Solange alte und neue Procedures nebeneinander existieren (Schritt 7 bis 13), nicht beide in derselben Oberfläche mischen.
