import { ComingSoon } from "@/app/components/ui/ComingSoon";

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Kalender"
      description="Bald siehst du hier die ganze Woche auf einen Blick: wer wann welche Aufgabe übernimmt."
      icons={["kalender", "wecker", "planung"]}
    />
  );
}
