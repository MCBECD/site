"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { FileText, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

const PAGE_SIZE = 8;

interface Props {
  docs: DocMeta[];
  locale: string;
  heading: string;
  tagline: string;
  emptyText: string;
}

export default function DocsPageClient({ docs, locale, heading, tagline, emptyText }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(docs.length / PAGE_SIZE));

  const pageDocs = useMemo(
    () => docs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [docs, page],
  );

  // Reset page to 0 if docs list changes externally (e.g. locale switch)
  const safePage = Math.min(page, totalPages - 1);
  if (safePage !== page) setPage(safePage);

  // Generate page numbers for display: always show first, last, and a window around current
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const windowSize = 2;
    const start = Math.max(0, safePage - windowSize);
    const end = Math.min(totalPages - 1, safePage + windowSize);

    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= start && i <= end)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1); // ellipsis marker
      }
    }
    return pages;
  }, [totalPages, safePage]);

  if (docs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-[var(--color-text-tertiary)]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {heading}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{tagline}</p>
      </div>

      {/* Doc cards */}
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
              <ArrowRight
                className="w-4 h-4 text-[var(--color-text-tertiary)]
                  group-hover:text-[var(--color-accent)] transition-colors shrink-0 ml-3"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="p-2 rounded-md text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((p, i) =>
            p === -1 ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 h-8 flex items-center justify-center text-sm
                  text-[var(--color-text-tertiary)]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-sm transition-colors ${
                  p === safePage
                    ? "bg-[var(--color-accent)] text-white font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
              >
                {p + 1}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="p-2 rounded-md text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
