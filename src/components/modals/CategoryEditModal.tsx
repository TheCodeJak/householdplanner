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
import { ToneSwatches } from "@/components/ui/ToneSwatches";
import {
  categoryNameProblem,
  DEFAULT_CATEGORY,
  MAX_CATEGORY_NAME,
} from "@/lib/categories";
import type { TaskIconName, TaskIconTone } from "@/lib/taskIcons";
import type { CategoryOption } from "@/types/profile";
import { Button, Modal } from "jaklib/core";
import { useState } from "react";

/**
 * Sheet "Kategorie anlegen / bearbeiten": Name, Icon und Farbe. Die Aufgaben
 * der Kategorie übernehmen die Farbe für ihre Kacheln, das Icon steht im Kopf
 * der Gruppe. Das Sheet öffnet sich über dem Aufgaben-Sheet (TaskEditModal),
 * nur von dort lassen sich Kategorien ändern. Die Icon-Auswahl ist eine
 * Unteransicht im selben Sheet (sie gleitet von rechts herein).
 *
 * Das Sheet kennt nur das Formular. Speichern und Löschen übernimmt der
 * Aufrufer (onSave, onDelete), das Sheet zeigt nur "speichert …" und Fehler.
 */
export function CategoryEditModal({
  open,
  onClose,
  category,
  suggestedTone,
  onSave,
  onDelete,
  isPending,
  errorText,
}: {
  open: boolean;
  onClose: () => void;
  /** null = neue Kategorie */
  category: CategoryOption | null;
  /** Vorauswahl der Farbe bei einer neuen Kategorie (eine, die noch frei ist) */
  suggestedTone: TaskIconTone;
  onSave: (input: {
    name: string;
    tone: TaskIconTone;
    icon: TaskIconName | null;
  }) => void;
  onDelete: () => void;
  /** Eine Anfrage läuft: Knöpfe sperren */
  isPending: boolean;
  /** Fehlertext der letzten Anfrage (oder null) */
  errorText: string | null;
}) {
  const isNew = category === null;
  const [name, setName] = useState(category?.name ?? "");
  const [tone, setTone] = useState<TaskIconTone>(
    category?.tone ?? suggestedTone,
  );
  const [icon, setIcon] = useState<TaskIconName | null>(category?.icon ?? null);
  const [view, setView] = useState<"main" | "icon">("main");
  // Richtung des letzten Wechsels für die Animation; beim ersten Anzeigen
  // (null) gleitet nichts
  const [direction, setDirection] = useState<"forward" | "back" | null>(null);
  // Löschen ändert Aufgaben mit, deshalb erst nachfragen
  const [confirming, setConfirming] = useState(false);

  const problem = categoryNameProblem(name);
  // Beim leeren Feld nicht gleich meckern, nur das Speichern sperren
  const shownProblem = name.trim() ? problem : null;
  const canSave = !problem && !isPending;
  const count = category?.taskCount ?? 0;

  function go(next: "main" | "icon") {
    setDirection(next === "main" ? "back" : "forward");
    setView(next);
  }

  const group = "overflow-hidden rounded-2xl bg-surface-2 dark:bg-white/5";
  const row =
    "flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-body";

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="sheet"
      className="task-sheet"
      aria-label="Kategorie"
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
            view === "icon" ? "Icon" : isNew ? "Neue Kategorie" : "Kategorie"
          }
          right={
            view === "main" && (
              <SheetSaveButton
                onClick={() => onSave({ name: name.trim(), tone, icon })}
                disabled={!canSave}
              >
                {isPending ? "Speichert …" : isNew ? "Anlegen" : "Speichern"}
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
            <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
              <div className={group}>
                <button
                  type="button"
                  className={row}
                  onClick={() => {
                    setIcon(null);
                    go("main");
                  }}
                >
                  <span className="flex-1 text-fg">Kein eigenes Icon</span>
                  {icon === null && (
                    <Glyph name="check" size={18} className="text-accent" />
                  )}
                </button>
              </div>
              <IconGrid
                value={icon}
                onChange={(i) => {
                  setIcon(i);
                  go("main");
                }}
              />
            </div>
          )}

          {view === "main" && (
            <div className="flex flex-col gap-4 px-4 pt-3 pb-4">
              {errorText && <InlineAlert text={errorText} />}

              <div>
                <div className={`${group} divide-y divide-line`}>
                  {/* Vorschau: so sieht die Kachel der Gruppe aus */}
                  <div className="flex min-h-14 items-center gap-3 px-3 py-2">
                    <TaskTile
                      icon={icon}
                      title={name.trim() || "?"}
                      size={40}
                      tone={tone}
                    />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={MAX_CATEGORY_NAME}
                      placeholder="Name"
                      aria-label="Name der Kategorie"
                      autoFocus={isNew}
                      className="min-w-0 flex-1 bg-transparent text-body font-semibold text-fg outline-none placeholder:text-subtle"
                    />
                  </div>
                  <button
                    type="button"
                    className={row}
                    onClick={() => go("icon")}
                  >
                    <span className="flex-1 text-fg">Icon</span>
                    {icon ? (
                      <TaskTile
                        icon={icon}
                        title={name.trim() || "?"}
                        size={28}
                        tone={tone}
                      />
                    ) : (
                      <span className="text-muted">keins</span>
                    )}
                    <Glyph name="chevron" size={16} className="text-subtle" />
                  </button>
                </div>
                {shownProblem && (
                  <p className="mt-1 px-3 text-caption leading-snug text-danger">
                    {shownProblem}
                  </p>
                )}
                {!icon && (
                  <p className="mt-1 px-3 text-caption leading-snug text-subtle">
                    Ohne eigenes Icon zeigt die Gruppe das Icon ihrer ersten
                    Aufgabe.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1.5 px-3 text-caption font-semibold tracking-wider text-subtle uppercase">
                  Farbe
                </p>
                <div className={`${group} px-3 py-3.5`}>
                  <ToneSwatches value={tone} onChange={setTone} />
                </div>
              </div>

              {!isNew &&
                (confirming ? (
                  <div className="rounded-2xl bg-surface-2/70 p-3 dark:bg-black/20">
                    <p className="text-secondary leading-snug text-fg-2">
                      {count === 0
                        ? "Die Kategorie wird gelöscht."
                        : `${count} ${count === 1 ? "Aufgabe bleibt" : "Aufgaben bleiben"} erhalten und ${count === 1 ? "steht" : "stehen"} danach in „${DEFAULT_CATEGORY}“.`}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        className="w-full text-secondary"
                        onClick={() => setConfirming(false)}
                      >
                        Abbrechen
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full text-secondary"
                        loading={isPending}
                        disabled={isPending}
                        onClick={onDelete}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={group}>
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      disabled={isPending}
                      className="flex min-h-11 w-full items-center justify-center px-4 text-body font-semibold text-danger disabled:text-subtle"
                    >
                      Kategorie löschen
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
