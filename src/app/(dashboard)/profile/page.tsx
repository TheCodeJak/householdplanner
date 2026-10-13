import { ComingSoon } from "@/components/ui/ComingSoon";
import { FloatingTiles } from "@/components/ui/FloatingTiles";

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Profil"
      description="Bald verwaltest du hier dein Konto, deine Familie und Einladungen."
      illustration={<FloatingTiles icons={["zuhause", "schluessel", "post"]} />}
    />
  );
}
