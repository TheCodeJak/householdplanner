"use client";

import { Glyph } from "@/components/icons";
import { IconGrid } from "@/components/ui/IconGrid";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { TaskTile } from "@/components/ui/TaskTile";
import type { TaskIconName } from "@/lib/taskIcons";
import type { TaskDraft, TaskTemplate } from "@/types/profile";
import { Modal } from "jaklib/core";
import { useState } from "react";

/** Formular-Zustand, mit der Aufgabe vorbelegt (oder leer) */
function useTaskDraft(task: TaskTemplate | null, defaultCategory: string) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [icon, setIcon] = useState<TaskIconName | null>(task?.icon ?? null);
  const [category, setCategory] = useState(task?.category ?? defaultCategory);
  const [description, setDescription] = useState(task?.description ?? "");
  // Bestehende Zeitfenster behalten ihre id, neue haben keine (siehe TaskDraft)
  const [slots, setSlots] = useState<TaskDraft["slots"]>(task?.slots ?? []);
  return {
    title,
    setTitle,
    icon,
    setIcon,
    category,
    setCategory,
    description,
    setDescription,
    slots,
    setSlots,
    isNew: task === null,
  };
}

/**
 * Sheet "Aufgabe anlegen / bearbeiten" im Stil einer Formular-Liste
 * (gruppierte Zeilen wie in den iOS-Einstellungen). Icon und Kategorie öffnen
 * eine Unteransicht im selben Sheet.
 *
 * Das Sheet kennt nur das Formular. Speichern und Archivieren übernimmt die
 * Seite (onSave, onArchive), das Sheet zeigt nur "speichert …" und Fehler.
 */
export function TaskEditModal({
  open,
  onClose,
  task,
  categories,
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
  categories: string[];
  onSave: (draft: TaskDraft) => void;
  onArchive: () => void;
  /** Eine Anfrage läuft: Knöpfe sperren */
  isPending: boolean;
  /** Fehlertext der letzten Anfrage (oder null) */
  errorText: string | null;
}) {
  const draft = useTaskDraft(task, categories[0] ?? "");
  const [view, setView] = useState<"main" | "icon" | "category">("main");
  const [newCategory, setNewCategory] = useState("");

  const hasBlankSlot = draft.slots.some((s) => !s.label.trim());
  const canSave = !!draft.title.trim() && !hasBlankSlot && !isPending;
  // Auch eine eben neu getippte Kategorie bleibt in der Liste auswählbar
  const categoryChoices = [...new Set([...categories, draft.category])].filter(
    Boolean,
  );

  function applyNewCategory() {
    const name = newCategory.trim();
    if (!name) return;
    draft.setCategory(name);
    setNewCategory("");
    setView("main");
  }

  const group = "overflow-hidden rounded-2xl bg-surface-2 dark:bg-white/5";
  const row =
    "flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm";

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      className="task-sheet"
      aria-label="Aufgabe"
    >
      <div className="max-h-[85dvh] overflow-y-auto pb-5">
        {/* Kopf im iOS-Stil: Abbrechen · Titel · Sichern */}
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-surface/90 px-4 pt-6 pb-3 backdrop-blur">
          {view === "main" ? (
            <button
              type="button"
              onClick={onClose}
              className="justify-self-start text-sm text-muted"
            >
              Abbrechen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-1 justify-self-start text-sm font-medium text-brand-600"
            >
              <Glyph name="back" size={16} /> Zurück
            </button>
          )}
          <p className="text-sm font-bold text-fg">
            {view === "icon"
              ? "Icon"
              : view === "category"
                ? "Kategorie"
                : draft.isNew
                  ? "Neue Aufgabe"
                  : "Bearbeiten"}
          </p>
          {view === "main" ? (
            <button
              type="button"
              onClick={() =>
                onSave({
                  title: draft.title,
                  icon: draft.icon,
                  category: draft.category,
                  description: draft.description,
                  slots: draft.slots,
                })
              }
              disabled={!canSave}
              className="justify-self-end text-sm font-bold text-brand-600 disabled:text-subtle"
            >
              {isPending ? "Speichert …" : draft.isNew ? "Anlegen" : "Sichern"}
            </button>
          ) : (
            <span />
          )}
        </div>

        {view === "icon" && (
          <div className="p-4">
            <IconGrid
              value={draft.icon}
              onChange={(i) => {
                draft.setIcon(i);
                setView("main");
              }}
            />
          </div>
        )}

        {view === "category" && (
          <div className="p-4">
            <div className={`${group} divide-y divide-line`}>
              {categoryChoices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={row}
                  onClick={() => {
                    draft.setCategory(c);
                    setView("main");
                  }}
                >
                  <span className="flex-1 text-fg">{c}</span>
                  {c === draft.category && (
                    <Glyph name="check" size={18} className="text-brand-600" />
                  )}
                </button>
              ))}
              {/* Neue Kategorie: einfach hineintippen und übernehmen */}
              <div className={row}>
                <Glyph name="plus" size={16} className="text-brand-600" />
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyNewCategory();
                  }}
                  maxLength={50}
                  placeholder="Neue Kategorie"
                  className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:font-medium placeholder:text-brand-600"
                />
                {newCategory.trim() && (
                  <button
                    type="button"
                    onClick={applyNewCategory}
                    className="text-sm font-bold text-brand-600"
                  >
                    Übernehmen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "main" && (
          <div className="flex flex-col gap-5 p-4">
            {errorText && <InlineAlert text={errorText} />}

            <div className={`${group} divide-y divide-line`}>
              <div className={`${row} py-3`}>
                <TaskTile icon={draft.icon} title={draft.title} size={44} />
                <input
                  value={draft.title}
                  onChange={(e) => draft.setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="Titel"
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold text-fg outline-none placeholder:text-subtle"
                />
              </div>
              <button
                type="button"
                className={row}
                onClick={() => setView("icon")}
              >
                <span className="flex-1 text-fg">Icon</span>
                {draft.icon ? (
                  <TaskTile icon={draft.icon} title={draft.title} size={28} />
                ) : (
                  <span className="text-muted">keins</span>
                )}
                <Glyph name="chevron" size={16} className="text-subtle" />
              </button>
              <button
                type="button"
                className={row}
                onClick={() => setView("category")}
              >
                <span className="flex-1 text-fg">Kategorie</span>
                <span className="text-muted">{draft.category}</span>
                <Glyph name="chevron" size={16} className="text-subtle" />
              </button>
            </div>

            <div>
              <p className="mb-1.5 px-4 text-[11px] font-semibold tracking-wider text-subtle uppercase">
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
                        draft.setSlots(draft.slots.filter((_, j) => j !== i))
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-error-600 text-white"
                    >
                      <Glyph name="close" size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={`${row} font-medium text-brand-600`}
                  onClick={() =>
                    draft.setSlots([
                      ...draft.slots,
                      { label: "Neues Zeitfenster" },
                    ])
                  }
                >
                  <Glyph name="plus" size={16} /> Zeitfenster hinzufügen
                </button>
              </div>
              <p className="mt-1.5 px-4 text-[11px] leading-snug text-subtle">
                Ohne Zeitfenster gibt es die Aufgabe einmal am Tag. Reihenfolge
                per Ziehen ändern.
              </p>
              {hasBlankSlot && (
                <p className="mt-1 px-4 text-[11px] leading-snug text-error-600">
                  Zeitfenster dürfen nicht leer sein.
                </p>
              )}
            </div>

            <div>
              <p className="mb-1.5 px-4 text-[11px] font-semibold tracking-wider text-subtle uppercase">
                Notiz
              </p>
              <div className={group}>
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(e) => draft.setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Optional"
                  className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-fg outline-none placeholder:text-subtle"
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
                    className={`${row} justify-center font-semibold text-error-600 disabled:text-subtle`}
                  >
                    Aufgabe archivieren
                  </button>
                </div>
                <p className="mt-1.5 px-4 text-[11px] leading-snug text-subtle">
                  Archivierte Aufgaben verschwinden aus dem Plan, der Verlauf
                  bleibt erhalten.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
