import { memo } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (p: number) => void;
}

const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const PageButton = memo(function PageButton({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-100 ${
        active
          ? "bg-[var(--color-accent)] text-white shadow-sm shadow-[var(--color-accent)]/25"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
      }`}
    >
      {page + 1}
    </button>
  );
});

const DocPagination = memo(function DocPagination({ page, totalPages, pageNumbers, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="w-9 h-9 flex items-center justify-center rounded-lg
          text-[var(--color-text-tertiary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]
          disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-100"
      >
        <ChevronLeft />
      </button>

      {pageNumbers.map((p, i) =>
        p === -1 ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
            ...
          </span>
        ) : (
          <PageButton key={p} page={p} active={p === page} onClick={() => onPageChange(p)} />
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg
          text-[var(--color-text-tertiary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]
          disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-100"
      >
        <ChevronRight />
      </button>
    </div>
  );
});

export default DocPagination;
