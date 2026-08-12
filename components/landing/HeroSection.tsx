"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface HeroSectionProps {
  docsCount: number;
}

export function HeroSection({ docsCount }: HeroSectionProps) {
  const { t } = useLocale();

  return (
    <section className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-24 md:py-32">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-mono text-[var(--color-text-primary)]">
        MCBECD
        <span className="block mt-3 h-0.5 w-12 bg-[var(--color-accent)]" />
      </h1>
      <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-md leading-relaxed">
        {t("landing.tagline")}
      </p>
      <p className="mt-2 text-[13px] font-mono text-[var(--color-text-tertiary)]">
        {docsCount} {t("landing.statCommands")}
      </p>
      <div className="flex items-center gap-3 mt-8">
        <Link href="/docs/" className="cta-primary">
          {t("landing.ctaPrimary")}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="https://github.com/MCBECD"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-secondary"
        >
          <Github className="w-4 h-4" />
          {t("landing.ctaSecondary")}
        </a>
      </div>
    </section>
  );
}