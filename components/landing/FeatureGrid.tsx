"use client";

import { Copy, Languages, Palette } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

export function FeatureGrid() {
  const { t } = useLocale();

  const features = [
    { icon: Copy, titleKey: "landing.feature1Title", descKey: "landing.feature1Desc" },
    { icon: Languages, titleKey: "landing.feature2Title", descKey: "landing.feature2Desc" },
    { icon: Palette, titleKey: "landing.feature3Title", descKey: "landing.feature3Desc" },
  ] as const;

  return (
    <section className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-16">
      <div className="grid md:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, titleKey, descKey }, i) => (
          <div
            key={titleKey}
            className="feature-card landing-feature-enter rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
            style={{ animationDelay: `calc(var(--duration-stagger-step) * ${3 + i})` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-accent-muted)] mb-4">
              <Icon className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1.5">
              {t(titleKey)}
            </h3>
            <p className="text-[13px] text-[var(--color-text-tertiary)] leading-relaxed">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
