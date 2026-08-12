import type { ReactNode } from "react";

/** Settings panel generic section: title + content area */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-[var(--color-text-primary)] mb-2.5">{title}</div>
      {children}
    </div>
  );
}
