"use client";

import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

interface StatsBarProps {
  docsCount: number;
}

export const StatsBar = memo(function StatsBar({ docsCount }: StatsBarProps) {
  const { t } = useLocale();

  const stats = [
    { value: docsCount, label: t("landing.statCommands") },
    { value: 7, label: t("landing.statLocales") },
    { value: "MIT", label: t("landing.statLicense") },
  ] as const;

  return (
    <section className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-8">
      <div className="landing-stats-enter flex items-center justify-center gap-4 sm:gap-6 md:gap-10 lg:gap-16 py-6 border-y border-[var(--color-border)]">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center min-w-0 flex-1">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
              {stat.value}
            </div>
            <div className="text-[12px] text-[var(--color-text-tertiary)] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});