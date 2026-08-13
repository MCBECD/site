"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface DocPaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (p: number) => void;
}

const PageButton = memo(function PageButton({
  page,
  isActive,
  onClick,
}: {
  page: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[44px] h-11 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-100 ${
        isActive
          ? "bg-[var(--color-accent)] text-white shadow-sm shadow-[var(--color-accent)]/25"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
      }`}
    >
      {page + 1}
    </button>
  );
});

const DocPagination = memo(function DocPagination({ page, totalPages, pageNumbers, onPageChange }: DocPaginationProps) {
  const { t } = useLocale();
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label={t("doc.previousPage")}
        className="w-11 h-11 flex items-center justify-center rounded-lg
          text-[var(--color-text-tertiary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]
          disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-100"
      >
        <ChevronLeft />
      </button>

      {pageNumbers.map((p, i) =>
        p === -1 ? (
          <span key={`e-${i}`} className="w-11 h-11 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
            ...
          </span>
        ) : (
          <PageButton key={p} page={p} isActive={p === page} onClick={() => onPageChange(p)} />
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        aria-label={t("doc.nextPage")}
        className="w-11 h-11 flex items-center justify-center rounded-lg
          text-[var(--color-text-tertiary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]
          disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-100"
      >
        <ChevronRight />
      </button>
    </div>
  );
});

export { DocPagination };
