"use client";

import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { DocMeta } from "@/lib/docs";
import { getCategoryLabel, getCommandType, getCategoryBase } from "@/lib/categories";
import { renderTitleWithCode } from "@/app/docs/renderTitle";

interface DocCardProps {
  doc: DocMeta;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent, id: string) => void;
  viewMode?: "card" | "list";
}

<<<<<<< HEAD
const TYPE_COLORS: Record<string, string> = {
  Player: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  World: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Building: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Entity: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  UI: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  Other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const DocCard = memo(function DocCard({ doc, index, bookmarked, onBookmark, viewMode = "card" }: DocCardProps) {
=======
const DocCard = memo(function DocCard({ doc, bookmarked, onBookmark }: DocCardProps) {
>>>>>>> f717ab4 (fix: search icon hidden by backdrop-filter stacking, remove card index, right-align meta)
  const { t } = useLocale();
  const categoryLabel = getCategoryLabel(doc.category);
  const cmdType = getCategoryBase(doc.category) === "commands" ? getCommandType(doc.category) : null;
  const cmdTypeLabel = cmdType ? t(`doc.type${cmdType}`) : null;
  const cmdTypeColor = cmdType ? (TYPE_COLORS[cmdType] ?? TYPE_COLORS.Other) : "";

  if (viewMode === "list") {
    return (
      <Link
        href={`/docs/${doc.id}`}
        className="block group py-2 no-underline"
      >
        <div className="flex items-center gap-2.5 min-w-0">

          {categoryLabel && (
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
              bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
              {categoryLabel}
            </span>
          )}

          {cmdTypeLabel && (
            <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${cmdTypeColor}`}>
              {cmdTypeLabel}
            </span>
          )}

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
<<<<<<< HEAD
      <div className="flex items-center gap-3">
        <span className="shrink-0 w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center
          text-[11px] font-medium tabular-nums text-[var(--color-text-tertiary)]">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            {categoryLabel && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium
                bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                {categoryLabel}
              </span>
            )}
            {cmdTypeLabel && (
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cmdTypeColor}`}>
                {cmdTypeLabel}
              </span>
            )}
            <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate min-w-[120px] flex-1">
              {renderTitleWithCode(doc.title)}
            </h2>
          </div>
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
=======
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] truncate transition-colors duration-100">
          {renderTitleWithCode(doc.title)}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
>>>>>>> f717ab4 (fix: search icon hidden by backdrop-filter stacking, remove card index, right-align meta)
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
      {(doc.description || doc.author || doc.updatedAt) && (
        <div className="flex items-center justify-between gap-3 mt-1">
          {doc.description && (
            <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-1 leading-relaxed flex-1 min-w-0">
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