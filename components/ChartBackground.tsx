"use client";

import { useEffect, useRef } from "react";

// A faint navigation chart behind the whole page, a nod to the globe's Cebu ↔
// New York route: grid lines with "+" marks where they cross. Near the mouse the
// chart lights up in the accent blue. Moving the light only changes a transform
// and a background offset on a small layer, so it stays cheap. Styles in globals.css.

const SIZE = 560; // keep in step with .chart-light's --size

export default function ChartBackground() {
  const lightRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const light = lightRef.current;
    const grid = gridRef.current;
    if (!light || !grid) return;
    let frame = 0;
    let x = 0;
    let y = 0;

    const place = () => {
      frame = 0;
      const left = x - SIZE / 2;
      const top = y - SIZE / 2;
      light.style.transform = `translate(${left}px, ${top}px)`;
      // Shift the tile back so the lit grid lines up with the page grid.
      const pos = `${-left}px ${-top}px`;
      grid.style.maskPosition = pos;
      grid.style.webkitMaskPosition = pos;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      light.classList.add("on");
      if (!frame) frame = requestAnimationFrame(place);
    };
    const onLeave = () => light.classList.remove("on");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="chart">
      <div className="chart-grid" />
      <div ref={lightRef} className="chart-light">
        <div ref={gridRef} className="chart-light-grid" />
      </div>
    </div>
  );
}
