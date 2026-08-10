"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";

interface DocCardProps {
  doc: DocMeta;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
}

const DocCard = memo(function DocCard({ doc, bookmarked, onBookmark }: DocCardProps) {
  const { t } = useLocale();

  return (
    <Link
      href={`/docs/${doc.id}`}
      className="doc-card block group px-4 py-3.5 rounded-[var(--radius-sm)]
        bg-[var(--color-card-bg)]
        border border-[var(--color-border)]
        no-underline"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate">
            {doc.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => onBookmark(e, doc.id)}
            className={`w-6 h-6 flex items-center justify-center rounded-md
              ${bookmarked
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-accent)]"}
              }`}
            aria-label={bookmarked ? t("common.unbookmark") : t("common.bookmark")}
          >
            <Star className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 shrink-0" />
        </div>
      </div>
      {(doc.description || doc.author || doc.updatedAt) && (
        <div className="flex items-center justify-between gap-3 mt-1">
          {doc.description && (
            <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed flex-1 min-w-0">
              {doc.description}
            </p>
          )}
          {(doc.author || doc.updatedAt) && (
            <span className="text-[11px] text-[var(--color-text-tertiary)] shrink-0 tabular-nums">
              {doc.author}{doc.author && doc.updatedAt ? " · " : ""}{doc.updatedAt ?? ""}
            </span>
          )}
        </div>
      )}
    </Link>
  );
});

export default DocCard;
