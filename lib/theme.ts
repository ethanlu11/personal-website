// Two themes: white ("light") and dark gray ("gray"). Gray sets `.dark`, so every
// dark-mode style applies to it.
//
// The choice isn't saved: every visit opens in white (the server-rendered
// default in app/layout.tsx), and switching only lasts until the page reloads.
export type ThemePref = "light" | "gray";

export const THEMES: ThemePref[] = ["light", "gray"];
