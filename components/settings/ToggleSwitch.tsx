"use client";

/** 通用开关组件 — 支持 role="switch" 无障碍 */
export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 border ${
        checked
          ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
          : "bg-[var(--color-bg-tertiary)] border-[var(--color-border)]"
      }`}
    >
      <span
        className={`block absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform
          duration-150 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
