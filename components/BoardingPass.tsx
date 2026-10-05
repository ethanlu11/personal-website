import ExternalLink from "@/components/ExternalLink";
import type { Project } from "@/content";

// A project as a compact paper boarding pass, a nod to the globe's Cebu ↔ New
// York flight: the plane's tail with the project's logo on it (the livery), the
// ticket itself (route from NYC to the project's "airport code", description,
// and ticket fields), and a tear-off stub with a barcode behind a perforation.
// The whole pass links to the live project; on hover it lifts and the plane flies
// the route. On phones the tail hides and the stub moves under the ticket. The
// pass is white paper in both themes (.paper in globals.css); the perforation
// notches show the page color behind it.

// Barcode bar widths, derived from the text so each pass gets its own pattern.
function bars(text: string) {
  const out: number[] = [];
  for (let i = 0; i < 34; i++) out.push(1 + ((text.charCodeAt(i % text.length) + i * 7) % 3));
  return out;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">{label}</dt>
      <dd className="truncate text-[13px] font-medium">{value}</dd>
    </div>
  );
}

// A small plane pointing right, the same silhouette as the one on the globe.
function Plane({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-11 -10 22 20" width="18" height="16" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M10 0 6 -1.6H1L-3 -9H-5.5L-3 -1.6H-7L-9 -4.5H-10.5L-9.2 0-10.5 4.5H-9L-7 1.6H-3L-5.5 9H-3L1 1.6H6Z"
      />
    </svg>
  );
}

// The plane's tail, drawn like the real thing: a narrow top, a front edge leaning
// back slightly, and a long trailing edge sweeping down to a wide base on the
// fuselage. The project's own logo (white, see `tail` in content.ts) is painted
// on it like an airline livery, centered in the widest part of the fin.
function Tail({ logo }: { logo: string }) {
  return (
    <div aria-hidden="true" className="relative hidden w-32 shrink-0 overflow-hidden bg-accent/10 sm:block">
      <svg viewBox="0 0 130 200" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 h-[94%] w-full">
        <path d="M10 10 Q10 6 15 6 L52 6 Q56 6 58 10 L128 166 L128 188 L30 188 Z" className="fill-accent" />
        {/* A pale stripe along the fin's trailing edge, then the fuselage. */}
        <path d="M58 10 L128 166 L128 176 L52 12 Z" fill="#fff" opacity="0.35" />
        <rect x="0" y="186" width="130" height="14" className="fill-accent" opacity="0.4" />
        <image href={logo} x="33" y="88" width="58" height="56" preserveAspectRatio="xMidYMid meet" />
      </svg>
    </div>
  );
}

export default function BoardingPass({ project, index }: { project: Project; index: number }) {
  const flight = `EL ${String(index + 1).padStart(3, "0")}`;
  const host = new URL(project.href).hostname;
  const fields = [
    { label: "Passenger", value: "Ethan Lu" },
    ...(project.role ? [{ label: "Role", value: project.role }] : []),
    ...(project.year ? [{ label: "Year", value: project.year }] : []),
    { label: "Gate", value: host },
  ];

  return (
    <ExternalLink
      href={project.href}
      aria-label={`${project.title}: ${project.kind}, ${host}`}
      className="paper group relative flex flex-col overflow-hidden rounded-xl border border-line bg-bg shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-14px_rgba(0,0,0,0.3)] sm:flex-row"
    >
      <Tail logo={project.tail} />

      {/* The ticket */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 bg-accent px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.14em] text-white uppercase md:px-5">
          <span>Boarding pass</span>
          <span>
            {flight} · {project.kind}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-4 pt-3 pb-3.5 md:px-5">
          {/* Route: from New York to the project. The plane flies it on hover. */}
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <p className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">From</p>
              <p className="font-mono text-2xl leading-none font-bold tracking-tight">NYC</p>
            </div>
            <div className="relative mt-3 min-w-8 flex-1 border-t-2 border-dashed border-line">
              <Plane className="absolute -top-[9px] left-0 text-accent transition-[left] duration-700 ease-out group-hover:left-[calc(100%-18px)]" />
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">To</p>
              <p className="font-mono text-2xl leading-none font-bold tracking-tight text-accent">{project.code}</p>
            </div>
          </div>

          <h3 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.03em] text-accent md:text-[1.75rem]">{project.title}</h3>
          <div className="mt-1 mb-3 space-y-1.5 text-sm leading-snug">
            {project.description.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>

          <dl className="mt-auto flex flex-wrap gap-x-8 gap-y-2 border-t border-dashed border-line pt-2.5">
            {fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </dl>
        </div>
      </div>

      {/* Tear-off stub, behind a perforation with notches. */}
      <div className="relative flex shrink-0 flex-col justify-between gap-3 border-t-2 border-dashed border-line px-4 py-3 sm:w-36 sm:border-t-0 sm:border-l-2">
        <span aria-hidden="true" className="absolute -top-2.5 -left-2.5 hidden size-5 rounded-full border border-line bg-[var(--page)] sm:block" />
        <span aria-hidden="true" className="absolute -bottom-2.5 -left-2.5 hidden size-5 rounded-full border border-line bg-[var(--page)] sm:block" />
        <dl className="grid grid-cols-3 gap-3 sm:grid-cols-2">
          <Field label="Flight" value={flight} />
          <Field label="Seat" value={`${index + 1}A`} />
          <Field label="To" value={project.code} />
        </dl>
        <div>
          <div aria-hidden="true" className="flex h-9 items-stretch gap-[1.5px]">
            {bars(project.title + project.href).map((w, i) => (
              <span key={i} className="bg-fg" style={{ flexGrow: w }} />
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.12em] uppercase transition-colors group-hover:text-accent">
            Board
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </p>
        </div>
      </div>
    </ExternalLink>
  );
}
