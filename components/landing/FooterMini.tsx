"use client";

import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

export const FooterMini = memo(function FooterMini() {
  const { t } = useLocale();

  return (
    <footer className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-12 border-t border-[var(--color-border)]">
      <p className="text-[12px] text-[var(--color-text-tertiary)] font-mono">
        {t("landing.footerCopyright")}
      </p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2 max-w-lg leading-relaxed">
        {t("landing.footerDisclaimer")}
      </p>
    </footer>
  );
});
