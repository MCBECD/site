"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { SquircleButton } from "@/components/SquircleButton";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4">
      <p className="text-7xl font-bold text-[var(--color-text-tertiary)]/30 mb-3 select-none">404</p>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-6">{t("doc.notFound")}</p>
      <Link href="/docs" className="no-underline">
        <SquircleButton
          cornerRadius={10}
          className="inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium
            text-[var(--color-accent)] bg-[var(--color-accent-muted)]
            hover:bg-[var(--color-accent)]/15 transition-colors"
        >
          {t("common.backToList")}
        </SquircleButton>
      </Link>
    </div>
  );
}
