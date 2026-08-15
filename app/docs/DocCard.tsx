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
  isBookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
  viewMode: "card" | "list";
}

const DocCard = memo(function DocCard({ doc, isBookmarked, onBookmark, viewMode }: DocCardProps) {
  const { t } = useLocale();
  const typeKey = getCommandTypeI18nKey(doc.category);
  const typeLabel = typeKey ? t(typeKey) : undefined;

  return viewMode === "list" ? (
    <Link
      href={`/docs/${doc.id}/`}
      className="block group py-2 min-h-[44px] no-underline"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {typeLabel && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            {typeLabel}
          </span>
        )}
        <h2 className="text-[13px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate flex-1 min-w-0 transition-colors duration-[var(--duration-fast)]">
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
        no-underline min-h-[44px]"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-[var(--duration-fast)]">
          {...renderTitleWithCode(doc.title, true)}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => onBookmark(e, doc.id)}
            className={`w-11 h-11 flex items-center justify-center rounded-[var(--radius-sm)] active:scale-[0.92] transition-[color,opacity,transform] duration-[var(--duration-fast)] -m-2
              ${isBookmarked
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-accent)]"}
            `}
            aria-label={isBookmarked ? t("common.unbookmark") : t("common.bookmark")}
          >
            <Star className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 shrink-0 transition-opacity duration-[var(--duration-fast)]" />
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
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

export { DocCard };
