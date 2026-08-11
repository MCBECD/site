"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface DocCardProps {
  doc: DocMeta;
  index: number;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
}

const DocCard = memo(function DocCard({ doc, index, bookmarked, onBookmark }: DocCardProps) {
  const { t } = useLocale();

  return (
    <Link
      href={`/docs/${doc.id}`}
      className="doc-card doc-card-enter block group px-4 py-4 rounded-xl
        bg-[var(--color-card-bg)]
        border border-[var(--color-border)]
        no-underline"
      style={{ "--stagger-index": index } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center
          text-[11px] font-medium tabular-nums text-[var(--color-text-tertiary)]">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-100">
            {renderTitleWithCode(doc.title)}
          </h2>
          {(doc.description || doc.author || doc.updatedAt) && (
            <div className="flex items-center gap-2 mt-0.5">
              {doc.description && (
                <p className="text-[12px] text-[var(--color-text-tertiary)] truncate">
                  {doc.description}
                </p>
              )}
              {(doc.author || doc.updatedAt) && (
                <span className="shrink-0 text-[11px] text-[var(--color-text-tertiary)]/60 tabular-nums">
                  {doc.author}{doc.author && doc.updatedAt ? " · " : ""}{doc.updatedAt ?? ""}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => onBookmark(e, doc.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-100
              ${bookmarked
                ? "text-yellow-500"
                : "text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-yellow-500"}
            `}
            aria-label={bookmarked ? t("common.unbookmark") : t("common.bookmark")}
          >
            <Star className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity duration-100" />
        </div>
      </div>
    </Link>
  );
});

export default DocCard;
