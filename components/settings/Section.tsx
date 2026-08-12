import type { ReactNode } from "react";

/** Settings panel generic section: title + optional action + content area */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[13px] font-medium text-[var(--color-text-primary)]">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}
