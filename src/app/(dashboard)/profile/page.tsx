import { ComingSoon } from "@/app/components/ui/ComingSoon";

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Profil"
      description="Bald verwaltest du hier dein Konto, deine Familie und Einladungen."
      icons={["zuhause", "schluessel", "post"]}
    />
  );
}
