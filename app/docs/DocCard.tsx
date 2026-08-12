"use client";

import { memo } from "react";
import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { getCommandTypeI18nKey } from "@/lib/categories";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface DocCardProps {
  doc: DocMeta;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
  viewMode: "card" | "list";
}

const DocCard = memo(function DocCard({ doc, bookmarked, onBookmark, viewMode }: DocCardProps) {
  const { t } = useLocale();
  const typeKey = getCommandTypeI18nKey(doc.category);
  const typeLabel = typeKey ? t(typeKey) : undefined;

  return viewMode === "list" ? (
    <Link
      href={`/docs/${doc.id}/`}
      className="block group py-2 no-underline"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {typeLabel && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {typeLabel}
          </span>
        )}
        <h2 className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate flex-1 min-w-0">
          {...renderTitleWithCode(doc.title, true)}
        </h2>
        {doc.description && (
          <span className="hidden sm:block text-[12px] text-[var(--color-text-tertiary)] truncate max-w-[40%]">
            {doc.description}
          </span>
        )}
      </div>
    </Link>
  ) : (
    <Link
      href={`/docs/${doc.id}/`}
      className="doc-card block group px-4 py-3.5 rounded-[var(--radius-lg)]
        bg-[var(--color-card-bg)]
        border border-[var(--color-border)]
        no-underline"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-100">
          {...renderTitleWithCode(doc.title, true)}
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
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
        {typeLabel && (
          <span className="inline-flex items-center gap-1 shrink-0 text-[var(--color-accent)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {typeLabel}
          </span>
        )}
        {doc.description && (
          <p className="truncate leading-relaxed min-w-0">
            {doc.description}
          </p>
        )}
        {(doc.author || doc.updatedAt) && (
          <span className="shrink-0 tabular-nums ml-auto">
            {doc.author}{doc.author && doc.updatedAt ? " · " : ""}{doc.updatedAt ?? ""}
          </span>
        )}
      </div>
    </Link>
  );
});

export default DocCard;
