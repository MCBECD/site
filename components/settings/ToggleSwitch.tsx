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
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 border ${
        isChecked
          ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
          : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)]"
      }`}
    >
      <span
        className={`block absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform
          duration-100 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
          isChecked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
});
