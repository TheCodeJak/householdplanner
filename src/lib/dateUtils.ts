// Reine Datums-Helfer. Alle arbeiten in der LOKALEN Zeitzone des Browsers und
// ignorieren die Uhrzeit – ein "Tag" ist immer Mitternacht dieses Tages.

const daysOfWeek: string[] = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

// Index wie Date.getDay(): 0 = Sonntag
const shortDaysOfWeek: string[] = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const months: string[] = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const DAY_MS = 86_400_000;

/** "Sonntag" – dayIndex wie Date.getDay() (0 = Sonntag) */
export function getDay(dayIndex: number): string {
  return daysOfWeek[dayIndex];
}

/** "So" – dayIndex wie Date.getDay() (0 = Sonntag) */
export function getShortDay(dayIndex: number): string {
  return shortDaysOfWeek[dayIndex];
}

/** "Oktober" – monthIndex wie Date.getMonth() (0 = Januar) */
export function getMonth(monthIndex: number): string {
  return months[monthIndex];
}

/** "Sonntag, 11.10." */
export function formatDayLabel(d: Date): string {
  return `${getDay(d.getDay())}, ${d.getDate()}.${d.getMonth() + 1}.`;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Montag der Woche, in der `date` liegt (Wochen beginnen montags) */
export function mondayOf(date: Date): Date {
  // getDay(): So=0 … Sa=6  →  (getDay() + 6) % 7: Mo=0 … So=6
  return addDays(date, -((date.getDay() + 6) % 7));
}

/** Die 7 Tage ab `monday` */
export function weekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Ganze Tage von `from` bis `to` (negativ, wenn `to` davor liegt) */
export function daysBetween(from: Date, to: Date): number {
  // Math.round fängt die 23/25-Stunden-Tage bei der Zeitumstellung ab
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** Date → "2026-10-11" (so erwartet es der Server) */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "2026-10-11" → Date (lokale Mitternacht, nicht UTC wie new Date("2026-10-11")) */
export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, n: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
