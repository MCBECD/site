"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { getCategoryLabel } from "@/lib/categories";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface DocCardProps {
  doc: DocMeta;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
  viewMode?: "card" | "list";
}

const DocCard = memo(function DocCard({ doc, bookmarked, onBookmark, viewMode = "card" }: DocCardProps) {
  const { t } = useLocale();
  const categoryLabel = getCategoryLabel(doc.category);

  if (viewMode === "list") {
    return (
      <Link
        href={`/docs/${doc.id}`}
        className="block group py-2 no-underline"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate flex-1 min-w-0">
            {renderTitleWithCode(doc.title)}
          </h2>
          {(doc.author || doc.updatedAt) && (
            <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0 tabular-nums hidden sm:inline">
              {doc.author}{doc.author && doc.updatedAt ? " · " : ""}{doc.updatedAt ?? ""}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/docs/${doc.id}`}
      className="doc-card block group px-4 py-3.5 rounded-xl
        bg-[var(--color-card-bg)]
        border border-[var(--color-border)]
        no-underline"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-100">
          {renderTitleWithCode(doc.title)}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
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
      <div className="flex items-center justify-between gap-3 mt-1">
        {doc.description && (
          <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-1 leading-relaxed flex-1 min-w-0">
            {doc.description}
          </p>
        )}
        <div className="flex items-center gap-2 shrink-0">
          {categoryLabel && (
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              {categoryLabel}
            </span>
          )}
          {(doc.author || doc.updatedAt) && (
            <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
              {doc.author}{doc.author && doc.updatedAt ? " · " : ""}{doc.updatedAt ?? ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

export default DocCard;