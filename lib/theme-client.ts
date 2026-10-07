import { THEMES, type ThemePref } from "@/lib/theme";

// Shared by the pull cord, the footer switch, and the "D" shortcut so they stay in sync.
export const THEME_CHANGE_EVENT = "theme-change";

// The current theme, read from <html data-theme-pref> (white on every load).
export function readPref(): ThemePref {
  return document.documentElement.dataset.themePref === "gray" ? "gray" : "light";
}

export function setPref(pref: ThemePref) {
  const root = document.documentElement;
  root.classList.toggle("dark", pref === "gray");
  root.dataset.themePref = pref;
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

// White ↔ gray: what the cord and the "D" key do.
export function cycleTheme() {
  setPref(THEMES[(THEMES.indexOf(readPref()) + 1) % THEMES.length]);
}

export const themeName = (pref: ThemePref) => ({ light: "White", gray: "Dark gray" })[pref];

export function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}
