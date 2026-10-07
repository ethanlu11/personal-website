import Image from "next/image";
import WindowShade from "@/components/WindowShade";

// A hero portrait as the view out of an airplane window: a moulded bezel, the
// rounded pane, and a shade you can drag down to shut it (WindowShade;
// .plane-window in globals.css), labeled with a window seat. The photo can't be
// dragged out or long-pressed into an image menu.

export type Photo = { src: string; alt: string; position: string; zoom?: number };

export default function HeroPhoto({ photo, index }: { photo: Photo; index: number }) {
  return (
    <figure className="group plane-window-figure">
      <div className="plane-window relative aspect-[4/5]">
        <div className="plane-window-pane">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="(min-width: 768px) 240px, 44vw"
            draggable={false}
            className="object-cover select-none"
            style={{
              objectPosition: photo.position,
              transform: photo.zoom ? `scale(${photo.zoom})` : undefined,
              transformOrigin: photo.position,
            }}
          />
          <WindowShade />
        </div>
      </div>
      <figcaption className="mt-2.5 text-center font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
        Seat {index === 0 ? "1A" : "1F"}
      </figcaption>
    </figure>
  );
}
