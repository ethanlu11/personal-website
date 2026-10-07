"use client";

import { useEffect, useSyncExternalStore } from "react";
import { playClick } from "@/lib/click";
import type { ThemePref } from "@/lib/theme";
import { cycleTheme, readPref, setPref, subscribeTheme } from "@/lib/theme-client";

const options: { value: ThemePref; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Use the white theme",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </>
    ),
  },
  {
    value: "gray",
    label: "Use the dark gray theme",
    icon: <path d="M12 3a7 7 0 1 0 9 11 9 9 0 1 1-9-11Z" />,
  },
];

// Footer White / Gray switch (as on newa.sh), plus the "D" shortcut, which
// toggles between them like the cord.
export default function ThemeToggle() {
  // null on the server; the active state is painted by CSS from <html data-theme-pref>.
  const pref = useSyncExternalStore(subscribeTheme, readPref, () => null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "d" && e.key !== "D") return;
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName ?? "")) return;
      playClick();
      cycleTheme();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      role="group"
      aria-label="Color theme (press D to switch)"
      className="flex w-fit items-center gap-0.5 rounded-lg bg-tray p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-theme-option={o.value}
          aria-label={o.label}
          aria-pressed={pref === o.value}
          title={o.label}
          onClick={() => {
            playClick();
            setPref(o.value);
          }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-fg"
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {o.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
