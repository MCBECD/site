interface PaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (p: number) => void;
}

export default function DocPagination({ page, totalPages, pageNumbers, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="min-w-[36px] h-9 flex items-center justify-center rounded-lg
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-tertiary)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pageNumbers.map((p, i) =>
        p === -1 ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-[13px] transition-colors ${
              p === page
                ? "bg-[var(--color-accent)] text-white font-medium shadow-sm"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            }`}
          >
            {p + 1}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="min-w-[36px] h-9 flex items-center justify-center rounded-lg
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-tertiary)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
