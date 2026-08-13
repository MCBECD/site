"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-20 md:py-32">
      <div className="max-w-md mx-auto text-center space-y-6">
        <p className="text-[13px] font-medium text-[var(--color-accent)]">
          {t("notFound.errorCode")}
        </p>
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[var(--color-text-primary)]">
          404
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
          {t("notFound.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/docs/" className="cta-primary">
            {t("notFound.backHome")}
          </Link>
          <Link href="/docs/" className="cta-secondary">
            {t("notFound.browseDocs")}
          </Link>
        </div>
      </div>
    </div>
  );
}
