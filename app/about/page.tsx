"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { ExternalLink } from "lucide-react";

const SITE_REPO = "https://github.com/MCBECD/site";
const DOCS_REPO = "https://github.com/MCBECD/docs";

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
        {t("about.title")}
      </h1>

      {/* What is MCBECD */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          {t("about.whatIs")}
        </h2>
        <div className="space-y-3 text-[var(--color-text-secondary)] leading-relaxed">
          <p>{t("about.whatIsP1")}</p>
          <p>{t("about.whatIsP2")}</p>
          <p>{t("about.whatIsP3")}</p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          {t("about.techTitle")}
        </h2>
        <div className="space-y-3 text-[var(--color-text-secondary)] leading-relaxed">
          <p>{t("about.techP1")}</p>
          <p>{t("about.techP2")}</p>
          <p>{t("about.techP3")}</p>
          <p>{t("about.techP4")}</p>
        </div>
      </section>

      {/* Contributing */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          {t("about.contribTitle")}
        </h2>
        <div className="space-y-3 text-[var(--color-text-secondary)] leading-relaxed">
          <p>{t("about.contribP1")}</p>
          <p>{t("about.contribP2")}</p>
          <div className="flex flex-col gap-2 pt-2">
            <a
              href={`${SITE_REPO}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-accent)] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("about.contribLink")}
            </a>
            <a
              href={`${DOCS_REPO}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--color-accent)] hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("about.contribDocsLink")}
            </a>
          </div>
        </div>
      </section>

      {/* License */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          {t("about.licenseTitle")}
        </h2>
        <p className="text-[var(--color-text-secondary)] leading-relaxed">
          {t("about.licenseP1")}
        </p>
      </section>

      {/* Attribution */}
      <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
        {t("about.attribP1")}
      </p>
    </div>
  );
}
