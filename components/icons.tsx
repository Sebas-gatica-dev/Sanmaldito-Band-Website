import type { SVGProps } from "react";

export function CrossMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path d="M24 3v42M9 17h30M15 10l9-7 9 7M17 37l7 8 7-8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 17l5-3 5 3-5 3-5-3ZM34 17l5-3 5 3-5 3-5-3Z" fill="currentColor" />
    </svg>
  );
}

export function ThornRule({ className = "" }: { className?: string }) {
  return (
    <div className={`thorn-rule ${className}`} aria-hidden="true">
      <span />
      <i>✦</i>
      <span />
    </div>
  );
}
