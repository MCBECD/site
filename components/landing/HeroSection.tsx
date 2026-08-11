"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { CommandPreview } from "./CommandPreview";

export function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-12 gap-8 items-center">
      {/* Left: brand + tagline + CTA (7/12) */}
      <div className="md:col-span-7 space-y-6">
        <h1 className="landing-hero-enter text-5xl md:text-6xl font-bold tracking-tight font-mono text-[var(--color-text-primary)]">
          MCBECD
          <span className="block mt-3 h-0.5 w-12 bg-[var(--color-accent)]" />
        </h1>
        <p className="landing-sub-enter text-lg text-[var(--color-text-secondary)] max-w-md leading-relaxed">
          {t("landing.tagline")}
        </p>
        <div className="landing-cta-enter flex items-center gap-3 pt-2">
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
      </div>

      {/* Right: terminal preview (5/12) */}
      <div className="md:col-span-5 landing-terminal-enter">
        <CommandPreview />
      </div>
    </section>
  );
}
