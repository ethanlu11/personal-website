// Three themes: white ("light", the default), cream ("cream"), and dark gray
// ("gray"). Cream sets `.cream` for its colors; gray sets `.dark`, so every
// dark-mode style applies to it.
export type ThemePref = "light" | "cream" | "gray";

export const THEMES: ThemePref[] = ["light", "cream", "gray"];

export const THEME_STORAGE_KEY = "theme";

// Runs inline in <head>, before first paint, so there's no theme flash. A saved
// "dark" (the old black theme) becomes gray; anything else unknown, or no choice
// yet, opens in white.
export const themeScript = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");if(p==="dark")p="gray";if(p!=="cream"&&p!=="gray")p="light";var e=document.documentElement;e.classList.toggle("cream",p==="cream");e.classList.toggle("dark",p==="gray");e.dataset.themePref=p}catch(_){}})()`;
