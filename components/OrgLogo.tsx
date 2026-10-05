import Image from "next/image";
import type { Logo } from "@/content";

// A small square org logo, LinkedIn-style. Decorative: the org name sits right next to it.
export default function OrgLogo({ logo, size = 48 }: { logo: Logo; size?: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface"
      style={{ width: size, height: size, background: logo.bg }}
    >
      {logo.src ? (
        <Image
          src={logo.src}
          alt=""
          width={size}
          height={size}
          className={logo.cover ? "h-full w-full object-cover" : "h-full w-full object-contain p-1.5"}
        />
      ) : (
        <span className="font-mono text-sm font-bold tracking-[-0.04em] text-muted">{logo.initials}</span>
      )}
    </div>
  );
}
