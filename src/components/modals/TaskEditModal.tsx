"use client";

import { Glyph } from "@/components/icons";
import { IconGrid } from "@/components/ui/IconGrid";
import { InlineAlert } from "@/components/ui/InlineAlert";
import {
  SheetBackButton,
  SheetCancelButton,
  SheetHeader,
  SheetSaveButton,
} from "@/components/ui/SheetHeader";
import { TaskTile } from "@/components/ui/TaskTile";
import { useModalTarget } from "@/hooks/useModalTarget";
import { DEFAULT_CATEGORY } from "@/lib/categories";
import {
  TASK_TONE_HEX,
  type TaskIconName,
  type TaskIconTone,
} from "@/lib/taskIcons";
import type { CategoryOption, TaskDraft, TaskTemplate } from "@/types/profile";
import { Modal } from "jaklib/core";
import { useRef, useState } from "react";
import { CategoryEditModal } from "./CategoryEditModal";

/**
 * Was das Aufgaben-Sheet mit Kategorien tun kann. Die Seite stellt es bereit,
 * das Sheet kennt keine Anfragen (siehe useCategoryActions).
 */
export type CategoryEditing = {
  create: (
    input: { name: string; tone: TaskIconTone; icon: TaskIconName | null },
    onDone: (created: CategoryOption) => void,
  ) => void;
  update: (
    input: {
      id: string;
      name: string;
      tone: TaskIconTone;
      icon: TaskIconName | null;
    },
    onDone: () => void,
  ) => void;
  remove: (id: string, onDone: () => void) => void;
  isPending: boolean;
  errorText: string | null;
  reset: () => void;
};

type View = "main" | "icon" | "category";

/** Formular-Zustand, mit der Aufgabe vorbelegt (oder leer) */
function useTaskDraft(
  task: TaskTemplate | null,
  defaultCategoryId: string | null,
) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [icon, setIcon] = useState<TaskIconName | null>(task?.icon ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(
    task ? task.category.id : defaultCategoryId,
  );
  const [description, setDescription] = useState(task?.description ?? "");
  // Bestehende Zeitfenster behalten ihre id, neue haben keine (siehe TaskDraft)
  const [slots, setSlots] = useState<TaskDraft["slots"]>(task?.slots ?? []);
  return {
    title,
    setTitle,
    icon,
    setIcon,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    slots,
    setSlots,
    isNew: task === null,
  };
}

/** Kleiner Farbpunkt vor einem Kategorienamen */
function ToneDot({ tone }: { tone: TaskIconTone }) {
  return (
    <span
      aria-hidden
      className="h-3 w-3 shrink-0 rounded-full"
      style={{ backgroundColor: TASK_TONE_HEX[tone][600] }}
    />
  );
}

/**
 * Sheet "Aufgabe anlegen / bearbeiten" im Stil einer Formular-Liste
 * (gruppierte Zeilen wie in den iOS-Einstellungen). Icon und Kategorie öffnen
 * eine Unteransicht im selben Sheet (sie gleitet von rechts herein). Dort
 * lassen sich Kategorien anlegen, ändern und löschen: Das öffnet ein eigenes
 * Sheet (CategoryEditModal) über diesem. Nur hier werden Kategorien bearbeitet.
 *
 * Das Sheet kennt nur das Formular. Speichern und Archivieren der Aufgabe
 * sowie die Änderungen an Kategorien übernimmt die Seite (onSave, onArchive,
 * categoryEditing), das Sheet zeigt nur "speichert …" und Fehler.
 */
export function TaskEditModal({
  open,
  onClose,
  task,
  categories,
  suggestedTone,
  categoryEditing,
  onSave,
  onArchive,
  isPending,
  errorText,
}: {
  open: boolean;
  onClose: () => void;
  /** null = neue Aufgabe */
  task: TaskTemplate | null;
  /** Vorhandene Kategorien der Familie zur Auswahl */
  categories: CategoryOption[];
  /** Vorauswahl der Farbe einer neuen Kategorie (eine, die noch frei ist) */
  suggestedTone: TaskIconTone;
  categoryEditing: CategoryEditing;
  onSave: (draft: TaskDraft) => void;
  onArchive: () => void;
  /** Eine Anfrage läuft: Knöpfe sperren */
  isPending: boolean;
  /** Fehlertext der letzten Anfrage (oder null) */
  errorText: string | null;
}) {
  const draft = useTaskDraft(task, categories[0]?.id ?? null);
  const [view, setView] = useState<View>("main");
  const focusNewSlot = useRef(false);
  // Richtung des letzten Wechsels für die Animation; beim ersten Anzeigen
  // (null) gleitet nichts
  const [direction, setDirection] = useState<"forward" | "back" | null>(null);
  // { category: null } = neue Kategorie (Objekt drumherum wie bei useModalTarget üblich)
  const editor = useModalTarget<{ category: CategoryOption | null }>();
  // Zählt die Öffnungen: Das Sheet bleibt nach dem Schließen eingehängt, ohne
  // neuen key würde es beim erneuten Öffnen den alten Stand zeigen.
  const [editorSession, setEditorSession] = useState(0);

  const hasBlankSlot = draft.slots.some((s) => !s.label.trim());
  const canSave = !!draft.title.trim() && !hasBlankSlot && !isPending;

  // Die gewählte Kategorie (null = "Sonstiges"). Die Kachel der Aufgabe trägt ihre Farbe.
  const selected = categories.find((c) => c.id === draft.categoryId) ?? null;
  const tone = selected?.tone ?? "slate";

  function go(next: View) {
    setDirection(next === "main" ? "back" : "forward");
    setView(next);
  }

  function choose(categoryId: string | null) {
    draft.setCategoryId(categoryId);
    go("main");
  }

  function openEditor(category: CategoryOption | null) {
    categoryEditing.reset();
    setEditorSession((n) => n + 1);
    editor.openFor({ category });
  }

  const group = "overflow-hidden rounded-2xl bg-surface-2 dark:bg-white/5";
  const row =
    "flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-body";

  const editorTarget = editor.target;

  return (
    <>
      <Modal
        open={open}
        // Escape hört jedes offene Sheet. Solange das Kategorie-Sheet darüber
        // liegt, soll es allein schließen, nicht auch dieses darunter.
        onClose={() => {
          if (!editor.isOpen) onClose();
        }}
        variant="sheet"
        className={`task-sheet ${editor.isOpen ? "task-sheet--behind" : ""}`}
        aria-label="Aufgabe"
      >
        <div className="max-h-[85dvh] overflow-y-auto">
          <SheetHeader
            left={
              view === "main" ? (
                <SheetCancelButton onClick={onClose} />
              ) : (
                <SheetBackButton onClick={() => go("main")} />
              )
            }
            title={
              view === "icon"
                ? "Icon"
                : view === "category"
                  ? "Kategorie"
                  : draft.isNew
                    ? "Neue Aufgabe"
                    : "Bearbeiten"
            }
            right={
              view === "main" && (
                <SheetSaveButton
                  onClick={() =>
                    onSave({
                      title: draft.title,
                      icon: draft.icon,
                      categoryId: draft.categoryId,
                      description: draft.description,
                      slots: draft.slots,
                    })
                  }
                  disabled={!canSave}
                >
                  {isPending
                    ? "Speichert …"
                    : draft.isNew
                      ? "Anlegen"
                      : "Speichern"}
                </SheetSaveButton>
              )
            }
          />

          {/* key: Beim Wechsel der Ansicht wird der Block neu eingehängt und gleitet herein */}
          <div
            key={view}
            className={
              direction === "forward"
                ? "sheet-view-forward"
                : direction === "back"
                  ? "sheet-view-back"
                  : undefined
            }
          >
            {view === "icon" && (
              <div className="px-4 pt-3 pb-4">
                <IconGrid
                  value={draft.icon}
                  onChange={(i) => {
                    draft.setIcon(i);
                    go("main");
                  }}
                />
              </div>
            )}

            {view === "category" && (
              <div className="px-4 pt-3 pb-4">
                <div className={`${group} divide-y divide-line`}>
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center">
                      <button
                        type="button"
                        className={`${row} flex-1`}
                        onClick={() => choose(c.id)}
                      >
                        <ToneDot tone={c.tone} />
                        <span className="flex-1 text-fg">{c.name}</span>
                        {c.id === draft.categoryId && (
                          <Glyph
                            name="check"
                            size={18}
                            className="text-accent"
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label={`${c.name} bearbeiten`}
                        onClick={() => openEditor(c)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center text-subtle hover:text-fg-2"
                      >
                        <Glyph name="pencil" size={16} />
                      </button>
                    </div>
                  ))}
                  {/* Ohne Kategorie: die Sammelgruppe, immer wählbar (nicht bearbeitbar) */}
                  <button
                    type="button"
                    className={row}
                    onClick={() => choose(null)}
                  >
                    <ToneDot tone="slate" />
                    <span className="flex-1 text-fg">{DEFAULT_CATEGORY}</span>
                    {draft.categoryId === null && (
                      <Glyph name="check" size={18} className="text-accent" />
                    )}
                  </button>
                  <button
                    type="button"
                    className={`${row} font-medium text-accent`}
                    onClick={() => openEditor(null)}
                  >
                    <Glyph name="plus" size={16} /> Neue Kategorie
                  </button>
                </div>
              </div>
            )}

            {view === "main" && (
              <div className="flex flex-col gap-4 px-4 pt-3 pb-4">
                {errorText && <InlineAlert text={errorText} />}

                <div className={`${group} divide-y divide-line`}>
                  <div className={`${row} py-2.5`}>
                    <TaskTile
                      icon={draft.icon}
                      title={draft.title}
                      size={40}
                      tone={tone}
                    />
                    <input
                      value={draft.title}
                      onChange={(e) => draft.setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="Titel"
                      className="min-w-0 flex-1 bg-transparent text-body font-semibold text-fg outline-none placeholder:text-subtle"
                    />
                  </div>
                  <button
                    type="button"
                    className={row}
                    onClick={() => go("icon")}
                  >
                    <span className="flex-1 text-fg">Icon</span>
                    {draft.icon ? (
                      <TaskTile
                        icon={draft.icon}
                        title={draft.title}
                        size={28}
                        tone={tone}
                      />
                    ) : (
                      <span className="text-muted">keins</span>
                    )}
                    <Glyph name="chevron" size={16} className="text-subtle" />
                  </button>
                  <button
                    type="button"
                    className={row}
                    onClick={() => go("category")}
                  >
                    <span className="flex-1 text-fg">Kategorie</span>
                    <span className="flex items-center gap-2 text-muted">
                      <ToneDot tone={tone} />
                      {selected?.name ?? DEFAULT_CATEGORY}
                    </span>
                    <Glyph name="chevron" size={16} className="text-subtle" />
                  </button>
                </div>

                <div>
                  <p className="mb-1.5 px-4 text-caption font-semibold tracking-wider text-subtle uppercase">
                    Zeitfenster
                  </p>
                  <div className={`${group} divide-y divide-line`}>
                    {draft.slots.map((s, i) => (
                      <div key={s.id ?? `neu-${i}`} className={row}>
                        <Glyph
                          name="grip"
                          size={16}
                          className="cursor-grab text-subtle"
                        />
                        <input
                          ref={(el) => {
                            if (
                              el &&
                              focusNewSlot.current &&
                              i === draft.slots.length - 1
                            ) {
                              focusNewSlot.current = false;
                              el.focus();
                              el.select();
                            }
                          }}
                          value={s.label}
                          onChange={(e) =>
                            draft.setSlots(
                              draft.slots.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x,
                              ),
                            )
                          }
                          maxLength={50}
                          className="min-w-0 flex-1 bg-transparent text-fg outline-none"
                        />
                        <button
                          type="button"
                          aria-label="Entfernen"
                          onClick={() =>
                            draft.setSlots(
                              draft.slots.filter((_, j) => j !== i),
                            )
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-error-600 text-white"
                        >
                          <Glyph name="close" size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={`${row} font-medium text-accent`}
                      onClick={() => {
                        focusNewSlot.current = true;
                        draft.setSlots([
                          ...draft.slots,
                          { label: "Neues Zeitfenster" },
                        ]);
                      }}
                    >
                      <Glyph name="plus" size={16} /> Zeitfenster hinzufügen
                    </button>
                  </div>
                  <p className="mt-1.5 px-4 text-caption leading-snug text-subtle">
                    Ohne Zeitfenster gibt es die Aufgabe einmal am Tag.
                    Reihenfolge per Ziehen ändern.
                  </p>
                  {hasBlankSlot && (
                    <p className="mt-1 px-4 text-caption leading-snug text-danger">
                      Zeitfenster dürfen nicht leer sein.
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 px-4 text-caption font-semibold tracking-wider text-subtle uppercase">
                    Notiz
                  </p>
                  <div className={group}>
                    <textarea
                      rows={2}
                      value={draft.description}
                      onChange={(e) => draft.setDescription(e.target.value)}
                      maxLength={500}
                      placeholder="Optional"
                      className="block w-full resize-none bg-transparent px-4 py-2.5 text-body text-fg outline-none placeholder:text-subtle"
                    />
                  </div>
                </div>

                {!draft.isNew && (
                  <div>
                    <div className={group}>
                      <button
                        type="button"
                        onClick={onArchive}
                        disabled={isPending}
                        className={`${row} justify-center font-semibold text-danger disabled:text-subtle`}
                      >
                        Aufgabe archivieren
                      </button>
                    </div>
                    <p className="mt-1.5 px-4 text-caption leading-snug text-subtle">
                      Archivierte Aufgaben verschwinden aus dem Plan, der
                      Verlauf bleibt erhalten.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Eigenes Sheet über diesem. Es bleibt nach dem Schließen eingehängt
          (editorTarget bleibt erhalten), damit es herausfahren kann. */}
      {editorTarget && (
        <CategoryEditModal
          key={`${editorTarget.category?.id ?? "new"}-${editorSession}`}
          open={editor.isOpen}
          onClose={editor.close}
          category={editorTarget.category}
          suggestedTone={suggestedTone}
          onSave={(input) => {
            const { category } = editorTarget;
            if (category) {
              categoryEditing.update(
                { id: category.id, ...input },
                editor.close,
              );
            } else {
              // Eine neue Kategorie gleich für diese Aufgabe auswählen
              categoryEditing.create(input, (created) => {
                draft.setCategoryId(created.id);
                editor.close();
                go("main");
              });
            }
          }}
          onDelete={() => {
            const { category } = editorTarget;
            if (!category) return;
            categoryEditing.remove(category.id, () => {
              // Ihre Aufgaben, auch diese, stehen danach in "Sonstiges"
              if (draft.categoryId === category.id) draft.setCategoryId(null);
              editor.close();
            });
          }}
          isPending={categoryEditing.isPending}
          errorText={categoryEditing.errorText}
        />
      )}
    </>
  );
}
