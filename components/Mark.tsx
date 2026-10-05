// Ethan Lu's monogram: an E with an L inside it. The L (spine and base) takes the
// current text color, so it flips with the theme; the two bars stay logo blue.
export const MARK_BLUE = "#1F4FD8";

export default function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <rect x="18" y="14" width="16" height="72" fill="currentColor" />
      <rect x="18" y="70" width="64" height="16" fill="currentColor" />
      <rect x="40" y="14" width="42" height="16" fill={MARK_BLUE} />
      <rect x="40" y="42" width="30" height="16" fill={MARK_BLUE} />
    </svg>
  );
}
