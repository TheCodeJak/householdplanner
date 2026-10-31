import { AppBackdrop } from "@/components/layout/AppBackdrop";
import BottomNav from "@/components/layout/BottomNav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VariantSwitcher } from "./_variants/VariantSwitcher"; // Gerüst für Design-Varianten

// Rahmen für alle Seiten nach dem Login: Hintergrund, Inhalt, Bottom-Navigation.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    // relative isolate: eigene Stapel-Ebene, damit der AppBackdrop mit -z-…
    // hinter dem Inhalt liegt, aber nicht hinter dem <body> verschwindet
    <div className="relative isolate flex w-full flex-col">
      <AppBackdrop />
      <main className="mx-auto w-full flex-1 md:px-6 md:py-8">{children}</main>
      {/* Platzhalter in Höhe der schwebenden Bottom-Navigation, damit die
          letzte Karte nicht darunter verschwindet */}
      <div className="h-16 md:hidden" />
      <BottomNav />
      {/* Bleibt beim Seitenwechsel eingehängt; ohne offene Varianten unsichtbar */}
      <VariantSwitcher />
    </div>
  );
}
