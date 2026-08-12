"use client";

import { memo, useCallback } from "react";

export const SliderRow = memo(function SliderRow({ label, value, onChange, max = 100 }: {
  label: string; value: number; onChange: (v: number) => void; max?: number;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
    [onChange],
  );

  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-[var(--color-text-secondary)] w-[68px] flex-shrink-0 text-right">{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={handleChange}
        aria-label={label}
        className="flex-1 h-1.5 accent-[var(--color-accent)]"
      />
      <span className="text-[11px] text-[var(--color-text-tertiary)] w-8 text-right tabular-nums">{value}</span>
    </div>
  );
});
