import { BarsIllustration, ComingSoon } from "@/app/components/ui/ComingSoon";

export default function StatisticsPage() {
  return (
    <ComingSoon
      title="Statistik"
      description="Bald siehst du hier, wer wie viel im Haushalt erledigt hat – pro Woche und pro Monat."
      illustration={<BarsIllustration />}
    />
  );
}
