import { ImageResponse } from "next/og";
import { MARK_BLUE } from "@/components/Mark";
import { hero, site } from "@/content";

export const alt = `${site.name}: ${hero.oneLiner}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#000",
          color: "#f2f2f2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <svg width="180" height="180" viewBox="0 0 100 100">
            <rect x="18" y="14" width="16" height="72" fill="#f2f2f2" />
            <rect x="18" y="70" width="64" height="16" fill="#f2f2f2" />
            <rect x="40" y="14" width="42" height="16" fill={MARK_BLUE} />
            <rect x="40" y="42" width="30" height="16" fill={MARK_BLUE} />
          </svg>
          <div style={{ fontSize: 170, fontWeight: 700, letterSpacing: -8, lineHeight: 0.9 }}>{site.name}</div>
        </div>
        <div style={{ fontSize: 40, lineHeight: 1.25, maxWidth: 960, color: "#b5b5b5" }}>
          {hero.oneLiner}
        </div>
      </div>
    ),
    size,
  );
}
