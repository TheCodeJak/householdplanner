import { Glyph, type GlyphName } from "@/components/icons";
import type { ReactNode } from "react";

/**
 * Symbol + Text in einem jaklib-Button. jaklib packt den Inhalt in ein
 * <span>, und Tailwind setzt svg auf display:block → ohne inline-flex stünde
 * das Symbol über dem Text.
 */
export function ButtonLabel({
  icon,
  children,
}: {
  icon: GlyphName;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Glyph name={icon} size={16} />
      {children}
    </span>
  );
}
