import { useEffect } from "react";

/**
 * Applies "light"/"dark" to <html> based on the OS preference, live-updating
 * if it changes — matching the inline script in index.html that sets the
 * initial class before paint (avoiding a flash of the wrong theme). There's
 * no manual override UI, so system preference is the only source of truth.
 */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      root.classList.remove("light", "dark");
      root.classList.add(mql.matches ? "dark" : "light");
    };

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);
}
