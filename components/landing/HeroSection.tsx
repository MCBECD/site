"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { useLocale } from "@/contexts/LocaleContext";
import { CommandPreview } from "./CommandPreview";

export const HeroSection = memo(function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] pt-12 pb-10 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 grid md:grid-cols-12 gap-8 items-center">
      {/* Left: brand + tagline + CTA (7/12) */}
      <div className="md:col-span-7 space-y-5 sm:space-y-6">
        <h1 className="landing-hero-enter text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-text-primary)]">
          MCBECD
        </h1>
        <p className="landing-sub-enter text-lg text-[var(--color-text-secondary)] max-w-md leading-relaxed">
          {t("landing.tagline")}
        </p>
        <div className="landing-cta-enter flex flex-wrap items-center gap-3 pt-2">
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
            <GithubIcon className="w-4 h-4" />
            {t("landing.ctaSecondary")}
            <span className="sr-only"> {t("common.opensInNewTab")}</span>
          </a>
        </div>
      </div>

      {/* Right: terminal preview (5/12) */}
      <div className="md:col-span-5 landing-cta-enter">
        <CommandPreview />
      </div>
    </section>
  );
});
