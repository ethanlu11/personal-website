import { ImageResponse } from "next/og";
import { MARK_BLUE } from "@/components/Mark";
import { site } from "@/content";

// The link-preview image: just the logo and name, centered on black.
export const alt = site.name;
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
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          background: "#000",
          color: "#f2f2f2",
        }}
      >
        <svg width="220" height="220" viewBox="0 0 100 100">
          <rect x="18" y="14" width="16" height="72" fill="#f2f2f2" />
          <rect x="18" y="70" width="64" height="16" fill="#f2f2f2" />
          <rect x="40" y="14" width="42" height="16" fill={MARK_BLUE} />
          <rect x="40" y="42" width="30" height="16" fill={MARK_BLUE} />
        </svg>
        <div style={{ fontSize: 200, fontWeight: 700, letterSpacing: -9, lineHeight: 0.9 }}>{site.name}</div>
      </div>
    ),
    size,
  );
}
