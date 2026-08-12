"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface CTASectionProps {
  docsCount: number;
}

export function CTASection({ docsCount }: CTASectionProps) {
  const { t } = useLocale();

  return (
    <section className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-20 text-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mb-3">
        {t("landing.ctaSectionTitle")}
      </h2>
      <p className="text-[14px] text-[var(--color-text-tertiary)] max-w-md mx-auto leading-relaxed mb-8">
        {t("landing.ctaSectionDesc", { count: docsCount })}
      </p>
      <Link href="/docs/" className="cta-primary">
        {t("landing.ctaSectionButton")}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
