import { addDays, isSameDay, startOfToday } from "@/lib/dateUtils";
import { useState } from "react";

/**
 * Der gewählte Tag im Dashboard – die EINE Quelle der Wahrheit dafür.
 * Wochentag, Monat, "ist heute" usw. werden daraus abgeleitet statt separat
 * gespeichert. Startet mit heute (lokale Zeit, 00:00 Uhr).
 */
export function useSelectedDay() {
  const [selectedDay, setSelectedDay] = useState<Date>(() => startOfToday());

  // Um n Tage verschieben (negativ = zurück). Die Funktions-Form von
  // setSelectedDay nutzt immer den aktuellsten Wert, auch bei schnellen Klicks.
  function shift(delta: number) {
    setSelectedDay((d) => addDays(d, delta));
  }

  const isToday = isSameDay(selectedDay, new Date());

  function goToday() {
    setSelectedDay(startOfToday());
  }

  return { date: selectedDay, isToday, shift, goToday };
}
