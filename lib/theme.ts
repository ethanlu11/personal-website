export type ThemePref = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

// Runs inline in <head>, before first paint, so there's no theme flash.
// Sets `.dark` on <html> for styling and `data-theme-pref` for the toggle.
export const themeScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.dataset.themePref=p}catch(_){}})()`;
