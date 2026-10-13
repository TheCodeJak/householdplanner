import { ComingSoon } from "@/components/ui/ComingSoon";
import { FloatingTiles } from "@/components/ui/FloatingTiles";

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Kalender"
      description="Bald siehst du hier die ganze Woche auf einen Blick: wer wann welche Aufgabe übernimmt."
      illustration={<FloatingTiles icons={["kalender", "wecker", "planung"]} />}
    />
  );
}
