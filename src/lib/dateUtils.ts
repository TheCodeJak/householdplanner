const daysOfWeek: string[] = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

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

export function getDay(dayIndex: number): string {
  return daysOfWeek[dayIndex];
}

export function getMonth(monthIndex: number): string {
  return months[monthIndex];
}

function today(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getDayByDayOffset(offset: number): Date {
  const day = today();
  day.setDate(today().getDate() - ((today().getDay() + 6) % 7) + offset);
  return day;
}

export function getDayByWeekOffset(offset: number): Date {
  const monday = today();
  monday.setDate(today().getDate() - ((today().getDay() + 6) % 7) + offset * 7);
  return monday;
}

export function getMonday(weekOffset: number): Date {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDate(d: Date): string {
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

export function getWeekNumber(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}
