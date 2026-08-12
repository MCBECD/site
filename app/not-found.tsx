"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-32">
      <p className="text-[12px] font-mono text-[var(--color-accent)]">{t("notFound.errorCode")}</p>
      <h1 className="mt-3 text-6xl font-bold font-mono text-[var(--color-text-primary)]">404</h1>
      <p className="mt-4 text-[14px] text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
        {t("notFound.description")}
      </p>
      <div className="flex items-center gap-3 mt-8">
        <Link href="/" className="cta-primary">{t("notFound.backHome")}</Link>
        <Link href="/docs/" className="cta-secondary">{t("notFound.browseDocs")}</Link>
      </div>
    </div>
  );
}
