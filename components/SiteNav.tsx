"use client";

import { Fragment, useEffect, useState } from "react";
import SocialIcon from "@/components/SocialIcon";

export type NavSection = { id: string; label: string };

// Top bar: a "Home / Section" breadcrumb that follows the scroll on the left, and
// slash-separated links to every section on the right, ending in a straight-to-PDF
// resume link.
export default function SiteNav({ sections, resume }: { sections: NavSection[]; resume: string }) {
  const [current, setCurrent] = useState<string | null>(null);

  // The section crossing the middle of the viewport is the current one.
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el) => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(e.target.id);
          else setCurrent((c) => (c === e.target.id ? null : c));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const here = sections.find((s) => s.id === current);
  const link = "rounded-sm transition-colors hover:text-fg";

  return (
    <nav
      aria-label="Sections"
      className="flex min-w-0 flex-1 items-center justify-between gap-6 font-mono text-[13px] font-bold tracking-normal text-muted uppercase"
    >
      <p className="hidden shrink-0 items-center gap-3 sm:flex">
        <a href="#top" className={link}>
          Home
        </a>
        {here && (
          <>
            <span aria-hidden="true" className="text-muted/60">/</span>
            <a href={`#${here.id}`} className={`${link} text-fg`}>
              {here.label}
            </a>
          </>
        )}
      </p>
      <ul className="-my-2 ml-auto flex min-w-0 items-center gap-3 overflow-x-auto py-2 [scrollbar-width:none] md:gap-4">
        {sections.map((s, i) => (
          <Fragment key={s.id}>
            {i > 0 && (
              <li aria-hidden="true" className="text-muted/60">
                /
              </li>
            )}
            <li className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={s.id === current ? "location" : undefined}
                className={`${link} ${s.id === current ? "text-fg" : ""}`}
              >
                {s.label}
              </a>
            </li>
          </Fragment>
        ))}
      </ul>
      {/* Outside the scrolling list so it stays in view on narrow screens. */}
      <a
        href={resume}
        target="_blank"
        rel="noopener noreferrer"
        className={`${link} -ml-2 flex shrink-0 items-center gap-1.5 text-fg sm:ml-0`}
      >
        <SocialIcon name="resume" size={15} />
        Resume
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </nav>
  );
}
