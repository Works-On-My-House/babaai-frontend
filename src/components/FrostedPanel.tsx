import type { ReactNode } from "react";

interface FrostedPanelProps {
  children: ReactNode;
  className?: string;
}

/** Semi-transparent panel for readable content over illustrated backgrounds. */
export function FrostedPanel({ children, className = "" }: FrostedPanelProps) {
  return (
    <div
      className={`rounded-3xl border border-white/75 bg-white/78 shadow-xl shadow-amber-900/8 backdrop-blur-md dark:border-stone-600/45 dark:bg-stone-900/88 dark:shadow-black/35 ${className}`}
    >
      {children}
    </div>
  );
}
