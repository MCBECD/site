"use client";

import { memo } from "react";

/** Generic toggle switch component — supports role="switch" for accessibility */
export const ToggleSwitch = memo(function ToggleSwitch({ isChecked, onChange, label }: { isChecked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={isChecked}
      aria-label={label}
      onClick={() => onChange(!isChecked)}
      className="relative w-11 min-h-[44px] flex items-center flex-shrink-0"
    >
      <span
        className={`relative w-11 h-6 rounded-full transition-colors duration-[var(--duration-fast)] border ${
          isChecked
            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
            : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)]"
        }`}
      >
        <span
          className={`block absolute top-1/2 -translate-y-1/2 left-[3px] w-[18px] h-[18px] rounded-full bg-[var(--color-bg-primary)] shadow-[var(--shadow-sm)] transition-transform
            duration-[var(--duration-fast)] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
            isChecked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
});
