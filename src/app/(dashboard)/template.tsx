// Anders als layout.tsx wird template.tsx bei jedem Seitenwechsel neu
// eingehängt – so läuft die Einblende-Animation bei jedem Tab-Wechsel erneut.
// Hintergrund und Bottom-Navigation (im Layout) bleiben dabei stehen.
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="motion-safe:animate-page-in">{children}</div>;
}
