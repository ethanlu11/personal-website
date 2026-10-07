"use client";

import { useRef, useState } from "react";

// The pull-down shade inside an airplane window. Drag it down to shut the window
// or back up to open it; let go and it snaps shut past halfway, otherwise back
// open. A tap (or Enter / Space) toggles it, and hovering the window dips an
// open shade a little as a hint. `closed` is how far down it is: REST when open
// (a sliver shows at the top), 1 when shut. Styles: .plane-window-shade in
// globals.css.

const REST = 0.1;
const TAP_PX = 4; // movement below this counts as a tap, not a drag

export default function WindowShade() {
  const [closed, setClosed] = useState(REST);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ y: 0, start: REST, height: 1, moved: false });

  const shut = closed > REST + 0.01;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pane = e.currentTarget.parentElement;
    if (!pane) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, start: closed, height: pane.getBoundingClientRect().height, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dy) > TAP_PX) drag.current.moved = true;
    setClosed(Math.min(1, Math.max(REST, drag.current.start + dy / drag.current.height)));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (!drag.current.moved) setClosed(drag.current.start > 0.5 ? REST : 1);
    else setClosed((c) => (c > 0.5 ? 1 : REST));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={shut}
      aria-label={shut ? "Open the window shade" : "Close the window shade"}
      title="Drag the shade"
      className="plane-window-shade"
      data-state={dragging ? "dragging" : closed >= 1 ? "shut" : closed <= REST ? "open" : "moving"}
      style={{ "--closed": closed } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        setClosed(closed > 0.5 ? REST : 1);
      }}
    />
  );
}
