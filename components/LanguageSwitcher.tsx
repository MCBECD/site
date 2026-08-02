"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n/shared";

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchTo = (locale: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm
          text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
          hover:bg-[var(--color-bg-tertiary)] transition-colors"
        title={t("settings.language")}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{t(`language.${locale}`)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-lg shadow-lg
          bg-[var(--color-bg-primary)] border border-[var(--color-border)] z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchTo(loc)}
              className="w-full text-left px-3 py-1.5 text-sm
                text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              {t(`language.${loc}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
