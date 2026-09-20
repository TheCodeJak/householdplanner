"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = "overview" | "calendar" | "stats" | "profile";

const TABS: { key: Tab; label: string; href: string }[] = [
  { key: "overview", label: "Übersicht", href: "/dashboard" },
  { key: "calendar", label: "Kalender", href: "/calendar" },
  { key: "stats", label: "Statistik", href: "/statistics" },
  { key: "profile", label: "Profil", href: "/profile" },
];

function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const color = active ? "currentColor" : "#94A3B8";
  const size = 22;

  switch (tab) {
    case "overview":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10.5z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={active ? color : "none"}
            fillOpacity={active ? 0.15 : 0}
          />
        </svg>
      );
    case "calendar":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke={color}
            strokeWidth="1.8"
          />
          <path d="M3 10h18" stroke={color} strokeWidth="1.8" />
          <path
            d="M8 2v4M16 2v4"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "stats":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M8 17V13M12 17V7M16 17V11"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "profile":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
          <path
            d="M4 21c0-3.3 3.6-6 8-6s8 2.7 8 6"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ key, label, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-0.5 pt-1.5 pb-1 px-3 transition-colors ${
                active ? "text-orange-500" : "text-slate-400"
              }`}
            >
              <TabIcon tab={key} active={active} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
