import { addDays, isSameDay, startOfToday } from "@/lib/dateUtils";
import { useState } from "react";

export function useSelectedDay() {
  const [selectedDay, setSelectedDay] = useState<Date>(() => startOfToday());

  function shift(delta: number) {
    setSelectedDay((d) => addDays(d, delta));
  }

  const isToday = isSameDay(selectedDay, new Date());

  function goToday() {
    setSelectedDay(startOfToday());
  }

  return { date: selectedDay, isToday, shift, goToday };
}
