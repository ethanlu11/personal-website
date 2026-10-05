import { THEME_STORAGE_KEY, type ThemePref } from "@/lib/theme";

// Shared by the pull cord, the footer switch, and the "D" shortcut so they stay in sync.
export const THEME_CHANGE_EVENT = "theme-change";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(THEME_STORAGE_KEY);
    return p === "light" || p === "dark" ? p : "system";
  } catch {
    return "system";
  }
}

export function isDark() {
  return document.documentElement.classList.contains("dark");
}

export function applyPref(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && darkQuery().matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.dataset.themePref = pref;
}

export function setPref(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {}
  applyPref(pref);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function toggleLightDark() {
  setPref(isDark() ? "light" : "dark");
}

export function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function watchSystemTheme() {
  const mq = darkQuery();
  const onChange = () => readPref() === "system" && applyPref("system");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
