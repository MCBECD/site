"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getAllDocs } from "@/lib/docs";
import { Link } from "@/i18n/navigation";
import { FileText, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

const PAGE_SIZE = 8;

export default function DocsPageClient({ docs, locale }: { docs: DocMeta[]; locale: string }) {
  const t = useTranslations();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(docs.length / PAGE_SIZE);
  const pageDocs = docs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {t("sidebar.documentation")}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t("common.tagline")}
        </p>
      </div>

      <div className="space-y-3">
        {pageDocs.map((doc) => (
          <Link
            key={doc.id}
            href={`/docs/${doc.id}`}
            locale={locale}
            className="block group p-4 rounded-lg border border-[var(--color-border)]
              bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)]
              hover:bg-[var(--color-sidebar-active)] transition-all no-underline"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-base font-medium text-[var(--color-text-primary)] truncate">
                    {doc.title}
                  </h2>
                  {doc.description && (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)]
                group-hover:text-[var(--color-accent)] transition-colors shrink-0 ml-3" />
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-md text-[var(--color-text-secondary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-md text-sm transition-colors
                ${i === page
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-md text-[var(--color-text-secondary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]
              disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
