import type { TaskIconName } from "@/lib/taskIcons";
import { ReactNode } from "react";

// Die Zeichnungen aller Aufgaben-Icons: Pfade im 24×24-Raster, Outline-Stil.
// Farbe, Strichstärke und runde Linienenden setzt <TaskIcon> am <svg>; die
// Pfade erben sie. Ausgefüllte Punkte (Augen, Kalendertage) nutzen
// fill="currentColor", damit sie dieselbe Farbe bekommen.
// Namen, Anzeigenamen und Farben stehen in @/lib/taskIcons.
//
// `satisfies Record<TaskIconName, ReactNode>` (ganz unten) prüft beim
// Kompilieren, dass es für JEDEN Namen aus TASK_ICON_NAMES eine Zeichnung gibt.
export const taskIconPaths = {
  aufraeumen: (
    <>
      <path d="M12 2.5 8.5 12" />
      <path d="M6 12h6l1.5 8.5h-9z" />
      <path d="M8 15.5l-.5 5M10.5 15.5l.5 5" />
      <path d="M15 15h6l-1 5.5h-4z" />
      <path d="M18 15v-3" />
    </>
  ),
  waschen: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <path d="M4 7h16M14 4.75h3" />
      <circle cx="12" cy="14" r="4.5" />
      <path d="M9 14.5c1-1 2-1 3 0s2 1 3 0" />
    </>
  ),
  saugen: (
    <>
      <path d="M3 18a5 5 0 0 1 10 0v1H3z" />
      <circle cx="5.5" cy="20.7" r="1" />
      <circle cx="10.5" cy="20.7" r="1" />
      <path d="M8 13C8 7 11 4 14 4s3.5 2.5 3 5l-1 11" />
      <path d="M13.5 20.5h5" />
    </>
  ),
  wischen: (
    <>
      <path d="M3 10h9l-1.2 10a1 1 0 0 1-1 .9H5.2a1 1 0 0 1-1-.9z" />
      <path d="M4 10c0-3 2-4.5 3.5-4.5S11 7 11 10" />
      <path d="M20 2.5 17 17" />
      <path d="M14 17h6M14.5 17v4M16.5 17v4M18.5 17v4" />
    </>
  ),
  putzen: (
    <>
      <path d="M8 3h5v3H8zM13 4h3l1 2M9 6h3v2" />
      <path d="M7.5 8h6A1.5 1.5 0 0 1 15 9.5V20a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 6 20V9.5A1.5 1.5 0 0 1 7.5 8z" />
      <path d="M8.5 13h4M19 3.5h1M19 6h1.5M19 8.5h1" />
    </>
  ),
  kochen: (
    <>
      <path d="M4 9h16M10.5 9V7.5h3V9" />
      <path d="M5 9v9a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V9M5 12H2.5M19 12h2.5" />
      <path d="M9 5c-.5-1 .5-2 0-3M15 5c-.5-1 .5-2 0-3" />
    </>
  ),
  essen: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 3v5a1.5 1.5 0 0 0 3 0V3M4.5 3v18" />
      <path d="M20.5 21V3c-1.5 1-2 3-2 6s1 3 2 3" />
    </>
  ),
  braten: (
    <>
      <path d="M2.5 11h12l-1 4a2 2 0 0 1-2 1.5h-6a2 2 0 0 1-2-1.5z" />
      <path d="M14.5 12.5l7-2.5" />
      <path d="M6 8c-.5-1 .5-2 0-3M10 8c-.5-1 .5-2 0-3" />
    </>
  ),
  toasten: (
    <>
      <rect x="3" y="9" width="18" height="11" rx="3" />
      <path d="M7 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      <path d="M17.5 13v3M6 20v1.5M18 20v1.5" />
    </>
  ),
  einkaufen: (
    <>
      <path d="M2 3h2.5l2.2 11.5h11l2-8H5.6" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  besorgungen: (
    <>
      <path d="M7 10l3-6M17 10l-3-6M2.5 10h19" />
      <path d="M4 10l1.5 9a1.5 1.5 0 0 0 1.5 1.3h10a1.5 1.5 0 0 0 1.5-1.3L20 10" />
      <path d="M9 13.5v4M12 13.5v4M15 13.5v4" />
    </>
  ),
  kaffee: (
    <>
      <path d="M4 9h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 6c-.5-1 .5-2 0-3M12 6c-.5-1 .5-2 0-3" />
    </>
  ),
  kuehlschrank: (
    <>
      <rect x="5" y="2" width="14" height="19" rx="2" />
      <path d="M5 10h14M8.5 5v2.5M8.5 13v3.5M7.5 21v1.5M16.5 21v1.5" />
    </>
  ),
  muell: (
    <>
      <path d="M4 6h16M9.5 6V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
      <path d="M5.5 6l1 14a1.5 1.5 0 0 0 1.5 1.4h8a1.5 1.5 0 0 0 1.5-1.4l1-14" />
      <path d="M10 10v7.5M14 10v7.5" />
    </>
  ),
  hund: (
    <>
      <rect x="7" y="4" width="10" height="15" rx="5" />
      <path d="M7 8.5C5 7.5 3 9 3.5 13c.3 2 1.5 2 3.5 1M17 8.5c2-1 4 .5 3.5 4.5-.3 2-1.5 2-3.5 1" />
      <path d="M11 14.5h2l-1 1zM12 15.5v1.5" />
      <circle cx="10" cy="11" r=".6" fill="currentColor" />
      <circle cx="14" cy="11" r=".6" fill="currentColor" />
    </>
  ),
  katze: (
    <>
      <path d="M4.5 13c0-2 .5-4 1.5-5.5L5 3l4.5 3a8 8 0 0 1 5 0L19 3l-1 4.5c1 1.5 1.5 3.5 1.5 5.5 0 4.5-3.5 7.5-7.5 7.5S4.5 17.5 4.5 13z" />
      <path d="M11.3 14.8h1.4l-.7.8zM2 14l4 .5M2.5 17l3.5-1M22 14l-4 .5M21.5 17l-3.5-1" />
      <circle cx="9.5" cy="12" r=".6" fill="currentColor" />
      <circle cx="14.5" cy="12" r=".6" fill="currentColor" />
    </>
  ),
  post: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </>
  ),
  paket: (
    <>
      <path d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7z" />
      <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10M7.75 4.75l8.5 4.5" />
    </>
  ),
  wecker: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9v4l2.5 2" />
      <path d="M3.5 6.5a3 3 0 0 1 4-3.5M20.5 6.5a3 3 0 0 0-4-3.5M6.5 19.5 5 21.5M17.5 19.5l1.5 2" />
    </>
  ),
  zuhause: (
    <>
      <path d="M3 11l9-7.5 9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      <path d="M16 5.5V3.5h2.5v4" />
    </>
  ),
  kalender: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <g fill="currentColor" stroke="none">
        <circle cx="7.5" cy="13" r=".9" />
        <circle cx="12" cy="13" r=".9" />
        <circle cx="16.5" cy="13" r=".9" />
        <circle cx="7.5" cy="17" r=".9" />
        <circle cx="12" cy="17" r=".9" />
      </g>
    </>
  ),
  planung: (
    <>
      <rect x="5" y="4" width="14" height="17.5" rx="2" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M8 10l1 1 2-2M13 10h3M8 15l1 1 2-2M13 15h3" />
    </>
  ),
  finanzen: (
    <>
      <path d="M19 12.5c0-3.5-3.1-6-7-6-1 0-2 .2-2.8.5L7 5.5v3c-1.5 1-2.4 2.3-2.7 3.8H3v3h1.4c.4 1.4 1.3 2.6 2.6 3.5v2h3v-1.3h4v1.3h3V19c1.3-1 2-2.8 2-4.5z" />
      <path d="M19 12.5c1.5 0 2-1 1.8-2M10.5 9.5h3" />
      <circle cx="7.5" cy="12" r=".6" fill="currentColor" />
    </>
  ),
  apotheke: (
    <>
      <rect x="3" y="7" width="18" height="13.5" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M12 10.5v6M9 13.5h6" />
    </>
  ),
  schluessel: (
    <>
      <circle cx="8" cy="8" r="4.5" />
      <circle cx="7" cy="7" r="1.2" />
      <path d="M11.2 11.2 20 20M15.5 15.5l2-2M18 18l1.5-1.5" />
    </>
  ),
  pflanzen: (
    <>
      <path d="M7 14h10l-1.2 6.5a1 1 0 0 1-1 .8H9.2a1 1 0 0 1-1-.8z" />
      <path d="M12 14V8M12 10c-3 0-5-2-5-5 3 0 5 2 5 5zM12 8c0-3 2-5 5-5 0 3-2 5-5 5z" />
    </>
  ),
  buegeln: (
    <>
      <path d="M3 18h18v-3.5A5.5 5.5 0 0 0 15.5 9H9c-3 0-5.3 4-6 9z" />
      <path d="M10 9V7a1.5 1.5 0 0 1 1.5-1.5H20M7 14.5h10" />
    </>
  ),
  bett: (
    <>
      <path d="M3 19V6M3 15h18v4M21 15v-3a2 2 0 0 0-2-2h-8v5" />
      <rect x="5" y="10.5" width="4" height="3" rx="1.5" />
    </>
  ),
  spuelen: (
    <>
      <path d="M3 13h18M4.5 13v2.5a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4V13" />
      <path d="M12 13V7a2.5 2.5 0 0 1 5 0M17 9.5v1" />
    </>
  ),
} satisfies Record<TaskIconName, ReactNode>;
