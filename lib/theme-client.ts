import { THEME_STORAGE_KEY, THEMES, type ThemePref } from "@/lib/theme";

// Shared by the pull cord, the footer switch, and the "D" shortcut so they stay in sync.
export const THEME_CHANGE_EVENT = "theme-change";

export function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(THEME_STORAGE_KEY);
    if (p === "dark") return "gray"; // the retired black theme
    return p === "cream" || p === "gray" ? p : "light";
  } catch {
    return "light";
  }
}

export function applyPref(pref: ThemePref) {
  const root = document.documentElement;
  root.classList.toggle("cream", pref === "cream");
  root.classList.toggle("dark", pref === "gray");
  root.dataset.themePref = pref;
}

export function setPref(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {}
  applyPref(pref);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

// White → cream → gray → white: what the cord and the "D" key do.
export function cycleTheme() {
  const current = (document.documentElement.dataset.themePref as ThemePref) ?? readPref();
  setPref(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]);
}

export const themeName = (pref: ThemePref) => ({ light: "White", cream: "Cream", gray: "Dark gray" })[pref];

export function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
