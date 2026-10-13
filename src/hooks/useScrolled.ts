import { useEffect, useState } from "react";

/**
 * true, sobald die Seite mehr als `threshold` Pixel nach unten gescrollt ist.
 * Wird z.B. genutzt, um einen klebenden Kopf erst beim Scrollen milchig zu machen.
 * Der State ändert sich nur beim Über-/Unterschreiten der Schwelle, nicht bei
 * jedem Pixel – React rendert also nicht bei jedem Scroll-Event neu.
 */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    // passive: verspricht dem Browser, dass wir das Scrollen nie verhindern –
    // er muss nicht auf den Handler warten und scrollt flüssiger
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
