import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
/** Same storage key as the original design, so a saved choice carries over. */
export const THEME_KEY = "wealthspan_theme_preference";

/** Runs before first paint (inlined in the page head) so a dark phone never flashes white. */
export const THEME_BOOT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var h=document.documentElement;h.classList.toggle("dark",d);h.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function readThemePreference(): ThemePreference {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(dark: boolean) {
  const html = document.documentElement;
  html.classList.toggle("dark", dark);
  html.style.colorScheme = dark ? "dark" : "light";
  document.body.classList.toggle("dark-theme", dark);
}

/** Follows the phone's light/dark setting (or the person's own choice) by toggling the `dark` class on <html>, as the original does. */
export function useTheme() {
  const [pref, setPref] = useState<ThemePreference>("system");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setPref(readThemePreference());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const dark = pref === "dark" || (pref === "system" && systemDark);
  useEffect(() => {
    apply(dark);
  }, [dark]);

  const choose = (next: ThemePreference) => {
    setPref(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private window: the choice lasts until the page closes */
    }
  };
  return { pref, dark, choose };
}
