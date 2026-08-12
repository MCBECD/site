"use client";

import { useLocale } from "@/contexts/LocaleContext";

interface StatsBarProps {
  docsCount: number;
}

export function StatsBar({ docsCount }: StatsBarProps) {
  const { t } = useLocale();

  const stats = [
    { value: docsCount, label: t("landing.statCommands") },
    { value: 7, label: t("landing.statLocales") },
    { value: "MIT", label: t("landing.statLicense") },
  ] as const;

  return (
    <section className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-8">
      <div className="landing-stats-enter flex items-center justify-center gap-8 md:gap-16 py-6 border-y border-[var(--color-border)]">
        {stats.map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold font-mono tabular-nums text-[var(--color-text-primary)]">
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
}
