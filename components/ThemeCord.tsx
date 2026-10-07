"use client";

import { useEffect, useRef } from "react";
import { playClick, warmClick } from "@/lib/click";
import { cycleTheme, readPref, subscribeTheme, themeName } from "@/lib/theme-client";

// A lamp pull cord for light/dark, after newa.sh. You have to pull it: grab the cord
// or handle and drag down. It clicks over the moment the pull passes PULL_THRESHOLD,
// like a real lamp chain, once per pull. A plain click does nothing.
// (Keyboard and screen-reader activation still toggles, so it stays accessible.)

const REST_Y = 150; // resting cord length (px)
const PULL_THRESHOLD = 24; // how far past rest counts as a pull
const MAX_PULL = 80; // free travel before the cord resists
const MAX_SWAY = 80;
const START = { x: -20, y: -100 }; // tucked away above the viewport before it drops in

type Spring = { stiffness: number; damping: number; mass: number };
const SNAP_Y: Spring = { stiffness: 420, damping: 24, mass: 0.9 };
const SNAP_X: Spring = { stiffness: 360, damping: 24, mass: 0.8 };
const DROP_Y: Spring = { stiffness: 160, damping: 18, mass: 0.9 };
const DROP_X: Spring = { stiffness: 130, damping: 15, mass: 0.9 };

const BIG_WOBBLE = [0, 15, -10, 6, -3, 1.25, 0];
const SMALL_WOBBLE = [0, 6, -4, 2, -0.75, 0];

// Past the free range, the cord gives less and less (like framer's dragElastic).
function rubber(v: number, min: number, max: number, elastic: number) {
  if (v > max) return max + (v - max) * elastic;
  if (v < min) return min + (v - min) * elastic;
  return v;
}

// The cord: a line from the anchor to the handle, with a sine wobble that peaks mid-cord.
function cordPath(x: number, y: number, wobble: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 18; i++) {
    const h = i / 18;
    const sway = Math.sin(h * Math.PI * 3.5) * wobble * Math.sin(h * Math.PI);
    pts.push(`${(30 + h * x + sway).toFixed(2)},${(h * y).toFixed(2)}`);
  }
  return `M ${pts.join(" L ")}`;
}

export default function ThemeCord() {
  const pathRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<SVGRectElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);

  // Mutable animation state lives outside React so dragging never re-renders.
  const s = useRef({
    x: START.x,
    y: START.y,
    vx: 0,
    vy: 0,
    target: { x: 0, y: REST_Y },
    springX: DROP_X,
    springY: DROP_Y,
    wobble: 0,
    wobbleKeys: null as number[] | null,
    wobbleStart: 0,
    wobbleDur: 0,
    dragging: false,
    toggledThisPull: false,
    dragFrom: { px: 0, py: 0 },
    raf: 0,
    last: 0,
    reduced: false,
  });

  // Animation controls created inside the effect, used by the pointer handlers.
  const api = useRef<{
    wake: () => void;
    wobble: (big: boolean) => void;
    render: () => void;
    cleanup?: () => void;
  }>({ wake: () => {}, wobble: () => {}, render: () => {} });

  useEffect(() => {
    const st = s.current;
    st.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      pathRef.current?.setAttribute("d", cordPath(st.x, st.y, st.wobble));
      handleRef.current?.setAttribute("transform", `translate(${st.x.toFixed(2)} ${st.y.toFixed(2)})`);
      // The grab area runs the whole cord, from the anchor down past the handle.
      if (hitRef.current) {
        hitRef.current.style.transform = `translateX(${st.x}px)`;
        hitRef.current.style.height = `${Math.max(0, st.y + 39)}px`;
      }
    };

    const step = (t: number) => {
      const dt = Math.min(0.032, st.last ? (t - st.last) / 1000 : 0.016);
      st.last = t;
      let moving = false;

      if (!st.dragging) {
        for (const axis of ["x", "y"] as const) {
          const sp = axis === "x" ? st.springX : st.springY;
          const v = axis === "x" ? "vx" : "vy";
          const force = -sp.stiffness * (st[axis] - st.target[axis]) - sp.damping * st[v];
          st[v] += (force / sp.mass) * dt;
          st[axis] += st[v] * dt;
          if (Math.abs(st[axis] - st.target[axis]) > 0.05 || Math.abs(st[v]) > 0.05) moving = true;
          else {
            st[axis] = st.target[axis];
            st[v] = 0;
          }
        }
      }

      if (st.wobbleKeys) {
        // rAF timestamps can trail performance.now(), so clamp below as well.
        const p = Math.max(0, Math.min(1, (t - st.wobbleStart) / st.wobbleDur));
        const eased = 1 - (1 - p) ** 2;
        const f = eased * (st.wobbleKeys.length - 1);
        const i = Math.min(Math.floor(f), st.wobbleKeys.length - 2);
        st.wobble = st.wobbleKeys[i] + (st.wobbleKeys[i + 1] - st.wobbleKeys[i]) * (f - i);
        if (p >= 1) {
          st.wobble = 0;
          st.wobbleKeys = null;
        } else moving = true;
      }

      render();
      st.raf = moving || st.dragging ? requestAnimationFrame(step) : 0;
      if (!st.raf) st.last = 0;
    };

    const wake = () => {
      if (!st.raf) st.raf = requestAnimationFrame(step);
    };

    const wobble = (big: boolean) => {
      if (st.reduced) return;
      st.wobbleKeys = big ? BIG_WOBBLE : SMALL_WOBBLE;
      st.wobbleDur = big ? 820 : 460;
      st.wobbleStart = performance.now();
      wake();
    };

    api.current = { wake, wobble, render };

    // Drop in shortly after load.
    if (st.reduced) {
      st.x = 0;
      st.y = REST_Y;
      render();
    } else {
      render();
      const timer = window.setTimeout(() => {
        wake();
        wobble(true);
      }, 300);
      api.current.cleanup = () => clearTimeout(timer);
    }

    // When the theme changes some other way (the "D" key, the footer), give the cord
    // a tug. The label always names the current theme for screen readers.
    const label = () =>
      hitRef.current?.setAttribute("aria-label", `Theme: ${themeName(readPref())}. Pull the cord down to change it.`);
    let theme = readPref();
    const unsub = subscribeTheme(() => {
      if (readPref() === theme) return;
      theme = readPref();
      if (!st.dragging && Math.abs(st.y - REST_Y) < 5 && !st.reduced) {
        st.springY = SNAP_Y;
        st.vy = 600;
        wake();
        wobble(true);
      }
      label();
    });
    label();

    // Switching away mid-pull (alt-tab, a system dialog) can swallow the pointerup.
    const onBlur = () => release();
    window.addEventListener("blur", onBlur);

    return () => {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
      api.current.cleanup?.();
      unsub();
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Flip the theme after the cord's current frame has painted, so the page-wide
  // restyle lands in its own task instead of stalling the pull mid-drag.
  const toggleSoon = () => requestAnimationFrame(() => setTimeout(cycleTheme, 0));

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = s.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    warmClick();
    st.dragging = true;
    st.toggledThisPull = false;
    st.dragFrom = { px: e.clientX - st.x, py: e.clientY - st.y };
    st.vx = st.vy = 0;
    st.wobble = 0;
    st.wobbleKeys = null;
    api.current.wake();
  };

  const follow = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = s.current;
    const rawY = e.clientY - st.dragFrom.py;
    st.x = rubber(e.clientX - st.dragFrom.px, -MAX_SWAY, MAX_SWAY, 0.16);
    st.y = rubber(rawY, REST_Y, REST_Y + MAX_PULL, rawY > REST_Y ? 0.32 : 0.04);
    // Click over as soon as the pull passes the threshold, not on release.
    if (!st.toggledThisPull && st.y - REST_Y > PULL_THRESHOLD) {
      st.toggledThisPull = true;
      playClick();
      toggleSoon();
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (s.current.dragging) follow(e);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!s.current.dragging) return;
    follow(e); // count the release point too, so a fast flick still registers
    release();
  };

  // Let go and spring back up. Also runs on pointercancel, lost capture and window
  // blur, where the pointer coordinates can't be trusted, so it never reads them.
  function release() {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    const pulled = st.y - REST_Y;
    st.springX = SNAP_X;
    st.springY = SNAP_Y;
    st.target = { x: 0, y: REST_Y };
    if (st.toggledThisPull) api.current.wobble(true);
    else if (Math.abs(st.x) > 5 || pulled > 4) api.current.wobble(false);
    api.current.wake();
  }

  // Keyboard / assistive tech (click with detail 0): animate a pull, then toggle.
  // Mouse clicks (detail >= 1) are ignored on purpose: you have to pull it.
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0) return;
    const st = s.current;
    if (!st.reduced) {
      st.springY = SNAP_Y;
      st.vy = 900;
      api.current.wake();
    }
    playClick();
    toggleSoon();
  };

  return (
    <div className="pointer-events-none absolute top-0 right-2 h-[320px] w-[60px] select-none sm:right-6 lg:right-10">
      <svg
        aria-hidden="true"
        width="60"
        height="320"
        viewBox="0 0 60 320"
        className="overflow-visible text-muted"
      >
        <rect x="27" y="0" width="6" height="4" fill="currentColor" />
        <path
          ref={pathRef}
          d={cordPath(START.x, START.y, 0)}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <rect
          ref={handleRef}
          x="26"
          y="0"
          width="8"
          height="28"
          rx="4"
          fill="currentColor"
          transform={`translate(${START.x} ${START.y})`}
        />
      </svg>
      <button
        ref={hitRef}
        type="button"
        aria-label="Theme: White. Pull the cord down to change it."
        title="Pull me"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onClick={onClick}
        className="pointer-events-auto absolute top-0 left-[5px] w-[50px] cursor-grab touch-none rounded-b-full active:cursor-grabbing"
        style={{ height: 0, transform: `translateX(${START.x}px)` }}
      />
    </div>
  );
}
