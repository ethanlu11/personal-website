"use client";

import { useRef } from "react";

// The edge-to-edge name. It turns blue only while the cursor is on a letter's ink,
// not anywhere in its box: CSS :hover would fire in the gaps between and around
// the letters, so instead each move finds the character under the cursor and
// checks that glyph's pixels, drawn to a canvas in the same font.

const SLOP = 2; // px of forgiveness around the ink

// One canvas per character and font, reused across moves.
const glyphs = new Map<string, { data: Uint8ClampedArray; w: number; h: number }>();

function glyph(ch: string, font: string, w: number, h: number) {
  const key = `${ch}|${font}|${w}|${h}`;
  let g = glyphs.get(key);
  if (!g) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.font = font;
    ctx.textBaseline = "alphabetic";
    // A text range's box spans the font's ascent and descent, so the baseline
    // sits one ascent below its top.
    ctx.fillText(ch, 0, ctx.measureText(ch).fontBoundingBoxAscent);
    g = { data: ctx.getImageData(0, 0, w, h).data, w, h };
    glyphs.set(key, g);
  }
  return g;
}

function onInk(el: HTMLElement, x: number, y: number) {
  const node = el.firstChild;
  if (!(node instanceof Text)) return false;
  const text = node.data;
  const cs = getComputedStyle(el);
  const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const range = document.createRange();
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") continue;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getBoundingClientRect();
    if (x < r.left - SLOP || x > r.right + SLOP || y < r.top || y > r.bottom) continue;
    // Glyphs can overhang their box a little, so give the canvas some room.
    const g = glyph(text[i], font, Math.ceil(r.width * 1.3), Math.ceil(r.height));
    if (!g) return false;
    const gx = Math.round(x - r.left);
    const gy = Math.round(y - r.top);
    for (let dy = -SLOP; dy <= SLOP; dy++) {
      for (let dx = -SLOP; dx <= SLOP; dx++) {
        const px = gx + dx;
        const py = gy + dy;
        if (px < 0 || py < 0 || px >= g.w || py >= g.h) continue;
        if (g.data[(py * g.w + px) * 4 + 3] > 64) return true;
      }
    }
  }
  return false;
}

export default function FitName({ text, as: Tag = "p" }: { text: string; as?: "h1" | "p" }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (el) el.classList.toggle("on-ink", onInk(el, clientX, clientY));
    });
  };

  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    ref.current?.classList.remove("on-ink");
  };

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement>}
      className="fit-name"
      style={{ "--chars": text.length } as React.CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {text}
    </Tag>
  );
}
