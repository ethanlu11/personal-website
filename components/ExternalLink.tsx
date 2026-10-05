import type { ComponentProps } from "react";

// Opens in a new tab and says so to screen readers.
export default function ExternalLink({
  children,
  ...props
}: Omit<ComponentProps<"a">, "target" | "rel">) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}
