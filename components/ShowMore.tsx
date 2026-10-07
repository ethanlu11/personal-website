"use client";

import { Children, useState } from "react";

// Shows the first `initial` children, then a "Show more" button that reveals the
// rest (and "Show less" to fold them back). With `initial` or fewer children it
// renders them all and no button.
export default function ShowMore({ initial, children }: { initial: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const items = Children.toArray(children);
  const hidden = items.length - initial;

  return (
    <>
      {open ? items : items.slice(0, initial)}
      {hidden > 0 && (
        <li className="list-none">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs font-bold tracking-normal uppercase transition-colors hover:border-fg"
          >
            {open ? "Show less" : `Show more (${hidden})`}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </li>
      )}
    </>
  );
}
