"use client";

import { useId, useRef, useState } from "react";

// Sub-tabs within a section. Every panel is rendered (so the content is in the
// page for search and no-JS), and the inactive ones are hidden. Follows the ARIA
// tabs pattern: arrow keys, Home and End move between tabs.
export default function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" onKeyDown={onKeyDown} className="mb-10 flex gap-7 border-b border-line md:mb-12">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`-mb-px cursor-pointer border-b-2 pb-3 font-mono text-sm font-bold tracking-normal uppercase transition-colors ${
              active === i ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
