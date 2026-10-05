"use client";

import { useEffect, useRef, useState } from "react";
import { countryOutlines, worldOutlines } from "@/lib/geo";

// An outline globe drawn on a plain canvas with no libraries: a rim plus country
// borders, rotating in the spirit of vighneshhemnani.org's globe.
// It spins on its own, leans toward the cursor, and can be dragged with momentum.
// Every country is outlined faintly; the United States and the Philippines are
// highlighted in blue, with pins on the given places
// and a plane circling the world westbound between the first two: over Europe
// to the second pin, then over the Pacific back to the first, at the same rate
// the globe turns. It leaves shortly after load; on each landing the globe holds
// still for a beat, then the plane sets off on the next leg. The globe only turns
// while the plane is in the air.
// Press and hold to spin it up.

const BASE_TILT = 0.32;
const SPEEDS = [15, 12.5, 10]; // seconds per turn for the 1 / 2 / 3 speed buttons
const DEFAULT_SPEED = 2; // starts on 3, the fastest
const DRAG_GAIN = 0.0085; // radians per pixel
const HOLD_MS = 350; // press and hold this long (without dragging) to spin up
const HOLD_BOOST = 10; // spin speed multiplier while held
const FIRST_DEPARTURE_MS = 1300; // after load, the plane leaves the first pin
const LANDING_PAUSE_MS = 500; // on each landing the globe holds still this long
const TACK_SCALE = 1.35; // pin thumbtack size
const TACK_RED = "#e5383b";
const ROUTE_STEPS = 120;
const ROUTE_LIFT = 0.07; // how far the arc rises above the surface, as a share of the radius
// Leave headroom so the lifted route never runs off the canvas.
const GLOBE_SCALE = 1 / (1 + ROUTE_LIFT + 0.015);

// A small plane silhouette pointing along +x, in px.
const PLANE = [
  [10, 0], [6, -1.6], [1, -1.6], [-3, -9], [-5.5, -9], [-3, -1.6], [-7, -1.6], [-9, -4.5],
  [-10.5, -4.5], [-9.2, 0], [-10.5, 4.5], [-9, 4.5], [-7, 1.6], [-3, 1.6], [-5.5, 9], [-3, 9],
  [1, 1.6], [6, 1.6],
];

// Points along a sideways route from a to b: heading west over Asia, Europe and
// the Atlantic, with a northward bow that carries it across Europe while keeping
// it in the mid-latitudes instead of looping over the pole. Lifted off the
// surface in a low arc.
function flightRoute(a: Pin, b: Pin) {
  const dLon = -((((a.lon - b.lon) % 360) + 360) % 360);
  const out: [number, number, number][] = [];
  for (let i = 0; i <= ROUTE_STEPS; i++) {
    const t = i / ROUTE_STEPS;
    const bow = Math.sin(Math.PI * t);
    const v = toVec(a.lat + (b.lat - a.lat) * t + 20 * bow, a.lon + dLon * t);
    const lift = 1 + ROUTE_LIFT * bow;
    out.push([v[0] * lift, v[1] * lift, v[2] * lift]);
  }
  return out;
}


type Pin = { label: string; lat: number; lon: number };

// Latitude/longitude to a point on the unit sphere (east = +x, north = +y).
function toVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.sin(lo) * Math.cos(la), Math.sin(la), Math.cos(lo) * Math.cos(la)];
}

// Each ring as sphere points, plus which edges to skip: a jump across the ±180°
// meridian (Alaska's Aleutians) isn't a real edge and would cut across the globe.
// Long straight borders (e.g. the 49th parallel) are broken into `maxStep`-degree
// steps so they bend with the sphere and clip cleanly at the horizon.
function toRings(rings: number[][], maxStep: number) {
  return rings.map((ring) => {
    const pts: [number, number, number][] = [];
    const skip: boolean[] = [];
    const n = ring.length / 2;
    for (let i = 0; i < n; i++) {
      const [lon, lat] = [ring[i * 2], ring[i * 2 + 1]];
      const j = (i + 1) % n;
      const [nLon, nLat] = [ring[j * 2], ring[j * 2 + 1]];
      if (Math.abs(nLon - lon) > 180) {
        pts.push(toVec(lat, lon));
        skip.push(true);
        continue;
      }
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(nLon - lon), Math.abs(nLat - lat)) / maxStep));
      for (let k = 0; k < steps; k++) {
        const t = k / steps;
        pts.push(toVec(lat + (nLat - lat) * t, lon + (nLon - lon) * t));
        skip.push(false);
      }
    }
    return { pts, skip, closed: !skip.includes(true) };
  });
}

// Highlighted countries (blue, filled) and every other country (faint ink lines).
const OUTLINES = toRings(Object.values(countryOutlines).flat(), 1.5);
const WORLD = toRings(worldOutlines, 3);

export default function InteractiveGlobe({ pins, className = "" }: { pins: Pin[]; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // null = follow prefers-reduced-motion; true/false = the visitor's choice.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const spinning = !(userPaused ?? reduced);
  const spinRef = useRef(spinning);
  const [speed, setSpeed] = useState(DEFAULT_SPEED); // index into SPEEDS
  const spinRateRef = useRef((Math.PI * 2) / SPEEDS[DEFAULT_SPEED]); // radians per second
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    spinRef.current = spinning;
    wakeRef.current();
  }, [spinning]);

  useEffect(() => {
    spinRateRef.current = (Math.PI * 2) / SPEEDS[speed];
  }, [speed]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const pinVecs = pins.map((p) => toVec(p.lat, p.lon));
    // Two westbound legs that close the loop: over Europe, then back over the Pacific.
    const routes = pins.length >= 2 ? [flightRoute(pins[0], pins[1]), flightRoute(pins[1], pins[0])] : [];
    // Each leg's westward sweep in radians: the plane covers it at the globe's own
    // turning rate, so it keeps exact pace with the spin on both legs.
    const westward = (a: Pin, b: Pin) => ((((a.lon - b.lon) % 360) + 360) % 360) * (Math.PI / 180);
    const legSpans = routes.length ? [westward(pins[0], pins[1]), westward(pins[1], pins[0])] : [];
    const st = {
      size: 0,
      // Start with the first pin facing us, ready for takeoff.
      yaw: -((pins[0]?.lon ?? 0) * Math.PI) / 180,
      pitch: BASE_TILT,
      yawVel: 0, // extra spin from a fling, decays back to auto-spin
      hoverYaw: 0,
      hoverPitch: 0,
      targetHoverYaw: 0,
      targetHoverPitch: 0,
      dragging: false,
      pressX: 0,
      pressY: 0,
      pressMoved: false,
      holdTimer: 0,
      boosting: false, // long-press is held
      boost: 1, // current spin multiplier, eases toward HOLD_BOOST or 1
      // The plane: flying a leg, or on the ground at that leg's start until groundUntil.
      // The globe only turns while the plane is in the air.
      flying: false,
      leg: 0 as 0 | 1, // 0 = first pin → second, 1 = second → first
      planeP: 0, // progress through the current leg, 0 → 1
      firstFlight: true, // only the very first takeoff fades in
      groundUntil: performance.now() + FIRST_DEPARTURE_MS,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      raf: 0,
      prev: 0,
      visible: true,
      ready: false,
      fg: "#000",
      lineBoost: 1, // white-on-black lines need more weight than black-on-white
      accent: "#1e40af",
      bg: "#fff",
      mono: "monospace",
    };

    const readColors = () => {
      const cs = getComputedStyle(wrap);
      st.fg = cs.color;
      st.lineBoost = document.documentElement.classList.contains("dark") ? 1.5 : 1;
      st.accent = cs.getPropertyValue("--accent").trim() || st.accent;
      st.bg = cs.getPropertyValue("--bg").trim() || st.bg;
      st.mono = getComputedStyle(document.documentElement).getPropertyValue("--font-space-mono").trim() || st.mono;
    };

    const resize = () => {
      const size = wrap.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.size = size;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // A thumbtack seen from the side, leaning a little, its needle tip at (x, y):
    // a dark needle, then a red flange, waist and cap outlined in the page color.
    // Red, not the accent blue, so it stands out against the highlighted countries.
    const drawTack = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.22);
      ctx.scale(TACK_SCALE, TACK_SCALE);
      ctx.lineCap = "round";
      ctx.strokeStyle = st.fg;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -8);
      ctx.stroke();
      ctx.fillStyle = TACK_RED;
      ctx.strokeStyle = st.bg;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-7, -11.5, 14, 4, 2); // flange
      ctx.roundRect(-3.5, -20, 7, 9, 1.5); // waist
      ctx.roundRect(-6, -24.5, 12, 5, 2.5); // cap
      ctx.stroke();
      ctx.fill();
      // A small highlight down the waist so it reads as rounded plastic.
      ctx.strokeStyle = st.bg;
      ctx.globalAlpha *= 0.55;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-1.5, -18.5);
      ctx.lineTo(-1.5, -12.5);
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      const { size } = st;
      if (!size) return;
      const c = size / 2;
      const r = (size / 2) * GLOBE_SCALE;
      const yaw = st.yaw + st.hoverYaw;
      const pitch = st.pitch + st.hoverPitch;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      ctx.clearRect(0, 0, size, size);

      // The globe's rim, so its shape reads without a mesh.
      ctx.strokeStyle = st.fg;
      ctx.lineWidth = 1;
      ctx.globalAlpha = Math.min(1, 0.22 * st.lineBoost);
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.stroke();

      // Country outlines: strong on the near side, a faint ghost on the far side.
      const project = (v: [number, number, number]) => {
        const x1 = v[0] * cy + v[2] * sy;
        const z1 = -v[0] * sy + v[2] * cy;
        return [c + x1 * r, c - (v[1] * cp - z1 * sp) * r, v[1] * sp + z1 * cp] as const;
      };
      // Every other country, near side only, batched by depth: solid black lines in
      // light mode, softer white lines in dark mode.
      ctx.lineJoin = "round";
      const world = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (const ring of WORLD) {
        let prev = project(ring.pts[0]);
        for (let i = 0; i < ring.pts.length; i++) {
          const next = project(ring.pts[(i + 1) % ring.pts.length]);
          const depth = (prev[2] + next[2]) / 2;
          if (!ring.skip[i] && depth > 0) {
            const band = world[Math.min(3, Math.floor(depth / 0.12))];
            band.moveTo(prev[0], prev[1]);
            band.lineTo(next[0], next[1]);
          }
          prev = next;
        }
      }
      const dark = st.lineBoost > 1;
      ctx.strokeStyle = dark ? st.fg : "#000";
      ctx.lineWidth = dark ? 0.7 : 0.8;
      const worldAlpha = dark ? [0.08, 0.18, 0.3, 0.45] : [0.35, 0.65, 0.9, 1];
      world.forEach((path, band) => {
        ctx.globalAlpha = worldAlpha[band];
        ctx.stroke(path);
      });

      ctx.strokeStyle = st.accent;
      for (const ring of OUTLINES) {
        const pr = ring.pts.map(project);
        // Bucket edges by depth: far side, then four bands that strengthen toward
        // the viewer, so coastlines fade out as they roll over the horizon.
        const far = new Path2D();
        const near = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
        for (let i = 0; i < pr.length; i++) {
          if (ring.skip[i]) continue;
          const a = pr[i];
          const b = pr[(i + 1) % pr.length];
          const depth = (a[2] + b[2]) / 2;
          const path = depth <= 0 ? far : near[Math.min(3, Math.floor(depth / 0.1))];
          path.moveTo(a[0], a[1]);
          path.lineTo(b[0], b[1]);
        }
        if (ring.closed && pr.every((p) => p[2] > 0.02)) {
          ctx.globalAlpha = 0.14;
          ctx.fillStyle = st.accent;
          ctx.beginPath();
          pr.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.closePath();
          ctx.fill();
        }
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.12;
        ctx.stroke(far);
        ctx.lineWidth = 1.5;
        near.forEach((path, band) => {
          ctx.globalAlpha = [0.15, 0.4, 0.7, 0.95][band];
          ctx.stroke(path);
        });
      }

      // Flight route: a steady line where visible, a faint ghost where the globe hides it.
      // A lifted point is hidden only when it's behind the globe and inside its disc.
      if (routes.length) {
        const liftedRoutes = routes.map((route) =>
          route.map((v) => {
            const x1 = v[0] * cy + v[2] * sy;
            const z1 = -v[0] * sy + v[2] * cy;
            const sx = x1;
            const syy = v[1] * cp - z1 * sp;
            const depth = v[1] * sp + z1 * cp;
            return { x: c + sx * r, y: c - syy * r, hidden: depth < 0 && sx * sx + syy * syy < 1 };
          }),
        );
        const shown = new Path2D();
        const ghost = new Path2D();
        for (const lifted of liftedRoutes) {
          for (let i = 0; i < lifted.length - 1; i++) {
            const a = lifted[i];
            const b = lifted[i + 1];
            const path = a.hidden || b.hidden ? ghost : shown;
            path.moveTo(a.x, a.y);
            path.lineTo(b.x, b.y);
          }
        }
        const lifted = liftedRoutes[st.leg];
        ctx.strokeStyle = st.accent;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.12;
        ctx.stroke(ghost);
        ctx.globalAlpha = 0.9;
        ctx.stroke(shown);

        // The plane: placed along the route, turned to face its direction of travel.
        const at = (t: number) => {
          const f = Math.max(0, Math.min(ROUTE_STEPS, t * ROUTE_STEPS));
          const i = Math.min(ROUTE_STEPS - 1, Math.floor(f));
          const a = lifted[i];
          const b = lifted[i + 1];
          const k = f - i;
          return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, hidden: k < 0.5 ? a.hidden : b.hidden };
        };
        const here = at(st.planeP);
        // Heading from points just behind and ahead; at the ends only one side clamps.
        const back = at(st.planeP - 0.005);
        const ahead = at(st.planeP + 0.005);
        // Fades in on its very first takeoff; after that it's always somewhere on the loop.
        const fade = !st.firstFlight ? 1 : st.flying ? Math.min(1, st.planeP / 0.06) : 0;
        if (!here.hidden && fade > 0) {
          ctx.save();
          ctx.translate(here.x, here.y);
          ctx.rotate(Math.atan2(ahead.y - back.y, ahead.x - back.x));
          ctx.globalAlpha = fade;
          ctx.fillStyle = st.fg;
          ctx.strokeStyle = st.bg;
          ctx.lineWidth = 1.5;
          ctx.lineJoin = "round";
          ctx.beginPath();
          PLANE.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          ctx.restore();
        }
      }

      // Pins: a thumbtack stuck into the spot with a label above it; they fade as
      // they turn away.
      ctx.font = `700 11px ${st.mono}`;
      ctx.textBaseline = "middle";
      pins.forEach((pin, i) => {
        const [px, py, depth] = project(pinVecs[i]);
        if (depth <= 0) return;
        const fade = Math.min(1, depth / 0.25);
        const label = pin.label.toUpperCase();
        const tw = ctx.measureText(label).width;
        const top = py - 24.5 * TACK_SCALE - 14;
        ctx.globalAlpha = fade;
        ctx.fillStyle = st.fg;
        ctx.beginPath();
        ctx.roundRect(px - tw / 2 - 7, top - 9, tw + 14, 18, 9);
        ctx.fill();
        ctx.fillStyle = st.bg;
        ctx.fillText(label, px - tw / 2, top + 0.5);
        drawTack(px, py);
      });
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, st.prev ? (t - st.prev) / 1000 : 0.016);
      st.prev = t;
      // Long-press boost eases up while held and winds down after release.
      const boostTarget = st.boosting ? HOLD_BOOST : 1;
      st.boost += (boostTarget - st.boost) * (1 - Math.exp(-dt * (st.boosting ? 2.5 : 1.6)));
      if (!st.boosting && Math.abs(st.boost - 1) < 0.01) st.boost = 1;
      // The globe's own turn (with any hold boost); it stops while the plane is on
      // the ground, and the plane flies at exactly this rate.
      const grounded = routes.length > 0 && !st.flying;
      const turn =
        !grounded && (!st.dragging || st.boosting)
          ? ((spinRef.current ? 1 : 0) + (st.boost - 1)) * spinRateRef.current
          : 0;
      if (!st.dragging || st.boosting) {
        st.yaw += (turn + st.yawVel) * dt;
        st.yawVel *= Math.exp(-dt * 2.2);
        if (Math.abs(st.yawVel) < 0.001) st.yawVel = 0;
        st.pitch += (BASE_TILT - st.pitch) * (1 - Math.exp(-dt * 1.5));
      }
      const ease = 1 - Math.exp(-dt * 4);
      st.hoverYaw += (st.targetHoverYaw - st.hoverYaw) * ease;
      st.hoverPitch += (st.targetHoverPitch - st.hoverPitch) * ease;

      // The plane: fly a leg, land, hold for a beat, then take off on the next leg.
      if (routes.length) {
        if (st.flying) {
          st.planeP += (turn * dt) / legSpans[st.leg];
          if (st.planeP >= 1) {
            st.leg = st.leg === 0 ? 1 : 0;
            st.planeP = 0;
            st.flying = false;
            st.firstFlight = false;
            st.groundUntil = t + LANDING_PAUSE_MS;
          }
        } else if (t >= st.groundUntil) st.flying = true;
      }
      draw();

      const settling =
        st.dragging ||
        st.boost !== 1 ||
        st.yawVel !== 0 ||
        Math.abs(st.targetHoverYaw - st.hoverYaw) > 0.0005 ||
        Math.abs(st.targetHoverPitch - st.hoverPitch) > 0.0005 ||
        Math.abs(BASE_TILT - st.pitch) > 0.0005;
      if (st.visible && st.ready && (spinRef.current || settling)) st.raf = requestAnimationFrame(tick);
      else {
        st.raf = 0;
        st.prev = 0;
      }
    };

    const wake = () => {
      if (!st.raf && st.visible && st.ready) st.raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    // Pointer: lean toward the cursor on hover; drag to spin, fling for momentum.
    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (st.dragging && st.boosting) return; // holding: ignore small wobbles of the pointer
      if (st.dragging) {
        if (Math.hypot(e.clientX - st.pressX, e.clientY - st.pressY) > 6) st.pressMoved = true;
        const dx = e.clientX - st.lastX;
        const dy = e.clientY - st.lastY;
        const dt = Math.max(1, e.timeStamp - st.lastT) / 1000;
        st.yaw += dx * DRAG_GAIN;
        st.pitch = Math.max(-1.1, Math.min(1.1, st.pitch + dy * DRAG_GAIN));
        st.yawVel = (dx * DRAG_GAIN) / dt;
        st.lastX = e.clientX;
        st.lastY = e.clientY;
        st.lastT = e.timeStamp;
      } else if (e.pointerType === "mouse") {
        st.targetHoverYaw = ((e.clientX - rect.left) / rect.width - 0.5) * 0.5;
        st.targetHoverPitch = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
      }
      wake();
    };
    const onDown = (e: PointerEvent) => {
      st.dragging = true;
      st.yawVel = 0;
      st.pressX = e.clientX;
      st.pressY = e.clientY;
      st.pressMoved = false;
      clearTimeout(st.holdTimer);
      // Held still long enough? Spin up instead of dragging.
      st.holdTimer = window.setTimeout(() => {
        if (st.dragging && !st.pressMoved) {
          st.boosting = true;
          wake();
        }
      }, HOLD_MS);
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.lastT = e.timeStamp;
      wrap.setPointerCapture(e.pointerId);
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (!st.dragging) return;
      st.dragging = false;
      clearTimeout(st.holdTimer);
      if (st.boosting) {
        st.boosting = false; // the boost winds down on its own; no fling
        st.yawVel = 0;
        wake();
        return;
      }
      // Ignore stale velocity if the pointer paused before release.
      if (e.timeStamp - st.lastT > 80) st.yawVel = 0;
      st.yawVel = Math.max(-8, Math.min(8, st.yawVel));
      wake();
    };
    const onLeave = () => {
      st.targetHoverYaw = 0;
      st.targetHoverPitch = 0;
      wake();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("pointerleave", onLeave);
    // A long press on touch screens shouldn't open the system menu.
    const noMenu = (e: Event) => e.preventDefault();
    wrap.addEventListener("contextmenu", noMenu);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(wrap);

    // Recolor on the next frame, not inside the theme switch: reading computed
    // styles here would force a full-page style recalc mid-pull and stall the cord.
    let recolor = 0;
    const themeObserver = new MutationObserver(() => {
      cancelAnimationFrame(recolor);
      recolor = requestAnimationFrame(() => {
        readColors();
        draw();
      });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const io = new IntersectionObserver(([entry]) => {
      st.visible = entry.isIntersecting;
      if (st.visible) wake();
      else {
        cancelAnimationFrame(st.raf);
        st.raf = 0;
        st.prev = 0;
      }
    });
    io.observe(wrap);

    readColors();
    resize();
    draw();
    // Start moving once the main thread is idle so it never competes with hydration.
    const begin = () => {
      st.ready = true;
      wake();
    };
    const hasIdle = typeof requestIdleCallback === "function";
    const idle: number = hasIdle
      ? requestIdleCallback(begin, { timeout: 2500 })
      : window.setTimeout(begin, 1200);

    return () => {
      if (hasIdle) cancelIdleCallback(idle);
      else clearTimeout(idle);
      cancelAnimationFrame(st.raf);
      cancelAnimationFrame(recolor);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("contextmenu", noMenu);
      clearTimeout(st.holdTimer);
      ro.disconnect();
      themeObserver.disconnect();
      io.disconnect();
    };
  }, [pins]);

  return (
    // Controls sit in a row under the globe on phones and in a slim column to its
    // right on desktop (keep the column's 40px + 10px gap in step with .hero-globe).
    <figure className={`flex flex-col gap-3 md:flex-row md:items-end md:gap-2.5 ${className}`}>
      <div
        ref={wrapRef}
        role="img"
        aria-label={`A rotating globe with the world's countries outlined, the United States and the Philippines highlighted, and pins on ${pins.map((p) => p.label).join(" and ")}, with a plane flying between them. Drag to spin it, or press and hold to spin it faster.`}
        title="Drag to spin · press and hold to speed up"
        className="aspect-square w-full cursor-grab touch-pan-y select-none text-fg [-webkit-touch-callout:none] active:cursor-grabbing md:w-auto md:min-w-0 md:flex-1"
      >
        <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-normal text-muted md:w-10 md:shrink-0 md:flex-col md:justify-end md:gap-6 md:pb-[8%]">
        {/* Speed: picking one also resumes a paused globe. */}
        <div role="group" aria-label="Globe speed" className="flex items-center gap-1 md:flex-col">
          <span aria-hidden="true" className="md:mb-1">Speed</span>
          {SPEEDS.map((seconds, i) => (
            <button
              key={seconds}
              type="button"
              aria-pressed={speed === i}
              aria-label={`Speed ${i + 1}: one turn every ${seconds} seconds`}
              title={`One turn every ${seconds}s`}
              onClick={() => {
                setSpeed(i);
                setUserPaused(false);
              }}
              className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors hover:text-fg ${
                speed === i ? "bg-tray text-fg" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setUserPaused(spinning)}
          aria-label={spinning ? "Pause globe" : "Spin globe"}
          className="flex h-6 cursor-pointer items-center uppercase transition-colors hover:text-fg"
        >
          {spinning ? "Pause" : "Spin"}
          <span className="md:hidden">&nbsp;globe</span>
        </button>
      </div>
    </figure>
  );
}
